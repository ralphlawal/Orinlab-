"use client";

type Props = {
  embedUrl: string;
  title: string;
  artist: string;
  coverUrl: string | null;
};

/**
 * Spotify preview trigger. Renders as an absolute-positioned green play button
 * visible on `group-hover`. Dispatches a custom window event picked up by
 * SpotifyPreviewDrawer — zero coupling between the two.
 */
export function PlayButton({ embedUrl, title, artist, coverUrl }: Props) {
  function handlePlay(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent("spotify:preview", {
        detail: { embedUrl, title, artist, coverUrl },
      })
    );
  }

  return (
    <button
      onClick={handlePlay}
      aria-label={`Preview ${title}`}
      className="absolute bottom-14 right-3 z-20 w-11 h-11 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95"
      style={{ background: "#1DB954", boxShadow: "0 4px 16px rgba(29,185,84,0.5)" }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="white" aria-hidden="true">
        <path d="M2.5 1.5L11.5 7L2.5 12.5V1.5Z" />
      </svg>
    </button>
  );
}
