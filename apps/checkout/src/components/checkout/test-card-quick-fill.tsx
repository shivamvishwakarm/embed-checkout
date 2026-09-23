"use client";

import { useState } from "react";

export type TestCardQuickFillProps = {
  onFill?: (cardNumber: string, expiry: string, cvv: string) => void;
};

const TEST_CARDS = [
  {
    name: "Success Card",
    number: "4242 4242 4242 4242",
    raw: "4242424242424242",
    expiry: "12/28",
    cvv: "123",
    status: "Always Succeeds",
    tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    name: "Decline Card",
    number: "4000 0000 0000 0002",
    raw: "4000000000000002",
    expiry: "12/28",
    cvv: "123",
    status: "Always Declines",
    tagColor: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    name: "Retry Flow",
    number: "4000 0000 0000 0341",
    raw: "4000000000000341",
    expiry: "12/28",
    cvv: "123",
    status: "Fails 1st, Passes 2nd",
    tagColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
];

export function TestCardQuickFill({ onFill }: TestCardQuickFillProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSelect = (card: (typeof TEST_CARDS)[0], index: number) => {
    onFill?.(card.number, card.expiry, card.cvv);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white/70 shadow-sm backdrop-blur-sm transition-all overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 text-left text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
            🧪
          </span>
          <div>
            <span className="font-semibold text-slate-900">Test Cards</span>
            <span className="text-slate-500 font-normal ml-1.5">(simulation sandbox)</span>
          </div>
        </div>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 bg-slate-50/60 p-3 space-y-2">
          <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
            Click any card to auto-fill into the payment form:
          </p>
          <div className="space-y-1.5">
            {TEST_CARDS.map((card, idx) => (
              <button
                key={card.number}
                type="button"
                onClick={() => handleSelect(card, idx)}
                className="w-full flex items-center justify-between rounded-lg border border-slate-200/80 bg-white p-2 text-left hover:border-slate-300 hover:bg-slate-50/80 transition-all group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold tracking-wider text-slate-800">
                      {card.number}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${card.tagColor}`}>
                      {card.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Exp: {card.expiry} · CVV: {card.cvv}
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-500 group-hover:text-blue-600 transition-colors">
                  {copiedIndex === idx ? "Applied! ✓" : "Fill →"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
