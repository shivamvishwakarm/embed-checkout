import { Button } from "@/components/ui/button";

export type CheckoutHeaderProps = {
  title?: string | undefined;
  onClose?: (() => void) | undefined;
};

export function CheckoutHeader({ title = "Secure checkout", onClose }: CheckoutHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
          Dodo
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">{title}</h2>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Close checkout"
        onClick={onClose}
        className="h-9 w-9 rounded-full text-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      >
        ×
      </Button>
    </div>
  );
}
