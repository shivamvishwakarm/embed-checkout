import React from "react";
import { CheckoutDemo } from "../components/checkout-demo";

export default function MerchantPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white p-1 shadow-lg shadow-indigo-500/10 border border-slate-700/50 overflow-hidden">
              <img
                src="/dodo-icon.png"
                alt="Dodo Store"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">
                Dodo Store
              </span>
              <span className="ml-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[11px] font-semibold text-indigo-400">
                Merchant Demo
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Merchant: <strong className="text-slate-300">localhost:3000</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span>
              Checkout Iframe: <strong className="text-slate-300">localhost:3001</strong>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Embeddable Checkout SDK Demo
          </h1>
          <p className="text-base text-slate-300">
            A cross-origin payment overlay built with strict postMessage contracts,
            zero server dependencies, and deterministic test cards.
          </p>
        </div>

        {/* Demo Orchestrator */}
        <CheckoutDemo />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 mt-20 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 space-y-1">
          <p>
            Dodo Checkout Monorepo — Frontend Engineering Assignment.
          </p>
          <p className="text-slate-400">
            Separation of concerns: Merchant App (Host) ↔ @dodo/sdk ↔ Checkout App (Iframe).
          </p>
        </div>
      </footer>
    </div>
  );
}
