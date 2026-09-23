"use client";

import { useState } from "react";
import { CardForm } from "@/components/checkout/card-form";
import { CheckoutHeader } from "@/components/checkout/checkout-header";
import { CloseConfirmation } from "@/components/checkout/close-confirmation";
import { CustomerForm } from "@/components/checkout/customer-form";
import { PaymentButton } from "@/components/checkout/payment-button";
import { PaymentError } from "@/components/checkout/payment-error";
import { PaymentSuccess } from "@/components/checkout/payment-success";
import { ProductSummary } from "@/components/checkout/product-summary";
import { TestCardQuickFill } from "@/components/checkout/test-card-quick-fill";
import { UpiQrView } from "@/components/checkout/upi-qr-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProduct, type Product } from "@/lib/products";
import type { PaymentInput } from "@/features/payment/payment-types";
import { type CheckoutState } from "@/features/payment/payment-state";

export type CheckoutShellProps = {
  state: CheckoutState;
  form: PaymentInput;
  onFieldChange?: ((field: keyof PaymentInput, value: string) => void) | undefined;
  onSubmit?: ((input: PaymentInput) => void) | undefined;
  onClose?: (() => void) | undefined;
  onRetry?: (() => void) | undefined;
  onCancelClose?: (() => void) | undefined;
  onConfirmClose?: (() => void) | undefined;
  sessionId?: string | undefined;
  processing?: boolean | undefined;
  errorMessage?: string | undefined;
  product?: Product | undefined;
};

