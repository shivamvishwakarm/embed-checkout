"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import { formatCurrency } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export type ProductSummaryProps = {
  product: Product;
};

export function ProductSummary({ product }: ProductSummaryProps) {
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  // Approximate 18% tax breakdown for simulation matching image 2 & 3
  const effectivePrice = discountApplied ? Math.max(0, product.price * 0.9) : product.price;
  const subtotal = Math.round(effectivePrice * 0.847 * 100) / 100;
  const tax = Math.round((effectivePrice - subtotal) * 100) / 100;

  const handleApplyDiscount = () => {
    if (discountCode.trim()) {
      setDiscountApplied(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Merchant Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-700 ring-2 ring-pink-50">
            D
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-800">Dodo Store</span>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.2 text-[10px] font-medium text-blue-700">
              Verified
            </span>
          </div>
        </div>
        <Badge variant="outline" className="text-[11px] font-medium text-slate-600 bg-white">
          Pay in {product.currency.toUpperCase()} ▾
        </Badge>
      </div>

      {/* Main Product Showcase Box */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
        <div className="flex items-start gap-3.5">
          {/* Product Icon Avatar */}
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-sm overflow-hidden">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-900 text-white font-bold text-xl">
              🦤
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-base font-bold text-slate-900 truncate tracking-tight">
                {product.name}
              </h3>
              <p className="text-base font-bold text-slate-900 tracking-tight shrink-0">
                {formatCurrency(effectivePrice, product.currency)}
              </p>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 line-clamp-2">
              {product.description}
            </p>
          </div>
        </div>

        <Separator className="my-3.5" />

        {/* Collapsible Discount Code */}
        {!showDiscount && !discountApplied ? (
          <button
            type="button"
            onClick={() => setShowDiscount(true)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors flex items-center gap-1"
          >
            <span>Have a discount code?</span>
            <span className="font-semibold">Apply code</span>
          </button>
        ) : discountApplied ? (
          <div className="flex items-center justify-between text-xs rounded-lg bg-emerald-50 px-3 py-1.5 border border-emerald-200 text-emerald-800">
            <span className="font-medium">Coupon &apos;{discountCode}&apos; applied (-10%)</span>
            <button
              type="button"
              onClick={() => {
                setDiscountApplied(false);
                setDiscountCode("");
              }}
              className="text-emerald-700 font-semibold hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="e.g. WELCOME10"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-slate-800 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleApplyDiscount}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
            >
              Apply
            </button>
          </div>
        )}

        <Separator className="my-3.5" />

        {/* Itemized Price Breakdown */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-mono">{formatCurrency(subtotal, product.currency)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Estimated Tax (GST/VAT)</span>
            <span className="font-mono">{formatCurrency(tax, product.currency)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between items-baseline pt-0.5">
            <span className="text-sm font-bold text-slate-900">Total</span>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight font-mono">
              {formatCurrency(effectivePrice, product.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
