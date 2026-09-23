"use client";

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
  const resolvedTitle = title ?? "Payment Declined";

  return (
    <div className="space-y-4 py-2">
      <Alert variant="destructive" className="border-red-200/90 bg-red-50/80 rounded-2xl p-4 text-red-900 shadow-xs">
        <div className="flex gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 shrink-0">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <AlertTitle className="text-sm font-bold text-red-900">{resolvedTitle}</AlertTitle>
            <AlertDescription className="text-xs text-red-700 mt-1 leading-relaxed">{message}</AlertDescription>
          </div>
        </div>
      </Alert>

      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          autoFocus
          className="w-full h-11 rounded-xl border-slate-300 font-semibold text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
        >
          Try Again
        </Button>
      ) : null}
    </div>
  );
}
