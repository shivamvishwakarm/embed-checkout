"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckoutShell } from "@/components/checkout/checkout-shell";
import { CloseConfirmation } from "@/components/checkout/close-confirmation";
import {
  type CheckoutState,
  closeConfirmationState,
  closedState,
  createInitialState,
  errorState,
  failureState,
  processingState,
  readyState,
  successState,
} from "@/features/payment/payment-state";
import type { PaymentError, PaymentInput } from "@/features/payment/payment-types";
import { DeterministicFakePaymentEngine } from "@/features/payment/fake-payment-engine";
import { getProduct } from "@/lib/products";
import { getCheckoutSessionFromUrl } from "@/lib/session";
import {
  sendCheckoutClosed,
  sendCheckoutReady,
  sendPaymentError,
  sendPaymentSuccess,
} from "@/lib/protocol";
import { validateHostMessage } from "@/lib/protocol-validator";

const DEFAULT_MERCHANT_ORIGIN =
  process.env["NEXT_PUBLIC_MERCHANT_ORIGIN"] ?? "http://localhost:3000";

function getReferrerOrigin(): string {
  if (typeof window === "undefined") {
    return DEFAULT_MERCHANT_ORIGIN;
  }

  try {
    const origin = document.referrer ? new URL(document.referrer).origin : DEFAULT_MERCHANT_ORIGIN;
    return origin || DEFAULT_MERCHANT_ORIGIN;
  } catch {
    return DEFAULT_MERCHANT_ORIGIN;
  }
}

function getInitialForm(productId = ""): PaymentInput {
  return {
    productId,
    email: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  };
}

