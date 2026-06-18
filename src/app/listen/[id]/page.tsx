import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Music2, ExternalLink } from "lucide-react";

const PLATFORM_META: Record<string, { label: string; color: string; bg: string }> = {
  spotify:       { label: "Spotify",       color: "#1db954", bg: "#1db95415" },
  apple_music:   { label: "Apple Music",   color: "#fc3c44", bg: "#fc3c4415" },
  boomplay:      { label: "Boomplay",      color: "#f5a623", bg: "#f5a62315" },
  audiomack:     { label: "Audiomack",     color: "#ffa500", bg: "#ffa50015" },
  youtube_music: { label: "YouTube Music", color: "#ff0000", bg: "#ff000015" },
  deezer:        { label: "Deezer",        color: "#a238ff", bg: "#a238ff15" },
  tidal:         { label: "TIDAL",         color: "#00ffff", bg: "#00ffff12" },
  amazon_music:  { label: "Amazon Music",  color: "#00a8e1", bg: "#00a8e115" },
};

type Release = {
  id: string;
  artist_name: string;
  song_title: string;
  release_type: string;
  genre: string;
  cover_art_url: string | null;
  store_links: Record<string, string> | null;
  status: string;
};

async function getRelease(id: string): Promise<Release | null> {
  const { data } = await supabase
    .from("releases")
    .select("id, artist_name, song_title, release_type, genre, cover_art_url, store_links, status")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();
  return (data as Release) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const release = await getRelease(id);
  if (!release) return { title: "Not Found" };

  const title = `${release.song_title} — ${release.artist_name}`;
  const description = `Stream "${release.song_title}" by ${release.artist_name} on all platforms. Distributed by Orinlabí.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: release.cover_art_url ? [{ url: release.cover_art_url, width: 1200, height: 1200 }] : [],
      type: "music.song",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: release.cover_art_url ? [release.cover_art_url] : [],
    },
  };
}

export default async function ListenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const release = await getRelease(id);
  if (!release) notFound();

  const links = release.store_links
    ? Object.entries(release.store_links).filter(([, url]) => url?.trim())
    : [];

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-16">

      {/* Glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: release.cover_art_url
            ? "radial-gradient(ellipse 60% 50% at 50% 0%, #007bff18 0%, transparent 70%)"
            : "radial-gradient(ellipse 60% 50% at 50% 0%, #007bff10 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">

        {/* Cover art */}
        <div className="mx-auto w-56 h-56 rounded-3xl overflow-hidden bg-gradient-to-br from-[#007bff]/20 to-black mb-7 shadow-2xl shadow-black/60 flex items-center justify-center flex-shrink-0">
          {release.cover_art_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={release.cover_art_url}
              alt={release.song_title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Music2 size={48} className="text-[#007bff]/30" />
          )}
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-white font-bold text-2xl leading-tight mb-1">
            {release.song_title}
          </h1>
          <p className="text-white/50 text-sm">{release.artist_name}</p>
          <p className="text-white/25 text-xs mt-1 uppercase tracking-widest">
            {release.release_type} · {release.genre}
          </p>
        </div>

        {/* Platform links */}
        {links.length > 0 ? (
          <div className="space-y-3">
            {links.map(([key, url]) => {
              const meta = PLATFORM_META[key] ?? { label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), color: "#007bff", bg: "#007bff15" };
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full px-5 py-4 rounded-2xl border transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: meta.bg,
                    borderColor: `${meta.color}30`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: meta.color }}
                    />
                    <span className="text-white font-semibold text-sm">{meta.label}</span>
                  </div>
                  <ExternalLink size={14} className="text-white/30 group-hover:text-white/60 transition-colors" />
                </a>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-white/30 text-sm">
            Store links coming soon — check back shortly.
          </div>
        )}

        {/* QR Code */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-white/20 text-xs uppercase tracking-widest">Scan to listen</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`https://orinlabi.com/listen/${release.id}`)}&bgcolor=000000&color=ffffff&margin=6`}
            alt="QR code"
            width={110}
            height={110}
            className="rounded-xl opacity-60"
          />
        </div>

        {/* Orinlabí footer */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/20 hover:text-white/40 text-xs transition-colors"
          >
            Distributed by{" "}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548295/IMG_1637_fbxmfe.png"
              alt="Orinlabí"
              width={16}
              height={16}
              className="opacity-30 hover:opacity-50 transition-opacity"
            />
            <span className="font-semibold">Orinlabí</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 300;
