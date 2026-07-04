import { unstable_cache } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, ChevronDown, Star, CheckCircle2,
  Zap, Globe, ShieldCheck, BarChart3, Users, Music,
} from "lucide-react";
import { PlatformIcon } from "@/components/PlatformIcon";
import { PlatformIconCell } from "@/components/PlatformIconCell";
import { AnimateIn } from "@/components/AnimateIn";
import { CountUp } from "@/components/CountUp";
import { StreamsChart } from "@/components/StreamsChart";
import { supabase } from "@/lib/supabase";
import {
  getSetting,
  DEFAULT_HERO, DEFAULT_TESTIMONIALS,
  DEFAULT_FEATURES, DEFAULT_WHY, DEFAULT_FAQ,
  type HeroSettings, type Testimonial,
  type FeatureCard, type WhyCard, type FaqItem,
} from "@/lib/siteSettings";

type RealArtist = {
  artist_name: string;
  genre: string | null;
  country: string | null;
  song_title: string | null;
  cover_art_url: string | null;
  profile_image_url: string | null;
};

const getRealSpotlightArtists = unstable_cache(
  async (): Promise<RealArtist[]> => {
    try {
      const { data } = await supabase
        .from("releases")
        .select("artist_name,genre,country,song_title,cover_art_url,email")
        .eq("status", "approved")
        .order("submitted_at", { ascending: false });

      if (!data || data.length === 0) return [];

      const seen = new Set<string>();
      const unique = data.filter((r) => {
        const key = r.artist_name.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const emails = unique.map((a) => a.email).filter(Boolean);
      let photoMap: Record<string, string | null> = {};
      if (emails.length) {
        const { data: profiles } = await supabase
          .from("artist_profiles")
          .select("email,artist_image_url")
          .in("email", emails);
        if (profiles) {
          for (const p of profiles) photoMap[p.email] = p.artist_image_url ?? null;
        }
      }

      return unique.slice(0, 4).map((a) => ({
        artist_name: a.artist_name,
        genre: a.genre ?? null,
        country: a.country ?? null,
        song_title: a.song_title ?? null,
        cover_art_url: a.cover_art_url ?? null,
        profile_image_url: photoMap[a.email] ?? null,
      }));
    } catch {
      return [];
    }
  },
  ["spotlight-artists"],
  { revalidate: 300, tags: ["releases"] }
);

/* ── Floating DSP icons ───────────────────────────────────────────────────── */
const HERO_PLATFORMS = [
  { key: "spotify",       color: "#1DB954", size: 52, top: "9%",  left: "56%" },
  { key: "apple_music",   color: "#FC3C44", size: 44, top: "22%", left: "79%" },
  { key: "tiktok",        color: "#69C9D0", size: 40, top: "40%", left: "89%" },
  { key: "boomplay",      color: "#FF6B35", size: 36, top: "60%", left: "81%" },
  { key: "audiomack",     color: "#FFA500", size: 34, top: "75%", left: "62%" },
  { key: "deezer",        color: "#A238FF", size: 32, top: "56%", left: "49%" },
  { key: "amazon_music",  color: "#00A8E1", size: 38, top: "29%", left: "64%" },
  { key: "tidal",         color: "#00FFFF", size: 30, top: "14%", left: "89%" },
  { key: "soundcloud",    color: "#FF5500", size: 28, top: "85%", left: "74%" },
  { key: "youtube_music", color: "#FF0000", size: 36, top: "47%", left: "71%" },
  { key: "instagram",     color: "#E1306C", size: 26, top: "90%", left: "52%" },
  { key: "anghami",       color: "#9B59B6", size: 30, top: "6%",  left: "71%" },
];

/* ── Hero ─────────────────────────────────────────────────────────────────── */
function Hero({ s }: { s: HeroSettings }) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#050505]">
      {/* Ambient background — kept small for GPU performance */}
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[#007bff]/12 rounded-full blur-[70px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[320px] h-[320px] bg-violet-600/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating platform icons */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        {HERO_PLATFORMS.map((p, i) => (
          <div
            key={p.key}
            className="absolute flex items-center justify-center rounded-2xl"
            style={{
              top: p.top, left: p.left,
              width: p.size + 28, height: p.size + 28,
              background: `${p.color}16`,
              border: `1px solid ${p.color}30`,
              willChange: "transform",
              animation: i % 2 === 0 ? `platformFloat ${3.5 + (i % 3) * 0.8}s ease-in-out infinite` : undefined,
              animationDelay: i % 2 === 0 ? `${i * 0.4}s` : undefined,
            }}
          >
            <span style={{ color: p.color }}>
              <PlatformIcon platformKey={p.key} size={p.size} />
            </span>
          </div>
        ))}
      </div>

      {/* Hero content */}
      <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16 py-24 lg:max-w-[58%]">
        <div
          className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.1] text-white/60 text-[11px] font-semibold px-4 py-2 rounded-full mb-10"
          style={{ animation: "fadeSlideUp 0.6s ease-out both" }}
        >
          <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
          {s.badge || "Global Music Distribution · 150+ Platforms"}
        </div>

        <h1
          className="font-bold leading-[0.93] tracking-tight mb-8"
          style={{ animation: "fadeSlideUp 0.7s ease-out 0.1s both" }}
        >
          <span className="block text-[clamp(3.5rem,11vw,8.5rem)] text-white">Release</span>
          <span
            className="block text-[clamp(3.5rem,11vw,8.5rem)] text-transparent bg-clip-text"
            style={{
              backgroundImage: "linear-gradient(90deg, #007bff, #7c3aed, #ec4899, #007bff)",
              backgroundSize: "300% auto",
              animation: "shimmer 5s linear infinite",
            }}
          >
            unlimited
          </span>
          <span className="block text-[clamp(3.5rem,11vw,8.5rem)] text-white">music.</span>
        </h1>

        <p
          className="text-white/45 text-lg sm:text-xl max-w-lg mb-10 leading-relaxed"
          style={{ animation: "fadeSlideUp 0.7s ease-out 0.2s both" }}
        >
          {s.subheadline || "Upload to every platform. Keep 100% of your royalties. Your first release is completely free — no credit card required."}
        </p>

        <div
          className="flex flex-col sm:flex-row items-start gap-3 mb-16"
          style={{ animation: "fadeSlideUp 0.7s ease-out 0.3s both" }}
        >
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-full text-base transition-all duration-200 hover:gap-3 group"
            style={{
              background: "linear-gradient(135deg, #007bff, #6d28d9)",
              boxShadow: "0 0 30px rgba(0,123,255,0.35), 0 0 60px rgba(109,40,217,0.15)",
            }}
          >
            Start Free <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white font-medium px-7 py-4 rounded-full border border-white/10 hover:border-white/30 text-base transition-all duration-200"
          >
            How It Works
          </Link>
        </div>

        {/* Stats */}
        <div
          className="flex items-center gap-10 flex-wrap"
          style={{ animation: "fadeSlideUp 0.7s ease-out 0.4s both" }}
        >
          {[
            { value: "∞",    label: "Releases" },
            { value: "150+", label: "Platforms" },
            { value: "100%", label: "Royalties" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-white/25 text-xs uppercase tracking-widest mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20">
        <ChevronDown size={22} />
      </div>

      <style>{`
        @keyframes platformFloat {
          0%, 100% { transform: translateY(0px) }
          50%       { transform: translateY(-14px) }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @keyframes shimmer {
          0%   { background-position: 0% center }
          100% { background-position: 300% center }
        }
      `}</style>
    </section>
  );
}

/* ── Platform ticker ──────────────────────────────────────────────────────── */
const TICKER_PLATFORMS = [
  "Spotify", "Apple Music", "YouTube Music", "TikTok", "Amazon Music",
  "Deezer", "TIDAL", "Audiomack", "SoundCloud", "Boomplay",
  "Pandora", "Anghami", "Beatport", "Instagram", "Shazam",
];

function PlatformTicker() {
  const items = [...TICKER_PLATFORMS, ...TICKER_PLATFORMS];
  return (
    <div className="border-y border-white/[0.06] py-4 overflow-hidden bg-white/[0.01]">
      <div className="flex gap-12 whitespace-nowrap" style={{ animation: "ticker 35s linear infinite" }}>
        {items.map((name, i) => (
          <span key={i} className="text-white/20 text-xs font-bold uppercase tracking-[0.18em] flex-shrink-0">
            {name} <span className="text-[#007bff]/30 mx-2">·</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}

/* ── Distribute ───────────────────────────────────────────────────────────── */
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

function Distribute() {
  return (
    <section className="py-24 px-6 border-t border-white/[0.05]">
      <div className="max-w-6xl mx-auto">
        <AnimateIn>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
            <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">01  Distribute</span>
          </div>
        </AnimateIn>
        <AnimateIn delay={80}>
          <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold text-white leading-[1.05] tracking-tight mb-3">
            Global Music<br /><span className="text-white/35">Distribution.</span>
          </h2>
        </AnimateIn>
        <AnimateIn delay={140}>
          <p className="text-white/40 mb-12 max-w-lg text-base leading-relaxed">
            Drop your music on every platform. Spotify, Apple, TikTok, Amazon, YouTube — everywhere. Zero gatekeepers, every penny yours. Your first release is on us.
          </p>
        </AnimateIn>

        {/* FREE FIRST RELEASE badge */}
        <AnimateIn delay={180}>
          <div className="inline-flex items-center gap-3 mb-8 bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/25 rounded-2xl px-5 py-3">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-bold">First release completely FREE</span>
            <span className="text-white/30 text-xs">· 15% fee on subsequent releases only</span>
          </div>
        </AnimateIn>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-px bg-white/[0.05] rounded-2xl overflow-hidden border border-white/[0.05]">
          {PLATFORM_GRID.map((p, i) => (
            <AnimateIn key={p.key} delay={i * 40} direction="fade">
              <div className="flex flex-col items-center justify-center gap-3 py-7 px-3 bg-[#050505] hover:bg-white/[0.04] transition-all duration-300 group h-full">
                <PlatformIconCell platformKey={p.key} color={p.color} size={22} />
                <span className="text-white/25 group-hover:text-white/60 text-[10px] font-medium transition-colors text-center leading-tight">{p.label}</span>
              </div>
            </AnimateIn>
          ))}
          <div className="col-span-3 sm:col-span-4 lg:col-span-6 flex items-center justify-center bg-[#050505] py-4 border-t border-white/[0.05]">
            <Link href="/submit" className="text-[#007bff] text-xs font-semibold hover:underline flex items-center gap-1.5">
              + 140 more stores <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <AnimateIn delay={100}>
            <Link href="/submit" className="inline-flex items-center gap-2 text-white font-bold px-7 py-3.5 rounded-full text-sm transition-all hover:gap-3 group"
              style={{ background: "linear-gradient(135deg, #007bff, #6d28d9)", boxShadow: "0 0 20px rgba(0,123,255,0.3)" }}>
              Start Releasing Free <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}

/* ── Stats (with CountUp) ─────────────────────────────────────────────────── */
function Stats() {
  const items = [
    { to: 150,  suffix: "+", label: "Stores & Platforms",  sub: "All the big names plus hidden gems you haven't discovered yet." },
    { to: 100,  suffix: "%", label: "Royalty Payouts",      sub: "No deductions on your first release. Flat 85% on everything after." },
    { to: 0,    suffix: "",  label: "Cost to Start",        sub: "Your first distribution is completely free. No credit card needed.", prefix: "$" },
    { to: 48,   suffix: "h", label: "Average Go-Live Time", sub: "Most releases are live on all platforms within two business days." },
  ];
  return (
    <section className="py-20 px-6 border-y border-white/[0.05] relative overflow-hidden">
      {/* Color pop */}
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-violet-600/8 rounded-full blur-[60px] pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 relative z-10">
        {items.map((s, i) => (
          <AnimateIn key={s.label} delay={i * 80}>
            <p className="text-[clamp(2.2rem,5vw,3.5rem)] font-bold text-white leading-none">
              <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} duration={2000} />
            </p>
            <p className="text-[#007bff] font-semibold text-sm mt-1.5 mb-1">{s.label}</p>
            <p className="text-white/25 text-xs leading-relaxed">{s.sub}</p>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}

/* ── Streaming Growth Chart ───────────────────────────────────────────────── */
function LiveGrowth() {
  return (
    <section className="py-24 px-6 border-b border-white/[0.05] relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute top-1/2 right-0 w-[280px] h-[280px] bg-[#007bff]/8 rounded-full blur-[60px] pointer-events-none -translate-y-1/2" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div>
            <AnimateIn>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-[11px] font-bold uppercase tracking-[0.25em]">Live Growth</span>
              </div>
            </AnimateIn>
            <AnimateIn delay={80}>
              <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold text-white leading-[1.05] tracking-tight">
                Streams that grow<br />
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(90deg, #1DB954, #00b4d8, #007bff)", backgroundSize: "200% auto", animation: "shimmer 4s linear infinite" }}
                >
                  every day.
                </span>
              </h2>
            </AnimateIn>
            <AnimateIn delay={160}>
              <p className="text-white/40 text-sm mt-4 max-w-sm leading-relaxed">
                Illustrative streaming trajectory based on our artist roster over 12 months.
              </p>
            </AnimateIn>
          </div>
          <AnimateIn direction="right" delay={120}>
            <div className="flex items-center gap-6 flex-wrap">
              {[
                { label: "Spotify",     color: "#1DB954" },
                { label: "TikTok",      color: "#69C9D0" },
                { label: "Apple Music", color: "#FC3C44" },
              ].map(p => (
                <div key={p.label} className="flex items-center gap-2">
                  <span className="w-8 h-[2px] rounded-full" style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
                  <span className="text-white/40 text-xs">{p.label}</span>
                </div>
              ))}
            </div>
          </AnimateIn>
        </div>

        <AnimateIn direction="fade" delay={200}>
          <div
            className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.025), rgba(255,255,255,0.01))", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="relative z-10">
              <StreamsChart />
            </div>
          </div>
        </AnimateIn>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { value: "24K", label: "Avg streams / month", sub: "across all platforms in year 1", color: "#1DB954" },
            { value: "+127%", label: "Avg growth rate",      sub: "month-over-month across our roster", color: "#69C9D0" },
            { value: "$2.1M", label: "Paid to artists",      sub: "in royalties since launch", color: "#FC3C44" },
          ].map((s, i) => (
            <AnimateIn key={s.label} delay={i * 70}>
              <div className="bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 rounded-xl p-5 hover:-translate-y-0.5">
                <p
                  className="text-[clamp(1.6rem,4vw,2.2rem)] font-bold leading-none mb-1"
                  style={{ color: s.color, textShadow: `0 0 20px ${s.color}50` }}
                >
                  {s.value}
                </p>
                <p className="text-white/60 text-sm font-semibold mb-0.5">{s.label}</p>
                <p className="text-white/25 text-xs">{s.sub}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Monetize ─────────────────────────────────────────────────────────────── */
const EARNINGS_ROWS = [
  { label: "Streaming royalties",  value: "$842",  pct: 88, color: "#007bff" },
  { label: "TikTok & Reels",       value: "$164",  pct: 54, color: "#69C9D0" },
  { label: "YouTube Content ID",   value: "$127",  pct: 40, color: "#FF0000" },
  { label: "Publishing · PRS…",    value: "$74",   pct: 26, color: "#A238FF" },
  { label: "Mechanical splits",    value: "$48",   pct: 18, color: "#FFA500" },
];

function Monetize() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Color pop */}
      <div className="absolute top-1/3 right-1/4 w-[260px] h-[260px] bg-violet-600/8 rounded-full blur-[55px] pointer-events-none" />

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <div>
          <AnimateIn>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
              <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">02  Monetise</span>
            </div>
          </AnimateIn>
          <AnimateIn delay={80}>
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold text-white leading-[1.05] tracking-tight mb-4">
              Every stream.<br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(90deg, #007bff, #a855f7)", backgroundSize: "200% auto", animation: "shimmer 5s linear infinite" }}
              >
                Every royalty.
              </span>
            </h2>
          </AnimateIn>
          <AnimateIn delay={140}>
            <p className="text-white/40 text-base leading-relaxed mb-8 max-w-md">
              Streaming royalties are just the start. Earn from publishing, sync, YouTube, mechanical, splits — routed straight to your account.
            </p>
          </AnimateIn>
          <div className="space-y-3 mb-8">
            {["100% of all streaming revenue (first release)", "YouTube Content ID earnings", "TikTok & Instagram Reels monetisation", "Auto royalty splits for collaborators", "Publishing · PRS, GEMA, ASCAP"].map((item, i) => (
              <AnimateIn key={item} delay={200 + i * 60}>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={15} className="text-[#007bff] flex-shrink-0" />
                  <span className="text-white/60 text-sm">{item}</span>
                </div>
              </AnimateIn>
            ))}
          </div>
          <AnimateIn delay={520}>
            <Link href="/submit" className="inline-flex items-center gap-2 text-white font-bold px-7 py-3.5 rounded-full text-sm transition-all hover:gap-3 group"
              style={{ background: "linear-gradient(135deg, #007bff, #7c3aed)", boxShadow: "0 0 25px rgba(0,123,255,0.3)" }}>
              See What You&apos;re Missing <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </AnimateIn>
        </div>

        <AnimateIn direction="right" delay={100}>
          <div className="bg-[#0c0c10] border border-white/[0.08] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#007bff]/5 via-violet-500/3 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest">Live</span>
                </div>
              </div>
              <p className="text-white/25 text-[11px] uppercase tracking-widest mb-5">Your earnings · this month</p>
              <div className="space-y-4 mb-6">
                {EARNINGS_ROWS.map((r, i) => (
                  <div key={r.label} style={{ animation: `fadeSlideUp 0.5s ease-out ${300 + i * 80}ms both` }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white/50 text-xs">{r.label}</span>
                      <span className="text-white font-semibold text-xs">{r.value}</span>
                    </div>
                    <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color, animation: "barFill 1.4s ease-out both", animationDelay: `${600 + i * 100}ms` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/[0.06] pt-5">
                <p className="text-white/20 text-[11px] uppercase tracking-widest mb-1">Paid this month</p>
                <p className="text-3xl font-bold text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #007bff, #a855f7)" }}>
                  $1,255.00
                </p>
              </div>
            </div>
          </div>
        </AnimateIn>
      </div>

      <style>{`
        @keyframes barFill { from { width: 0 } }
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:none } }
      `}</style>
    </section>
  );
}

/* ── Grow / Features ──────────────────────────────────────────────────────── */
const FEATURE_META = [
  { icon: <BarChart3 size={22} />, color: "#007bff"  },
  { icon: <Zap size={22} />,       color: "#f59e0b"  },
  { icon: <Music size={22} />,     color: "#1DB954"  },
  { icon: <Globe size={22} />,     color: "#a78bfa"  },
  { icon: <Users size={22} />,     color: "#f472b6"  },
  { icon: <ShieldCheck size={22} />, color: "#34d399" },
];

function Grow({ items }: { items: FeatureCard[] }) {
  return (
    <section className="py-24 px-6 border-t border-white/[0.05] bg-white/[0.01] relative overflow-hidden">
      {/* Color pop */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-500/8 rounded-full blur-[70px] pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        <AnimateIn>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
            <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">03  Grow</span>
          </div>
        </AnimateIn>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <AnimateIn delay={80}>
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold text-white leading-[1.05] tracking-tight">
              Tools to help you<br /><span className="text-white/35">get heard.</span>
            </h2>
          </AnimateIn>
          <AnimateIn delay={140} direction="right">
            <p className="text-white/35 max-w-xs text-sm leading-relaxed lg:mb-1.5">
              Releasing music is just the start. Get the data, firepower and edge you need to grow long after release day.
            </p>
          </AnimateIn>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((f, i) => {
            const { icon, color } = FEATURE_META[i % FEATURE_META.length];
            return (
              <AnimateIn key={i} delay={i * 60}>
                <div
                  className="group bg-[#050505] hover:bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 transition-all duration-300 hover:border-white/[0.12] hover:-translate-y-1 h-full relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at top left, ${color}08, transparent 60%)` }} />
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 relative z-10"
                    style={{ background: `${color}18`, color }}
                  >
                    {icon}
                  </div>
                  <h3 className="text-white font-semibold text-base mb-2 relative z-10">{f.title}</h3>
                  <p className="text-white/35 text-sm leading-relaxed relative z-10">{f.desc}</p>
                </div>
              </AnimateIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Why ──────────────────────────────────────────────────────────────────── */
const WHY_ICONS = [
  <Users size={18} key="u" />, <Zap size={18} key="z" />,
  <BarChart3 size={18} key="b" />, <ShieldCheck size={18} key="s" />,
];

function Why({ items }: { items: WhyCard[] }) {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <AnimateIn>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
              <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">04  Why us</span>
            </div>
          </AnimateIn>
          <AnimateIn delay={80}>
            <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-bold text-white leading-[1.1] tracking-tight mb-6">
              The platform<br />independent artists<br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(90deg, #007bff, #f472b6)", backgroundSize: "200% auto", animation: "shimmer 5s linear infinite" }}
              >
                deserve.
              </span>
            </h2>
          </AnimateIn>
          <AnimateIn delay={140}>
            <p className="text-white/40 leading-relaxed mb-8 text-base">
              Distribution should be earned, not just purchased. Every application is personally reviewed by our team — no algorithms, no shortcuts. We work only with artists we genuinely believe in, and for those we do, we go all the way.
            </p>
          </AnimateIn>
          <AnimateIn delay={200}>
            <Link href="/about" className="inline-flex items-center gap-2 text-[#007bff] font-semibold hover:gap-3 transition-all duration-200 text-sm">
              Our Story <ArrowRight size={15} />
            </Link>
          </AnimateIn>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((r, i) => (
            <AnimateIn key={i} delay={i * 80} direction={i % 2 === 0 ? "left" : "right"}>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-[#007bff]/25 transition-all duration-300 h-full group relative overflow-hidden">
                <div className="absolute inset-0 bg-[#007bff]/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="w-9 h-9 bg-[#007bff]/10 rounded-lg flex items-center justify-center text-[#007bff] mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10">
                  {WHY_ICONS[i % WHY_ICONS.length]}
                </div>
                <h4 className="text-white font-semibold mb-2 text-sm relative z-10">{r.title}</h4>
                <p className="text-white/35 text-xs leading-relaxed relative z-10">{r.desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Artist Spotlight ─────────────────────────────────────────────────────── */
function ArtistSpotlight({ artists }: { artists: RealArtist[] }) {
  return (
    <section className="py-24 px-6 border-t border-white/[0.05] bg-white/[0.01] relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[350px] h-[180px] bg-[#007bff]/8 rounded-full blur-[60px] pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-14">
          <div>
            <AnimateIn>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
                <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">05  Our Artists</span>
              </div>
            </AnimateIn>
            <AnimateIn delay={80}>
              <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold text-white leading-[1.05] tracking-tight">
                From your bedroom<br /><span className="text-white/35">to the world.</span>
              </h2>
            </AnimateIn>
          </div>
          <AnimateIn direction="right">
            <Link href="/artists" className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium transition-colors">
              View all artists <ArrowRight size={14} />
            </Link>
          </AnimateIn>
        </div>

        {artists.length === 0 ? (
          /* Empty state — roster not yet public */
          <AnimateIn direction="fade" delay={100}>
            <div className="border border-white/[0.07] rounded-2xl p-12 sm:p-16 text-center bg-white/[0.02]">
              <div className="w-16 h-16 rounded-2xl bg-[#007bff]/10 border border-[#007bff]/20 flex items-center justify-center mx-auto mb-6">
                <Music size={28} className="text-[#007bff]/60" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Roster launching soon</h3>
              <p className="text-white/35 text-sm max-w-xs mx-auto mb-8 leading-relaxed">
                We&apos;re reviewing our first wave of applications. Apply now and be among the founding artists on OrinlabÍ Records.
              </p>
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-all hover:gap-3 group"
                style={{ background: "linear-gradient(135deg, #007bff, #6d28d9)", boxShadow: "0 0 20px rgba(0,123,255,0.3)" }}
              >
                Apply Now <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </AnimateIn>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {artists.map((a, i) => {
              const img = a.profile_image_url ?? a.cover_art_url;
              return (
                <AnimateIn key={a.artist_name} delay={i * 70}>
                  <Link
                    href={`/artists/${encodeURIComponent(a.artist_name.trim())}`}
                    className="group relative bg-white/[0.03] border border-white/[0.06] hover:border-[#007bff]/35 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 block"
                  >
                    <div className="aspect-[3/4] relative bg-gradient-to-br from-[#007bff]/20 to-black overflow-hidden">
                      {img ? (
                        <Image src={img} alt={a.artist_name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music size={36} className="text-[#007bff]/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      <div className="absolute inset-0 bg-[#007bff]/0 group-hover:bg-[#007bff]/8 transition-colors duration-300" />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-2 py-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest">Live</span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white font-bold text-sm leading-tight truncate">{a.artist_name}</p>
                        {a.genre && <p className="text-[#007bff]/80 text-xs">{a.genre}</p>}
                      </div>
                    </div>
                  </Link>
                </AnimateIn>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Testimonials ─────────────────────────────────────────────────────────── */
function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-pink-500/8 rounded-full blur-[60px] pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <AnimateIn>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
              <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">06  Trusted</span>
            </div>
          </AnimateIn>
          <AnimateIn delay={80}>
            <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold text-white leading-[1.05] tracking-tight">
              Don&apos;t just take<br /><span className="text-[#007bff]">our word for it.</span>
            </h2>
          </AnimateIn>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((t, i) => (
            <AnimateIn key={i} delay={i * 80}>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 flex flex-col hover:border-white/[0.1] transition-all duration-300 hover:-translate-y-1 h-full group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#007bff]/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="flex gap-0.5 mb-5 relative z-10">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} className="fill-[#007bff] text-[#007bff]" />
                  ))}
                </div>
                <p className="text-white/60 text-sm leading-relaxed flex-1 mb-6 relative z-10">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#007bff] to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-white/30 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            </AnimateIn>
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
          <AnimateIn>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
              <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">07  FAQ</span>
            </div>
          </AnimateIn>
          <AnimateIn delay={80}>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-white leading-[1.1] tracking-tight">Common questions.</h2>
          </AnimateIn>
        </div>
        <div className="space-y-3">
          {items.map((faq, i) => (
            <AnimateIn key={i} delay={i * 50}>
              <details className="group bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] rounded-xl overflow-hidden transition-colors duration-200">
                <summary className="flex items-center justify-between p-5 cursor-pointer text-white font-medium text-sm list-none hover:text-[#007bff] transition-colors">
                  {faq.q}
                  <span className="text-white/30 group-open:text-[#007bff] text-xl leading-none ml-4 transition-colors flex-shrink-0">
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:inline">–</span>
                  </span>
                </summary>
                <p className="px-5 pb-5 text-white/45 text-sm leading-relaxed">{faq.a}</p>
              </details>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Final CTA ────────────────────────────────────────────────────────────── */
function CTA() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[200px] bg-[#007bff]/10 rounded-full blur-[70px]" />
      </div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <AnimateIn className="py-16 sm:py-24">
          <p className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em] mb-5">Ready to release?</p>
          <h2 className="text-[clamp(3rem,8vw,6rem)] font-bold text-white leading-[0.95] tracking-tight mb-4">
            Start free in<br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(90deg, #007bff, #7c3aed, #ec4899, #007bff)", backgroundSize: "300% auto", animation: "shimmer 5s linear infinite" }}
            >
              60 seconds.
            </span>
          </h2>
          <p className="text-white/35 text-base max-w-sm mx-auto mb-3">
            First release is completely free. No credit card required.
          </p>
          <p className="text-white/20 text-xs mb-10">From second release onwards: 85% to you, 15% to us.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/submit"
              className="inline-flex items-center gap-2 text-white font-bold px-10 py-4 rounded-full text-base transition-all hover:gap-3 group"
              style={{ background: "linear-gradient(135deg, #007bff, #7c3aed)", boxShadow: "0 0 40px rgba(0,123,255,0.4), 0 0 80px rgba(124,58,237,0.2)" }}>
              Sign Up Free <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/pricing" className="text-white/40 hover:text-white font-medium px-7 py-4 rounded-full border border-white/10 hover:border-white/30 transition-all duration-200 text-sm">
              See how it works
            </Link>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default async function HomePage() {
  const [hero, testimonials, features, why, faq, spotlightArtists] = await Promise.all([
    getSetting("hero", DEFAULT_HERO),
    getSetting("testimonials", DEFAULT_TESTIMONIALS),
    getSetting("features", DEFAULT_FEATURES),
    getSetting("why", DEFAULT_WHY),
    getSetting("faq", DEFAULT_FAQ),
    getRealSpotlightArtists(),
  ]);

  return (
    <>
      <Hero s={hero} />
      <PlatformTicker />
      <Distribute />
      <Stats />
      <LiveGrowth />
      <Monetize />
      <Grow items={features} />
      <Why items={why} />
      <ArtistSpotlight artists={spotlightArtists} />
      <Testimonials items={testimonials} />
      <FAQ items={faq} />
      <CTA />
    </>
  );
}
