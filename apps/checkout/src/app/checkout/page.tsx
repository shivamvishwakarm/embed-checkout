"use client";

import { CheckoutPageShell } from "@/hooks/use-checkout-session";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.4)]">
          <CheckoutPageShell />
        </div>
      </div>
    </main>
  );
}
