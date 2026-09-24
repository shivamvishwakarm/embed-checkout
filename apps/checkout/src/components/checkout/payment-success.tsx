"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { confetti } from "@/lib/confetti";
import type { Product } from "@/lib/products";
import { formatCurrency } from "@/lib/products";

export type PaymentSuccessProps = {
  sessionId: string | undefined;
  product?: Product | undefined;
  attemptId?: string | undefined;
  onClose?: (() => void) | undefined;
};

export function PaymentSuccess({
  sessionId,
  product,
  attemptId,
  onClose,
}: PaymentSuccessProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    confetti.burstCelebration();
  }, []);

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTriggerMoreConfetti = () => {
    confetti.burstCelebration();
  };

  const formattedDate = React.useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  }, []);

  return (
    <div className="relative overflow-hidden py-4 sm:py-6">
      {/* Background decoration */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-72 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-md flex-col items-center text-center">
        {/* Success icon */}
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-400/10 animate-ping" />

          <div className="absolute inset-1 rounded-full bg-emerald-100/70" />

          <div
            title="Celebrate again"
            aria-label="Celebrate payment success"
            className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <svg
              className="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>

          </div>
        </div>

        {/* Heading */}
        <div className="mb-6 flex flex-col items-center gap-2">
          {/* <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Payment Verified
          </div> */}

          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Payment Successful
          </h2>

          <p className="max-w-sm text-xs leading-relaxed text-slate-500 sm:text-sm">
            Your payment was completed successfully. Your order confirmation
            has been sent to your email.
          </p>
        </div>

        {/* Transaction summary */}
        <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm">
          {product && (
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/70 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-1.5">
                  <img
                    src="/dodo-icon.png"
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900">
                    {product.name}
                  </p>

                  <p className="text-[11px] font-medium text-slate-500">
                    Billed to your card
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-extrabold text-slate-900">
                  {formatCurrency(product.price, product.currency)}
                </p>

                <span className="mt-1 inline-flex rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-600">
                  Paid
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3 p-4 text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-slate-500">Status</span>

              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Completed
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-slate-500">Date & Time</span>

              <span className="text-right font-medium text-slate-800">
                {formattedDate}
              </span>
            </div>

            {attemptId && (
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium text-slate-500">
                  Attempt Reference
                </span>

                <span className="truncate font-mono text-[11px] font-semibold text-slate-700">
                  {attemptId}
                </span>
              </div>
            )}

            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Session & Receipt ID
                  </span>

                  <p className="truncate select-all font-mono text-xs font-semibold text-slate-800">
                    {sessionId}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(sessionId || "")}
                  className="h-7 shrink-0 bg-white px-2.5 text-xs font-semibold"
                  aria-label="Copy receipt ID"
                >
                  {copied ? "Copied ✓" : "Copy"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex w-full flex-col gap-2.5 sm:flex-row">
          {onClose && (
            <Button
              type="button"
              onClick={onClose}
              className="h-11 flex-1 rounded-xl bg-slate-900 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Done & Return to Store
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleTriggerMoreConfetti}
            className="h-11 rounded-xl border-slate-200 px-4 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 sm:w-auto"
          >
            Celebrate Again
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] leading-relaxed text-slate-400">
          <svg
            className="h-3.5 w-3.5 shrink-0 text-emerald-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 001.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>

          <span>
            Secured by Dodo Payments Merchant of Record. Zero card details
            stored.
          </span>
        </div>
      </div>
    </div>
  );
}