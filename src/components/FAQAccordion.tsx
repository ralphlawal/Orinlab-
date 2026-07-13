"use client";

import { useState } from "react";
import { AnimateIn } from "./AnimateIn";

type FaqItem = { q: string; a: string };

export function FAQAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((faq, i) => {
        const isOpen = open === i;
        return (
          <AnimateIn key={i} delay={i * 45}>
            <div
              className={`rounded-xl overflow-hidden transition-all duration-300 border ${
                isOpen
                  ? "bg-white/[0.045] border-[#007bff]/30 shadow-[0_0_24px_rgba(0,123,255,0.08)]"
                  : "bg-white/[0.03] border-white/[0.06] hover:border-white/[0.1]"
              }`}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left gap-4 group"
                aria-expanded={isOpen}
              >
                <span className={`font-medium text-sm leading-snug transition-colors duration-200 ${isOpen ? "text-white" : "text-white/75 group-hover:text-white"}`}>
                  {faq.q}
                </span>
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-sm font-light transition-all duration-300 ${
                    isOpen
                      ? "bg-[#007bff] border-[#007bff] text-white rotate-45"
                      : "border-white/20 text-white/35 group-hover:border-white/40 group-hover:text-white/60"
                  }`}
                >
                  +
                </span>
              </button>

              {/* Grid trick: 0fr → 1fr for smooth height animation without JS measurement */}
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-white/50 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          </AnimateIn>
        );
      })}
    </div>
  );
}
