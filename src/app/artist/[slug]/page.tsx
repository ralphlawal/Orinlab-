import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Music2, ExternalLink, Globe } from "lucide-react";

type Profile = {
  email: string;
  artist_name: string;
  bio: string | null;
  profile_photo_url: string | null;
  instagram_handle: string | null;
  website_url: string | null;
  genre: string | null;
  public_slug: string | null;
};

type Release = {
  id: string;
  song_title: string;
  release_type: string;
  genre: string;
  cover_art_url: string | null;
  release_date: string | null;
  store_links: Record<string, string> | null;
};

function getAccentColor(genre: string | null): string {
  const g = (genre ?? "").toLowerCase();
  if (g.includes("afrobeat"))                    return "#f59e0b"; // amber
  if (g.includes("amapiano"))                    return "#a855f7"; // purple
  if (g.includes("highlife"))                    return "#22c55e"; // green
  if (g.includes("gospel"))                      return "#eab308"; // gold
  if (g.includes("hip-hop") || g.includes("rap")) return "#ef4444"; // red
  if (g.includes("r&b"))                         return "#06b6d4"; // cyan
  if (g.includes("afropop"))                     return "#ec4899"; // pink
  if (g.includes("afro-soul") || g.includes("soul")) return "#f97316"; // orange
  if (g.includes("afro-fusion"))                 return "#f59e0b"; // amber
  if (g.includes("reggae"))                      return "#16a34a"; // deep green
  if (g.includes("jazz"))                        return "#c084fc"; // lavender
  return "#007bff";
}

async function getData(slug: string): Promise<{ profile: Profile; releases: Release[] } | null> {
  const { data: profile } = await supabase
    .from("artist_profiles")
    .select("email, artist_name, bio, profile_photo_url, instagram_handle, website_url, genre, public_slug")
    .eq("public_slug", slug)
    .maybeSingle();

  if (!profile) return null;

  const { data: releases } = await supabase
    .from("releases")
    .select("id, song_title, release_type, genre, cover_art_url, release_date, store_links")
    .eq("email", profile.email)
    .eq("status", "approved")
    .order("release_date", { ascending: false });

  return { profile: profile as Profile, releases: (releases ?? []) as Release[] };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) return { title: "Artist Not Found" };
  const { profile } = data;
  return {
    title: `${profile.artist_name} — Orinlabí`,
    description: profile.bio ?? `${profile.artist_name} on Orinlabí Music Distribution.`,
    openGraph: {
      title: profile.artist_name,
      description: profile.bio ?? undefined,
      images: profile.profile_photo_url ? [{ url: profile.profile_photo_url, width: 400, height: 400 }] : [],
    },
  };
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) notFound();

  const { profile, releases } = data;
  const accent = getAccentColor(profile.genre);

  return (
    <div className="min-h-screen bg-black relative">

      {/* Left accent strip */}
      <div
        className="fixed left-0 top-0 bottom-0 w-1.5 z-50 pointer-events-none"
        style={{ background: `linear-gradient(to bottom, ${accent}, ${accent}60, transparent)` }}
      />

      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Background gradient wash from accent */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${accent}28 0%, ${accent}08 40%, transparent 70%)`,
          }}
        />
        {/* Subtle bottom fade to black */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 pl-8 pt-24 pb-14 flex flex-col sm:flex-row items-center sm:items-end gap-7 relative z-10">
          {/* Photo */}
          <div
            className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${accent}40, #000)`,
              boxShadow: `0 24px 64px ${accent}50, 0 4px 24px rgba(0,0,0,0.8)`,
            }}
          >
            {profile.profile_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profile_photo_url}
                alt={profile.artist_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music2 size={44} style={{ color: accent, opacity: 0.5 }} />
            )}
          </div>

          <div className="text-center sm:text-left pb-1">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1.5">Artist</p>
            <h1 className="text-white font-bold text-3xl sm:text-5xl leading-none tracking-tight mb-2">
              {profile.artist_name}
            </h1>

            {/* Genre badge */}
            {profile.genre && (
              <span
                className="inline-block text-xs font-semibold px-3 py-1 rounded-full mt-1 mb-3"
                style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}
              >
                {profile.genre}
              </span>
            )}

            {/* Socials */}
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-1">
              {profile.instagram_handle && (
                <a
                  href={`https://instagram.com/${profile.instagram_handle.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs transition-colors"
                >
                  <span className="text-[10px] font-bold">IG</span>
                  @{profile.instagram_handle.replace(/^@/, "")}
                </a>
              )}
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs transition-colors"
                >
                  <Globe size={13} />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pl-8 pb-20">
        {/* Bio */}
        {profile.bio && (
          <div
            className="mb-10 rounded-2xl p-5"
            style={{
              background: `${accent}08`,
              border: `1px solid ${accent}20`,
            }}
          >
            <p className="text-white/60 text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Releases */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-1 h-5 rounded-full"
              style={{ background: accent }}
            />
            <h2 className="text-white font-semibold text-lg">Music</h2>
            {releases.length > 0 && (
              <span className="text-white/20 text-sm">{releases.length} release{releases.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {releases.length === 0 ? (
            <div className="text-white/20 text-sm text-center py-16">No releases yet.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {releases.map((r) => {
                const hasLink = r.store_links && Object.values(r.store_links).some((v) => v?.trim());
                return (
                  <div key={r.id} className="group">
                    <div
                      className="aspect-square rounded-2xl overflow-hidden mb-3 relative flex items-center justify-center shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${accent}25, #111)`,
                        boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
                      }}
                    >
                      {r.cover_art_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.cover_art_url}
                          alt={r.song_title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Music2 size={28} style={{ color: accent, opacity: 0.3 }} />
                      )}
                      {hasLink && (
                        <Link
                          href={`/listen/${r.id}`}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <span
                            className="text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1"
                            style={{ background: accent }}
                          >
                            <ExternalLink size={11} /> Listen
                          </span>
                        </Link>
                      )}
                    </div>
                    <p className="text-white font-medium text-sm truncate">{r.song_title}</p>
                    <p className="text-white/30 text-xs">
                      {r.release_type}{r.release_date ? ` · ${new Date(r.release_date).getFullYear()}` : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Orinlabí footer */}
        <div className="mt-14 pt-8 border-t border-white/[0.06] text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-white/20 hover:text-white/40 text-xs transition-colors">
            Distributed by{" "}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548295/IMG_1637_fbxmfe.png"
              alt="Orinlabí"
              width={14}
              height={14}
              className="opacity-30"
            />
            <span className="font-semibold">Orinlabí</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 300;
