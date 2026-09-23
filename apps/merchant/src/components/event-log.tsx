"use client";

import React, { useState } from "react";

export interface LoggedEvent {
  id: string;
  timestamp: string;
  type: string;
  source: "sdk_callback" | "postmessage_protocol" | "merchant_action";
  payload?: Record<string, unknown> | null | undefined;
}

interface EventLogProps {
  events: LoggedEvent[];
  onClear: () => void;
}

export function EventLog({ events, onClear }: EventLogProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredEvents = events.filter((ev) => {
    if (filter === "all") return true;
    if (filter === "callbacks") return ev.source === "sdk_callback";
    if (filter === "protocol") return ev.source === "postmessage_protocol";
    return true;
  });

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "PAYMENT_SUCCESS":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "PAYMENT_ERROR":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "CHECKOUT_READY":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "CHECKOUT_OPENED":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      case "CHECKOUT_CLOSED":
      case "PROGRAMMATIC_CLOSE":
        return "bg-slate-500/10 text-slate-300 border-slate-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            SDK & Protocol Event Console
          </h3>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-mono font-medium text-slate-400">
            {events.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-slate-700"
          >
            <option value="all">All Events</option>
            <option value="callbacks">SDK Callbacks Only</option>
            <option value="protocol">Protocol Messages</option>
          </select>

          <button
            type="button"
            onClick={onClear}
            disabled={events.length === 0}
            className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-xs max-h-[380px] min-h-[220px]">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <svg
              className="h-8 w-8 mb-2 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="font-sans text-sm">No events logged yet.</p>
            <p className="font-sans text-xs text-slate-600 mt-1">
              Trigger a checkout session to inspect lifecycle events in real time.
            </p>
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="rounded-lg border border-slate-800/80 bg-slate-950/70 p-3 transition hover:border-slate-700"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">
                    {ev.timestamp}
                  </span>
                  <span
                    className={`rounded border px-2 py-0.5 text-[10px] font-semibold tracking-wider ${getBadgeStyle(
                      ev.type
                    )}`}
                  >
                    {ev.type}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-sans">
                  {ev.source.replace("_", " ")}
                </span>
              </div>

              {ev.payload && Object.keys(ev.payload).length > 0 && (
                <pre className="overflow-x-auto rounded bg-slate-900/90 p-2 text-[11px] text-slate-300 border border-slate-800/60 mt-1">
                  <code>{JSON.stringify(ev.payload, null, 2)}</code>
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
