"use client";

import React from "react";

export interface DemoProduct {
  id: string;
  name: string;
  tagline: string;
  price: number;
  currency: string;
  badge?: string;
  features: string[];
  recommended?: boolean;
}

interface ProductCardProps {
  product: DemoProduct;
  onBuy: (productId: string) => void;
  isCheckoutActive: boolean;
}

export function ProductCard({
  product,
  onBuy,
  isCheckoutActive,
}: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency,
    minimumFractionDigits: 0,
  }).format(product.price);

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 ${
        product.recommended
          ? "border-indigo-500/60 bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900/90 shadow-xl shadow-indigo-950/30 ring-1 ring-indigo-500/30"
          : "border-slate-800 bg-slate-900/80 hover:border-slate-700"
      }`}
    >
      {product.badge && (
        <div className="absolute -top-3 left-6">
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-md">
            {product.badge}
          </span>
        </div>
      )}

      <div>
        <div className="mb-4">
          <span className="text-xs font-mono font-medium text-slate-400">
            {product.id}
          </span>
          <h3 className="mt-1 text-xl font-bold text-white tracking-tight">
            {product.name}
          </h3>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {product.tagline}
          </p>
        </div>

        <div className="my-5 flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {formattedPrice}
          </span>
          <span className="text-xs font-medium text-slate-400">
            one-time payment
          </span>
        </div>

        <ul className="mb-6 space-y-2.5 text-sm text-slate-300">
          {product.features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2.5">
              <svg
                className="h-4 w-4 shrink-0 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        disabled={isCheckoutActive}
        onClick={() => onBuy(product.id)}
        className={`w-full rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
          isCheckoutActive
            ? "cursor-not-allowed bg-slate-800 text-slate-500"
            : product.recommended
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-[0.99]"
            : "bg-slate-800 text-slate-100 hover:bg-slate-700 active:scale-[0.99]"
        }`}
      >
        {isCheckoutActive ? "Checkout Active…" : `Buy for ${formattedPrice}`}
      </button>
    </div>
  );
}
