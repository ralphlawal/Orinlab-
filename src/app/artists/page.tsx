import Link from "next/link";
import { Music, Globe, ArrowRight, Star, Play } from "lucide-react";

export const metadata = {
  title: "Artists – Orinlabi",
  description:
    "Meet the independent African artists distributed and supported by Orinlabi.",
};

const artists = [
  {
    name: "Temi Adeyemi",
    genre: "Afrobeats",
    country: "Nigeria",
    streams: "2.4M",
    releases: 8,
    bio: "Lagos-based Afrobeats artist known for infectious rhythms and powerful storytelling. His debut EP crossed 1M streams in its first month.",
    achievements: ["1M+ streams debut EP", "Featured on Audiomack Top 10", "Boomplay editorial playlist"],
    latestRelease: "Everyday Vibe",
  },
  {
    name: "Kwame Asante",
    genre: "Highlife",
    country: "Ghana",
    streams: "1.8M",
    releases: 12,
    bio: "A master of contemporary Highlife blending traditional Ghanaian sounds with modern production, Kwame has built a loyal international audience.",
    achievements: ["Ghana Music Awards Nominee", "BBC Africa featured", "European tour 2025"],
    latestRelease: "Akwaaba",
  },
  {
    name: "Zara Musa",
    genre: "Afropop",
    country: "Nigeria",
    streams: "3.1M",
    releases: 15,
    bio: "One of Nigeria's most exciting Afropop voices, Zara's soulful delivery and powerful lyrics have earned her a massive global following.",
    achievements: ["3M+ total streams", "Apple Music Africa featured", "NET Awards nominated"],
    latestRelease: "Higher Ground EP",
  },
  {
    name: "Amara Diallo",
    genre: "Afro-soul",
    country: "Senegal",
    streams: "900K",
    releases: 5,
    bio: "Dakar-born singer-songwriter blending West African soul with contemporary R&B influences, creating music that transcends borders.",
    achievements: ["Spotify New Music Friday Africa", "TRACE Africa feature", "Deezer editorial pick"],
    latestRelease: "L'Âme du Sahel",
  },
  {
    name: "Chidi Okonkwo",
    genre: "Afro-fusion",
    country: "Nigeria",
    streams: "1.2M",
    releases: 7,
    bio: "Port Harcourt-based producer and vocalist crafting a unique Afro-fusion sound that draws from jazz, highlife, and electronic music.",
    achievements: ["1M+ streams milestone", "COLOURS session featured", "Sync placement in film"],
    latestRelease: "Neon Lagos",
  },
  {
    name: "Fatou Kouyaté",
    genre: "Afropop",
    country: "Guinea",
    streams: "650K",
    releases: 4,
    bio: "A rising star from Conakry whose powerful voice and danceable productions are rapidly building a fanbase across Francophone Africa.",
    achievements: ["Boomplay West Africa chart", "RFI Africa feature", "Music in Africa spotlight"],
    latestRelease: "Liberté",
  },
];

function Hero() {
  return (
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
          Orinlabi. This is their story.
        </p>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="py-16 px-4 border-y border-white/10">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { value: "50+", label: "Artists" },
          { value: "10M+", label: "Total Streams" },
          { value: "50+", label: "Countries" },
          { value: "100+", label: "Releases" },
        ].map((s) => (
          <div key={s.label}>
            <div className="text-4xl font-bold text-white mb-2">{s.value}</div>
            <div className="text-white/40 text-sm uppercase tracking-wider">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ArtistGrid() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((a) => (
            <div
              key={a.name}
              className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#007bff]/30 rounded-3xl overflow-hidden transition-all duration-300"
            >
              {/* Avatar area */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-[#007bff]/20 via-[#007bff]/5 to-black flex items-center justify-center">
                <Music size={48} className="text-[#007bff]/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="text-[#007bff] text-xs font-semibold bg-[#007bff]/10 px-2 py-1 rounded-full">
                      {a.genre}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/60 text-xs">
                    <Globe size={12} />
                    {a.country}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold text-xl">{a.name}</h3>
                    <p className="text-white/40 text-xs mt-0.5">
                      {a.releases} releases
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[#007bff] font-bold text-lg">
                      {a.streams}
                    </div>
                    <div className="text-white/30 text-xs">streams</div>
                  </div>
                </div>

                <p className="text-white/50 text-sm leading-relaxed mb-5">
                  {a.bio}
                </p>

                {/* Latest release */}
                <div className="flex items-center gap-3 bg-white/[0.04] rounded-xl p-3 mb-5">
                  <div className="w-8 h-8 bg-[#007bff]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Play size={14} className="text-[#007bff]" />
                  </div>
                  <div>
                    <p className="text-white/30 text-xs">Latest Release</p>
                    <p className="text-white text-sm font-medium">{a.latestRelease}</p>
                  </div>
                </div>

                {/* Achievements */}
                <div className="space-y-2">
                  {a.achievements.map((ach) => (
                    <div key={ach} className="flex items-center gap-2">
                      <Star size={12} className="text-[#007bff] flex-shrink-0" />
                      <span className="text-white/40 text-xs">{ach}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 px-4 bg-white/[0.02]">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Are You Next?
        </h2>
        <p className="text-white/50 text-lg mb-10">
          Join the growing roster of African artists releasing their music
          worldwide through Orinlabi.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/submit"
            className="bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-8 py-4 rounded-full transition-all duration-200"
          >
            Submit Your Music
          </Link>
          <Link
            href="/pricing"
            className="flex items-center gap-2 text-white/60 hover:text-white font-medium transition-colors"
          >
            View Plans <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function ArtistsPage() {
  return (
    <>
      <Hero />
      <Stats />
      <ArtistGrid />
      <CTA />
    </>
  );
}
