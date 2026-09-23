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
    <div className="space-y-6">
      <CheckoutHeader title="Secure checkout" onClose={onClose} />
      <ProductSummary product={resolvedProduct} />

      <div className="space-y-5">
        <CustomerForm
          value={form.email}
          onChange={(value) => onFieldChange?.("email", value)}
          error={errorMessage}
          disabled={processing}
        />

        <CardForm
          cardNumber={form.cardNumber}
          expiry={form.expiry}
          cvv={form.cvv}
          onChange={(field, value) => onFieldChange?.(field, value)}
          disabled={processing}
        />
      </div>

      <PaymentButton processing={processing} disabled={processing} onClick={() => onSubmit?.(form)} />
    </div>
  );

  const renderProcessingState = () => (
    <div className="space-y-6">
      <CheckoutHeader title="Processing payment" onClose={onClose} />
      <ProductSummary product={resolvedProduct} />

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center gap-3 text-slate-700">
          <Spinner size="md" className="text-slate-700" />
          <div>
            <p className="font-medium">Processing your payment</p>
            <p className="text-sm text-slate-500">This should only take a moment.</p>
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

  switch (state.status) {
    case "CREATED":
      return renderReadyState();
    case "LOADING":
      return (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white p-6">
          <Spinner size="lg" className="text-slate-700" />
          <p className="text-sm text-slate-600">Loading checkout...</p>
        </div>
      );
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
