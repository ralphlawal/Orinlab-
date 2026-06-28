"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "fade";
};

export function AnimateIn({ children, className = "", delay = 0, direction = "up" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const base = "transition-all ease-out";
  const state = {
    up:    shown ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0",
    left:  shown ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0",
    right: shown ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0",
    fade:  shown ? "opacity-100" : "opacity-0",
  }[direction];

  return (
    <div
      ref={ref}
      className={`${base} ${state} ${className}`}
      style={{ transitionDuration: "700ms", transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
