"use client";

import { Button } from "@/components/ui/button";

export type CloseConfirmationProps = {
  onConfirm?: (() => void) | undefined;
  onCancel?: (() => void) | undefined;
  isProcessing?: boolean;
};

export function CloseConfirmation({
  onConfirm,
  onCancel,
  isProcessing = false,
}: CloseConfirmationProps) {
  return (
    <div
      role="alertdialog"
      aria-labelledby="close-dialog-title"
      aria-describedby="close-dialog-desc"
      className="w-full space-y-4 rounded-2xl border border-amber-200/90 bg-amber-50/95 p-6 text-left shadow-xl"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 border border-amber-200/80">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-200/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
            Warning
          </div>
          <h3 id="close-dialog-title" className="text-base font-bold text-slate-900">
            Are you sure you want to exit?
          </h3>
          <p id="close-dialog-desc" className="text-xs leading-relaxed text-slate-700">
            {isProcessing
              ? "Payment is being processed. Your transaction may still be in flight with the payment network. Are you sure you want to exit?"
              : "Your payment has not been completed yet. If you exit now, your checkout session will be cancelled."}
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
        <Button
          type="button"
          variant="destructive"
          onClick={onConfirm}
          className="flex-1 h-10 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
        >
          Yes, Exit
        </Button>
        <Button
          type="button"
          variant="default"
          onClick={onCancel}
          autoFocus
          className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm"
        >
          Continue Payment
        </Button>
      </div>
    </div>
  );
}
