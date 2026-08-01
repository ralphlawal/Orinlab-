import Link from "next/link";
import { Music, Globe, ArrowRight, Play } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getSetting, DEFAULT_ARTISTS_PAGE, type ArtistsPageSettings } from "@/lib/siteSettings";

export const revalidate = 60;

export const metadata = {
  title: "Artists",
  description:
    "Meet the independent artists distributed and supported worldwide by OrinlabÍ Records.",
};

function slugify(name: string) {
  return encodeURIComponent(name.trim());
}

async function getApprovedArtists() {
  const { data } = await supabase
    .from("releases")
    .select("artist_name,genre,country,artist_bio,song_title,cover_art_url,submitted_at,email")
    .eq("status", "approved")
    .order("submitted_at", { ascending: false });

  if (!data) return [];

  // Group all releases per artist, then pick best metadata per artist.
  // Most recent release wins for text fields, but cover_art_url is taken
  // from ANY release that has one (newest first) so a recent re-release
  // without artwork doesn't hide an older cover.
  const byArtist = new Map<string, typeof data>();
  for (const r of data) {
    const key = r.artist_name.toLowerCase().trim();
    if (!byArtist.has(key)) byArtist.set(key, []);
    byArtist.get(key)!.push(r);
  }
  const artists = [...byArtist.values()].map((rows) => {
    const latest = rows[0];
    const cover = rows.find((r) => r.cover_art_url)?.cover_art_url ?? null;
    return { ...latest, cover_art_url: cover };
  });

  // Fetch artist profiles for photo, bio, and country (prefer profile data over application data)
  const emails = artists.map((a) => a.email).filter(Boolean);
  type PMap = { artist_image_url: string | null; bio: string | null; country: string | null; instagram_handle: string | null; spotify_artist_id: string | null };
  let profileMap: Record<string, PMap> = {};
  if (emails.length) {
    const { data: profiles } = await supabase
      .from("artist_profiles")
      .select("email,artist_image_url,bio,country,instagram_handle,spotify_artist_id")
      .in("email", emails);
    if (profiles) {
      for (const p of profiles) {
        profileMap[p.email] = {
          artist_image_url: p.artist_image_url ?? null,
          bio: p.bio ?? null,
          country: p.country ?? null,
          instagram_handle: p.instagram_handle ?? null,
          spotify_artist_id: p.spotify_artist_id ?? null,
        };
      }
    }
  }

  return artists.map((a) => {
    const prof = profileMap[a.email];
    return {
      ...a,
      profile_image_url: prof?.artist_image_url ?? null,
      artist_bio: prof?.bio || a.artist_bio,
      country: prof?.country || a.country,
      instagram_handle: prof?.instagram_handle ?? null,
      spotify_artist_id: prof?.spotify_artist_id ?? null,
    };
  });
}

export default async function ArtistsPage() {
  const [artists, artistsPage] = await Promise.all([
    getApprovedArtists(),
    getSetting<ArtistsPageSettings>("artists_page", DEFAULT_ARTISTS_PAGE),
  ]);
  const countries = new Set(artists.map((a) => a.country).filter(Boolean)).size;

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#007bff]/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4">
            Our Artists
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6">
            {artistsPage.heading}
          </h1>
          <p className="text-white/60 text-lg sm:text-xl leading-relaxed">
            {artistsPage.body}
          </p>
        </div>
      </section>

      {/* Stats */}
      {artists.length > 0 && (
        <section className="py-16 px-4 border-y border-white/10">
          <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">{artists.length}</div>
              <div className="text-white/40 text-sm uppercase tracking-wider">Artists</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">150+</div>
              <div className="text-white/40 text-sm uppercase tracking-wider">Platforms</div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <div className="text-4xl font-bold text-white mb-2">
                {countries > 0 ? countries : "—"}
              </div>
              <div className="text-white/40 text-sm uppercase tracking-wider">Countries</div>
            </div>
          </div>
        </section>
      )}

      {/* Artist grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {artists.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artists.map((a) => {
                const heroImg = a.profile_image_url ?? a.cover_art_url;
                return (
                <Link
                  key={a.artist_name}
                  href={`/artists/${slugify(a.artist_name)}`}
                  className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#007bff]/30 rounded-3xl overflow-hidden transition-all duration-300 block"
                >
                  {/* Cover / avatar area */}
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-[#007bff]/20 via-[#007bff]/5 to-black overflow-hidden">
                    {heroImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={heroImg}
                        alt={`${a.artist_name}`}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Music size={48} className="text-[#007bff]/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      {a.genre && (
                        <span className="text-[#007bff] text-xs font-semibold bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#007bff]/20">
                          {a.genre}
                        </span>
                      )}
                      {a.country && (
                        <div className="flex items-center gap-1.5 text-white/70 text-xs bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
                          <Globe size={11} />
                          {a.country}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-white font-bold text-xl mb-2">{a.artist_name}</h3>

                    {a.artist_bio ? (
                      <p className="text-white/50 text-sm leading-relaxed mb-5 line-clamp-3">
                        {a.artist_bio}
                      </p>
                    ) : (
                      <p className="text-white/25 text-sm italic mb-5">
                        Artist bio coming soon.
                      </p>
                    )}

                    {(a.instagram_handle || a.spotify_artist_id) && (
                      <div className="flex items-center gap-2 mb-4">
                        {a.instagram_handle && (
                          <a
                            href={`https://instagram.com/${a.instagram_handle.replace(/^@/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-pink-400 transition-colors bg-white/[0.04] px-2.5 py-1.5 rounded-lg"
                          >
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                            @{a.instagram_handle.replace(/^@/, "")}
                          </a>
                        )}
                        {a.spotify_artist_id && (
                          <a
                            href={`https://open.spotify.com/artist/${a.spotify_artist_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-[#1db954] transition-colors bg-white/[0.04] px-2.5 py-1.5 rounded-lg"
                          >
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                            Spotify
                          </a>
                        )}
                      </div>
                    )}

                    {a.song_title && (
                      <div className="flex items-center gap-3 bg-white/[0.04] rounded-xl p-3">
                        <div className="w-8 h-8 bg-[#007bff]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Play size={14} className="text-[#007bff]" />
                        </div>
                        <div>
                          <p className="text-white/30 text-xs">Latest Release</p>
                          <p className="text-white text-sm font-medium">{a.song_title}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-white/[0.02] border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Are You Next?
          </h2>
          <p className="text-white/50 text-lg mb-10">
            Any independent artist can submit. Get approved and your music goes live on 150+ platforms worldwide — for free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/submit"
              className="bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-8 py-4 rounded-full transition-all duration-200"
            >
              Apply for Distribution
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-2 text-white/60 hover:text-white font-medium transition-colors"
            >
              How It Works <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24">
      <div className="w-20 h-20 bg-[#007bff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Music size={36} className="text-[#007bff]/50" />
      </div>
      <h3 className="text-white font-bold text-2xl mb-3">Roster Coming Soon</h3>
      <p className="text-white/40 max-w-sm mx-auto leading-relaxed">
        We&apos;re actively reviewing applications and onboarding our first wave
        of artists. Check back soon.
      </p>
      <Link
        href="/submit"
        className="mt-8 inline-block bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-8 py-3.5 rounded-full transition-colors"
      >
        Apply Now
      </Link>
    </div>
  );
}
