"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PlatformIcon } from "@/components/PlatformIcon";
import {
  Music2, Clock, CheckCircle2, XCircle,
  ChevronRight, Loader2, ArrowRight, UserCircle2, PlusCircle,
  BarChart2, DollarSign, Radio, Megaphone, AlertTriangle, Info,
  ImageIcon, AtSign, CreditCard, Mic2, X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Announcement = { id: string; title: string; body: string; type: "info" | "warning" | "success" };

type Release = {
  id: string;
  song_title: string;
  release_type: string;
  genre: string;
  release_date: string;
  status: "pending" | "approved" | "rejected";
  review_notes: string | null;
  cover_art_url: string | null;
  submitted_at: string;
  streams: Record<string, number> | null;
  royalties_usd: number | null;
  store_links: Record<string, string> | null;
};

type Pitch = {
  id: string;
  song_title: string;
  pitch_notes: string | null;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  created_at: string;
};

type Notif = {
  id: string;
  title: string;
  body: string;
  type: "success" | "info" | "warning" | "error";
  read: boolean;
  created_at: string;
};

type Profile = {
  artist_name: string | null;
  bio: string | null;
  artist_image_url: string | null;
  payout_method: string | null;
  instagram_handle: string | null;
  spotify_artist_id: string | null;
};

// ─── Status config ─────────────────────────────────────────────────────────────

const statusConfig = {
  pending:  { icon: Clock,        label: "Under Review", color: "text-amber-400",  bg: "bg-amber-400/10 border-amber-400/20",   dot: "bg-amber-400 animate-pulse",  accent: "#F59E0B" },
  approved: { icon: CheckCircle2, label: "Approved",     color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", dot: "bg-emerald-400",              accent: "#10B981" },
  rejected: { icon: XCircle,      label: "Not Selected", color: "text-rose-400",   bg: "bg-rose-400/10 border-rose-400/20",      dot: "bg-rose-400",                 accent: "#F43F5E" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtN(n: number) {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K`
    : n.toString();
}

const PLT_COLORS: Record<string, string> = {
  spotify: "#1DB954", apple_music: "#FA2D48", youtube: "#FF0000",
  youtube_music: "#FF0000", boomplay: "#FF6900", audiomack: "#FFA500",
  deezer: "#A238FF", tidal: "#00E0FF", amazon_music: "#00A8E0",
  soundcloud: "#FF5500", anghami: "#7B45E5",
};

const PLT_LABELS: Record<string, string> = {
  spotify: "Spotify", apple_music: "Apple Music", youtube: "YouTube",
  youtube_music: "YT Music", boomplay: "Boomplay", audiomack: "Audiomack",
  deezer: "Deezer", tidal: "Tidal", amazon_music: "Amazon",
  soundcloud: "SoundCloud", anghami: "Anghami",
};

// ─── Animated counter hook ────────────────────────────────────────────────────

function useCounter(target: number, duration = 1400, delay = 0) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!target || started.current) return;
    const timeout = setTimeout(() => {
      started.current = true;
      let startTs: number | null = null;
      const tick = (ts: number) => {
        if (!startTs) startTs = ts;
        const progress = Math.min((ts - startTs) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return value;
}

// ─── Platform Chart ────────────────────────────────────────────────────────────

function PlatformChart({ releases }: { releases: Release[] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 300); return () => clearTimeout(t); }, []);

  const totals: Record<string, number> = {};
  for (const r of releases.filter((r) => r.status === "approved")) {
    for (const [k, v] of Object.entries(r.streams ?? {})) {
      totals[k] = (totals[k] ?? 0) + v;
    }
  }
  const entries = Object.entries(totals).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a).slice(0, 7);
  if (!entries.length) return null;
  const max = entries[0][1];

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Streams by Platform</p>
        <Link href="/portal/earnings" className="text-[#007bff] text-xs hover:underline">Full report →</Link>
      </div>
      <div className="space-y-3">
        {entries.map(([key, val], i) => {
          const color = PLT_COLORS[key] ?? "#007bff";
          const label = PLT_LABELS[key] ?? key;
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}22`, color }}>
                <PlatformIcon platformKey={key} size={14} />
              </div>
              <span className="text-white/50 text-xs w-20 flex-shrink-0 truncate">{label}</span>
              <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: ready ? `${(val / max) * 100}%` : "0%",
                    background: `linear-gradient(90deg, ${color}cc, ${color})`,
                    transition: `width ${700 + i * 80}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                    boxShadow: ready ? `0 0 8px ${color}55` : "none",
                  }}
                />
              </div>
              <span className="text-white/60 text-xs w-10 text-right flex-shrink-0 font-medium tabular-nums">{fmtN(val)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, gradient, label, target, prefix = "", suffix = "", decimals = 0, delay = 0 }: {
  icon: React.ElementType; gradient: string; label: string; target: number;
  prefix?: string; suffix?: string; decimals?: number; delay?: number;
}) {
  const count = useCounter(target, 1400, delay);
  const display = decimals > 0
    ? `${prefix}${count.toFixed(decimals)}${suffix}`
    : target === 0 ? "—" : `${prefix}${fmtN(count)}${suffix}`;
  return (
    <div className="relative overflow-hidden bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center card-hover">
      <div className="absolute inset-0 opacity-[0.04]" style={{ background: gradient }} />
      <div className="relative z-10">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: gradient + "22" }}>
          <Icon size={15} style={{ color: "white" }} />
        </div>
        <p className="text-white font-bold text-xl tabular-nums">{display}</p>
        <p className="text-white/40 text-xs mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Pitch Section ────────────────────────────────────────────────────────────

const PITCH_TYPE_LABELS: Record<string, string> = {
  PLAYLIST: "Playlist", RADIO: "Radio", BLOG: "Press", SYNC: "Sync", SOCIAL: "Social",
};
const PITCH_STATUS: Record<string, { color: string; bg: string; label: string }> = {
  pending:  { color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/20",   label: "Under Review" },
  reviewed: { color: "text-blue-400",    bg: "bg-blue-400/10 border-blue-400/20",     label: "Reviewed" },
  accepted: { color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", label: "Accepted" },
  rejected: { color: "text-rose-400",    bg: "bg-rose-400/10 border-rose-400/20",     label: "Not Selected" },
};

function PitchSection({ pitches }: { pitches: Pitch[] }) {
  if (!pitches.length) return null;
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Promotion Pitches</p>
        <Link href="/portal/pitch" className="text-[#007bff] text-xs hover:underline">Submit New →</Link>
      </div>
      <div className="space-y-2">
        {pitches.slice(0, 3).map((p) => {
          const typeKey = p.pitch_notes?.match(/^\[([A-Z]+)\]/)?.[1] ?? "";
          const cfg = PITCH_STATUS[p.status] ?? PITCH_STATUS.pending;
          return (
            <div key={p.id} className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{p.song_title}</p>
                <p className="text-white/30 text-[11px]">{PITCH_TYPE_LABELS[typeKey] ?? "Pitch"} · {new Date(p.created_at).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}</p>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Activity Section ─────────────────────────────────────────────────────────

const NOTIF_COLORS: Record<string, string> = {
  success: "#10B981", info: "#007bff", warning: "#F59E0B", error: "#F43F5E",
};

function ActivitySection({ notifications }: { notifications: Notif[] }) {
  if (!notifications.length) return null;
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Recent Activity</p>
        <Link href="/portal/notifications" className="text-[#007bff] text-xs hover:underline">View All →</Link>
      </div>
      <div className="space-y-3">
        {notifications.map((n) => {
          const dotColor = NOTIF_COLORS[n.type] ?? "#007bff";
          return (
            <div key={n.id} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: dotColor, opacity: n.read ? 0.3 : 1, boxShadow: n.read ? "none" : `0 0 6px ${dotColor}88` }} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium">{n.title}</p>
                <p className="text-white/40 text-[11px] mt-0.5 line-clamp-1">{n.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Smart Reminder ───────────────────────────────────────────────────────────

type Reminder = {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  gradient: string;
};

function ReminderBanner({ reminder, onDismiss }: { reminder: Reminder; onDismiss: (id: string) => void }) {
  const Icon = reminder.icon;
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 border animate-slide-up"
      style={{ borderColor: reminder.iconColor + "30", background: reminder.iconColor + "0d" }}
    >
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ background: reminder.gradient }} />
      <div className="flex items-start gap-3 pl-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: reminder.iconColor + "20" }}>
          <Icon size={15} style={{ color: reminder.iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">{reminder.title}</p>
          <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{reminder.body}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <Link
            href={reminder.href}
            className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
            style={{ background: reminder.iconColor + "25", color: reminder.iconColor }}
          >
            {reminder.cta}
          </Link>
          <button
            onClick={() => onDismiss(reminder.id)}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10 transition-all"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile completion ring ──────────────────────────────────────────────────

function ProfileRing({ pct }: { pct: number }) {
  const R = 18;
  const circ = 2 * Math.PI * R;
  const dash = circ - (pct / 100) * circ;
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
        <defs>
          <linearGradient id="pRing" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#007bff" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <circle cx="22" cy="22" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <circle cx="22" cy="22" r={R} fill="none" stroke="url(#pRing)" strokeWidth="4"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">{pct}%</span>
    </div>
  );
}

// ─── Quick actions ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: "New Release",   href: "/portal/releases/new", icon: PlusCircle,  gradient: "linear-gradient(135deg, #007bff, #0040ff)" },
  { label: "Promote Music", href: "/portal/pitch",        icon: Megaphone,   gradient: "linear-gradient(135deg, #8B5CF6, #EC4899)" },
  { label: "My Earnings",   href: "/portal/earnings",     icon: DollarSign,  gradient: "linear-gradient(135deg, #10B981, #059669)" },
  { label: "Edit Profile",  href: "/portal/profile",      icon: UserCircle2, gradient: "linear-gradient(135deg, #F59E0B, #EF4444)" },
];

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className={`transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"} ${className}`}>
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const DISMISSED_KEY = "orinlabi_dismissed_reminders";

function getDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]"); } catch { return []; }
}

export default function PortalDashboard() {
  const [releases, setReleases]         = useState<Release[]>([]);
  const [pitches, setPitches]           = useState<Pitch[]>([]);
  const [recentNotifs, setRecentNotifs] = useState<Notif[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading]           = useState(true);
  const [profile, setProfile]           = useState<Profile | null>(null);
  const [dismissed, setDismissed]       = useState<string[]>([]);

  useEffect(() => { setDismissed(getDismissed()); }, []);

  function dismissReminder(id: string) {
    const next = [...dismissed, id];
    setDismissed(next);
    try { localStorage.setItem(DISMISSED_KEY, JSON.stringify(next)); } catch {}
  }

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [releasesRes, profileRes, announcementsRes, pitchesRes, notifsRes] = await Promise.all([
        supabase
          .from("releases")
          .select("id,song_title,release_type,genre,release_date,status,review_notes,cover_art_url,submitted_at,artist_name,streams,royalties_usd,store_links")
          .eq("email", session.user.email!)
          .order("submitted_at", { ascending: false }),
        supabase
          .from("artist_profiles")
          .select("artist_name,bio,artist_image_url,payout_method,instagram_handle,spotify_artist_id")
          .eq("email", session.user.email!)
          .maybeSingle(),
        supabase
          .from("announcements")
          .select("id,title,body,type")
          .eq("active", true)
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("playlist_pitches")
          .select("id,song_title,pitch_notes,status,created_at")
          .eq("email", session.user.email!)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("notifications")
          .select("id,title,body,type,read,created_at")
          .eq("email", session.user.email!)
          .order("created_at", { ascending: false })
          .limit(4),
      ]);

      setAnnouncements((announcementsRes.data ?? []) as Announcement[]);
      setPitches((pitchesRes.data ?? []) as Pitch[]);
      setRecentNotifs((notifsRes.data ?? []) as Notif[]);
      setProfile((profileRes.data ?? null) as Profile | null);
      setReleases((releasesRes.data ?? []) as Release[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-[#007bff]/20" />
          <Loader2 size={28} className="text-[#007bff] animate-spin absolute inset-0 m-auto" />
        </div>
        <p className="text-white/20 text-xs">Loading your dashboard…</p>
      </div>
    );
  }

  // ── Derived data ───────────────────────────────────────────────────────────

  const approved      = releases.filter((r) => r.status === "approved");
  const pending       = releases.filter((r) => r.status === "pending");
  const hasApproved   = approved.length > 0;
  const totalStreams   = approved.reduce((sum, r) => sum + Object.values(r.streams ?? {}).reduce((a, b) => a + b, 0), 0);
  const totalEarnings = releases.reduce((sum, r) => sum + (r.royalties_usd ?? 0), 0);
  const liveCount     = approved.filter((r) => r.store_links && Object.keys(r.store_links).length > 0).length;

  const artistName = profile?.artist_name
    ?? (releases[0] as unknown as { artist_name?: string })?.artist_name
    ?? "";

  // ── Profile completion ─────────────────────────────────────────────────────

  const profileFields = profile
    ? [!!profile.artist_name, !!profile.bio, !!profile.artist_image_url, !!profile.payout_method, !!profile.instagram_handle, !!profile.spotify_artist_id]
    : [];
  const profilePct = profileFields.length
    ? Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100)
    : 0;

  // ── Smart reminders ─────────────────────────────────────────────────────────

  const allReminders: Reminder[] = [];

  if (profile && !profile.artist_image_url) {
    allReminders.push({
      id: "no_photo",
      icon: ImageIcon,
      iconColor: "#F59E0B",
      title: "Add your artist photo",
      body: "Artists with a profile photo get 3× more visibility on Orinlabí.",
      href: "/portal/profile",
      cta: "Upload Photo",
      gradient: "linear-gradient(180deg, #F59E0B, #EF4444)",
    });
  }
  if (profile && !profile.bio) {
    allReminders.push({
      id: "no_bio",
      icon: Mic2,
      iconColor: "#8B5CF6",
      title: "Write your artist bio",
      body: "Tell your story — your bio appears on your smart link page and press kit.",
      href: "/portal/profile",
      cta: "Add Bio",
      gradient: "linear-gradient(180deg, #8B5CF6, #EC4899)",
    });
  }
  if (profile && !profile.instagram_handle) {
    allReminders.push({
      id: "no_social",
      icon: AtSign,
      iconColor: "#EC4899",
      title: "Connect your socials",
      body: "Linking Instagram and TikTok helps fans discover your music through our promotions.",
      href: "/portal/profile",
      cta: "Connect",
      gradient: "linear-gradient(180deg, #EC4899, #F59E0B)",
    });
  }
  if (hasApproved && profile && !profile.payout_method) {
    allReminders.push({
      id: "no_payout",
      icon: CreditCard,
      iconColor: "#10B981",
      title: "Set up your payout method",
      body: "You have approved releases but no payout method — you won't be able to receive royalties until this is done.",
      href: "/portal/profile",
      cta: "Set Up Payouts",
      gradient: "linear-gradient(180deg, #10B981, #007bff)",
    });
  }
  if (pending.length > 0) {
    allReminders.push({
      id: `pending_${pending.length}`,
      icon: Clock,
      iconColor: "#007bff",
      title: `${pending.length} release${pending.length !== 1 ? "s" : ""} under review`,
      body: "Our team is reviewing your submission. You'll get a notification when it's approved.",
      href: `/portal/releases/${pending[0].id}`,
      cta: "View Status",
      gradient: "linear-gradient(180deg, #007bff, #8B5CF6)",
    });
  }

  const visibleReminders = allReminders.filter((r) => !dismissed.includes(r.id));

  return (
    <section className="max-w-3xl mx-auto px-4 py-10">

      {/* ── Hero banner ─────────────────────────────────────────────────────── */}
      <FadeIn delay={0} className="mb-6">
        <div
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
          style={{ background: "linear-gradient(135deg, #080818 0%, #110d2a 40%, #0a1828 100%)" }}
        >
          {/* Animated blobs */}
          <div
            className="absolute -top-20 -right-20 w-72 h-72 opacity-20 animate-blob pointer-events-none"
            style={{ background: "radial-gradient(circle, #8B5CF6, #007bff)", borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
          />
          <div
            className="absolute -bottom-16 -left-10 w-52 h-52 opacity-10 animate-blob pointer-events-none"
            style={{ background: "radial-gradient(circle, #EC4899, #8B5CF6)", borderRadius: "40% 60% 70% 30% / 50% 40% 60% 50%", animationDelay: "4s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-[0.04] animate-spin-slow pointer-events-none"
            style={{ background: "conic-gradient(from 0deg, #007bff, #8B5CF6, #EC4899, #10B981, #007bff)" }}
          />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {artistName && (
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Welcome back</p>
              )}
              <h1 className="font-bold text-3xl sm:text-4xl leading-tight mb-2">
                {artistName
                  ? <span className="gradient-text">{artistName}</span>
                  : <span className="text-white">Your Dashboard</span>}
              </h1>
              <p className="text-white/40 text-sm">
                {hasApproved
                  ? `${approved.length} active release${approved.length !== 1 ? "s" : ""} · distributing globally`
                  : "Track your music, earnings, and reach — all in one place."}
              </p>
            </div>

            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              {profileFields.length > 0 && (
                <div className="flex items-center gap-2">
                  <ProfileRing pct={profilePct} />
                </div>
              )}
              {hasApproved && (
                <Link
                  href="/portal/releases/new"
                  className="inline-flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-full text-sm transition-all animate-glow"
                  style={{ background: "linear-gradient(135deg, #007bff, #8B5CF6)" }}
                >
                  <PlusCircle size={14} /> New Release
                </Link>
              )}
            </div>
          </div>

          {/* Stats strip inside hero */}
          {hasApproved && (
            <div className="relative z-10 mt-6 grid grid-cols-3 gap-3">
              {[
                { label: "Streams", value: fmtN(totalStreams), color: "#60a5fa" },
                { label: "Royalties", value: totalEarnings > 0 ? `$${totalEarnings.toFixed(2)}` : "—", color: "#34d399" },
                { label: "Live", value: String(liveCount), color: "#c084fc" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/[0.06] backdrop-blur-sm rounded-xl px-3 py-2.5 text-center border border-white/[0.06]">
                  <p className="text-white font-bold text-lg tabular-nums" style={{ color }}>{value}</p>
                  <p className="text-white/30 text-[11px]">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </FadeIn>

      {/* ── Smart Reminders ─────────────────────────────────────────────────── */}
      {visibleReminders.length > 0 && (
        <FadeIn delay={80} className="mb-6 space-y-3">
          {visibleReminders.slice(0, 3).map((r) => (
            <ReminderBanner key={r.id} reminder={r} onDismiss={dismissReminder} />
          ))}
        </FadeIn>
      )}

      {/* ── Quick Actions ────────────────────────────────────────────────────── */}
      <FadeIn delay={160} className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ label, href, icon: Icon, gradient }, i) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col items-center gap-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-2xl p-4 transition-all duration-200 text-center card-hover"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                style={{ background: gradient + "33" }}
              >
                <Icon size={19} style={{ background: gradient, backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }} />
              </div>
              <span className="text-white/60 text-xs font-medium group-hover:text-white/90 transition-colors">{label}</span>
            </Link>
          ))}
        </div>
      </FadeIn>

      {/* ── Platform chart ───────────────────────────────────────────────────── */}
      {hasApproved && totalStreams > 0 && (
        <FadeIn delay={240} className="mb-6">
          <PlatformChart releases={releases} />
        </FadeIn>
      )}

      {/* ── Pitches + Activity ───────────────────────────────────────────────── */}
      {(pitches.length > 0 || recentNotifs.length > 0) && (
        <FadeIn delay={320} className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PitchSection pitches={pitches} />
            <ActivitySection notifications={recentNotifs} />
          </div>
        </FadeIn>
      )}

      {/* ── Announcements ────────────────────────────────────────────────────── */}
      {announcements.length > 0 && (
        <FadeIn delay={400} className="mb-6">
          <div className="space-y-2">
            {announcements.map((a) => {
              const styles = {
                info:    { icon: <Info size={14} />,          border: "#007bff", bg: "#007bff0d", text: "#60a5fa" },
                warning: { icon: <AlertTriangle size={14} />, border: "#F59E0B", bg: "#F59E0B0d", text: "#fbbf24" },
                success: { icon: <CheckCircle2 size={14} />,  border: "#10B981", bg: "#10B9810d", text: "#34d399" },
              }[a.type] ?? { icon: <Megaphone size={14} />, border: "#ffffff20", bg: "#ffffff05", text: "#ffffff60" };
              return (
                <div key={a.id} className="rounded-2xl px-4 py-3 flex items-start gap-3 border"
                  style={{ background: styles.bg, borderColor: styles.border + "40" }}>
                  <span className="flex-shrink-0 mt-0.5" style={{ color: styles.text }}>{styles.icon}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">{a.title}</p>
                    <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{a.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </FadeIn>
      )}

      {/* ── Releases ─────────────────────────────────────────────────────────── */}
      {releases.length === 0 ? (
        <FadeIn delay={300}>
          {/* Onboarding checklist */}
          <div className="mb-8">
            <div
              className="relative overflow-hidden rounded-2xl p-6 border"
              style={{ background: "linear-gradient(135deg, #0a0820, #080f20)", borderColor: "#007bff20" }}
            >
              <p className="text-white font-bold text-lg mb-1">Welcome to Orinlabí</p>
              <p className="text-white/50 text-sm mb-6">Get your music to every streaming platform in 3 steps.</p>
              <div className="space-y-3">
                {[
                  { num: "1", color: "#007bff", title: "Complete your profile", body: "Add your photo, bio, and social links so fans can find you.", href: "/portal/profile", cta: "Edit Profile" },
                  { num: "2", color: "#8B5CF6", title: "Submit your first release", body: "Upload your track and cover art. We review within 3–5 business days.", href: "/portal/releases/new", cta: "Submit Release" },
                  { num: "3", color: "#10B981", title: "Get your smart link", body: "One link for Spotify, Apple Music, Boomplay, and everywhere else.", href: null, cta: null },
                ].map(({ num, color, title, body, href, cta }) => (
                  <div key={num} className="flex items-start gap-4 bg-white/[0.03] rounded-xl px-4 py-4">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: color + "25" }}>
                      <span className="text-xs font-bold" style={{ color }}>{num}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{title}</p>
                      <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{body}</p>
                    </div>
                    {href && cta && (
                      <Link href={href} className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all border"
                        style={{ background: color + "18", color, borderColor: color + "40" }}>
                        {cta}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 animate-glow" style={{ background: "linear-gradient(135deg, #007bff20, #8B5CF620)" }}>
              <Music2 size={28} className="text-[#007bff]/60" />
            </div>
            <p className="text-white/50 font-medium mb-2">No submissions yet</p>
            <p className="text-white/30 text-sm mb-8">Apply to distribute your music with Orinlabí.</p>
            <Link href="/submit" className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-full text-sm animate-glow"
              style={{ background: "linear-gradient(135deg, #007bff, #8B5CF6)" }}>
              Submit Application <ArrowRight size={16} />
            </Link>
          </div>
        </FadeIn>
      ) : (
        <div className="space-y-3">
          <FadeIn delay={480}>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Your Releases</p>
          </FadeIn>
          {releases.map((r, i) => {
            const cfg = statusConfig[r.status] ?? statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <FadeIn key={r.id} delay={500 + i * 50}>
                <Link
                  href={`/portal/releases/${r.id}`}
                  className="group relative flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] rounded-2xl p-4 transition-all duration-200 overflow-hidden card-hover"
                >
                  {/* Left accent by status */}
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl" style={{ background: cfg.accent }} />

                  <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden ml-2" style={{ background: `linear-gradient(135deg, ${cfg.accent}20, #000)` }}>
                    {r.cover_art_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.cover_art_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 size={20} style={{ color: cfg.accent + "60" }} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{r.song_title}</p>
                    <p className="text-white/40 text-xs mt-0.5">{r.release_type} · {r.genre}</p>
                    <p className="text-white/20 text-xs mt-1">
                      Applied {new Date(r.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    <span className="hidden sm:block">{cfg.label}</span>
                    <Icon size={13} className="sm:hidden" />
                  </div>
                  <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 flex-shrink-0 transition-colors" />
                </Link>
              </FadeIn>
            );
          })}

          <FadeIn delay={550 + releases.length * 50}>
            <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
              <p className="text-white/25 text-sm mb-4">Have more music to release?</p>
              {hasApproved ? (
                <Link href="/portal/releases/new"
                  className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-full text-sm transition-all"
                  style={{ background: "linear-gradient(135deg, #007bff22, #8B5CF622)", border: "1px solid #007bff30" }}>
                  <PlusCircle size={15} /> Submit a New Release <ArrowRight size={15} />
                </Link>
              ) : (
                <Link href="/submit"
                  className="inline-flex items-center gap-2 border border-white/10 hover:border-[#007bff]/40 text-white/60 hover:text-white font-medium px-6 py-3 rounded-full text-sm transition-all">
                  Submit Another Application <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </FadeIn>
        </div>
      )}
    </section>
  );
}
