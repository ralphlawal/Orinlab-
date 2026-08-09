"use client";

import { useState, useEffect } from "react";

type Preview = {
  embedUrl: string;
  title: string;
  artist: string;
  coverUrl: string | null;
};

const KENTE = [
  "#D4A017 0px, #D4A017 22px",
  "#2A5C3F 22px, #2A5C3F 33px",
  "#8B1A1A 33px, #8B1A1A 41px",
  "#0A0A08 41px, #0A0A08 49px",
  "#D4A017 49px, #D4A017 71px",
  "#8B1A1A 71px, #8B1A1A 79px",
  "#2A5C3F 79px, #2A5C3F 87px",
  "#0A0A08 87px, #0A0A08 95px",
].join(", ");

/**
 * Global floating Spotify preview drawer — mounts once in SiteChrome and
 * listens for the "spotify:preview" CustomEvent dispatched by PlayButton.
 * Slides up from the bottom with a Kente-strip top edge.
 */
export function SpotifyPreviewDrawer() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handler(e: Event) {
      const { detail } = e as CustomEvent<Preview>;
      setPreview(detail);
      setVisible(true);
    }
    window.addEventListener("spotify:preview", handler);
    return () => window.removeEventListener("spotify:preview", handler);
  }, []);

  function close() {
    setVisible(false);
    setTimeout(() => setPreview(null), 350);
  }

  return (
    <div
      role="region"
      aria-label="Music preview player"
      className={`fixed bottom-0 left-0 right-0 z-[200] transition-transform duration-300 ease-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {preview && (
        <div className="bg-[#080808]/96 backdrop-blur-2xl border-t border-white/10 shadow-[0_-8px_40px_rgba(0,0,0,0.6)]">
          {/* Kente strip top edge */}
          <div
            style={{
              height: "5px",
              backgroundImage: `repeating-linear-gradient(90deg, ${KENTE})`,
              backgroundSize: "95px 100%",
            }}
          />

          {/* Player row */}
          <div className="max-w-2xl mx-auto px-4 pt-3 pb-1 flex items-center gap-4">
            {/* Cover art */}
            {preview.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview.coverUrl}
                alt=""
                aria-hidden="true"
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-lg"
              />
            )}

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{preview.title}</p>
              <p className="text-white/45 text-xs truncate mt-0.5">{preview.artist}</p>
            </div>

            {/* Waveform indicator */}
            <div className="hidden sm:flex items-end gap-[2px] h-5 opacity-60" aria-hidden="true">
              {[0.7, 1.1, 0.65, 0.9, 0.8, 1.2, 0.75].map((d, i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: "3px",
                    height: "100%",
                    background: "#1DB954",
                    animation: `wave-bar ${d}s ${i * 0.12}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>

            {/* Close */}
            <button
              onClick={close}
              aria-label="Close preview"
              className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M12.7 3.3a1 1 0 0 0-1.4 0L8 6.6 4.7 3.3a1 1 0 0 0-1.4 1.4L6.6 8 3.3 11.3a1 1 0 1 0 1.4 1.4L8 9.4l3.3 3.3a1 1 0 0 0 1.4-1.4L9.4 8l3.3-3.3a1 1 0 0 0 0-1.4z" />
              </svg>
            </button>
          </div>

          {/* Spotify iframe — keyed by URL so it remounts on track change */}
          <iframe
            key={preview.embedUrl}
            title="Spotify preview"
            src={`${preview.embedUrl}&autoplay=1`}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="block"
          />
        </div>
      )}
    </div>
  );
}
