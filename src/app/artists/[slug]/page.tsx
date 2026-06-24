import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Globe, Music, ArrowLeft, Play } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = decodeURIComponent(slug).trim();
  return {
    title: `${name} – Orinlabí`,
    description: `${name} is an African artist distributed globally by Orinlabí.`,
  };
}

async function getArtist(slug: string) {
  const artistName = decodeURIComponent(slug).trim();

  // Fetch ALL releases for this artist — let RLS + JS handle status filtering.
  // Do NOT add .eq("status","approved") here: it interacts poorly with some
  // RLS configurations and would cause a hard 404 even for artists who exist
  // but whose releases are currently pending.
  const { data: allReleases } = await supabase
    .from("releases")
    .select("id,artist_name,genre,country,artist_bio,song_title,release_type,release_date,cover_art_url,store_links,submitted_at,email,status")
    .ilike("artist_name", artistName)
    .order("submitted_at", { ascending: false });

  // Approved releases are the only ones shown to visitors
  const approvedReleases = (allReleases ?? []).filter((r) => r.status === "approved");

  // Look up artist profile — first try by email (more accurate), then by name
  let profile = null;
  const anyRelease = (allReleases ?? [])[0] ?? null;
  const profileEmail = anyRelease?.email ?? null;

  if (profileEmail) {
    const { data } = await supabase
      .from("artist_profiles")
      .select("artist_image_url,artist_type,instagram_handle,x_handle,tiktok_username,youtube_channel,website_url,spotify_artist_id,bio,country,artist_name,status")
      .eq("email", profileEmail)
      .maybeSingle();
    profile = data;
  }

  if (!profile) {
    // Fallback: search by name (covers artists with profile but no releases yet)
    const { data } = await supabase
      .from("artist_profiles")
      .select("artist_image_url,artist_type,instagram_handle,x_handle,tiktok_username,youtube_channel,website_url,spotify_artist_id,bio,country,artist_name,status")
      .ilike("artist_name", artistName)
      .maybeSingle();
    profile = data;
  }

  // Hard 404 only when neither releases nor a profile exist for this slug
  if (!allReleases?.length && !profile) return null;

  const displayName = anyRelease?.artist_name ?? (profile as { artist_name?: string | null } | null)?.artist_name ?? artistName;

  return {
    releases: approvedReleases,
    profile,
    artistName: displayName,
    hasPendingOnly: approvedReleases.length === 0,
  };
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getArtist(slug);
  if (!data) notFound();

  const { releases, profile, artistName, hasPendingOnly } = data;
  const anyRelease = releases[0] ?? null;
  const coverArt = releases.find((r) => r.cover_art_url)?.cover_art_url ?? null;
  const heroImg = profile?.artist_image_url ?? coverArt;
  const displayBio = (profile as { bio?: string | null } | null)?.bio || anyRelease?.artist_bio;
  const displayCountry = (profile as { country?: string | null } | null)?.country || anyRelease?.country;

  const socials = [
    profile?.instagram_handle && { label: "Instagram", href: `https://instagram.com/${profile.instagram_handle}`, handle: `@${profile.instagram_handle}` },
    profile?.x_handle && { label: "X", href: `https://x.com/${profile.x_handle}`, handle: `@${profile.x_handle}` },
    profile?.tiktok_username && { label: "TikTok", href: `https://tiktok.com/@${profile.tiktok_username}`, handle: `@${profile.tiktok_username}` },
    profile?.youtube_channel && { label: "YouTube", href: profile.youtube_channel, handle: "YouTube" },
    profile?.website_url && { label: "Website", href: profile.website_url, handle: profile.website_url.replace(/^https?:\/\//, "") },
  ].filter(Boolean) as { label: string; href: string; handle: string }[];

  const spotifyId = profile?.spotify_artist_id;

  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#007bff]/5 to-black pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4">
          <Link href="/artists" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors mb-8">
            <ArrowLeft size={15} /> All Artists
          </Link>

          <div className="flex flex-col md:flex-row items-start gap-8 pb-16">
            {/* Photo */}
            <div className="w-full md:w-72 flex-shrink-0">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#007bff]/20 to-black">
                {heroImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={heroImg} alt={artistName} className="absolute inset-0 w-full h-full object-cover object-center" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Music size={56} className="text-[#007bff]/30" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-2">
              {profile?.artist_type && (
                <p className="text-[#007bff] text-xs font-semibold uppercase tracking-widest mb-3">{profile.artist_type}</p>
              )}
              <h1 className="text-white font-black text-4xl sm:text-5xl md:text-6xl leading-none mb-4">{artistName}</h1>

              <div className="flex flex-wrap gap-3 mb-6">
                {anyRelease?.genre && (
                  <span className="bg-[#007bff]/10 border border-[#007bff]/20 text-[#007bff] text-xs font-semibold px-3 py-1.5 rounded-full">
                    {anyRelease.genre}
                  </span>
                )}
                {displayCountry && (
                  <span className="flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.08] text-white/50 text-xs px-3 py-1.5 rounded-full">
                    <Globe size={11} /> {displayCountry}
                  </span>
                )}
              </div>

              {displayBio && (
                <p className="text-white/60 text-base leading-relaxed mb-6 max-w-xl">{displayBio}</p>
              )}

              {/* Socials */}
              {socials.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.2] text-white/60 hover:text-white text-xs font-medium px-4 py-2 rounded-full transition-all"
                    >
                      {s.handle}
                    </a>
                  ))}
                </div>
              )}

              {/* Spotify embed */}
              {spotifyId && /^[0-9A-Za-z]{22}$/.test(spotifyId) && (
                <div className="mt-6">
                  <iframe
                    src={`https://open.spotify.com/embed/artist/${spotifyId}?utm_source=generator&theme=0`}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-2xl"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Releases */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        {hasPendingOnly ? (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-10 text-center">
            <div className="w-14 h-14 bg-[#007bff]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <Music size={24} className="text-[#007bff]/60" />
            </div>
            <h2 className="text-white font-bold text-xl mb-2">Music coming soon</h2>
            <p className="text-white/40 text-sm max-w-xs mx-auto">
              {artistName}&apos;s releases are being reviewed and will appear here shortly.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-white font-bold text-xl mb-6">Releases</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {releases.map((r) => {
                const hasLinks = r.store_links && Object.keys(r.store_links).length > 0;
                const spotifyLink = r.store_links?.spotify;
                return (
                  <div key={r.id} className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all">
                    <div className="relative aspect-square bg-gradient-to-br from-[#007bff]/10 to-black overflow-hidden">
                      {r.cover_art_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.cover_art_url} alt={r.song_title} className="absolute inset-0 w-full h-full object-cover object-center" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Music size={36} className="text-[#007bff]/20" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-white font-semibold text-sm truncate">{r.song_title}</p>
                      <p className="text-white/40 text-xs mt-0.5">{r.release_type} · {r.genre}</p>
                      {r.release_date && (
                        <p className="text-white/25 text-xs mt-1">
                          {new Date(r.release_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                      {hasLinks && (
                        <div className="flex gap-2 mt-3">
                          {spotifyLink ? (
                            <a href={spotifyLink} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 bg-[#1DB954]/10 hover:bg-[#1DB954]/20 text-[#1DB954] text-xs font-semibold px-3 py-1.5 rounded-full transition-colors">
                              <Play size={11} /> Spotify
                            </a>
                          ) : null}
                          <a href={String(Object.values(r.store_links!)[0] ?? "")} target="_blank" rel="noopener noreferrer"
                            className="text-white/40 hover:text-white text-xs transition-colors">
                            More links →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-white/[0.06] text-center">
        <p className="text-white/40 text-sm mb-4">Inspired? Distribute your music with Orinlabí.</p>
        <Link href="/submit" className="inline-block bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-7 py-3 rounded-full transition-colors text-sm">
          Apply for Distribution
        </Link>
      </section>
    </>
  );
}
