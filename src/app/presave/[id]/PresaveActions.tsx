"use client";

import { useState } from "react";
import { Check, Copy, Bell, Loader2 } from "lucide-react";

const PLATFORMS = [
  { label: "Spotify",      color: "#1db954", bg: "#1db95420" },
  { label: "Apple Music",  color: "#fc3c44", bg: "#fc3c4420" },
  { label: "Amazon Music", color: "#00a8e0", bg: "#00a8e020" },
  { label: "Deezer",       color: "#a238ff", bg: "#a238ff20" },
  { label: "Tidal",        color: "#e0e0e0", bg: "#e0e0e015" },
  { label: "Audiomack",    color: "#ffa500", bg: "#ffa50020" },
  { label: "Boomplay",     color: "#ff4b4b", bg: "#ff4b4b20" },
];

export default function PresaveActions({
  releaseId,
  presaveUrl,
  artistName,
  songTitle,
}: {
  releaseId: string;
  presaveUrl: string;
  artistName?: string;
  songTitle?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyState, setNotifyState] = useState<"idle" | "loading" | "done" | "error">("idle");

  function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    if (!notifyEmail.trim()) return;
    setNotifyState("loading");
    try {
      const res = await fetch("/api/presave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          releaseId,
          email: notifyEmail.trim(),
          artistName,
          songTitle,
        }),
      });
      setNotifyState(res.ok ? "done" : "error");
    } catch {
      setNotifyState("error");
    }
  }

  return (
    <div className="space-y-3">
      {/* Per-platform pre-save buttons */}
      <div className="space-y-2.5">
        {PLATFORMS.map((p) => (
          <a
            key={p.label}
            href={presaveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full rounded-2xl px-4 py-3.5 transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ background: p.bg, border: `1px solid ${p.color}30` }}
          >
            <span className="font-semibold text-sm" style={{ color: p.color }}>
              {p.label}
            </span>
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: p.color, color: p.color === "#e0e0e0" ? "#000" : "#000" }}
            >
              Pre-save
            </span>
          </a>
        ))}
      </div>

      {/* Notify me on drop */}
      <div className="border border-white/[0.08] rounded-2xl p-4 mt-2">
        {notifyState === "done" ? (
          <div className="flex items-center justify-center gap-2 text-green-400 text-sm py-1">
            <Check size={15} /> You&apos;re on the list — we&apos;ll notify you when it drops!
          </div>
        ) : (
          <form onSubmit={handleNotify} className="space-y-2.5">
            <p className="text-white/40 text-xs flex items-center gap-1.5">
              <Bell size={12} /> Get notified when this drops
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={notifyEmail}
                onChange={(e) => { setNotifyEmail(e.target.value); setNotifyState("idle"); }}
                placeholder="your@email.com"
                required
                className="flex-1 bg-white/[0.05] border border-white/[0.1] focus:border-white/30 outline-none text-white placeholder-white/20 text-sm px-3 py-2 rounded-lg transition-colors"
              />
              <button
                type="submit"
                disabled={notifyState === "loading"}
                className="bg-white/[0.08] hover:bg-white/[0.14] disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                {notifyState === "loading" ? <Loader2 size={12} className="animate-spin" /> : "Notify me"}
              </button>
            </div>
            {notifyState === "error" && <p className="text-red-400 text-xs">Something went wrong — try again.</p>}
          </form>
        )}
      </div>

      {/* Copy link */}
      <button
        onClick={copyLink}
        className="w-full border border-white/[0.08] hover:border-white/20 text-white/35 hover:text-white/60 font-medium py-3 rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm"
      >
        {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy link</>}
      </button>
    </div>
  );
}
