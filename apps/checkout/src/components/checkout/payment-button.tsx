"use client";

import { Button } from "@/components/ui/button";

export type PaymentButtonProps = {
  processing?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  label?: string;
};

export function PaymentButton({
  processing = false,
  disabled = false,
  onClick,
  type = "submit",
  label = "Pay now",
}: PaymentButtonProps) {
  return (
    <Button
      type={type}
      variant="default"
      size="lg"
      onClick={onClick}
      disabled={disabled || processing}
      loading={processing}
      className="w-full h-12 rounded-xl bg-slate-900 text-white font-semibold shadow-md hover:bg-slate-800 active:scale-[0.99] transition-all"
    >
      {processing ? (
        "Processing..."
      ) : (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-4 w-4 opacity-80" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
              clipRule="evenodd"
            />
          </svg>
          <span>{label}</span>
        </span>
      )}
    </Button>
  );
}
