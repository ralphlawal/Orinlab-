import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap, Music2, BarChart3, Megaphone, Film, Palette, Users } from "lucide-react";

export const metadata = {
  title: "Music Promotion",
  description: "Playlist pitching, press campaigns, social strategy and paid ads. Get your African music heard worldwide.",
};

const TICKER_ITEMS = [
  "PLAYLIST PITCHING", "PRESS CAMPAIGN", "SOCIAL MEDIA PLAN",
  "SPOTIFY · APPLE · TIDAL", "TIKTOK & INSTAGRAM ADS", "PRIORITY DISTRIBUTION",
  "PROMO VIDEOS", "CURATOR NETWORK", "100% ROYALTIES",
];

const SERVICES = [
  {
    tag: "PLAYLISTS",
    icon: <Music2 size={24} />,
    title: "Playlist Pitching",
    desc: "We pitch your track to our active network of playlist curators across Spotify, Apple Music, Tidal and YouTube Music.",
    price: "$9.99",
    href: "/portal/services",
    color: "#007bff",
  },
  {
    tag: "VIDEO",
    icon: <Film size={24} />,
    title: "Promo Video",
    desc: "Professional promotional video for your release — perfect for social media, story reels and YouTube shorts.",
    price: "$19.99",
    href: "/portal/services",
    color: "#7c3aed",
  },
  {
    tag: "PRIORITY",
    icon: <Zap size={24} />,
    title: "Expedited Release",
    desc: "Skip the queue. Your release goes live on all stores within 3 days instead of the standard 2+ week window.",
    price: "$60",
    href: "/portal/services",
    color: "#f59e0b",
  },
  {
    tag: "DESIGN",
    icon: <Palette size={24} />,
    title: "Cover Art Design",
    desc: "Professional cover art created by our in-house design team, tailored to your genre and brand identity.",
    price: "$15.00",
    href: "/portal/services",
    color: "#10b981",
  },
  {
    tag: "ANALYTICS",
    icon: <BarChart3 size={24} />,
    title: "Analytics & Trends",
    desc: "Track every stream, store breakdown and royalty in real time from your artist portal dashboard.",
    price: "Included",
    href: "/portal/analytics",
    color: "#06b6d4",
  },
  {
    tag: "MARKETING",
    icon: <Users size={24} />,
    title: "Artist Marketing",
    desc: "Tailored Instagram and TikTok strategy written by our promo team, designed to grow your reach in your genre.",
    price: "Coming soon",
    href: "/contact",
    color: "#ec4899",
  },
];

const PACKAGES = [
  {
    name: "Promo",
    tagline: "For artists releasing singles",
    price: "$22.99",
    note: "one-time per release",
    popular: false,
    features: [
      "Playlist pitching (Spotify, Apple, Tidal)",
      "Priority distribution (3-day delivery)",
      "Stream analytics in your portal",
      "Curator pitch report",
    ],
    href: "/portal/services",
    cta: "Start Your Promo",
  },
  {
    name: "Promo+",
    tagline: "Everything, plus visuals",
    price: "$49.99",
    note: "one-time per release",
    popular: true,
    features: [
      "Everything in Promo",
      "Promo video (social-ready)",
      "Custom cover art design",
      "Social media strategy guide",
      "Dedicated promo manager",
    ],
    href: "/portal/services",
    cta: "Start Your Campaign",
  },
];

