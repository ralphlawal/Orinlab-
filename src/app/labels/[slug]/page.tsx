import { notFound } from "next/navigation";
import Link from "next/link";
import { Globe, ArrowLeft, Play, Music, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await supabase
    .from("label_profiles")
    .select("name,bio")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return { title: "Label Not Found – OrinlabÍ Records" };
  return {
    title: `${data.name} – OrinlabÍ Records`,
    description: data.bio || `${data.name} is a record label distributed globally by OrinlabÍ Records.`,
  };
}

async function getLabel(slug: string) {
  const { data: label } = await supabase
    .from("label_profiles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!label) return null;

  // Find artists whose record_label matches (case-insensitive)
  const { data: artistProfiles } = await supabase
    .from("artist_profiles")
    .select("email,artist_name,artist_image_url,bio,country,artist_type,instagram_handle,spotify_artist_id,record_label")
    .ilike("record_label", label.name);

  const emails = artistProfiles?.map((p) => p.email).filter(Boolean) ?? [];

  let releases: {
    email: string;
    artist_name: string;
    song_title: string;
    cover_art_url: string | null;
    release_type: string;
    genre: string;
    release_date: string | null;
    store_links: Record<string, string> | null;
  }[] = [];

  if (emails.length) {
    const { data } = await supabase
      .from("releases")
      .select("email,artist_name,song_title,cover_art_url,release_type,genre,release_date,store_links")
      .in("email", emails)
      .eq("status", "approved")
      .order("submitted_at", { ascending: false });
    releases = (data ?? []) as typeof releases;
  }

  // Build per-artist data
  const artists = (artistProfiles ?? []).map((p) => {
    const artistReleases = releases.filter((r) => r.email === p.email);
    const cover = artistReleases.find((r) => r.cover_art_url)?.cover_art_url ?? null;
    return {
      ...p,
      coverArt: cover,
      releaseCount: artistReleases.length,
      latestRelease: artistReleases[0] ?? null,
    };
  });

  return { label, artists, releaseCount: releases.length };
}

export default async function LabelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getLabel(slug);
  if (!data) notFound();

  const { label, artists, releaseCount } = data;

  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#007bff]/5 to-black pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4">
          <Link href="/labels" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors mb-8">
            <ArrowLeft size={15} /> All Labels
          </Link>

          <div className="flex flex-col md:flex-row items-start gap-8 pb-16">
            {/* Logo */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#007bff]/20 to-black">
                {label.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={label.logo_url}
                    alt={label.name}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Music size={56} className="text-[#007bff]/30" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-2">
              {label.is_featured && (
                <p className="text-[#007bff] text-xs font-semibold uppercase tracking-widest mb-3">
                  Featured Label
                </p>
              )}
              <h1 className="text-white font-black text-4xl sm:text-5xl md:text-6xl leading-none mb-4">
                {label.name}
              </h1>

              <div className="flex flex-wrap gap-3 mb-6">
                {label.genre_focus && (
                  <span className="bg-[#007bff]/10 border border-[#007bff]/20 text-[#007bff] text-xs font-semibold px-3 py-1.5 rounded-full">
                    {label.genre_focus}
                  </span>
                )}
                {label.country && (
                  <span className="flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.08] text-white/50 text-xs px-3 py-1.5 rounded-full">
                    <Globe size={11} /> {label.country}
                  </span>
                )}
                {label.founded_year && (
                  <span className="bg-white/[0.05] border border-white/[0.08] text-white/50 text-xs px-3 py-1.5 rounded-full">
                    Est. {label.founded_year}
                  </span>
                )}
              </div>

              {label.bio && (
                <p className="text-white/60 text-base leading-relaxed mb-6 max-w-xl">{label.bio}</p>
              )}

              {/* Stats */}
              <div className="flex gap-6 mb-6">
                <div>
                  <div className="text-white font-bold text-xl">{artists.length}</div>
                  <div className="text-white/40 text-xs">Artists</div>
                </div>
                <div>
                  <div className="text-white font-bold text-xl">{releaseCount}</div>
                  <div className="text-white/40 text-xs">Releases</div>
                </div>
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-3">
                {label.website_url && (
                  <a
                    href={label.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.2] text-white/60 hover:text-white text-xs font-medium px-4 py-2 rounded-full transition-all"
                  >
                    <ExternalLink size={11} />
                    {label.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                )}
                {label.instagram_handle && (
                  <a
                    href={`https://instagram.com/${label.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.2] text-white/60 hover:text-white text-xs font-medium px-4 py-2 rounded-full transition-all"
                  >
                    @{label.instagram_handle}
                  </a>
                )}
                {label.x_handle && (
                  <a
                    href={`https://x.com/${label.x_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.2] text-white/60 hover:text-white text-xs font-medium px-4 py-2 rounded-full transition-all"
                  >
                    @{label.x_handle}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Artist Roster */}
      {artists.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <h2 className="text-white font-bold text-xl mb-6">Artists</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {artists.map((a) => {
              const heroImg = a.artist_image_url ?? a.coverArt;
              return (
                <Link
                  key={a.email}
                  href={`/artists/${encodeURIComponent((a.artist_name || "").trim())}`}
                  className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#007bff]/30 rounded-2xl overflow-hidden transition-all"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-[#007bff]/10 to-black overflow-hidden">
                    {heroImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={heroImg}
                        alt={a.artist_name ?? ""}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Music size={36} className="text-[#007bff]/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-white font-semibold truncate">{a.artist_name}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      {a.artist_type && (
                        <p className="text-white/40 text-xs">{a.artist_type}</p>
                      )}
                      {a.releaseCount > 0 && (
                        <p className="text-white/25 text-xs">{a.releaseCount} release{a.releaseCount !== 1 ? "s" : ""}</p>
                      )}
                    </div>
                    {a.latestRelease && (
                      <div className="flex items-center gap-2 mt-3 bg-white/[0.04] rounded-xl p-2.5">
                        <div className="w-7 h-7 bg-[#007bff]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Play size={12} className="text-[#007bff]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white/30 text-[10px]">Latest</p>
                          <p className="text-white text-xs font-medium truncate">{a.latestRelease.song_title}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-4 border-t border-white/[0.06] text-center">
        <p className="text-white/40 text-sm mb-4">Want to distribute your label&apos;s music with OrinlabÍ Records?</p>
        <Link
          href="/contact"
          className="inline-block bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-7 py-3 rounded-full transition-colors text-sm"
        >
          Partner With Us
        </Link>
      </section>
    </>
  );
}
