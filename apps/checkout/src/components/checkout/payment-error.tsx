import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export type PaymentErrorProps = {
  title?: string | undefined;
  message?: string | undefined;
  onRetry?: (() => void) | undefined;
};

export function PaymentError({
  title,
  message = "Please review your details and try again.",
  onRetry,
}: PaymentErrorProps) {
  const resolvedTitle = title ?? "Unable to complete payment";

  return (
    <div className="space-y-4">
      <Alert variant="destructive" className="border-red-200 bg-red-50/90 text-red-900">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-red-600 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <AlertTitle className="text-base font-semibold text-red-900">{resolvedTitle}</AlertTitle>
            <AlertDescription className="text-sm text-red-700 mt-1 leading-5">{message}</AlertDescription>
          </div>
        </div>
      </Alert>

      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          autoFocus
          className="w-full h-11 border-slate-300 font-medium hover:bg-slate-50"
        >
          Try again
        </Button>
      ) : null}
    </div>
  );
}
