"use client";

import { useState } from "react";
import { Check, Copy, Music2 } from "lucide-react";

const PLATFORMS = [
  { label: "Spotify",      color: "#1db954" },
  { label: "Apple Music",  color: "#fc3c44" },
  { label: "Deezer",       color: "#a238ff" },
  { label: "Tidal",        color: "#ffffff" },
  { label: "Amazon Music", color: "#00a8e0" },
  { label: "SoundCloud",   color: "#ff5500" },
  { label: "Audiomack",    color: "#ffa500" },
];

export default function PresaveActions({
  releaseId,
  presaveUrl,
}: {
  releaseId: string;
  presaveUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const url = window.location.origin + `/presave/${releaseId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-3">
      {/* Main CTA */}
      <a
        href={presaveUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2.5 font-bold py-4 rounded-xl transition-all text-base hover:opacity-90 active:scale-[0.98]"
        style={{ background: "#1db954", color: "#000" }}
      >
        <Music2 size={20} />
        Pre-save on all platforms
      </a>

      {/* Platform badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pb-1">
        {PLATFORMS.map((p) => (
          <span
            key={p.label}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full border"
            style={{ color: p.color, borderColor: `${p.color}40`, background: `${p.color}12` }}
          >
            {p.label}
          </span>
        ))}
      </div>

      {/* Copy link */}
      <button
        onClick={copyLink}
        className="w-full border border-white/[0.08] hover:border-white/20 text-white/35 hover:text-white/60 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
      >
        {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy link</>}
      </button>
    </div>
  );
}
