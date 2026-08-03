import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Music2, ExternalLink } from "lucide-react";
import { getPlatform } from "@/lib/platforms";
import { PlatformIcon } from "@/components/PlatformIcon";

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
  release_date: string | null;
  presave_url: string | null;
  presave_enabled: boolean | null;
};

const SELECT =
  "id,artist_name,song_title,release_type,genre,cover_art_url,store_links,ditto_smart_link,status,featured_artists,release_date,presave_url,presave_enabled";

const PRESAVE_PLATFORMS = ["spotify", "apple_music", "amazon_music", "deezer", "tidal", "audiomack", "boomplay"];
const FALLBACK_PLATFORMS = ["spotify", "apple_music", "youtube_music", "amazon_music", "deezer", "tidal", "audiomack", "boomplay", "tiktok", "soundcloud", "anghami"];

const IS_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}/i;

async function getRelease(id: string): Promise<Release | null> {
  if (!IS_UUID.test(id)) return null;
  const { data, error } = await supabase
    .from("releases")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return (data as Release) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!IS_UUID.test(id)) return { title: "Artist" };
  const release = await getRelease(id);
  if (!release) return { title: "Not Found" };

  const isUpcoming =
    !!release.release_date && new Date(release.release_date) > new Date();
  const verb = isUpcoming ? "Pre-save" : "Listen to";

  return {
    title: `${release.song_title} · ${release.artist_name}`,
    description: `${verb} ${release.song_title}`,
    openGraph: {
      title: `${release.song_title} · ${release.artist_name}`,
      description: `${verb} ${release.song_title}`,
      images: release.cover_art_url
        ? [{ url: release.cover_art_url, width: 1200, height: 1200 }]
        : [],
      type: "music.song",
      siteName: "OrinlabÍ",
    },
    twitter: {
      card: "summary_large_image",
      title: `${release.song_title} · ${release.artist_name}`,
      description: `${verb} ${release.song_title}`,
      images: release.cover_art_url ? [release.cover_art_url] : [],
    },
  };
}

function BlurredBg({ src }: { src: string | null }) {
  if (!src) return null;
  return (
    <>
      <div
        className="fixed inset-0 scale-110 pointer-events-none"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(70px) brightness(0.18) saturate(1.5)",
        }}
      />
      <div className="fixed inset-0 bg-black/55 pointer-events-none" />
    </>
  );
}

function OrinlabiFooter() {
  return (
    <div className="flex justify-center mt-10 mb-2">
      <Link
        href="/"
        className="text-white/20 hover:text-white/50 text-[9px] font-black uppercase tracking-[0.3em] transition-colors duration-200"
      >
        ORINLABÍ
      </Link>
    </div>
  );
}

