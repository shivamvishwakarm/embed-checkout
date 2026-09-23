"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DodoCheckout } from "../lib/checkout";
import { ProductCard, type DemoProduct } from "./product-card";
import { TestCardPanel } from "./test-card-panel";
import { EventLog, type LoggedEvent } from "./event-log";

const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: "prod_123",
    name: "Dodo Starter Kit",
    tagline: "The essential embeddable checkout package for modern developers.",
    price: 49,
    currency: "USD",
    badge: "Most Popular",
    recommended: true,
    features: [
      "Embeddable cross-origin iframe",
      "Deterministic test cards",
      "Full TypeScript SDK",
      "Zero external dependencies",
    ],
  },
  {
    id: "prod_456",
    name: "Dodo Pro Bundle",
    tagline: "Advanced checkout tooling for high-converting developer storefronts.",
    price: 129,
    currency: "USD",
    badge: "Pro",
    recommended: false,
    features: [
      "Everything in Starter Kit",
      "Automatic retry handling",
      "Double-click idempotency protection",
      "Standard accessible keyboard controls",
    ],
  },
  {
    id: "prod_789",
    name: "Dodo Enterprise",
    tagline: "Dedicated compliance isolation and custom checkout integrations.",
    price: 249,
    currency: "USD",
    badge: "Enterprise",
    recommended: false,
    features: [
      "Everything in Pro Bundle",
      "Strict origin validation",
      "Configurable timeout guards",
      "Full protocol event auditing",
    ],
  },
];

function formatTimestamp(): string {
  const now = new Date();
  return now.toTimeString().split(" ")[0] + "." + String(now.getMilliseconds()).padStart(3, "0");
}

export function CheckoutDemo() {
  const [isCheckoutActive, setIsCheckoutActive] = useState(false);
  const [customProductId, setCustomProductId] = useState("");
  const [events, setEvents] = useState<LoggedEvent[]>([]);
  const [lastSuccessSessionId, setLastSuccessSessionId] = useState<string | null>(null);

  const addEvent = useCallback(
    (
      type: string,
      source: LoggedEvent["source"],
      payload?: Record<string, unknown> | null
    ) => {
      const newEvent: LoggedEvent = {
        id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: formatTimestamp(),
        type,
        source,
        payload,
      };
      setEvents((prev) => [newEvent, ...prev]);
    },
    []
  );

  // Listen to postMessage protocol events for demonstration purposes
  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (!event.data || typeof event.data !== "object") return;
      const data = event.data as { version?: number; type?: string; sessionId?: string };
      if (data.version === 1 && typeof data.type === "string") {
        // Record raw protocol message received in merchant window
        addEvent(data.type, "postmessage_protocol", data as Record<string, unknown>);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [addEvent]);

  const handleBuy = (productId: string) => {
    const targetProductId = productId.trim();
    if (!targetProductId) return;

    setIsCheckoutActive(true);
    addEvent("CHECKOUT_OPENED", "merchant_action", { productId: targetProductId });

    DodoCheckout.open({
      productId: targetProductId,
      onSuccess: ({ sessionId }) => {
        setIsCheckoutActive(false);
        setLastSuccessSessionId(sessionId);
        addEvent("PAYMENT_SUCCESS", "sdk_callback", { sessionId });
      },
      onError: ({ code, message }) => {
        setIsCheckoutActive(false);
        addEvent("PAYMENT_ERROR", "sdk_callback", { code, message });
      },
      onClose: ({ reason }) => {
        setIsCheckoutActive(false);
        addEvent("CHECKOUT_CLOSED", "sdk_callback", { reason });
      },
    });
  };

  const handleProgrammaticClose = () => {
    addEvent("PROGRAMMATIC_CLOSE", "merchant_action", { action: "DodoCheckout.close()" });
    DodoCheckout.close();
    setIsCheckoutActive(false);
  };

  const handleClearLog = () => {
    setEvents([]);
  };

  return (
    <div className="space-y-10">
      {/* Success Notification Banner */}
      {lastSuccessSessionId && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-emerald-200 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              ✓
            </div>
            <div>
              <p className="text-sm font-semibold">Payment Completed Successfully!</p>
              <p className="font-mono text-xs text-emerald-400/80">
                Session ID: <span className="font-bold">{lastSuccessSessionId}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLastSuccessSessionId(null)}
            className="text-xs text-emerald-400/60 hover:text-emerald-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Product Showcase */}
      <section>
        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Select a Product
            </h2>
            <p className="text-sm text-slate-400">
              Each product initiates a secure checkout session using <code className="text-indigo-400 font-mono">DodoCheckout.open()</code>.
            </p>
          </div>

          {/* Programmatic close control if checkout is active */}
          {isCheckoutActive && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-xs font-medium text-amber-400 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Checkout Session Active
              </span>
              <button
                type="button"
                onClick={handleProgrammaticClose}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
              >
                Call DodoCheckout.close()
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEMO_PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onBuy={handleBuy}
              isCheckoutActive={isCheckoutActive}
            />
          ))}
        </div>
      </section>

      {/* Custom Product Test Section */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Test Invalid / Custom Product ID
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify how the checkout handles nonexistent products (e.g., <code className="font-mono text-slate-300">prod_unknown</code>).
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleBuy(customProductId || "prod_unknown");
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="e.g. prod_invalid"
              value={customProductId}
              onChange={(e) => setCustomProductId(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isCheckoutActive}
              className="rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-40 transition"
            >
              Test Product ID
            </button>
          </form>
        </div>
      </section>

      {/* Deterministic Test Cards Reference */}
      <section>
        <TestCardPanel />
      </section>

      {/* Real-time Event Log */}
      <section>
        <EventLog events={events} onClear={handleClearLog} />
      </section>
    </div>
  );
}
