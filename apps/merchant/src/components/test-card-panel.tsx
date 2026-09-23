"use client";

import React, { useState } from "react";

interface TestCard {
  label: string;
  number: string;
  behavior: string;
  badge: {
    text: string;
    color: string;
  };
}

const TEST_CARDS: TestCard[] = [
  {
    label: "Success Flow",
    number: "4242 4242 4242 4242",
    behavior: "Instantly succeeds and triggers onSuccess callback with sessionId.",
    badge: {
      text: "Always Succeeds",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
  },
  {
    label: "Decline Flow",
    number: "4000 0000 0000 0002",
    behavior: "Triggers PAYMENT_DECLINED. Shows retry screen inside checkout.",
    badge: {
      text: "Always Declines",
      color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    },
  },
  {
    label: "Retry → Success Flow",
    number: "4000 0000 0000 0341",
    behavior: "Declines on 1st attempt, then succeeds on retry (attempt #2).",
    badge: {
      text: "Fails Once → Retries",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
  },
];

export function TestCardPanel() {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const handleCopy = async (cardFormatted: string) => {
    const rawNumber = cardFormatted.replace(/\s+/g, "");
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(rawNumber);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = rawNumber;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedNumber(cardFormatted);
      setTimeout(() => {
        setCopiedNumber((current) => (current === cardFormatted ? null : current));
      }, 2000);
    } catch {
      // Ignore copy error
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Deterministic Test Cards</span>
            <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-400 border border-indigo-500/20">
              Fake Engine
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Click any card number to copy. Expiry: any future date (e.g.{" "}
            <span className="font-mono text-slate-300">12/28</span>), CVV: any 3 digits (e.g.{" "}
            <span className="font-mono text-slate-300">123</span>).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TEST_CARDS.map((card) => {
          const isCopied = copiedNumber === card.number;

          return (
            <div
              key={card.number}
              className="flex flex-col justify-between rounded-xl border border-slate-800/90 bg-slate-950/60 p-4 transition-colors hover:border-slate-700"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-300">
                    {card.label}
                  </span>
                  <span
                    className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${card.badge.color}`}
                  >
                    {card.badge.text}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(card.number)}
                  title="Click to copy raw card number"
                  className="group my-2 flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-left transition hover:border-indigo-500/40 hover:bg-slate-900"
                >
                  <span className="font-mono text-sm font-semibold tracking-wider text-slate-100 group-hover:text-indigo-300">
                    {card.number}
                  </span>
                  <span className="text-xs font-medium text-slate-400 group-hover:text-indigo-400">
                    {isCopied ? "Copied! ✓" : "Copy"}
                  </span>
                </button>

                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  {card.behavior}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
