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
    <div className="space-y-4">
      {/* UPI mode toggle */}
      <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("qr")}
          className={`flex-1 rounded-lg py-1.5 transition-all ${
            activeTab === "qr" ? "bg-white text-slate-900 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Scan QR Code
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("id")}
          className={`flex-1 rounded-lg py-1.5 transition-all ${
            activeTab === "id" ? "bg-white text-slate-900 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Enter UPI ID / VPA
        </button>
      </div>

      {activeTab === "qr" ? (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 text-center shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-800">Scan & Pay</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                Instant UPI
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <svg className="h-3 w-3 animate-spin text-amber-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="font-mono text-[11px] font-medium">Auto-expiring</span>
            </div>
          </div>

          {/* Crisp QR Code Graphic */}
          <div className="mx-auto my-2 flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-3 shadow-inner relative group">
            {/* SVG stylized QR code */}
            <svg viewBox="0 0 120 120" className="h-full w-full text-slate-900" fill="currentColor">
              {/* Corner 1 */}
              <rect x="10" y="10" width="30" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="20" y="20" width="10" height="10" rx="2" />
              {/* Corner 2 */}
              <rect x="80" y="10" width="30" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="90" y="20" width="10" height="10" rx="2" />
              {/* Corner 3 */}
              <rect x="10" y="80" width="30" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="20" y="90" width="10" height="10" rx="2" />
              {/* Decorative data modules */}
              <rect x="50" y="15" width="6" height="6" rx="1" />
              <rect x="62" y="15" width="6" height="6" rx="1" />
              <rect x="50" y="27" width="18" height="6" rx="1" />
              <rect x="15" y="50" width="6" height="18" rx="1" />
              <rect x="27" y="50" width="6" height="6" rx="1" />
              <rect x="27" y="62" width="6" height="6" rx="1" />
              <rect x="50" y="50" width="20" height="20" rx="4" fill="#3b82f6" />
              {/* Center icon in QR */}
              <rect x="80" y="50" width="6" height="12" rx="1" />
              <rect x="92" y="50" width="18" height="6" rx="1" />
              <rect x="80" y="68" width="12" height="6" rx="1" />
              <rect x="100" y="68" width="10" height="18" rx="1" />
              <rect x="50" y="80" width="6" height="18" rx="1" />
              <rect x="62" y="92" width="18" height="6" rx="1" />
              <rect x="80" y="92" width="12" height="18" rx="1" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="rounded-lg bg-white p-1.5 shadow-md border border-slate-200 flex items-center justify-center">
                <img
                  src="/UPI-Color.svg"
                  alt="UPI"
                  className="h-4 w-auto object-contain"
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 font-medium mt-3">Scan using any UPI App</p>

          {/* Supported UPI Apps Badges */}
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs">
              <img src="/gpay.png" alt="GPay" className="h-3.5 w-3.5 object-contain" />
              <span>GPay</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs">
              <img src="/phonepay.png" alt="PhonePe" className="h-3.5 w-3.5 object-contain" />
              <span>PhonePe</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs">
              <img src="/paytm.png" alt="Paytm" className="h-3.5 w-3.5 object-contain" />
              <span>Paytm</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs">
              <img src="/cred.png" alt="CRED" className="h-3.5 w-3.5 object-contain" />
              <span>CRED</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs">
              <img src="/bhim.png" alt="BHIM" className="h-3.5 w-3.5 object-contain" />
              <span>BHIM</span>
            </span>
          </div>

          {/* Savings banner from reference Image 1 */}
          <div className="mt-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-2.5 flex items-center justify-center gap-2 text-emerald-800 text-xs font-medium">
            <span>🏷️</span>
            <span>Upto 1.5% savings with NeuCard & UPI offers</span>
          </div>

          {/* One-click simulator for development/testing */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Button
              type="button"
              onClick={onSimulateSuccess}
              disabled={Boolean(processing)}
              loading={Boolean(processing)}
              variant="outline"
              className="w-full text-xs font-semibold text-slate-700 border-dashed border-slate-300 hover:bg-slate-50"
            >
              Simulate UPI Payment Success
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4 shadow-sm">
          <div>
            <label htmlFor="upi-vpa-input" className="block text-xs font-semibold text-slate-800 mb-1.5">
              Enter Virtual Payment Address (VPA)
            </label>
            <div className="relative">
              <input
                id="upi-vpa-input"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. yourname@okhdfcbank"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {["@okaxis", "@okhdfcbank", "@paytm", "@ibl", "@ybl"].map((suffix) => (
              <button
                key={suffix}
                type="button"
                onClick={() => setUpiId((curr) => (curr.includes("@") ? curr.split("@")[0] + suffix : curr + suffix))}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100"
              >
                {suffix}
              </button>
            ))}
          </div>

          <Button
            type="button"
            onClick={onSimulateSuccess}
            disabled={Boolean(processing)}
            loading={Boolean(processing)}
            className="w-full"
          >
            Verify & Pay
          </Button>
        </div>
      )}
    </div>
  );
}