export function CheckoutShell({
  state,
  form,
  onFieldChange,
  onSubmit,
  onClose,
  onRetry,
  onCancelClose,
  onConfirmClose,
  sessionId,
  processing = false,
  errorMessage,
  product,
}: CheckoutShellProps) {
  const [activePaymentMethod, setActivePaymentMethod] = useState<"card" | "upi">("card");

  const resolvedProduct =
    product ??
    (state.status === "READY" || state.status === "PROCESSING" || state.status === "FAILURE" || state.status === "CLOSE_CONFIRMATION"
      ? state.product
      : getProduct(form.productId) ?? { id: form.productId, name: "Dodo Starter Kit", description: "The essential embeddable checkout package for modern developers.", price: 49, currency: "USD" });

  const handleTestCardFill = (cardNumber: string, expiry: string, cvv: string) => {
    onFieldChange?.("cardNumber", cardNumber);
    onFieldChange?.("expiry", expiry);
    onFieldChange?.("cvv", cvv);
    if (!form.email) {
      onFieldChange?.("email", "buyer@example.com");
    }
  };

  const handleUpiSimulateSuccess = () => {
    // Fill required dummy data and submit
    const simulatedInput: PaymentInput = {
      ...form,
      productId: resolvedProduct.id,
      email: form.email || "upi.user@example.com",
      cardNumber: "4242424242424242",
      expiry: "12/28",
      cvv: "123",
    };
    onSubmit?.(simulatedInput);
  };

  const renderReadyState = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!processing) {
          onSubmit?.(form);
        }
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Order Summary & Trust Guarantee */}
        <div className="md:col-span-5 space-y-4">
          <ProductSummary product={resolvedProduct} />
          <TestCardQuickFill onFill={handleTestCardFill} />
        </div>

        {/* Right Column: Header, Payment Method Tabs & Form */}
        <div className="md:col-span-7 space-y-4">
          <CheckoutHeader title="Payment Options" onClose={onClose} />

          {/* Payment Method Switcher Tabs */}
          <Tabs value={activePaymentMethod} onValueChange={(val) => setActivePaymentMethod(val as "card" | "upi")}>
            <TabsList className="grid grid-cols-2 h-11 p-1 bg-slate-100 rounded-xl">
              <TabsTrigger
                value="card"
                className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                <span>Card</span>
              </TabsTrigger>

              <TabsTrigger
                value="upi"
                className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-gradient-to-r from-orange-500 via-white to-green-600 border border-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-700" />
                </span>
                <span>UPI</span>
              </TabsTrigger>
            </TabsList>

            {/* Card Payment Form */}
            <TabsContent value="card" className="space-y-4 mt-3">
              <CustomerForm
                value={form.email}
                onChange={(value) => onFieldChange?.("email", value)}
                error={errorMessage}
                disabled={processing}
                autoFocus
              />

              <CardForm
                cardNumber={form.cardNumber}
                expiry={form.expiry}
                cvv={form.cvv}
                onChange={(field, value) => onFieldChange?.(field, value)}
                disabled={processing}
              />

              <div className="pt-1">
                <PaymentButton processing={processing} disabled={processing} />
              </div>
            </TabsContent>

            {/* UPI QR Code Mode */}
            <TabsContent value="upi" className="mt-3">
              <UpiQrView
                onSimulateSuccess={handleUpiSimulateSuccess}
                processing={processing}
              />
            </TabsContent>
          </Tabs>

          {/* Merchant of Record & Security Footer */}
          <div className="pt-2 text-center border-t border-slate-100">
            <p className="text-[11px] leading-relaxed text-slate-400">
              This order process is conducted by our online reseller &amp; Merchant of Record,{" "}
              <span className="font-medium text-slate-500">dodopayments.com</span>, who also handles order-related inquiries and returns.
            </p>
            <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <span>🦤</span>
                <span className="font-semibold text-slate-700">Dodo Payments</span>
              </span>
              <span>·</span>
              <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-slate-800 hover:underline">
                Privacy
              </a>
              <span>·</span>
              <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-slate-800 hover:underline">
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </form>
  );

  const renderProcessingState = () => (
    <div className="space-y-6 max-w-lg mx-auto py-4">
      <CheckoutHeader title="Processing payment" onClose={onClose} showTimer={false} />
      <ProductSummary product={resolvedProduct} />

      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-8 text-center shadow-sm">
        <div className="flex flex-col items-center justify-center gap-4 text-slate-700">
          <div className="relative">
            <Spinner size="lg" className="text-slate-900" />
            <div className="absolute inset-0 animate-ping opacity-25 rounded-full bg-slate-400" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-base text-slate-900">Contacting card network...</p>
            <p className="text-xs text-slate-500">
              Please do not refresh or close this window while we verify your transaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFailureState = () => {
    const error = state.status === "FAILURE" ? state.error : undefined;
    const message = error?.message ?? errorMessage ?? "Please review your details and try again.";

    return (
      <div className="space-y-6 max-w-lg mx-auto py-4">
        <CheckoutHeader title="Payment issue" onClose={onClose} showTimer={false} />
        <ProductSummary product={resolvedProduct} />
        <PaymentError message={message} onRetry={onRetry} />
      </div>
    );
  };

  const renderSuccessState = () => {
    const successSessionId = sessionId ?? (state.status === "SUCCESS" ? state.sessionId : undefined) ?? "cs_unknown";

    return (
      <div className="space-y-6 max-w-lg mx-auto py-4">
        <CheckoutHeader title="Payment complete" onClose={onClose} showTimer={false} />
        <PaymentSuccess sessionId={successSessionId} />
      </div>
    );
  };

  const renderCloseConfirmationState = () => (
    <div className="space-y-6 max-w-md mx-auto py-4">
      <CheckoutHeader title="Secure checkout" onClose={onClose} showTimer={false} />
      <CloseConfirmation onCancel={onCancelClose} onConfirm={onConfirmClose} />
    </div>
  );

  const renderErrorState = () => (
    <div className="space-y-6 max-w-md mx-auto py-4">
      <CheckoutHeader title="Something went wrong" onClose={onClose} showTimer={false} />
      <Alert variant="destructive">
        <AlertTitle>Unable to continue</AlertTitle>
        <AlertDescription>{state.status === "ERROR" ? state.message : "The checkout session could not be initialized."}</AlertDescription>
      </Alert>
    </div>
  );

  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-pulse" aria-busy="true" aria-label="Loading checkout">
      <div className="md:col-span-5 space-y-4">
        <div className="h-44 w-full rounded-2xl bg-slate-100 border border-slate-200" />
        <div className="h-16 w-full rounded-xl bg-slate-100" />
      </div>
      <div className="md:col-span-7 space-y-4">
        <div className="h-10 w-full rounded-xl bg-slate-100" />
        <div className="h-12 w-full rounded-xl bg-slate-100" />
        <div className="h-28 w-full rounded-xl bg-slate-100" />
        <div className="h-12 w-full rounded-xl bg-slate-200" />
      </div>
    </div>
  );

  switch (state.status) {
    case "CREATED":
      return renderReadyState();
    case "LOADING":
      return renderLoadingSkeleton();
    case "READY":
      return renderReadyState();
    case "PROCESSING":
      return renderProcessingState();
    case "FAILURE":
      return renderFailureState();
    case "SUCCESS":
      return renderSuccessState();
    case "CLOSE_CONFIRMATION":
      return renderCloseConfirmationState();
    case "CLOSED":
      return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center max-w-md mx-auto">
          <p className="text-lg font-semibold text-slate-900">Checkout closed</p>
          <p className="mt-2 text-sm text-slate-600">The session was closed successfully.</p>
        </div>
      );
    case "ERROR":
      return renderErrorState();
    default:
      return renderReadyState();
  }
}
