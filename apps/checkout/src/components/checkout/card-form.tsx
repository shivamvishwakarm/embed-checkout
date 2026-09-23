"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type CardFormProps = {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardholderName?: string;
  onChange?: ((field: "cardNumber" | "expiry" | "cvv", value: string) => void) | undefined;
  errors?: Partial<Record<"cardNumber" | "expiry" | "cvv", string>> | undefined;
  disabled?: boolean | undefined;
};

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function detectCardBrand(number: string): "visa" | "mastercard" | "amex" | "rupay" | "unknown" {
  const clean = number.replace(/\D/g, "");
  if (clean.startsWith("4")) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(clean)) return "mastercard";
  if (/^3[47]/.test(clean)) return "amex";
  if (/^(60|65|81|82|508)/.test(clean)) return "rupay";
  return "unknown";
}

export function CardForm({
  cardNumber,
  expiry,
  cvv,
  cardholderName,
  onChange,
  errors,
  disabled,
}: CardFormProps) {
  const [name, setName] = React.useState(cardholderName ?? "");
  const detectedBrand = detectCardBrand(cardNumber);

  return (
    <div className="space-y-4">
      {/* Unified Card Information Group */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="card-number">Card information</Label>
        </div>

        <div
          className={cn(
            "rounded-xl border border-slate-300 bg-white transition-all shadow-sm focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10 overflow-hidden",
            (errors?.cardNumber || errors?.expiry || errors?.cvv) && "border-red-400 focus-within:border-red-500 focus-within:ring-red-500/20"
          )}
        >
          {/* Top row: Card Number + Card brand icons */}
          <div className="relative flex items-center border-b border-slate-200/80 px-3.5 py-2.5">
            <input
              id="card-number"
              aria-label="Card number"
              type="text"
              inputMode="numeric"
              value={cardNumber}
              onChange={(e) => onChange?.("cardNumber", formatCardNumber(e.target.value))}
              placeholder="1234 1234 1234 1234"
              disabled={disabled}
              autoComplete="cc-number"
              maxLength={19}
              required
              className="w-full bg-transparent text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />

            {/* Brand Badges */}
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span
                className={cn(
                  "flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-black transition-all",
                  detectedBrand === "visa"
                    ? "bg-blue-600 text-white shadow-sm scale-105"
                    : "bg-slate-100 text-slate-400 opacity-60"
                )}
              >
                VISA
              </span>
              <span
                className={cn(
                  "flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-black transition-all",
                  detectedBrand === "mastercard"
                    ? "bg-amber-600 text-white shadow-sm scale-105"
                    : "bg-slate-100 text-slate-400 opacity-60"
                )}
              >
                MC
              </span>
              <span
                className={cn(
                  "flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-black transition-all",
                  detectedBrand === "amex"
                    ? "bg-sky-600 text-white shadow-sm scale-105"
                    : "bg-slate-100 text-slate-400 opacity-60"
                )}
              >
                AMEX
              </span>
              <span
                className={cn(
                  "flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-black transition-all",
                  detectedBrand === "rupay"
                    ? "bg-emerald-600 text-white shadow-sm scale-105"
                    : "bg-slate-100 text-slate-400 opacity-60"
                )}
              >
                RUPAY
              </span>
            </div>
          </div>

          {/* Bottom row: Expiry and CVV split */}
          <div className="grid grid-cols-2 divide-x divide-slate-200/80">
            <div className="px-3.5 py-2.5">
              <input
                id="card-expiry"
                aria-label="Expiry date"
                type="text"
                inputMode="numeric"
                value={expiry}
                onChange={(e) => onChange?.("expiry", formatExpiry(e.target.value))}
                placeholder="MM / YY"
                disabled={disabled}
                autoComplete="cc-exp"
                maxLength={5}
                required
                className="w-full bg-transparent text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <div className="relative flex items-center px-3.5 py-2.5">
              <input
                id="card-cvv"
                aria-label="CVV / CVC"
                type="password"
                inputMode="numeric"
                value={cvv}
                onChange={(e) =>
                  onChange?.("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="CVC"
                disabled={disabled}
                autoComplete="cc-csc"
                maxLength={4}
                required
                className="w-full bg-transparent text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <svg
                className="h-4 w-4 text-slate-400 shrink-0 ml-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
          </div>
        </div>

        {errors?.cardNumber && (
          <p className="text-xs font-medium text-red-600 mt-1">{errors.cardNumber}</p>
        )}
      </div>

      {/* Cardholder Name */}
      <div className="space-y-1.5">
        <Label htmlFor="cardholder-name">Cardholder name</Label>
        <input
          id="cardholder-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name on card"
          disabled={disabled}
          autoComplete="cc-name"
          className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
      </div>

      {/* Compliance / Security Trust Callout */}
      <div className="flex items-center justify-center gap-1.5 text-emerald-700 py-0.5">
        <svg
          className="h-3.5 w-3.5 text-emerald-600"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-[11px] font-semibold tracking-wide">
          Secure • PCI DSS Compliant
        </span>
      </div>
    </div>
  );
}
