"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export type CheckoutHeaderProps = {
  title?: string | undefined;
  onClose?: (() => void) | undefined;
  showTimer?: boolean;
};

export function CheckoutHeader({ title = "Payment", onClose, showTimer = true }: CheckoutHeaderProps) {
  const [secondsLeft, setSecondsLeft] = useState(11 * 60 + 38); // 11:38 initial

  useEffect(() => {
    if (!showTimer) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showTimer]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
      {/* Test Mode & Expiration Indicator */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50/90 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
          <span>Test Mode</span>
        </div>

        {showTimer && (
          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50/50 px-2 py-0.5 rounded-md border border-amber-200/60">
            <span>⏰ Expires in</span>
            <span className="font-mono font-bold tracking-tight">{formattedTime}</span>
          </div>
        )}
      </div>

      {/* Action / Dismiss Button */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close checkout"
          onClick={onClose}
          className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