export function useCheckoutSession() {
  const [sourceOrigin] = useState<string>(getReferrerOrigin);

  const [state, setState] = useState<CheckoutState>(createInitialState);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [form, setForm] = useState<PaymentInput>(() => getInitialForm());
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const engineRef = useRef<DeterministicFakePaymentEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new DeterministicFakePaymentEngine();
  }

  const sessionIdRef = useRef<string | undefined>(sessionId);
  const hasSentReadyRef = useRef<string | null>(null);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const product =
    state.status === "READY" ||
    state.status === "PROCESSING" ||
    state.status === "FAILURE" ||
    state.status === "CLOSE_CONFIRMATION"
      ? state.product
      : getProduct(form.productId);

  const applySession = useCallback((nextSessionId: string, nextProductId: string) => {
    sessionIdRef.current = nextSessionId;
    setSessionId(nextSessionId);
    setForm((current) => ({ ...current, productId: nextProductId }));

    const nextProduct = getProduct(nextProductId);
    if (!nextProduct) {
      setState(errorState("INVALID_PRODUCT", "This product is unavailable."));
      return;
    }

    setState((currentState) => {
      if (currentState.status !== "CREATED" && currentState.status !== "LOADING") {
        return currentState;
      }
      return readyState(nextProduct);
    });

    setErrorMessage(undefined);

    if (hasSentReadyRef.current !== nextSessionId) {
      hasSentReadyRef.current = nextSessionId;
      sendCheckoutReady(nextSessionId);
    }
  }, []);

  useEffect(() => {
    const initialSession = getCheckoutSessionFromUrl(window.location.search, sourceOrigin);
    if (initialSession) {
      applySession(initialSession.sessionId, initialSession.productId);
    }
  }, [applySession, sourceOrigin]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const hostMessage = validateHostMessage(event, sourceOrigin);
      if (!hostMessage) {
        return;
      }

      if (hostMessage.type === "CHECKOUT_INIT") {
        applySession(hostMessage.sessionId, hostMessage.productId);
        return;
      }

      if (hostMessage.type === "CHECKOUT_CLOSE") {
        const currentSessionId = sessionIdRef.current;
        if (currentSessionId && hostMessage.sessionId !== currentSessionId) {
          return;
        }

        setState(closedState("USER_CLOSED"));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [applySession, sourceOrigin]);

  const onFieldChange = useCallback((field: keyof PaymentInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errorMessage) {
      setErrorMessage(undefined);
    }
  }, [errorMessage]);

  const submitPayment = useCallback(async (customInput?: PaymentInput) => {
    const activeForm = customInput ?? form;
    const currentSessionId = sessionId ?? sessionIdRef.current;
    const productForPayment = product ?? getProduct(activeForm.productId);
    if (!productForPayment) {
      setState(errorState("INVALID_PRODUCT", "The selected product could not be found."));
      return;
    }

    if (!currentSessionId) {
      setState(errorState("CHECKOUT_SESSION_INVALID", "This checkout session is unavailable."));
      return;
    }

    if (state.status === "PROCESSING" || state.status === "SUCCESS" || state.status === "CLOSED") {
      return;
    }

    const normalizedInput: PaymentInput = {
      ...activeForm,
      productId: productForPayment.id,
      email: activeForm.email.trim(),
      cardNumber: activeForm.cardNumber,
      expiry: activeForm.expiry,
      cvv: activeForm.cvv,
    };

    if (!normalizedInput.email || !normalizedInput.cardNumber || !normalizedInput.expiry || !normalizedInput.cvv) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    const nextAttempt = processingState(productForPayment, "pending");
    setState(nextAttempt);
    setErrorMessage(undefined);

    const result = await engineRef.current!.charge(normalizedInput);

    if (result.ok) {
      setState(successState(currentSessionId));
      sendPaymentSuccess(currentSessionId, result.attemptId);
      return;
    }

    const paymentError: PaymentError = result.error ?? {
      code: "UNKNOWN_ERROR",
      message: result.message ?? "Something went wrong while processing your payment.",
      retryable: true,
    };

    setState(failureState(productForPayment, paymentError, paymentError.retryable));
    sendPaymentError(currentSessionId, result.attemptId, paymentError.code, paymentError.message);
  }, [form, product, sessionId, state.status]);

  const retryPayment = useCallback(() => {
    if (!product) {
      return;
    }

    setErrorMessage(undefined);
    setState(readyState(product));
  }, [product]);

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const getEffectiveSessionId = useCallback(() => {
    return (
      sessionId ??
      sessionIdRef.current ??
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("sessionId") || undefined
        : undefined)
    );
  }, [sessionId]);

  const closeCheckout = useCallback(() => {
    const currentSessionId = getEffectiveSessionId();

    // If session is already finished, closed, or in error, close immediately
    if (state.status === "SUCCESS" || state.status === "CLOSED" || state.status === "ERROR") {
      setShowCloseConfirmation(false);
      if (currentSessionId) {
        sendCheckoutClosed(currentSessionId, "USER_CLOSED");
      }
      setState(closedState("USER_CLOSED"));
      return;
    }

    // In active payment states (READY, PROCESSING, FAILURE, CREATED, LOADING),
    // prompt user with confirmation dialog
    setShowCloseConfirmation(true);
  }, [getEffectiveSessionId, state.status]);

  const cancelClose = useCallback(() => {
    setShowCloseConfirmation(false);
    if (state.status === "CLOSE_CONFIRMATION") {
      const restoreProduct = product ?? getProduct(form.productId);
      if (restoreProduct) {
        setState(readyState(restoreProduct));
        return;
      }
      setState(createInitialState());
    }
  }, [form.productId, product, state.status]);

  const confirmClose = useCallback(() => {
    setShowCloseConfirmation(false);
    const currentSessionId = getEffectiveSessionId();

    if (currentSessionId) {
      sendCheckoutClosed(currentSessionId, "USER_CLOSED");
    }
    setState(closedState("USER_CLOSED"));
  }, [getEffectiveSessionId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (showCloseConfirmation || state.status === "CLOSE_CONFIRMATION") {
          cancelClose();
        } else {
          closeCheckout();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cancelClose, closeCheckout, showCloseConfirmation, state.status]);

  return {
    state,
    form,
    product,
    sessionId,
    errorMessage,
    showCloseConfirmation,
    onFieldChange,
    submitPayment,
    retryPayment,
    closeCheckout,
    cancelClose,
    confirmClose,
  };
}

export function CheckoutPageShell() {
  const checkout = useCheckoutSession();

  return (
    <main
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 sm:p-6 backdrop-blur-md transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (checkout.showCloseConfirmation) {
            checkout.cancelClose();
          } else {
            checkout.closeCheckout();
          }
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Checkout dialog"
    >
      <div
        className="relative w-full max-w-lg md:max-w-3xl lg:max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-2xl transition-all animate-modal-in my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CheckoutShell
          state={checkout.state}
          form={checkout.form}
          onFieldChange={checkout.onFieldChange}
          onSubmit={checkout.submitPayment}
          onClose={checkout.closeCheckout}
          onRetry={checkout.retryPayment}
          onCancelClose={checkout.cancelClose}
          onConfirmClose={checkout.confirmClose}
          sessionId={checkout.sessionId}
          errorMessage={checkout.errorMessage}
          product={checkout.product}
        />

        {checkout.showCloseConfirmation && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs rounded-2xl sm:rounded-3xl animate-modal-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                checkout.cancelClose();
              }
            }}
          >
            <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <CloseConfirmation
                onCancel={checkout.cancelClose}
                onConfirm={checkout.confirmClose}
                isProcessing={checkout.state.status === "PROCESSING"}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
