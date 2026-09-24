"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export type UpiQrViewProps = {
  onSimulateSuccess?: () => void;
  processing?: boolean;
};

export function UpiQrView({ onSimulateSuccess, processing }: UpiQrViewProps) {
  const [upiId, setUpiId] = useState("");
  const [activeTab, setActiveTab] = useState<"qr" | "id">("qr");

  return (
    <div className="space-y-3.5">
      {/* UPI mode toggle */}
      <div className="flex rounded-xl bg-slate-100/90 p-1 text-xs font-medium border border-slate-200/60 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("qr")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs transition-all duration-150 ${
            activeTab === "qr"
              ? "bg-white text-slate-900 shadow-xs font-semibold"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="3" height="3" />
            <rect x="18" y="18" width="3" height="3" />
          </svg>
          <span>Scan QR Code</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("id")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs transition-all duration-150 ${
            activeTab === "id"
              ? "bg-white text-slate-900 shadow-xs font-semibold"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          <span>UPI ID / VPA</span>
        </button>
      </div>

      {/* Unified Tab Container with fixed/smooth height profile */}
      <div className="min-h-[296px] rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        {activeTab === "qr" ? (
          <div className="flex flex-col items-center justify-between h-full space-y-3.5 text-center">
            {/* Top status bar */}
            <div className="flex items-center justify-between w-full pb-2.5 border-b border-slate-100">
            
           
            </div>

            {/* Small & Crisp QR Code Container with Premium Gradient Border */}
            <div className="relative group p-[2px] rounded-2xl  shadow-md transition-transform duration-200 hover:scale-[1.02]">
              <div className="flex h-32 w-32 items-center justify-center rounded-[14px] bg-white p-2 relative overflow-hidden">
                <img
                  src="/qr.png"
                  alt="UPI QR Code"
                  className="h-full w-full object-contain rounded-lg"
                />
                {/* Center UPI micro badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="rounded-md bg-white p-1 shadow-sm border border-slate-100/80 flex items-center justify-center">
                    <img
                      src="/UPI-Color.svg"
                      alt="UPI"
                      className="h-3 w-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-700">
                Point any camera or UPI app to scan
              </p>
              {/* Supported UPI Apps Badges */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap pt-0.5">
                {[
                  { name: "GPay", icon: "/gpay.png" },
                  { name: "PhonePe", icon: "/phonepay.png" },
                  { name: "Paytm", icon: "/paytm.png" },
                  { name: "CRED", icon: "/cred.png" },
                  { name: "BHIM", icon: "/bhim.png" },
                ].map((app) => (
                  <span
                    key={app.name}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/70 px-2 py-0.5 text-[10px] font-medium text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    <img src={app.icon} alt={app.name} className="h-3 w-3 object-contain" />
                    <span>{app.name}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Fast Simulation Trigger */}
            <div className="w-full pt-2 border-t border-slate-100">
              <Button
                type="button"
                onClick={onSimulateSuccess}
                disabled={Boolean(processing)}
                loading={Boolean(processing)}
                variant="outline"
                className="w-full h-9 text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              >
                I&apos;ve sent the payment
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3.5">
                <span className="text-xs font-bold text-slate-800 tracking-tight">Pay with UPI ID</span>
                <span className="text-[11px] text-slate-500">Fast & Direct</span>
              </div>

              <div>
                <label htmlFor="upi-vpa-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Virtual Payment Address (VPA)
                </label>
                <div className="relative">
                  <input
                    id="upi-vpa-input"
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@upi or username@okhdfc"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <img src="/UPI-Color.svg" alt="UPI" className="h-3 w-auto object-contain opacity-70" />
                  </div>
                </div>
              </div>

              {/* Common Handle Pills */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {["@okhdfcbank", "@okaxis", "@paytm", "@ybl", "@ibl"].map((suffix) => (
                  <button
                    key={suffix}
                    type="button"
                    onClick={() =>
                      setUpiId((curr) => {
                        const clean = curr.includes("@") ? curr.split("@")[0] : curr;
                        return (clean || "user") + suffix;
                      })
                    }
                    className="rounded-lg border border-slate-200/90 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    {suffix}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Button
                type="button"
                onClick={onSimulateSuccess}
                disabled={Boolean(processing) || !upiId.trim()}
                loading={Boolean(processing)}
                className="w-full h-10 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
              >
                Verify &amp; Request Payment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
