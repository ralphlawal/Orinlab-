"use client";

import { useState } from "react";
import { Check, Copy, Music2, Bell, Loader2 } from "lucide-react";

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
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyState, setNotifyState] = useState<"idle" | "loading" | "done" | "error">("idle");

  function copyLink() {
    const url = window.location.origin + `/presave/${releaseId}`;
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
        body: JSON.stringify({ releaseId, email: notifyEmail.trim() }),
      });
      setNotifyState(res.ok ? "done" : "error");
    } catch {
      setNotifyState("error");
    }
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

      {/* Notify me on drop */}
      <div className="border border-white/[0.08] rounded-xl p-4">
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
                className="flex-1 bg-white/[0.05] border border-white/[0.1] focus:border-white/30 outline-none text-white placeholder-white/20 text-sm px-3 py-2 rounded-lg transition-colors text-xs"
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
        className="w-full border border-white/[0.08] hover:border-white/20 text-white/35 hover:text-white/60 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
      >
        {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy link</>}
      </button>
    </div>
  );
}