export default async function ListenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!IS_UUID.test(id)) {
    const nameQuery = id.replace(/-/g, " ");
    const { data: slugMatches } = await supabase
      .from("releases")
      .select("id,status")
      .ilike("artist_name", `%${nameQuery}%`)
      .order("submitted_at", { ascending: true });

    const rows = (slugMatches ?? []) as { id: string; status: string }[];
    const target = rows.find((r) => r.status === "approved") ?? rows[0];
    if (target) redirect(`/listen/${target.id}`);
    else notFound();
  }

  const release = await getRelease(id);
  if (!release) notFound();

  const isUpcoming =
    !!release.release_date && new Date(release.release_date) > new Date();

  const releaseDateStr = release.release_date
    ? new Date(release.release_date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  let featuredNames = "";
  if (release.featured_artists) {
    try {
      const parsed = JSON.parse(release.featured_artists) as { name: string }[];
      if (parsed.length > 0)
        featuredNames = ` (feat. ${parsed.map((f) => f.name).join(", ")})`;
    } catch {
      featuredNames = ` (feat. ${release.featured_artists})`;
    }
  }
  const artistLine = release.artist_name + featuredNames;

  // ── UPCOMING / PRE-SAVE ──────────────────────────────────────────────────
  if (isUpcoming) {
    const hasPresave = !!(release.presave_enabled && release.presave_url);
    return (
      <div className="min-h-screen bg-[#0c0c0c] relative overflow-hidden">
        <BlurredBg src={release.cover_art_url} />
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-start pb-12">
          <div className="w-full max-w-sm px-5 pt-10">
            {/* Cover art */}
            <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-black/70 mb-7">
              {release.cover_art_url ? (
                <Image
                  src={release.cover_art_url}
                  alt={release.song_title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#007bff]/30 to-black flex items-center justify-center">
                  <Music2 size={72} className="text-[#007bff]/40" />
                </div>
              )}
            </div>

            {/* Track info */}
            <div className="text-center mb-8">
              {releaseDateStr && (
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-3.5 py-1.5 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <span className="text-emerald-400 text-xs font-semibold">Coming {releaseDateStr}</span>
                </div>
              )}
              <h1 className="text-white font-extrabold text-2xl leading-tight mb-2">
                {release.song_title}
              </h1>
              <p className="text-white/55 text-sm mb-2">{artistLine}</p>
              <p className="text-white/25 text-[10px] uppercase tracking-[0.18em]">
                {release.release_type}{release.genre ? ` · ${release.genre}` : ""}
              </p>
            </div>

            {/* Pre-save buttons */}
            {hasPresave ? (
              <div className="space-y-2.5">
                <p className="text-white/30 text-[10px] uppercase tracking-[0.18em] text-center mb-3">
                  Pre-save now
                </p>
                {PRESAVE_PLATFORMS.map((key) => {
                  const platform = getPlatform(key);
                  return (
                    <a
                      key={key}
                      href={release.presave_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3.5 w-full rounded-2xl px-4 py-3.5 transition-all duration-150 hover:scale-[1.015] active:scale-[0.985]"
                      style={{
                        background: `${platform.color}12`,
                        border: `1px solid ${platform.color}28`,
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${platform.color}22`, color: platform.color }}
                      >
                        <PlatformIcon platformKey={key} size={20} />
                      </div>
                      <span className="text-white font-semibold text-sm flex-1">
                        {platform.label}
                      </span>
                      <span className="text-white/35 text-xs">Pre-save →</span>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-6 py-5 text-center">
                <p className="text-white font-semibold mb-1">Pre-save coming soon</p>
                <p className="text-white/40 text-sm">
                  Check back shortly — the link will appear here before release.
                </p>
              </div>
            )}

            <OrinlabiFooter />
          </div>
        </div>
      </div>
    );
  }

  // ── NOT YET APPROVED ──────────────────────────────────────────────────────
  if (release.status !== "approved") {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        <BlurredBg src={release.cover_art_url} />
        <div className="relative z-10 max-w-sm w-full">
          {release.cover_art_url && (
            <div className="w-40 h-40 rounded-3xl overflow-hidden mx-auto mb-7 shadow-2xl shadow-black/70">
              <Image
                src={release.cover_art_url}
                alt={release.song_title}
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h1 className="text-white font-extrabold text-2xl mb-1.5">{release.song_title}</h1>
          <p className="text-white/50 text-sm mb-8">{release.artist_name}</p>
          <div className="bg-white/[0.05] border border-white/[0.10] rounded-2xl px-6 py-5">
            <p className="text-white font-semibold mb-1">Coming soon</p>
            <p className="text-white/40 text-sm leading-relaxed">
              This release is on its way to streaming platforms. Check back shortly.
            </p>
          </div>
          <OrinlabiFooter />
        </div>
      </div>
    );
  }

  // ── LIVE / LISTEN ─────────────────────────────────────────────────────────
  const links = release.store_links
    ? Object.entries(release.store_links).filter(([, url]) => url?.trim())
    : [];

  return (
    <div className="min-h-screen bg-[#0c0c0c] relative overflow-hidden">
      <BlurredBg src={release.cover_art_url} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start pb-12">
        <div className="w-full max-w-sm px-5 pt-10">
          {/* Cover art */}
          <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-black/70 mb-7 relative">
            {release.cover_art_url ? (
              <Image
                src={release.cover_art_url}
                alt={release.song_title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#007bff]/30 to-black flex items-center justify-center">
                <Music2 size={72} className="text-[#007bff]/40" />
              </div>
            )}
          </div>

          {/* Track info */}
          <div className="text-center mb-8">
            <h1 className="text-white font-extrabold text-2xl leading-tight mb-2">
              {release.song_title}
            </h1>
            <p className="text-white/55 text-sm mb-2">{artistLine}</p>
            <p className="text-white/25 text-[10px] uppercase tracking-[0.18em]">
              {release.release_type}{release.genre ? ` · ${release.genre}` : ""}
            </p>
          </div>

          {/* Platform links */}
          {links.length > 0 ? (
            <>
              <p className="text-white/30 text-[10px] uppercase tracking-[0.18em] text-center mb-4">
                Choose your platform
              </p>
              <div className="space-y-2.5">
                {links.map(([key, url]) => {
                  const platform = getPlatform(key);
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3.5 w-full rounded-2xl px-4 py-3.5 transition-all duration-150 hover:scale-[1.015] active:scale-[0.985]"
                      style={{
                        background: `${platform.color}12`,
                        border: `1px solid ${platform.color}28`,
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${platform.color}22`, color: platform.color }}
                      >
                        <PlatformIcon platformKey={key} size={20} />
                      </div>
                      <span className="text-white font-semibold text-sm flex-1">
                        {platform.label}
                      </span>
                      <span className="text-white/35 text-xs">Listen →</span>
                    </a>
                  );
                })}
              </div>
            </>
          ) : release.ditto_smart_link ? (
            <>
              <p className="text-white/30 text-[10px] uppercase tracking-[0.18em] text-center mb-4">
                Available on all major platforms
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {FALLBACK_PLATFORMS.map((key) => {
                  const p = getPlatform(key);
                  return (
                    <div
                      key={key}
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${p.color}18`, color: p.color }}
                    >
                      <PlatformIcon platformKey={key} size={18} />
                    </div>
                  );
                })}
              </div>
              <a
                href={release.ditto_smart_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full font-bold py-4 rounded-2xl text-white text-base transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #007bff, #7c3aed)" }}
              >
                <Music2 size={18} />
                Stream on all platforms
                <ExternalLink size={14} className="opacity-60" />
              </a>
            </>
          ) : (
            <div className="text-center py-10 text-white/30 text-sm">
              Streaming links coming soon — check back shortly.
            </div>
          )}

          {/* QR code */}
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-white/15 text-[9px] uppercase tracking-[0.25em]">
              Scan to listen
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                `https://orinlabi.com/listen/${release.id}`
              )}&bgcolor=0c0c0c&color=ffffff&margin=6`}
              alt="QR code"
              width={90}
              height={90}
              className="rounded-xl opacity-30"
            />
          </div>

          <OrinlabiFooter />
        </div>
      </div>
    </div>
  );
}

export const revalidate = 300;
