import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export type PaymentSuccessProps = {
  sessionId: string;
};

export function PaymentSuccess({ sessionId }: PaymentSuccessProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-5 text-center py-2">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100/80 text-emerald-600 ring-8 ring-emerald-50">
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div>
        <h3 className="text-xl font-bold tracking-tight text-slate-900">Payment completed</h3>
        <p className="mt-1.5 text-sm text-slate-600">Your checkout was processed successfully.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Receipt / Session ID
            </p>
            <p className="font-mono text-xs text-slate-900 mt-1 select-all break-all">{sessionId}</p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="ml-3 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/10 active:bg-slate-200 transition-colors shrink-0"
            aria-label="Copy session ID"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
