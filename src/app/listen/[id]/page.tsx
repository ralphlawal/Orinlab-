import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Music2 } from "lucide-react";
import { getPlatform } from "@/lib/platforms";
import { PlatformIcon } from "@/components/PlatformIcon";
import type { Platform } from "@/lib/platforms";

function PlatformBadge({ platform }: { platform: Platform }) {
  const icon = <PlatformIcon platformKey={platform.key} size={20} />;
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${platform.color}25`, color: platform.color }}
    >
      {icon ?? <span className="text-sm font-black">{platform.label.charAt(0)}</span>}
    </div>
  );
}

type Release = {
  id: string;
  artist_name: string;
  song_title: string;
  release_type: string;
  genre: string;
  cover_art_url: string | null;
  store_links: Record<string, string> | null;
  ditto_smart_link: string | null;
  status: string;
  featured_artists: string | null;
};

async function getRelease(id: string): Promise<Release | null> {
  const { data } = await supabase
    .from("releases")
    .select("id, artist_name, song_title, release_type, genre, cover_art_url, store_links, ditto_smart_link, status, featured_artists")
    .eq("id", id)
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

  // Release exists but not yet approved — show a holding page
  if (release.status !== "approved") {
    return (
      <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center px-6 text-center">
        {release.cover_art_url && (
          <div className="fixed inset-0 scale-110" style={{ backgroundImage: `url(${release.cover_art_url})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(60px) brightness(0.15) saturate(1.2)" }} />
        )}
        <div className="fixed inset-0 bg-black/70" />
        <div className="relative z-10 max-w-sm">
          {release.cover_art_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={release.cover_art_url} alt={release.song_title} className="w-32 h-32 object-cover rounded-2xl mx-auto mb-6 shadow-2xl" />
          )}
          <p className="text-white/25 text-[10px] uppercase tracking-[0.2em] mb-3">Distributed by ORINLABÍ</p>
          <h1 className="text-white font-bold text-2xl mb-2">{release.song_title}</h1>
          <p className="text-white/50 text-sm mb-8">{release.artist_name}</p>
          <div className="bg-white/[0.06] border border-white/[0.10] rounded-2xl px-6 py-5">
            <p className="text-white font-semibold mb-1">Coming soon</p>
            <p className="text-white/40 text-sm">This release is on its way to streaming platforms. Check back shortly.</p>
          </div>
        </div>
      </div>
    );
  }

  const links = release.store_links
    ? Object.entries(release.store_links).filter(([, url]) => url?.trim())
    : [];

  // Parse featured artists
  let featuredNames = "";
  if (release.featured_artists) {
    try {
      const parsed = JSON.parse(release.featured_artists) as { name: string }[];
      if (parsed.length > 0) featuredNames = ` (feat. ${parsed.map(f => f.name).join(", ")})`;
    } catch {
      featuredNames = release.featured_artists ? ` (feat. ${release.featured_artists})` : "";
    }
  }

  const artistLine = release.artist_name + featuredNames;

  return (
    <div className="min-h-screen bg-[#111] relative overflow-hidden">

      {/* Blurred background from cover art */}
      {release.cover_art_url && (
        <div
          className="fixed inset-0 scale-110"
          style={{
            backgroundImage: `url(${release.cover_art_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(60px) brightness(0.25) saturate(1.4)",
          }}
        />
      )}
      <div className="fixed inset-0 bg-black/60" />

      {/* Content — mobile-first card */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start pt-0 pb-16">

        {/* Cover art — full width on mobile, capped on desktop */}
        <div className="w-full max-w-md">
          <div className="w-full aspect-square overflow-hidden relative">
            {release.cover_art_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={release.cover_art_url}
                alt={release.song_title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#007bff]/30 to-black flex items-center justify-center">
                <Music2 size={72} className="text-[#007bff]/40" />
              </div>
            )}
            {/* Gradient fade into card below */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#111] to-transparent" />
          </div>

          {/* Info + links card */}
          <div className="bg-[#111] px-6 pt-2 pb-8 w-full">

            {/* Orinlabí branding */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <span className="text-white/25 text-[10px] uppercase tracking-[0.2em]">Distributed by</span>
              <Link href="/" className="text-white/50 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
                ORINLABÍ
              </Link>
            </div>

            {/* Song title + artist */}
            <div className="text-center mb-6">
              <h1 className="text-white font-bold text-2xl leading-tight mb-1.5">{release.song_title}</h1>
              <p className="text-white/60 text-sm">{artistLine}</p>
              <p className="text-white/25 text-[10px] mt-1.5 uppercase tracking-widest">
                {release.release_type} · {release.genre}
              </p>
            </div>

            {/* Choose platform */}
            {(() => {
              // Determine which links to show
              const individualLinks = links; // entries from store_links
              const dittoFallback = release.ditto_smart_link;

              // Platforms to show when using ditto fallback
              const FALLBACK_PLATFORMS = [
                "spotify", "apple_music", "youtube_music", "amazon_music",
                "deezer", "tidal", "audiomack", "boomplay",
                "tiktok", "soundcloud", "anghami", "pandora",
              ];

              if (individualLinks.length > 0) {
                return (
                  <>
                    <p className="text-white/35 text-xs text-center mb-4 uppercase tracking-widest">Choose your preferred music service</p>
                    <div className="space-y-2.5">
                      {individualLinks.map(([key, url]) => {
                        const platform = getPlatform(key);
                        return (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 w-full bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.98] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl px-4 py-3.5 transition-all duration-150"
                          >
                            <PlatformBadge platform={platform} />
                            <span className="text-white font-semibold text-sm flex-1">{platform.label}</span>
                            <span
                              className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
                              style={{ background: `${platform.color}20`, color: platform.color }}
                            >
                              Listen
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </>
                );
              }

              if (dittoFallback) {
                return (
                  <>
                    <p className="text-white/35 text-xs text-center mb-4 uppercase tracking-widest">Choose your preferred music service</p>
                    <div className="space-y-2.5">
                      {FALLBACK_PLATFORMS.map((key) => {
                        const platform = getPlatform(key);
                        return (
                          <a
                            key={key}
                            href={`/api/go/${release.id}`}
                            className="flex items-center gap-4 w-full bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.98] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl px-4 py-3.5 transition-all duration-150"
                          >
                            <PlatformBadge platform={platform} />
                            <span className="text-white font-semibold text-sm flex-1">{platform.label}</span>
                            <span
                              className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
                              style={{ background: `${platform.color}20`, color: platform.color }}
                            >
                              Listen
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </>
                );
              }

              return (
                <div className="text-center py-10 text-white/30 text-sm">
                  Streaming links coming soon — check back shortly.
                </div>
              );
            })()}

            {/* QR code */}
            <div className="mt-10 flex flex-col items-center gap-3">
              <p className="text-white/20 text-[10px] uppercase tracking-widest">Scan to listen</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`https://orinlabi.com/listen/${release.id}`)}&bgcolor=111111&color=ffffff&margin=6`}
                alt="QR code"
                width={100}
                height={100}
                className="rounded-xl opacity-40"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 300;
