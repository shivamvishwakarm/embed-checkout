"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-5 text-center py-4">
      {/* Animated celebratory checkmark */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100/90 text-emerald-600 ring-8 ring-emerald-50 shadow-sm animate-bounce duration-1000">
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div>
        <h3 className="text-xl font-bold tracking-tight text-slate-900">Payment completed!</h3>
        <p className="mt-1 text-xs text-slate-500">
          Your transaction has been processed securely. A receipt has been sent to your email.
        </p>
      </div>

      {/* Receipt box */}
      <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 text-left shadow-xs">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Receipt / Session ID
            </p>
            <p className="font-mono text-xs text-slate-900 mt-1 select-all break-all font-semibold">
              {sessionId}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-2.5 text-xs font-semibold shrink-0 bg-white"
            aria-label="Copy session ID"
          >
            {copied ? "Copied! ✓" : "Copy"}
          </Button>
        </div>
      </div>
    </div>
  );
}
