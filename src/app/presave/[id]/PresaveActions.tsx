"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function PresaveActions({
  releaseId,
  saved,
  denied,
  releaseDate,
}: {
  releaseId: string;
  saved: boolean;
  denied: boolean;
  releaseDate: string | null;
}) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const url = window.location.origin + `/presave/${releaseId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (saved) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(29,185,84,0.12)" }}>
          <Check size={32} color="#1db954" />
        </div>
        <h2 className="text-white font-bold text-xl mb-2">You&apos;re all set!</h2>
        <p className="text-white/50 text-sm leading-relaxed mb-8">
          This release will automatically appear in your Spotify library
          {releaseDate ? ` on ${releaseDate}` : " on release day"}.
        </p>
        <button
          onClick={copyLink}
          className="w-full border border-white/10 hover:border-white/25 text-white/50 hover:text-white/80 font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
        >
          {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Share the pre-save link</>}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {denied && (
        <p className="text-amber-400 text-xs text-center mb-2">
          You cancelled. Tap below to try again.
        </p>
      )}

      {/* Pre-save on Spotify */}
      <a
        href={`/api/presave/connect?release_id=${releaseId}`}
        className="flex w-full items-center justify-center gap-2.5 font-bold py-4 rounded-xl transition-colors text-base"
        style={{ background: "#1db954", color: "#000" }}
      >
        {/* Spotify wordmark icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
        Pre-save on Spotify
      </a>

      <button
        onClick={copyLink}
        className="w-full border border-white/[0.08] hover:border-white/20 text-white/35 hover:text-white/60 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
      >
        {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy link</>}
      </button>
    </div>
  );
}
