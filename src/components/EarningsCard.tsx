"use client";

import { useEffect, useRef, useState } from "react";

const ROWS = [
  { label: "Streaming royalties", value: "$842",  pct: 88, color: "#007bff" },
  { label: "TikTok & Reels",      value: "$164",  pct: 54, color: "#69C9D0" },
  { label: "YouTube Content ID",  value: "$127",  pct: 40, color: "#FF0000" },
  { label: "Publishing · PRS…",   value: "$74",   pct: 26, color: "#A238FF" },
  { label: "Mechanical splits",   value: "$48",   pct: 18, color: "#FFA500" },
];

export function EarningsCard() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="bg-[#0c0c10] border border-white/[0.08] rounded-2xl p-6 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#007bff]/5 via-violet-500/3 to-transparent pointer-events-none" />
      <div className="relative z-10">
        {/* Mac dots + Live badge */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest">Live</span>
          </div>
        </div>

        <p className="text-white/25 text-[11px] uppercase tracking-widest mb-5">Your earnings · this month</p>

        {/* Bars */}
        <div className="space-y-4 mb-6">
          {ROWS.map((r, i) => (
            <div
              key={r.label}
              style={{
                opacity: active ? 1 : 0,
                transform: active ? "none" : "translateY(14px)",
                transition: `opacity 0.45s ease ${i * 70}ms, transform 0.45s ease ${i * 70}ms`,
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white/50 text-xs">{r.label}</span>
                <span className="text-white font-semibold text-xs">{r.value}</span>
              </div>
              <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    background: r.color,
                    width: active ? `${r.pct}%` : "0%",
                    transition: active ? `width 1.2s cubic-bezier(0.22,1,0.36,1) ${300 + i * 90}ms` : "none",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div
          className="border-t border-white/[0.06] pt-5"
          style={{
            opacity: active ? 1 : 0,
            transition: `opacity 0.5s ease ${ROWS.length * 70 + 200}ms`,
          }}
        >
          <p className="text-white/20 text-[11px] uppercase tracking-widest mb-1">Paid this month</p>
          <p
            className="text-3xl font-bold text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(90deg, #007bff, #a855f7)" }}
          >
            $1,255.00
          </p>
        </div>
      </div>
    </div>
  );
}
