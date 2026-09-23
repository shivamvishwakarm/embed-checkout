import { Button } from "@/components/ui/button";

export type CloseConfirmationProps = {
  onConfirm?: (() => void) | undefined;
  onCancel?: (() => void) | undefined;
};

export function CloseConfirmation({ onConfirm, onCancel }: CloseConfirmationProps) {
  return (
    <div
      role="alertdialog"
      aria-labelledby="close-dialog-title"
      aria-describedby="close-dialog-desc"
      className="space-y-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left shadow-sm"
    >
      <div>
        <div className="flex items-center gap-1.5">
          <svg className="h-4 w-4 text-amber-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">Warning</p>
        </div>
        <h3 id="close-dialog-title" className="mt-2 text-lg font-semibold text-slate-900">
          Payment is being processed.
        </h3>
      </div>

      <p id="close-dialog-desc" className="text-sm leading-6 text-slate-700">
        Are you sure you want to close this checkout? The current payment may still be processing.
      </p>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          autoFocus
          className="flex-1 border-slate-300 bg-white hover:bg-slate-100"
        >
          Stay
        </Button>
        <Button type="button" variant="destructive" onClick={onConfirm} className="flex-1">
          Close
        </Button>
      </div>
    </div>
  );
}
