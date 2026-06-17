import Link from "next/link";
import { Music, Globe, ArrowRight, Play } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export const metadata = {
  title: "Artists – Orinlabí",
  description:
    "Meet the independent African artists distributed and supported by Orinlabí.",
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

  // Deduplicate by artist_name — keep the most recent entry per artist
  const seen = new Set<string>();
  const artists = data.filter((r) => {
    const key = r.artist_name.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Fetch artist profiles for photo, bio, and country (prefer profile data over application data)
  const emails = artists.map((a) => a.email).filter(Boolean);
  type PMap = { artist_image_url: string | null; bio: string | null; country: string | null };
  let profileMap: Record<string, PMap> = {};
  if (emails.length) {
    const { data: profiles } = await supabase
      .from("artist_profiles")
      .select("email,artist_image_url,bio,country")
      .in("email", emails);
    if (profiles) {
      for (const p of profiles) {
        profileMap[p.email] = {
          artist_image_url: p.artist_image_url ?? null,
          bio: p.bio ?? null,
          country: p.country ?? null,
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
    };
  });
}

export default async function ArtistsPage() {
  const artists = await getApprovedArtists();
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
            Voices of Africa.
          </h1>
          <p className="text-white/60 text-lg sm:text-xl leading-relaxed">
            Independent African artists who are reaching the world through
            Orinlabí. Selected. Supported. Global.
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
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-[#007bff]/20 via-[#007bff]/5 to-black overflow-hidden flex items-center justify-center">
                    {heroImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={heroImg}
                        alt={`${a.artist_name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Music size={48} className="text-[#007bff]/30" />
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
            Orinlabí is invitation-based. If you believe your music deserves
            a global audience, apply — distribution is free for selected artists.
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
