"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckoutShell } from "@/components/checkout/checkout-shell";
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

const DEFAULT_MERCHANT_ORIGIN = "http://localhost:3000";

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
  const [state, setState] = useState<CheckoutState>(createInitialState());
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [form, setForm] = useState<PaymentInput>(getInitialForm());
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [sourceOrigin] = useState<string>(getReferrerOrigin);

  const engineRef = useRef<DeterministicFakePaymentEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new DeterministicFakePaymentEngine();
  }

  const product =
    state.status === "READY" ||
    state.status === "PROCESSING" ||
    state.status === "FAILURE" ||
    state.status === "CLOSE_CONFIRMATION"
      ? state.product
      : getProduct(form.productId);

  const applySession = useCallback((nextSessionId: string, nextProductId: string) => {
    const nextProduct = getProduct(nextProductId);
    setSessionId(nextSessionId);
    setForm((current) => ({ ...current, productId: nextProductId }));

    if (!nextProduct) {
      setState(errorState("INVALID_PRODUCT", "This product is unavailable."));
      return;
    }

    setState(readyState(nextProduct));
    setErrorMessage(undefined);
    sendCheckoutReady(nextSessionId);
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
        if (sessionId && hostMessage.sessionId !== sessionId) {
          return;
        }

        setState(closedState("USER_CLOSED"));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [applySession, sessionId, sourceOrigin]);

  const onFieldChange = useCallback((field: keyof PaymentInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errorMessage) {
      setErrorMessage(undefined);
    }
  }, [errorMessage]);

  const submitPayment = useCallback(async () => {
    const productForPayment = product ?? getProduct(form.productId);
    if (!productForPayment) {
      setState(errorState("INVALID_PRODUCT", "The selected product could not be found."));
      return;
    }

    if (!sessionId) {
      setState(errorState("CHECKOUT_SESSION_INVALID", "This checkout session is unavailable."));
      return;
    }

    if (state.status === "PROCESSING" || state.status === "SUCCESS" || state.status === "CLOSED") {
      return;
    }

    const normalizedInput: PaymentInput = {
      ...form,
      productId: productForPayment.id,
      email: form.email.trim(),
      cardNumber: form.cardNumber,
      expiry: form.expiry,
      cvv: form.cvv,
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
      setState(successState(sessionId));
      sendPaymentSuccess(sessionId, result.attemptId);
      return;
    }

    const paymentError: PaymentError = result.error ?? {
      code: "UNKNOWN_ERROR",
      message: result.message ?? "Something went wrong while processing your payment.",
      retryable: true,
    };

    setState(failureState(productForPayment, paymentError, paymentError.retryable));
    sendPaymentError(sessionId, result.attemptId, paymentError.code, paymentError.message);
  }, [form, product, sessionId, state.status]);

  const retryPayment = useCallback(() => {
    if (!product) {
      return;
    }

    setErrorMessage(undefined);
    setState(readyState(product));
  }, [product]);

  const closeCheckout = useCallback(() => {
    if (!sessionId) {
      setState(closedState("USER_CLOSED"));
      return;
    }

    if (state.status === "PROCESSING") {
      setState(closeConfirmationState(product ?? getProduct(form.productId) ?? { id: form.productId, name: "Dodo Checkout", description: "Secure payment", price: 0, currency: "USD" }));
      return;
    }

    setState(closedState("USER_CLOSED"));
    sendCheckoutClosed(sessionId, "USER_CLOSED");
  }, [form.productId, product, sessionId, state.status]);

  const cancelClose = useCallback(() => {
    const restoreProduct = product ?? getProduct(form.productId);
    if (restoreProduct) {
      setState(readyState(restoreProduct));
      return;
    }

    setState(createInitialState());
  }, [form.productId, product]);

  const confirmClose = useCallback(() => {
    if (!sessionId) {
      setState(closedState("USER_CLOSED"));
      return;
    }

    setState(closedState("USER_CLOSED"));
    sendCheckoutClosed(sessionId, "USER_CLOSED");
  }, [sessionId]);

  return {
    state,
    form,
    product,
    sessionId,
    errorMessage,
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
  );
}
