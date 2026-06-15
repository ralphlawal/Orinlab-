import Link from "next/link";
import {
  Globe,
  Music,
  TrendingUp,
  ShieldCheck,
  Headphones,
  Mic2,
  BarChart3,
  Star,
  ChevronDown,
  ArrowRight,
  Zap,
  Users,
  DollarSign,
} from "lucide-react";

/* ── Hero ───────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#007bff]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 text-xs font-medium px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 bg-[#007bff] rounded-full animate-pulse" />
          Now accepting artist applications
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-6">
          Release Your Music{" "}
          <span className="text-[#007bff]">Worldwide.</span>
        </h1>

        <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Invitation-based global distribution for independent African artists.
          Apply, get selected, and release to 150+ platforms — completely free.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/submit"
            className="bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-8 py-4 rounded-full text-base transition-all duration-200 hover:shadow-[0_0_30px_rgba(0,123,255,0.4)]"
          >
            Apply for Distribution
          </Link>
          <Link
            href="/pricing"
            className="flex items-center gap-2 text-white/70 hover:text-white font-medium px-6 py-4 rounded-full border border-white/10 hover:border-white/30 text-base transition-all duration-200"
          >
            How It Works <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { value: "150+", label: "Platforms" },
            { value: "50+", label: "Countries" },
            { value: "100%", label: "Ownership" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-white">{s.value}</div>
              <div className="text-white/40 text-xs mt-1 uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 animate-bounce">
        <ChevronDown size={24} />
      </div>
    </section>
  );
}

/* ── Streaming Platforms ────────────────────────────────── */
function Platforms() {
  const platforms = [
    "Spotify",
    "Apple Music",
    "YouTube Music",
    "Deezer",
    "Tidal",
    "Amazon Music",
    "Boomplay",
    "Audiomack",
    "SoundCloud",
    "TikTok",
    "Instagram",
    "Facebook",
  ];
  return (
    <section className="py-16 border-y border-white/10 overflow-hidden">
      <p className="text-center text-white/30 text-xs uppercase tracking-widest mb-10">
        Your music on every major platform
      </p>
      <div
        className="flex gap-12"
        style={{ animation: "marquee 30s linear infinite" }}
      >
        {[...platforms, ...platforms].map((p, i) => (
          <span
            key={i}
            className="text-white/20 font-semibold text-lg whitespace-nowrap hover:text-white/60 transition-colors cursor-default"
          >
            {p}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

/* ── Features ───────────────────────────────────────────── */
function Features() {
  const features = [
    {
      icon: <Globe size={24} />,
      title: "Global Distribution",
      desc: "Get your music on 150+ streaming platforms across 50+ countries including Spotify, Apple Music, Boomplay, and more.",
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "100% Ownership",
      desc: "You own your masters. Always. We distribute your music without taking your rights or intellectual property.",
    },
    {
      icon: <DollarSign size={24} />,
      title: "Royalty Collection",
      desc: "Collect every dollar you earn from streams, downloads, and sync placements across all platforms.",
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Artist Marketing",
      desc: "Dedicated marketing campaigns, playlist pitching, and press coverage to amplify your release.",
    },
    {
      icon: <Headphones size={24} />,
      title: "Playlist Promotion",
      desc: "Get your music placed on curated playlists that reach thousands of targeted listeners.",
    },
    {
      icon: <Mic2 size={24} />,
      title: "Artist Development",
      desc: "Expert guidance on release strategy, brand building, and growing a sustainable music career.",
    },
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-3">
            Everything You Need
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Built For Artists,{" "}
            <span className="text-[#007bff]">By Artists.</span>
          </h2>
          <p className="text-white/50 mt-4 max-w-xl mx-auto">
            A complete ecosystem to release, promote, and grow your music career
            without losing ownership.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#007bff]/30 rounded-2xl p-7 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-[#007bff]/10 group-hover:bg-[#007bff]/20 rounded-xl flex items-center justify-center text-[#007bff] mb-5 transition-colors duration-300">
                {f.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {f.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Why Orinlabí ───────────────────────────────────────── */
function WhyOrinlabí() {
  const reasons = [
    {
      icon: <Users size={20} />,
      title: "African-Focused",
      desc: "Built for the unique needs of African artists navigating the global music industry.",
    },
    {
      icon: <Zap size={20} />,
      title: "Fast Delivery",
      desc: "Your music goes live on platforms within 24–48 hours after approval.",
    },
    {
      icon: <BarChart3 size={20} />,
      title: "Real-Time Analytics",
      desc: "Track your streams, earnings, and audience growth across all platforms.",
    },
    {
      icon: <ShieldCheck size={20} />,
      title: "Always Free",
      desc: "No subscription, no hidden fees. Selected artists distribute at zero cost — ever.",
    },
  ];

  return (
    <section className="py-24 px-4 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-3">
            Why Choose Us
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            The Platform African Artists Deserve.
          </h2>
          <p className="text-white/50 leading-relaxed mb-8">
            Orinlabí was built with African creators in mind. We don&apos;t believe
            distribution should cost you money. Apply, get selected, and release
            your music to the world — free. You focus on the art; we handle everything else.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-[#007bff] font-semibold hover:gap-3 transition-all duration-200"
          >
            Our Story <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-6"
            >
              <div className="w-10 h-10 bg-[#007bff]/10 rounded-lg flex items-center justify-center text-[#007bff] mb-4">
                {r.icon}
              </div>
              <h4 className="text-white font-semibold mb-2">{r.title}</h4>
              <p className="text-white/50 text-sm leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ───────────────────────────────────────── */
function Testimonials() {
  const testimonials = [
    {
      name: "Temi Adeyemi",
      role: "Afrobeats Artist, Lagos",
      quote:
        "Orinlabí made my global debut possible. My single was live on Spotify, Apple Music, and Boomplay within 48 hours. The support team actually cares.",
      rating: 5,
    },
    {
      name: "Kwame Asante",
      role: "Highlife Producer, Accra",
      quote:
        "Finally a distributor that understands the African market. The royalty transparency and playlist promotion are top-tier. I am not going anywhere else.",
      rating: 5,
    },
    {
      name: "Zara Musa",
      role: "Afropop Vocalist, Abuja",
      quote:
        "The release strategy team helped me plan my EP rollout from start to finish. Streams went up 400% compared to my previous release. Incredible.",
      rating: 5,
    },
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-3">
            Artist Stories
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Artists Love Orinlabí.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 flex flex-col"
            >
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-[#007bff] text-[#007bff]"
                  />
                ))}
              </div>
              <p className="text-white/70 text-sm leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-white/40 text-xs mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Artist Spotlight ────────────────────────────────────── */
function ArtistSpotlight() {
  const artists = [
    { name: "Temi Adeyemi", genre: "Afrobeats", country: "Nigeria", streams: "2.4M streams" },
    { name: "Kwame Asante", genre: "Highlife", country: "Ghana", streams: "1.8M streams" },
    { name: "Zara Musa", genre: "Afropop", country: "Nigeria", streams: "3.1M streams" },
    { name: "Amara Diallo", genre: "Afro-soul", country: "Senegal", streams: "900K streams" },
  ];

  return (
    <section className="py-24 px-4 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-3">
            Featured Artists
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Artist Spotlight.
          </h2>
          <p className="text-white/50 mt-4">
            Independent artists achieving global reach through Orinlabí.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {artists.map((a) => (
            <div
              key={a.name}
              className="group bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-[#007bff]/30 rounded-2xl overflow-hidden transition-all duration-300"
            >
              <div className="aspect-square bg-gradient-to-br from-[#007bff]/20 to-black/80 flex items-center justify-center">
                <Music size={40} className="text-[#007bff]/40" />
              </div>
              <div className="p-5">
                <h3 className="text-white font-semibold">{a.name}</h3>
                <p className="text-white/40 text-xs mt-0.5">
                  {a.genre} · {a.country}
                </p>
                <p className="text-[#007bff] text-xs font-semibold mt-3">
                  {a.streams}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/artists"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white font-medium transition-colors"
          >
            View All Artists <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ─────────────────────────────────────────────────── */
function FAQ() {
  const faqs = [
    {
      q: "How does Orinlabí distribute my music?",
      a: "You submit an application with your release details. Our team reviews it and if selected, we deliver your music to 150+ platforms worldwide — Spotify, Apple Music, Boomplay, Audiomack, and more — at no cost.",
    },
    {
      q: "Do I keep ownership of my music?",
      a: "Absolutely. You retain 100% ownership of your masters and copyright. Orinlabí only facilitates distribution and services — your music always belongs to you.",
    },
    {
      q: "How long does it take for my music to go live?",
      a: "Most releases go live within 24–48 hours after approval. We recommend submitting at least 2 weeks before your intended release date for best results.",
    },
    {
      q: "How do I receive my royalties?",
      a: "Royalties are tracked and paid out monthly. You can view your earnings in your artist dashboard and withdraw to your preferred payment method.",
    },
    {
      q: "What genres do you support?",
      a: "We support all genres with a focus on African music — Afrobeats, Highlife, Afropop, Amapiano, Afro-soul, Afro-fusion, and more.",
    },
    {
      q: "Can I release an album or EP?",
      a: "Yes. We support singles, EPs, and full albums. Once selected, you can submit releases to us and each one goes through our standard review and distribution process.",
    },
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-3">
            FAQ
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Common Questions.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden"
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer text-white font-medium text-sm list-none hover:text-[#007bff] transition-colors">
                {faq.q}
                <ChevronDown
                  size={18}
                  className="text-white/40 group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4"
                />
              </summary>
              <p className="px-5 pb-5 text-white/50 text-sm leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Call To Action ──────────────────────────────────────── */
function CTA() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto text-center relative">
        <div className="absolute inset-0 bg-[#007bff]/5 rounded-3xl blur-3xl" />
        <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-3xl p-12 sm:p-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Ready to Release?
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
            Join selected African artists distributing their music worldwide
            with Orinlabí — free, for those we believe in.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/submit"
              className="bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-10 py-4 rounded-full text-base transition-all duration-200 hover:shadow-[0_0_40px_rgba(0,123,255,0.4)]"
            >
              Apply Now
            </Link>
            <Link
              href="/pricing"
              className="text-white/60 hover:text-white font-medium px-6 py-4 rounded-full border border-white/10 hover:border-white/30 transition-all duration-200"
            >
              How It Works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Platforms />
      <Features />
      <WhyOrinlabí />
      <Testimonials />
      <ArtistSpotlight />
      <FAQ />
      <CTA />
    </>
  );
}
