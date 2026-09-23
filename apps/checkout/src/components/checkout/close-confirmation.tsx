import { Button } from "@/components/ui/button";

export type CloseConfirmationProps = {
  onConfirm?: (() => void) | undefined;
  onCancel?: (() => void) | undefined;
};

export function CloseConfirmation({ onConfirm, onCancel }: CloseConfirmationProps) {
  return (
    <div className="space-y-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left shadow-sm">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-amber-700">Warning</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">Payment is being processed.</h3>
      </div>

      <p className="text-sm leading-6 text-slate-600">
        Are you sure you want to close this checkout? The current payment may still be processing.
      </p>

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Stay
        </Button>
        <Button type="button" variant="destructive" onClick={onConfirm} className="flex-1">
          Close
        </Button>
      </div>
    </div>
  );
}