export default function PromotionPage() {
  return (
    <div className="bg-black text-white overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 sm:px-8 pt-32 pb-0 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(circle, #007bff, transparent)" }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.05]"
            style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] mb-8">
            <Megaphone size={12} className="text-[#007bff]" />
            <span className="text-white/50 text-xs font-semibold tracking-wide uppercase">Music Promotion</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black leading-[0.9] tracking-tight mb-6">
            MUSIC
            <br />
            PROMOTION
            <br />
            <span style={{ background: "linear-gradient(90deg,#007bff,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              MADE EASY.
            </span>
          </h1>

          <p className="text-white/50 text-lg sm:text-xl max-w-xl leading-relaxed mb-10">
            Playlisting. Online press. Social strategy. Promo videos.
            Launch a high-impact music marketing campaign managed by our team.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link
              href="/portal/login?redirect=/portal/services"
              className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-full transition-all hover:gap-3 group"
              style={{ background: "linear-gradient(135deg,#007bff,#7c3aed)" }}
            >
              Start Your Campaign
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="#packages"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white font-medium px-6 py-4 rounded-full border border-white/[0.1] hover:border-white/25 transition-all"
            >
              View Packages
            </Link>
          </div>

          <p className="text-white/25 text-sm mt-5">
            Lock your campaign in now.{" "}
            <strong className="text-white/40">Launch anytime within 12 months.</strong>
          </p>
        </div>

        {/* Ticker */}
        <div className="mt-16 -mx-6 sm:-mx-8 border-t border-b border-white/[0.06] py-3 overflow-hidden bg-white/[0.01]">
          <div className="flex whitespace-nowrap" style={{ animation: "ticker 35s linear infinite" }}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-4 text-white/20 text-xs font-bold tracking-widest uppercase px-8">
                {item}
                <span className="w-1 h-1 rounded-full bg-[#007bff] inline-block flex-shrink-0" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="px-6 sm:px-8 py-24">
        <div className="max-w-6xl mx-auto">
          <p className="text-white/25 text-xs font-semibold tracking-widest uppercase mb-2">What We Offer</p>
          <h2 className="text-3xl sm:text-4xl font-black mb-12">
            Inside out. Pick the services{" "}
            <span style={{ background: "linear-gradient(90deg,#007bff,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              that fit.
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="group relative bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-6 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${s.color}18`, color: s.color }}
                  >
                    {s.icon}
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full border"
                    style={{ color: s.color, borderColor: `${s.color}30`, background: `${s.color}08` }}>
                    {s.tag}
                  </span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-4">{s.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold" style={{ color: s.color }}>{s.price}</span>
                  <span className="text-white/20 group-hover:text-white/50 transition-colors">
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Risk-free callout */}
      <section className="px-6 sm:px-8 pb-16">
        <div className="max-w-2xl mx-auto bg-white/[0.03] border border-white/[0.07] rounded-3xl p-8 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg,#007bff,#7c3aed)" }}>
            <CheckCircle2 size={22} className="text-white" />
          </div>
          <h3 className="text-white font-bold text-2xl mb-2">Risk-Free Promotion</h3>
          <p className="text-white/40 text-sm mb-6">We stand behind every campaign we run.</p>
          <ul className="space-y-2 text-left max-w-xs mx-auto">
            {[
              "Keep 100% of your royalties",
              "No hidden fees or commissions",
              "Start anytime within 12 months",
              "Works with any subscription plan",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-white/60 text-sm">
                <CheckCircle2 size={14} className="text-[#007bff] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="px-6 sm:px-8 py-24" style={{ background: "linear-gradient(180deg, #050508 0%, #020204 100%)" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-white/25 text-xs font-semibold tracking-widest uppercase mb-2 text-center">Our Promo Packages</p>
          <h2 className="text-3xl sm:text-4xl font-black mb-3 text-center">
            We know music marketing.
            <br />
            <span style={{ background: "linear-gradient(90deg,#007bff,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Pick the campaign that fits.
            </span>
          </h2>
          <p className="text-white/30 text-sm text-center mb-12">Requires an active subscription plan. <Link href="/pricing" className="text-[#007bff] hover:underline">See plans →</Link></p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className="relative rounded-3xl p-8 border"
                style={{
                  background: pkg.popular ? "linear-gradient(145deg,#0a0a1a,#050512)" : "rgba(255,255,255,0.02)",
                  borderColor: pkg.popular ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.07)",
                }}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 right-6 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: "linear-gradient(90deg,#007bff,#7c3aed)", color: "white" }}>
                    MOST POPULAR
                  </div>
                )}
                <p className="text-white/30 text-xs font-semibold tracking-widest uppercase mb-2">{pkg.name}</p>
                <p className="text-white text-4xl font-black mb-1">{pkg.price}</p>
                <p className="text-white/30 text-xs mb-2">{pkg.note}</p>
                <p className="text-white/50 text-sm mb-6">{pkg.tagline}</p>
                <Link
                  href={pkg.href}
                  className="block text-center font-bold py-3.5 rounded-2xl mb-6 transition-all"
                  style={pkg.popular
                    ? { background: "linear-gradient(135deg,#007bff,#7c3aed)", color: "white" }
                    : { background: "rgba(255,255,255,0.07)", color: "white" }}
                >
                  {pkg.cta}
                </Link>
                <ul className="space-y-2.5">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/60">
                      <CheckCircle2 size={14} className="text-[#007bff] flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 sm:px-8 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black mb-4">
            Ready to get your<br />
            <span style={{ background: "linear-gradient(90deg,#007bff,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              music heard?
            </span>
          </h2>
          <p className="text-white/40 text-lg mb-8">Start with a plan, then add promotion when you&apos;re ready to launch.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-full group hover:gap-3 transition-all"
              style={{ background: "linear-gradient(135deg,#007bff,#7c3aed)" }}
            >
              View Plans <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white font-medium px-7 py-4 rounded-full border border-white/10 hover:border-white/30 transition-all"
            >
              Get In Touch <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
