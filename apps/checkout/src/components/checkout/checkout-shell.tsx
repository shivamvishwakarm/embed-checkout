import { CardForm } from "@/components/checkout/card-form";
import { CheckoutHeader } from "@/components/checkout/checkout-header";
import { CloseConfirmation } from "@/components/checkout/close-confirmation";
import { CustomerForm } from "@/components/checkout/customer-form";
import { PaymentButton } from "@/components/checkout/payment-button";
import { PaymentError } from "@/components/checkout/payment-error";
import { PaymentSuccess } from "@/components/checkout/payment-success";
import { ProductSummary } from "@/components/checkout/product-summary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getProduct, type Product } from "@/lib/products";
import type { PaymentError as PaymentErrorType, PaymentInput } from "@/features/payment/payment-types";
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
  const resolvedProduct =
    product ??
    (state.status === "READY" || state.status === "PROCESSING" || state.status === "FAILURE" || state.status === "CLOSE_CONFIRMATION"
      ? state.product
      : getProduct(form.productId) ?? { id: form.productId, name: "Dodo Checkout", description: "Secure payment", price: 0, currency: "USD" });

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
      <CheckoutHeader title="Secure checkout" onClose={onClose} />
      <ProductSummary product={resolvedProduct} />

      <div className="space-y-4">
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
      </div>

      <div className="space-y-3 pt-1">
        <PaymentButton processing={processing} disabled={processing} />
        <div className="flex items-center justify-center gap-1.5 text-slate-400">
          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
          <span className="text-[11px] font-medium tracking-wide">End-to-end encrypted · Simulated Sandbox</span>
        </div>
      </div>
    </form>
  );

  const renderProcessingState = () => (
    <div className="space-y-6">
      <CheckoutHeader title="Processing payment" onClose={onClose} />
      <ProductSummary product={resolvedProduct} />

      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6 text-center">
        <div className="flex flex-col items-center justify-center gap-3 text-slate-700">
          <Spinner size="lg" className="text-slate-900" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-900">Contacting card network...</p>
            <p className="text-xs text-slate-500">Please do not refresh or close this window.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFailureState = () => {
    const error = state.status === "FAILURE" ? state.error : undefined;
    const message = error?.message ?? errorMessage ?? "Please review your details and try again.";

    return (
      <div className="space-y-6">
        <CheckoutHeader title="Payment issue" onClose={onClose} />
        <ProductSummary product={resolvedProduct} />
        <PaymentError message={message} onRetry={onRetry} />
      </div>
    );
  };

  const renderSuccessState = () => {
    const successSessionId = sessionId ?? (state.status === "SUCCESS" ? state.sessionId : undefined) ?? "cs_unknown";

    return (
      <div className="space-y-6">
        <CheckoutHeader title="Payment complete" onClose={onClose} />
        <PaymentSuccess sessionId={successSessionId} />
      </div>
    );
  };

  const renderCloseConfirmationState = () => (
    <div className="space-y-6">
      <CheckoutHeader title="Secure checkout" onClose={onClose} />
      <CloseConfirmation onCancel={onCancelClose} onConfirm={onConfirmClose} />
    </div>
  );

  const renderErrorState = () => (
    <div className="space-y-6">
      <CheckoutHeader title="Something went wrong" onClose={onClose} />
      <Alert variant="destructive">
        <AlertTitle>Unable to continue</AlertTitle>
        <AlertDescription>{state.status === "ERROR" ? state.message : "The checkout session could not be initialized."}</AlertDescription>
      </Alert>
    </div>
  );

  const renderLoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading checkout">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="space-y-2">
          <div className="h-2.5 w-24 rounded-full bg-slate-200" />
          <div className="h-5 w-36 rounded-lg bg-slate-200" />
        </div>
        <div className="h-9 w-9 rounded-full bg-slate-200" />
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="space-y-1.5">
            <div className="h-2.5 w-20 rounded-full bg-slate-200" />
            <div className="h-4 w-32 rounded-lg bg-slate-200" />
          </div>
          <div className="h-5 w-16 rounded-lg bg-slate-200" />
        </div>
        <div className="h-3 w-48 rounded bg-slate-200" />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-slate-200" />
          <div className="h-11 w-full rounded-xl bg-slate-100 border border-slate-200" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="h-11 w-full rounded-xl bg-slate-100 border border-slate-200" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-slate-200" />
            <div className="h-11 w-full rounded-xl bg-slate-100 border border-slate-200" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-14 rounded bg-slate-200" />
            <div className="h-11 w-full rounded-xl bg-slate-100 border border-slate-200" />
          </div>
        </div>
      </div>

      <div className="h-12 w-full rounded-xl bg-slate-200" />
      <p className="text-center text-xs text-slate-400">Loading checkout...</p>
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
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
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
