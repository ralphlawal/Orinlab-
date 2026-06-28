import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronDown,
  Star,
  CheckCircle2,
  Zap,
  Globe,
  ShieldCheck,
  BarChart3,
  Users,
  DollarSign,
  Music,
} from "lucide-react";
import { PlatformIcon } from "@/components/PlatformIcon";
import {
  getSetting,
  DEFAULT_HERO,
  DEFAULT_TESTIMONIALS,
  DEFAULT_SPOTLIGHT,
  DEFAULT_FEATURES,
  DEFAULT_WHY,
  DEFAULT_FAQ,
  type HeroSettings,
  type Testimonial,
  type SpotlightArtist,
  type FeatureCard,
  type WhyCard,
  type FaqItem,
} from "@/lib/siteSettings";

/* ── Hero ─────────────────────────────────────────────────────────────────── */

const HERO_PLATFORMS = [
  { key: "spotify",      color: "#1DB954", size: 52, top: "8%",  left: "55%" },
  { key: "apple_music",  color: "#FC3C44", size: 44, top: "20%", left: "78%" },
  { key: "tiktok",       color: "#69C9D0", size: 40, top: "38%", left: "88%" },
  { key: "boomplay",     color: "#FF6B35", size: 38, top: "60%", left: "80%" },
  { key: "audiomack",    color: "#FFA500", size: 36, top: "74%", left: "60%" },
  { key: "deezer",       color: "#A238FF", size: 34, top: "55%", left: "48%" },
  { key: "amazon_music", color: "#00A8E1", size: 38, top: "28%", left: "62%" },
  { key: "tidal",        color: "#00FFFF", size: 32, top: "14%", left: "88%" },
  { key: "soundcloud",   color: "#FF5500", size: 30, top: "84%", left: "72%" },
  { key: "youtube_music",color: "#FF0000", size: 36, top: "46%", left: "70%" },
  { key: "instagram",    color: "#E1306C", size: 28, top: "90%", left: "50%" },
  { key: "anghami",      color: "#9B59B6", size: 32, top: "6%",  left: "70%" },
];

function Hero({ s }: { s: HeroSettings }) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#050505]">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-[#007bff]/8 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating platform icons — right 50% of screen */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        {HERO_PLATFORMS.map((p) => (
          <div
            key={p.key}
            className="absolute flex items-center justify-center rounded-2xl"
            style={{
              top: p.top,
              left: p.left,
              width: p.size + 20,
              height: p.size + 20,
              background: `${p.color}18`,
              border: `1px solid ${p.color}30`,
              backdropFilter: "blur(8px)",
              animation: `float-${Math.floor(Math.random() * 3)} ${3 + Math.random() * 2}s ease-in-out infinite`,
            }}
          >
            <span style={{ color: p.color }}><PlatformIcon platformKey={p.key} size={p.size} /></span>
          </div>
        ))}
        {/* connecting lines hint */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" preserveAspectRatio="none">
          <line x1="50%" y1="15%" x2="65%" y2="30%" stroke="white" strokeWidth="0.5" strokeDasharray="4 8" />
          <line x1="65%" y1="30%" x2="80%" y2="45%" stroke="white" strokeWidth="0.5" strokeDasharray="4 8" />
          <line x1="80%" y1="45%" x2="70%" y2="65%" stroke="white" strokeWidth="0.5" strokeDasharray="4 8" />
          <line x1="70%" y1="65%" x2="55%" y2="75%" stroke="white" strokeWidth="0.5" strokeDasharray="4 8" />
        </svg>
      </div>

      {/* Content — left half */}
      <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16 py-20 lg:max-w-[55%]">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-10">
          <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
          <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">01 Distribute</span>
        </div>

        {/* Headline */}
        <h1 className="font-bold leading-[0.95] tracking-tight mb-8">
          <span className="block text-[clamp(4rem,12vw,9rem)] text-white">Africa.</span>
          <span className="block text-[clamp(3rem,9vw,7rem)] text-white/50">Global.</span>
          <span className="block text-[clamp(3rem,9vw,7rem)] text-[#007bff]">Now.</span>
        </h1>

        <p className="text-white/50 text-lg sm:text-xl max-w-lg mb-10 leading-relaxed">
          {s.subheadline || "Drop your music on Spotify, Apple Music, Boomplay, TikTok and 150+ platforms worldwide. 100% of your royalties. Always."}
        </p>

        <div className="flex flex-col sm:flex-row items-start gap-3 mb-16">
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-bold px-8 py-4 rounded-full text-base transition-all duration-200 hover:shadow-[0_0_40px_rgba(0,123,255,0.35)] hover:gap-3"
          >
            Apply for Distribution <ArrowRight size={16} />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white font-medium px-7 py-4 rounded-full border border-white/10 hover:border-white/30 text-base transition-all duration-200"
          >
            How It Works
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-8 flex-wrap">
          {(s.stats ?? [{ value: "150+", label: "Platforms" }, { value: "100%", label: "Royalties" }, { value: "Africa", label: "First" }]).map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-white/30 text-xs uppercase tracking-widest mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20 animate-bounce">
        <ChevronDown size={22} />
      </div>

      <style>{`
        @keyframes float-0 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
        @keyframes float-1 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-16px)} }
        @keyframes float-2 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        [style*="float-0"] { animation-name: float-0 !important; }
        [style*="float-1"] { animation-name: float-1 !important; }
        [style*="float-2"] { animation-name: float-2 !important; }
      `}</style>
    </section>
  );
}

