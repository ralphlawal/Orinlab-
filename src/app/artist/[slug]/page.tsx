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

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#007bff]/10 via-transparent to-black pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 pt-20 pb-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 relative z-10">
          {/* Photo */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden bg-gradient-to-br from-[#007bff]/30 to-black flex-shrink-0 shadow-2xl shadow-black/60 flex items-center justify-center">
            {profile.profile_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.profile_photo_url} alt={profile.artist_name} className="w-full h-full object-cover" />
            ) : (
              <Music2 size={40} className="text-[#007bff]/30" />
            )}
          </div>

          <div className="text-center sm:text-left pb-1">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Artist</p>
            <h1 className="text-white font-bold text-3xl sm:text-4xl leading-tight">{profile.artist_name}</h1>
            {profile.genre && <p className="text-white/40 text-sm mt-1">{profile.genre}</p>}

            {/* Socials */}
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
              {profile.instagram_handle && (
                <a
                  href={`https://instagram.com/${profile.instagram_handle.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs transition-colors"
                >
                  <span className="text-[10px]">IG</span>
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
                  <Globe size={14} />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16">
        {/* Bio */}
        {profile.bio && (
          <div className="mb-10 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
            <p className="text-white/60 text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Releases */}
        <div>
          <h2 className="text-white font-semibold text-lg mb-4">Music</h2>

          {releases.length === 0 ? (
            <div className="text-white/30 text-sm text-center py-12">No releases yet.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {releases.map((r) => {
                const hasLink = r.store_links && Object.values(r.store_links).some((v) => v?.trim());
                return (
                  <div key={r.id} className="group">
                    {/* Cover */}
                    <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#007bff]/20 to-black mb-3 flex items-center justify-center shadow-lg shadow-black/40 relative">
                      {r.cover_art_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.cover_art_url} alt={r.song_title} className="w-full h-full object-cover" />
                      ) : (
                        <Music2 size={28} className="text-[#007bff]/30" />
                      )}
                      {hasLink && (
                        <Link
                          href={`/listen/${r.id}`}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <span className="bg-[#007bff] text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                            <ExternalLink size={11} /> Listen
                          </span>
                        </Link>
                      )}
                    </div>
                    <p className="text-white font-medium text-sm truncate">{r.song_title}</p>
                    <p className="text-white/30 text-xs">{r.release_type}{r.release_date ? ` · ${new Date(r.release_date).getFullYear()}` : ""}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Orinlabí footer */}
        <div className="mt-12 pt-8 border-t border-white/[0.06] text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-white/20 hover:text-white/40 text-xs transition-colors">
            Distributed by{" "}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548295/IMG_1637_fbxmfe.png"
              alt="Orinlabí"
              width={14} height={14}
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
