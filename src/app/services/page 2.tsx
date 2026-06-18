import Link from "next/link";
import {
  Globe,
  Megaphone,
  CalendarDays,
  Headphones,
  Palette,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "Services – Orinlabí",
  description:
    "Music distribution, marketing, release strategy, playlist promotion, brand development, and graphics design for African artists.",
};

const services = [
  {
    icon: <Globe size={28} />,
    title: "Music Distribution",
    tagline: "Your music everywhere, instantly.",
    desc: "Distribute your singles, EPs, and albums to 150+ streaming platforms including Spotify, Apple Music, Boomplay, Audiomack, Deezer, Tidal, YouTube Music, TikTok, and more. Go live within 24–48 hours.",
    features: [
      "150+ platforms globally",
      "50+ countries covered",
      "24–48 hour delivery",
      "ISRC & UPC generation",
      "Metadata management",
      "100% royalty collection",
    ],
  },
  {
    icon: <Megaphone size={28} />,
    title: "Artist Marketing",
    tagline: "Amplify your release worldwide.",
    desc: "From pre-release campaigns to post-release promotion, our marketing team creates customized campaigns that put your music in front of the right audience at the right time.",
    features: [
      "Social media campaigns",
      "Press & blog features",
      "Radio promotion",
      "Email marketing",
      "Targeted digital ads",
      "Release rollout strategy",
    ],
  },
  {
    icon: <CalendarDays size={28} />,
    title: "Release Strategy",
    tagline: "Plan your release for maximum impact.",
    desc: "A well-planned release makes all the difference. Our strategy team helps you choose the right date, build anticipation, and execute a rollout that maximizes streams and audience growth.",
    features: [
      "Release date planning",
      "Pre-save campaigns",
      "Content calendar",
      "Platform-by-platform strategy",
      "Rollout timeline",
      "Post-release review",
    ],
  },
  {
    icon: <Headphones size={28} />,
    title: "Playlist Promotion",
    tagline: "Get on the playlists that matter.",
    desc: "Our playlist team pitches your music to editorial and independent curators across Spotify, Apple Music, Audiomack, Boomplay, and more — targeting playlists that match your genre and audience.",
    features: [
      "Editorial playlist pitching",
      "Independent curator network",
      "Genre-targeted placement",
      "Africa & global playlists",
      "Boomplay & Audiomack focus",
      "Placement reporting",
    ],
  },
  {
    icon: <TrendingUp size={28} />,
    title: "Brand Development",
    tagline: "Build a career, not just a song.",
    desc: "Your brand is the foundation of your career. We help you develop a consistent, compelling artistic identity — from your bio to your visual aesthetic — that resonates with fans and industry professionals.",
    features: [
      "Artist bio writing",
      "Visual identity guidance",
      "Social media branding",
      "Press kit creation",
      "Positioning strategy",
      "Long-term career planning",
    ],
  },
  {
    icon: <Palette size={28} />,
    title: "Graphics Design",
    tagline: "Visuals that match your sound.",
    desc: "Professional cover art, promotional graphics, and visual assets designed specifically for music industry standards. We create artwork that gets attention on every platform.",
    features: [
      "Album & single cover art",
      "Promotional graphics",
      "Social media templates",
      "Press photos editing",
      "Streaming profile assets",
      "Platform-spec compliance",
    ],
  },
];

function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#007bff]/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto">
        <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4">
          What We Offer
        </p>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6">
          Complete Artist Services.
        </h1>
        <p className="text-white/60 text-lg sm:text-xl leading-relaxed">
          Everything you need to release, promote, and grow your music career
          — under one roof, built for African artists.
        </p>
      </div>
    </section>
  );
}

function ServiceList() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {services.map((s, idx) => (
          <div
            key={s.title}
            className={`grid lg:grid-cols-2 gap-10 items-center bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 sm:p-12 ${
              idx % 2 === 1 ? "lg:flex-row-reverse" : ""
            }`}
          >
            <div className={idx % 2 === 1 ? "lg:order-2" : ""}>
              <div className="w-14 h-14 bg-[#007bff]/10 rounded-2xl flex items-center justify-center text-[#007bff] mb-6">
                {s.icon}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {s.title}
              </h2>
              <p className="text-[#007bff] font-medium mb-5">{s.tagline}</p>
              <p className="text-white/60 leading-relaxed mb-8">{s.desc}</p>
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-6 py-3 rounded-full transition-colors duration-200 text-sm"
              >
                Apply Now <ArrowRight size={16} />
              </Link>
            </div>

            <div className={`bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-6 font-semibold">
                What&apos;s included
              </p>
              <ul className="space-y-4">
                {s.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-[#007bff] flex-shrink-0"
                    />
                    <span className="text-white/70 text-sm">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-white/50 text-lg mb-10">
          Apply to join Orinlabí. Selected artists receive all of these services — free.
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
  );
}

export default function ServicesPage() {
  return (
    <>
      <Hero />
      <ServiceList />
      <CTA />
    </>
  );
}
