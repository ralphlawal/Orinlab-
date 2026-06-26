"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Music2, Clock, CheckCircle2, XCircle,
  ChevronRight, Loader2, ArrowRight, UserCircle2, PlusCircle,
  BarChart2, DollarSign, Radio, Megaphone, AlertTriangle, Info,
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

// ─── Status config ─────────────────────────────────────────────────────────────

const statusConfig = {
  pending:  { icon: Clock,        label: "Under Review", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", dot: "bg-yellow-400 animate-pulse" },
  approved: { icon: CheckCircle2, label: "Approved",     color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20",   dot: "bg-green-400" },
  rejected: { icon: XCircle,      label: "Not Selected", color: "text-red-400",    bg: "bg-red-400/10 border-red-400/20",        dot: "bg-red-400" },
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

// ─── Platform Chart ────────────────────────────────────────────────────────────

function PlatformChart({ releases }: { releases: Release[] }) {
  const totals: Record<string, number> = {};
  for (const r of releases.filter((r) => r.status === "approved")) {
    for (const [k, v] of Object.entries(r.streams ?? {})) {
      totals[k] = (totals[k] ?? 0) + v;
    }
  }
  const entries = Object.entries(totals)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);
  if (!entries.length) return null;
  const max = entries[0][1];

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Streams by Platform</p>
        <Link href="/portal/earnings" className="text-[#007bff] text-xs hover:underline">Full report →</Link>
      </div>
      <div className="space-y-3">
        {entries.map(([key, val]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-white/50 text-xs w-24 flex-shrink-0 truncate">{PLT_LABELS[key] ?? key}</span>
            <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(val / max) * 100}%`, background: PLT_COLORS[key] ?? "#007bff" }}
              />
            </div>
            <span className="text-white/60 text-xs w-10 text-right flex-shrink-0">{fmtN(val)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pitch Section ────────────────────────────────────────────────────────────

const PITCH_TYPE_LABELS: Record<string, string> = {
  PLAYLIST: "Playlist", RADIO: "Radio", BLOG: "Press", SYNC: "Sync", SOCIAL: "Social",
};

const PITCH_STATUS: Record<string, { color: string; bg: string; label: string }> = {
  pending:  { color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", label: "Under Review" },
  reviewed: { color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20",     label: "Reviewed" },
  accepted: { color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20",   label: "Accepted" },
  rejected: { color: "text-red-400",    bg: "bg-red-400/10 border-red-400/20",       label: "Not Selected" },
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
                <p className="text-white/30 text-[11px]">
                  {PITCH_TYPE_LABELS[typeKey] ?? "Pitch"} ·{" "}
                  {new Date(p.created_at).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
                </p>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Activity Section ─────────────────────────────────────────────────────────

const NOTIF_DOT: Record<string, string> = {
  success: "bg-green-400", info: "bg-[#007bff]", warning: "bg-amber-400", error: "bg-red-400",
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
        {notifications.map((n) => (
          <div key={n.id} className="flex items-start gap-3">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${NOTIF_DOT[n.type] ?? "bg-[#007bff]"} ${n.read ? "opacity-40" : ""}`} />
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium">{n.title}</p>
              <p className="text-white/40 text-[11px] mt-0.5 line-clamp-1">{n.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: "New Release",   href: "/portal/releases/new", icon: PlusCircle,  colorCls: "text-[#007bff]",  bgCls: "bg-[#007bff]/10" },
  { label: "Promote Music", href: "/portal/pitch",        icon: Megaphone,   colorCls: "text-purple-400", bgCls: "bg-purple-400/10" },
  { label: "My Earnings",   href: "/portal/earnings",     icon: DollarSign,  colorCls: "text-green-400",  bgCls: "bg-green-400/10" },
  { label: "Edit Profile",  href: "/portal/profile",      icon: UserCircle2, colorCls: "text-amber-400",  bgCls: "bg-amber-400/10" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PortalDashboard() {
  const [releases, setReleases]           = useState<Release[]>([]);
  const [pitches, setPitches]             = useState<Pitch[]>([]);
  const [recentNotifs, setRecentNotifs]   = useState<Notif[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading]             = useState(true);
  const [artistName, setArtistName]       = useState("");
  const [showProfileBanner, setShowProfileBanner] = useState(false);

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
          .select("spotify_artist_id,instagram_handle")
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

      const data = (releasesRes.data ?? []) as Release[];
      if (data.length > 0) {
        setArtistName((data[0] as unknown as { artist_name?: string }).artist_name ?? "");
      }

      const hasApproved = data.some((r) => r.status === "approved");
      const profileFilled = !!(profileRes.data?.spotify_artist_id || profileRes.data?.instagram_handle);
      setShowProfileBanner(hasApproved && !profileFilled);

      setReleases(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  const approved      = releases.filter((r) => r.status === "approved");
  const hasApproved   = approved.length > 0;
  const totalStreams   = approved.reduce((sum, r) => sum + Object.values(r.streams ?? {}).reduce((a, b) => a + b, 0), 0);
  const totalEarnings = releases.reduce((sum, r) => sum + (r.royalties_usd ?? 0), 0);
  const liveCount     = approved.filter((r) => r.store_links && Object.keys(r.store_links).length > 0).length;

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-white font-bold text-3xl">
            {artistName ? `Hey, ${artistName}.` : "Your Dashboard"}
          </h1>
          <p className="text-white/40 text-sm mt-2">
            {hasApproved
              ? `${approved.length} active release${approved.length !== 1 ? "s" : ""} · distributing globally`
              : "Track the status of your applications and approved distributions."}
          </p>
        </div>
        {hasApproved && (
          <Link
            href="/portal/releases/new"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            <PlusCircle size={16} /> New Release
          </Link>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {QUICK_ACTIONS.map(({ label, href, icon: Icon, colorCls, bgCls }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#007bff]/20 rounded-2xl p-4 transition-all text-center group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgCls} group-hover:scale-110 transition-transform duration-200`}>
              <Icon size={18} className={colorCls} />
            </div>
            <span className="text-white/60 text-xs font-medium group-hover:text-white/90 transition-colors">{label}</span>
          </Link>
        ))}
      </div>

      {/* Analytics strip */}
      {hasApproved && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
            <BarChart2 size={16} className="text-[#007bff] mx-auto mb-2" />
            <p className="text-white font-bold text-xl">{fmtN(totalStreams)}</p>
            <p className="text-white/40 text-xs mt-0.5">Total Streams</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
            <DollarSign size={16} className="text-green-400 mx-auto mb-2" />
            <p className="text-white font-bold text-xl">
              {totalEarnings > 0 ? `$${totalEarnings.toFixed(2)}` : "—"}
            </p>
            <p className="text-white/40 text-xs mt-0.5">Total Earnings</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
            <Radio size={16} className="text-green-400 mx-auto mb-2" />
            <p className="text-white font-bold text-xl">{liveCount}</p>
            <p className="text-white/40 text-xs mt-0.5">Live Releases</p>
          </div>
        </div>
      )}

      {/* Platform chart */}
      {hasApproved && totalStreams > 0 && (
        <div className="mb-6">
          <PlatformChart releases={releases} />
        </div>
      )}

      {/* Pitches + Activity — side by side on desktop */}
      {(pitches.length > 0 || recentNotifs.length > 0) && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PitchSection pitches={pitches} />
          <ActivitySection notifications={recentNotifs} />
        </div>
      )}

      {/* Profile completion banner */}
      {showProfileBanner && (
        <div className="mb-8 bg-[#007bff]/10 border border-[#007bff]/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <UserCircle2 size={20} className="text-[#007bff] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold text-sm">Complete your distribution profile</p>
              <p className="text-white/50 text-xs mt-1">
                Your release was approved! We need your platform IDs and social handles to finalise your distribution setup.
              </p>
            </div>
          </div>
          <Link
            href="/portal/profile"
            className="flex-shrink-0 bg-[#007bff] hover:bg-[#0069d9] text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-colors whitespace-nowrap"
          >
            Complete Profile →
          </Link>
        </div>
      )}

      {/* Onboarding checklist — only if no releases yet */}
      {releases.length === 0 && (
        <div className="mb-8 bg-[#007bff]/5 border border-[#007bff]/20 rounded-2xl p-6">
          <p className="text-white font-bold text-lg mb-1">Welcome to Orinlabí</p>
          <p className="text-white/50 text-sm mb-5">Here&apos;s how to get your music distributed in three steps.</p>
          <div className="space-y-3">
            {[
              { num: "1", title: "Complete your profile", body: "Add your photo, bio, and social links so fans can find you.", href: "/portal/profile", cta: "Edit Profile" },
              { num: "2", title: "Submit your first release", body: "Upload your track, cover art, and credits. We'll review it within 3–5 business days.", href: "/portal/releases/new", cta: "Submit Release" },
              { num: "3", title: "Get your smart link", body: "Once approved, share one link that works on Spotify, Apple Music, Boomplay, and everywhere else.", href: null, cta: null },
            ].map(({ num, title, body, href, cta }) => (
              <div key={num} className="flex items-start gap-4 bg-white/[0.03] rounded-xl px-4 py-4">
                <div className="w-7 h-7 rounded-full bg-[#007bff]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#007bff] text-xs font-bold">{num}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{body}</p>
                </div>
                {href && cta && (
                  <Link href={href} className="flex-shrink-0 text-xs font-semibold text-[#007bff] hover:text-white border border-[#007bff]/30 hover:border-[#007bff] px-3 py-1.5 rounded-lg transition-colors">
                    {cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform announcements */}
      {announcements.length > 0 && (
        <div className="mb-6 space-y-2">
          {announcements.map((a) => {
            const styles = {
              info:    { icon: <Info size={14} />,          border: "border-[#007bff]/25", bg: "bg-[#007bff]/[0.08]", text: "text-[#007bff]" },
              warning: { icon: <AlertTriangle size={14} />, border: "border-amber-500/25", bg: "bg-amber-500/[0.08]",  text: "text-amber-400" },
              success: { icon: <CheckCircle2 size={14} />,  border: "border-green-500/25", bg: "bg-green-500/[0.08]",  text: "text-green-400" },
            }[a.type] ?? { icon: <Megaphone size={14} />, border: "border-white/10", bg: "bg-white/[0.03]", text: "text-white/60" };
            return (
              <div key={a.id} className={`${styles.bg} border ${styles.border} rounded-2xl px-4 py-3 flex items-start gap-3`}>
                <span className={`${styles.text} flex-shrink-0 mt-0.5`}>{styles.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{a.title}</p>
                  <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{a.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Releases */}
      {releases.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-white/[0.04] rounded-full flex items-center justify-center mx-auto mb-5">
            <Music2 size={28} className="text-white/20" />
          </div>
          <p className="text-white/50 font-medium mb-2">No submissions yet</p>
          <p className="text-white/30 text-sm mb-8">
            Apply to distribute your music with Orinlabí.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm"
          >
            Submit Application <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Your Releases</p>
          {releases.map((r) => {
            const cfg = statusConfig[r.status] ?? statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <Link
                key={r.id}
                href={`/portal/releases/${r.id}`}
                className="group flex items-center gap-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#007bff]/20 rounded-2xl p-5 transition-all duration-200"
              >
                {/* Cover */}
                <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#007bff]/20 to-black flex items-center justify-center">
                  {r.cover_art_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.cover_art_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Music2 size={20} className="text-[#007bff]/40" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{r.song_title}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {r.release_type} · {r.genre}
                  </p>
                  <p className="text-white/25 text-xs mt-1">
                    Applied {new Date(r.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                {/* Status */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  <span className="hidden sm:block">{cfg.label}</span>
                  <Icon size={13} className="sm:hidden" />
                </div>

                <ChevronRight size={16} className="text-white/20 group-hover:text-white/40 flex-shrink-0 transition-colors" />
              </Link>
            );
          })}

          {/* Submit more CTA */}
          <div className="mt-8 pt-8 border-t border-white/[0.06] text-center">
            <p className="text-white/30 text-sm mb-4">Have more music to release?</p>
            {hasApproved ? (
              <Link
                href="/portal/releases/new"
                className="inline-flex items-center gap-2 border border-[#007bff]/30 hover:border-[#007bff]/60 text-[#007bff]/70 hover:text-[#007bff] font-medium px-6 py-3 rounded-full text-sm transition-all"
              >
                <PlusCircle size={15} /> Submit a New Release <ArrowRight size={15} />
              </Link>
            ) : (
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 border border-white/10 hover:border-[#007bff]/40 text-white/60 hover:text-white font-medium px-6 py-3 rounded-full text-sm transition-all"
              >
                Submit Another Application <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
