"use client";

/**
 * GlobalTilt — attaches mouse-tracking 3D perspective tilt to any element
 * that carries a [data-tilt] attribute. Runs on every route change.
 *
 * Respects (prefers-reduced-motion) and skips touch/stylus devices.
 * Never touches colours, layout, or existing CSS classes.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// While the mouse is moving: track fast so the card feels stuck to the cursor.
const T_MOVE  = "transform 0.08s linear, background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease";
// On mouse leave: ease back to neutral slowly and naturally.
const T_LEAVE = "transform 0.65s cubic-bezier(0.23,1,0.32,1), background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease";

export default function GlobalTilt() {
  const pathname = usePathname();

  useEffect(() => {
    // Only desktop with a real pointer — skip tablets, phones, stylus-only devices
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    // Honour the OS "reduce motion" setting
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-tilt]"));
    if (!els.length) return;

    const cleanups: Array<() => void> = [];

    for (const el of els) {
      const maxDeg = parseFloat(el.dataset.tiltStrength ?? "7");

      const onEnter = () => {
        el.style.transition = T_MOVE;
      };

      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        // Normalise cursor position to [-0.5, 0.5] relative to card centre
        const nx = (e.clientX - r.left)  / r.width  - 0.5;
        const ny = (e.clientY - r.top)   / r.height - 0.5;
        const ry =  nx * 2 * maxDeg;   // positive = right edge comes forward
        const rx = -ny * 2 * maxDeg;   // positive = top edge comes forward
        el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        // Warm gold shadow shifts opposite to the tilt, deepening the 3D illusion
        const sX = (-ry * 2).toFixed(1);
        const sY = (rx * 2).toFixed(1);
        const sB = (Math.hypot(rx, ry) * 2.5 + 10).toFixed(0);
        el.style.boxShadow = `${sX}px ${sY}px ${sB}px rgba(212,160,23,0.16), 0 6px 20px rgba(0,0,0,0.28)`;
      };

      let resetTimer: ReturnType<typeof setTimeout> | null = null;

      const onLeave = () => {
        if (resetTimer) clearTimeout(resetTimer);
        el.style.transition = T_LEAVE;
        el.style.transform  = "";
        el.style.boxShadow  = "";
        // Restore native CSS transitions after the ease-back animation completes
        resetTimer = setTimeout(() => {
          el.style.transition = "";
        }, 700);
      };

      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mousemove",  onMove);
      el.addEventListener("mouseleave", onLeave);

      cleanups.push(() => {
        if (resetTimer) clearTimeout(resetTimer);
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mousemove",  onMove);
        el.removeEventListener("mouseleave", onLeave);
        el.style.transform  = "";
        el.style.transition = "";
        el.style.boxShadow  = "";
      });
    }

    return () => cleanups.forEach(fn => fn());
  }, [pathname]);

  return null;
}
