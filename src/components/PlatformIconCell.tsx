"use client";
import { PlatformIcon } from "./PlatformIcon";

export function PlatformIconCell({
  platformKey,
  color,
  size = 22,
}: {
  platformKey: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
      style={{ background: `${color}18`, color }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 20px ${color}40`)}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
    >
      <PlatformIcon platformKey={platformKey} size={size} />
    </div>
  );
}