/* ── Genre ticker ─────────────────────────────────────────────────────────── */
const GENRES = [
  "Afrobeats", "Amapiano", "Highlife", "Afro-pop", "Bongo Flava",
  "Genge", "Fuji", "Jùjú", "Kuduro", "Afro-soul", "Kwaito",
  "Azonto", "Benga", "Coupé-Décalé", "Naija", "Afro-fusion",
];

function GenreTicker() {
  const items = [...GENRES, ...GENRES];
  return (
    <div className="border-y border-white/[0.06] py-4 overflow-hidden bg-white/[0.01]">
      <div className="flex gap-10 whitespace-nowrap" style={{ animation: "ticker 40s linear infinite" }}>
        {items.map((g, i) => (
          <span key={i} className="text-white/25 text-xs font-bold uppercase tracking-[0.2em] flex-shrink-0">
            {g} <span className="text-[#007bff]/40 mx-3">·</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      `}</style>
    </div>
  );
}

/* ── Brand statement ──────────────────────────────────────────────────────── */
function BrandStatement() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-white/20 text-[11px] font-bold uppercase tracking-[0.3em] mb-8">Our Position</p>
        <h2 className="text-[clamp(2.5rem,7vw,6rem)] font-bold text-white leading-[1.05] tracking-tight mb-4">
          Selected Worldwide.
        </h2>
        <h2 className="text-[clamp(2.5rem,7vw,6rem)] font-bold text-[#007bff] leading-[1.05] tracking-tight mb-14">
          Curated from Africa.
        </h2>
        <div className="grid lg:grid-cols-3 gap-8 text-white/45 text-base leading-relaxed">
          <p>Orinlabí is a global distribution platform built specifically for African artists. Apply and our team personally reviews your music — every single submission.</p>
          <p>We distribute to 150+ platforms including Spotify, Apple Music, Boomplay, Audiomack, TikTok and more — with full royalty tracking and 100% ownership of your masters.</p>
          <p>No hidden fees. No complicated contracts. Just your music reaching the world while you keep everything you earn.</p>
        </div>
        <div className="mt-12 flex flex-col sm:flex-row items-start gap-4">
          <Link href="/submit" className="inline-flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-bold px-8 py-4 rounded-full text-base transition-all hover:shadow-[0_0_40px_rgba(0,123,255,0.35)]">
            Apply for Distribution <ArrowRight size={16} />
          </Link>
          <Link href="/about" className="inline-flex items-center gap-2 text-white/40 hover:text-white font-medium py-4 transition-colors text-base">
            Our Story →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Platform grid ────────────────────────────────────────────────────────── */
const PLATFORM_GRID = [
  { key: "spotify",       color: "#1DB954", label: "Spotify" },
  { key: "apple_music",   color: "#FC3C44", label: "Apple Music" },
  { key: "tiktok",        color: "#69C9D0", label: "TikTok" },
  { key: "amazon_music",  color: "#00A8E1", label: "Amazon Music" },
  { key: "youtube_music", color: "#FF0000", label: "YouTube Music" },
  { key: "tidal",         color: "#00FFFF", label: "TIDAL" },
  { key: "deezer",        color: "#A238FF", label: "Deezer" },
  { key: "boomplay",      color: "#FF6B35", label: "Boomplay" },
  { key: "audiomack",     color: "#FFA500", label: "Audiomack" },
  { key: "soundcloud",    color: "#FF5500", label: "SoundCloud" },
  { key: "instagram",     color: "#E1306C", label: "Instagram" },
  { key: "anghami",       color: "#9B59B6", label: "Anghami" },
];

function PlatformGrid() {
  return (
    <section className="py-20 px-6 border-t border-white/[0.05]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full" />
          <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">02 Where your music lands</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Every platform.<br />
          <span className="text-white/40">Every continent.</span>
        </h2>
        <p className="text-white/40 mb-12 max-w-lg">From Lagos to London, Nairobi to New York — your music lands everywhere fans are listening.</p>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
          {PLATFORM_GRID.map((p) => (
            <div
              key={p.key}
              className="flex flex-col items-center justify-center gap-3 py-7 px-4 bg-[#050505] hover:bg-white/[0.03] transition-colors group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{ background: `${p.color}18`, color: p.color }}
              >
                <PlatformIcon platformKey={p.key} size={22} />
              </div>
              <span className="text-white/30 group-hover:text-white/60 text-[11px] font-medium transition-colors text-center">{p.label}</span>
            </div>
          ))}
          <div className="col-span-3 sm:col-span-4 lg:col-span-6 flex items-center justify-center bg-[#050505] py-5 border-t border-white/[0.05]">
            <Link href="/submit" className="text-[#007bff] text-sm font-semibold hover:underline flex items-center gap-1.5">
              + 140 more stores worldwide <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Stats bar ────────────────────────────────────────────────────────────── */
function StatsBar() {
  const stats = [
    { value: "150+",     label: "Stores & Platforms",    sub: "All the biggest names globally" },
    { value: "100%",     label: "Royalty Payouts",        sub: "No deductions. Ever." },
    { value: "Africa",   label: "First",                  sub: "Built for African artists" },
    { value: "Curated",  label: "Application-based",      sub: "Every release personally reviewed" },
  ];
  return (
    <section className="py-20 px-6 border-y border-white/[0.05] bg-white/[0.01]">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.value}>
            <p className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-white leading-none">{s.value}</p>
            <p className="text-[#007bff] font-semibold text-sm mt-1">{s.label}</p>
            <p className="text-white/30 text-xs mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Monetize mockup ──────────────────────────────────────────────────────── */
function Monetize() {
  const rows = [
    { label: "Streaming royalties",   value: "$842",   pct: 85, color: "#007bff" },
    { label: "TikTok & Reels",        value: "$164",   pct: 55, color: "#69C9D0" },
    { label: "YouTube Content ID",    value: "$127",   pct: 40, color: "#FF0000" },
    { label: "Royalty splits",        value: "$74",    pct: 25, color: "#A238FF" },
    { label: "Presave conversions",   value: "$48",    pct: 18, color: "#FFA500" },
  ];
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full" />
            <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">03 Monetise</span>
          </div>
          <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold text-white leading-[1.05] tracking-tight mb-4">
            Every stream.<br />
            <span className="text-[#007bff]">Every royalty.</span>
          </h2>
          <p className="text-white/45 text-lg leading-relaxed mb-8 max-w-md">
            Streaming royalties are just the start. Earn from TikTok, YouTube Content ID, splits and more — routed straight to your account.
          </p>
          <div className="space-y-3">
            {[
              "100% of all streaming revenue",
              "YouTube Content ID earnings",
              "TikTok & Instagram Reels monetisation",
              "Auto royalty splits for collaborators",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-[#007bff] flex-shrink-0" />
                <span className="text-white/70 text-sm">{item}</span>
              </div>
            ))}
          </div>
          <Link href="/submit" className="inline-flex items-center gap-2 mt-8 bg-[#007bff] hover:bg-[#0069d9] text-white font-bold px-7 py-3.5 rounded-full text-sm transition-all hover:shadow-[0_0_30px_rgba(0,123,255,0.35)]">
            Start earning <ArrowRight size={15} />
          </Link>
        </div>

        {/* Right — earnings mockup */}
        <div className="bg-[#0c0c0f] border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/30 text-xs font-medium">LIVE</span>
            </div>
          </div>
          <p className="text-white/40 text-xs uppercase tracking-widest mb-5">Your earnings · this month</p>
          <div className="space-y-4 mb-6">
            {rows.map((r) => (
              <div key={r.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/60 text-xs">{r.label}</span>
                  <span className="text-white font-semibold text-xs">{r.value}</span>
                </div>
                <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.06] pt-5">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Paid this month</p>
            <p className="text-[#007bff] text-3xl font-bold">$1,255.00</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Features (tools) ─────────────────────────────────────────────────────── */
const FEATURE_ICONS = [
  <Globe size={22} key="globe" />,
  <ShieldCheck size={22} key="shield" />,
  <DollarSign size={22} key="dollar" />,
  <BarChart3 size={22} key="bar" />,
  <Zap size={22} key="zap" />,
  <Users size={22} key="users" />,
];

const FEATURE_COLORS = ["#007bff", "#34d399", "#f59e0b", "#a78bfa", "#f472b6", "#60a5fa"];

function Features({ items }: { items: FeatureCard[] }) {
  return (
    <section className="py-24 px-6 border-t border-white/[0.05] bg-white/[0.01]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full" />
          <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">04 Grow</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold text-white leading-[1.05] tracking-tight">
            Tools to help you<br />
            <span className="text-white/40">get heard.</span>
          </h2>
          <p className="text-white/40 max-w-xs text-sm leading-relaxed lg:mb-2">
            Releasing music is just the start. Orinlabí gives you the firepower to grow long after release day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((f, i) => {
            const color = FEATURE_COLORS[i % FEATURE_COLORS.length];
            return (
              <div
                key={i}
                className="group bg-[#050505] hover:bg-white/[0.03] border border-white/[0.06] hover:border-opacity-40 rounded-2xl p-7 transition-all duration-300"
                style={{ ["--hover-color" as string]: color }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300"
                  style={{ background: `${color}18`, color }}
                >
                  {FEATURE_ICONS[i % FEATURE_ICONS.length]}
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Why Orinlabí ─────────────────────────────────────────────────────────── */
const WHY_ICONS = [
  <Users size={18} key="u" />,
  <Zap size={18} key="z" />,
  <BarChart3 size={18} key="b" />,
  <ShieldCheck size={18} key="s" />,
];

function WhyOrinlabi({ items }: { items: WhyCard[] }) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full" />
            <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">05 Why us</span>
          </div>
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-bold text-white leading-[1.1] tracking-tight mb-6">
            The platform<br />African artists<br />
            <span className="text-[#007bff]">deserve.</span>
          </h2>
          <p className="text-white/45 leading-relaxed mb-8">
            Orinlabí was built for African creators. We don&apos;t believe distribution should cost you money. Apply, get selected, and release your music to the world — we handle everything else.
          </p>
          <Link href="/about" className="inline-flex items-center gap-2 text-[#007bff] font-semibold hover:gap-3 transition-all duration-200 text-sm">
            Our Story <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((r, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <div className="w-9 h-9 bg-[#007bff]/10 rounded-lg flex items-center justify-center text-[#007bff] mb-4">
                {WHY_ICONS[i % WHY_ICONS.length]}
              </div>
              <h4 className="text-white font-semibold mb-2 text-sm">{r.title}</h4>
              <p className="text-white/40 text-xs leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Artist Spotlight ─────────────────────────────────────────────────────── */
function ArtistSpotlight({ items }: { items: SpotlightArtist[] }) {
  return (
    <section className="py-24 px-6 border-t border-white/[0.05] bg-white/[0.01]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full" />
              <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">06 Hall of Fame</span>
            </div>
            <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold text-white leading-[1.05] tracking-tight">
              From Lagos to<br />
              <span className="text-white/40">Grammy stages.</span>
            </h2>
          </div>
          <Link href="/artists" className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium transition-colors">
            View all artists <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((a, i) => (
            <Link
              key={i}
              href={`/artists/${encodeURIComponent(a.name.trim())}`}
              className="group relative bg-white/[0.03] border border-white/[0.06] hover:border-[#007bff]/30 rounded-2xl overflow-hidden transition-all duration-300"
            >
              <div className="aspect-[3/4] relative bg-gradient-to-br from-[#007bff]/20 to-black overflow-hidden">
                {a.image_url ? (
                  <Image
                    src={a.image_url}
                    alt={a.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music size={36} className="text-[#007bff]/30" />
                  </div>
                )}
                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {/* live dot */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-2 py-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest">Live</span>
                </div>
                {/* streams badge */}
                {a.streams && (
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold text-sm leading-tight truncate">{a.name}</p>
                    <p className="text-[#007bff] text-xs font-semibold">{a.streams}</p>
                  </div>
                )}
              </div>
              {!a.streams && (
                <div className="p-4">
                  <p className="text-white font-semibold text-sm">{a.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{a.genre} · {a.country}</p>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ─────────────────────────────────────────────────────────── */
function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full" />
            <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">07 Trusted</span>
          </div>
          <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold text-white leading-[1.05] tracking-tight">
            Don&apos;t just take<br />
            <span className="text-[#007bff]">our word for it.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((t, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 flex flex-col">
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={14} className="fill-[#007bff] text-[#007bff]" />
                ))}
              </div>
              <p className="text-white/65 text-sm leading-relaxed flex-1 mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#007bff]/20 flex items-center justify-center text-[#007bff] text-xs font-bold flex-shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/30 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ──────────────────────────────────────────────────────────────────── */
function FAQ({ items }: { items: FaqItem[] }) {
  return (
    <section className="py-24 px-6 border-t border-white/[0.05] bg-white/[0.01]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full" />
            <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">08 FAQ</span>
          </div>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-white leading-[1.1] tracking-tight">
            Common questions.
          </h2>
        </div>
        <div className="space-y-3">
          {items.map((faq, i) => (
            <details key={i} className="group bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer text-white font-medium text-sm list-none hover:text-[#007bff] transition-colors">
                {faq.q}
                <span className="text-white/30 group-open:text-[#007bff] text-lg leading-none ml-4 transition-colors flex-shrink-0">
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">–</span>
                </span>
              </summary>
              <p className="px-5 pb-5 text-white/45 text-sm leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Final CTA ────────────────────────────────────────────────────────────── */
function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#007bff]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#007bff]/20 to-transparent" />
        <div className="absolute inset-0 bg-[#007bff]/[0.04] rounded-3xl blur-3xl" />
        <div className="relative py-16 sm:py-24">
          <p className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em] mb-6">Ready to release?</p>
          <h2 className="text-[clamp(3rem,8vw,6rem)] font-bold text-white leading-[0.95] tracking-tight mb-4">
            Start free in<br />
            <span className="text-[#007bff]">60 seconds.</span>
          </h2>
          <p className="text-white/40 text-lg max-w-md mx-auto mb-10">
            Join selected African artists distributing their music worldwide with Orinlabí.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/submit" className="inline-flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-bold px-10 py-4 rounded-full text-base transition-all hover:shadow-[0_0_50px_rgba(0,123,255,0.4)] hover:gap-3">
              Apply Now <ArrowRight size={16} />
            </Link>
            <Link href="/pricing" className="text-white/40 hover:text-white font-medium px-7 py-4 rounded-full border border-white/10 hover:border-white/30 transition-all duration-200">
              See how it works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default async function HomePage() {
  const [hero, testimonials, spotlight, features, why, faq] = await Promise.all([
    getSetting("hero", DEFAULT_HERO),
    getSetting("testimonials", DEFAULT_TESTIMONIALS),
    getSetting("spotlight", DEFAULT_SPOTLIGHT),
    getSetting("features", DEFAULT_FEATURES),
    getSetting("why", DEFAULT_WHY),
    getSetting("faq", DEFAULT_FAQ),
  ]);

  return (
    <>
      <Hero s={hero} />
      <GenreTicker />
      <BrandStatement />
      <PlatformGrid />
      <StatsBar />
      <Monetize />
      <Features items={features} />
      <WhyOrinlabi items={why} />
      <ArtistSpotlight items={spotlight} />
      <Testimonials items={testimonials} />
      <FAQ items={faq} />
      <CTA />
    </>
  );
}
