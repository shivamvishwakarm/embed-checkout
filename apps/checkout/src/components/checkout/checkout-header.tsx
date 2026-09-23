import { Button } from "@/components/ui/button";

export type CheckoutHeaderProps = {
  title?: string | undefined;
  onClose?: (() => void) | undefined;
};

export function CheckoutHeader({ title = "Secure checkout", onClose }: CheckoutHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
      <div>
        <div className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Dodo Secure Checkout
          </span>
        </div>
        <h2 className="mt-1 text-lg font-semibold text-slate-900 tracking-tight">{title}</h2>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Close checkout"
        onClick={onClose}
        className="h-10 w-10 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </Button>
    </div>
  );
}
