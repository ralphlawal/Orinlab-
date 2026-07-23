"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import {
  ArrowLeft, Music2, CheckCircle2, Clock, XCircle, Globe,
  DollarSign, BarChart3, Loader2, ExternalLink, ShieldCheck, ShieldOff,
  MessageSquare, Bell, Send, Zap, AlertTriangle, User2, Calendar,
  Radio, CreditCard, FileText, Link2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Release = {
  id: string;
  song_title: string;
  release_type: string;
  genre: string;
  status: "pending" | "approved" | "rejected" | "revision_requested";
  submitted_at: string;
  release_date: string | null;
  cover_art_url: string | null;
  streams: Record<string, number> | null;
  royalties_usd: number | null;
  distribution_stage: string | null;
  isrc: string | null;
};

type Profile = {
  email: string;
  artist_name: string | null;
  bio: string | null;
  country: string | null;
  artist_image_url: string | null;
  instagram_handle: string | null;
  x_handle: string | null;
  tiktok_username: string | null;
  youtube_channel: string | null;
  facebook_url: string | null;
  website_url: string | null;
  spotify_artist_id: string | null;
  apple_music_artist_id: string | null;
  audiomack_id: string | null;
  boomplay_id: string | null;
  deezer_id: string | null;
  soundcloud_id: string | null;
  record_label: string | null;
  payout_method: string | null;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_country: string | null;
  paypal_email: string | null;
  mobile_money_provider: string | null;
  mobile_money_number: string | null;
  account_status: "active" | "suspended" | "inactive" | "takedown" | null;
  plan: string | null;
  plan_status: string | null;
  created_at: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtN(n: number) {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K`
    : String(n);
}

function fmtUsd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

const STATUS_CFG = {
  pending:            { Icon: Clock,          label: "Pending",        color: "#F59E0B" },
  approved:           { Icon: CheckCircle2,   label: "Approved",       color: "#10B981" },
  rejected:           { Icon: XCircle,        label: "Not Selected",   color: "#F43F5E" },
  revision_requested: { Icon: AlertTriangle,  label: "Action Required",color: "#F59E0B" },
};

const ACCOUNT_CFG = {
  active:    { label: "Active",    color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", Icon: ShieldCheck },
  inactive:  { label: "Inactive",  color: "text-yellow-400",  bg: "bg-yellow-400/10 border-yellow-400/20",  Icon: Clock       },
  suspended: { label: "Suspended", color: "text-rose-400",    bg: "bg-rose-400/10 border-rose-400/20",      Icon: ShieldOff   },
  takedown:  { label: "Takedown",  color: "text-rose-600",    bg: "bg-rose-600/10 border-rose-600/20",      Icon: ShieldOff   },
};

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function ArtistProfilePage() {
  const { requestUnlock } = usePinGate();
  const params = useParams<{ email: string }>();
  const router = useRouter();

  const artistEmail = decodeURIComponent(params.email);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading]   = useState(true);

  // Notify panel
  const [showNotify, setShowNotify]   = useState(false);
  const [notifTitle, setNotifTitle]   = useState("");
  const [notifBody, setNotifBody]     = useState("");
  const [notifType, setNotifType]     = useState<"info" | "success" | "warning" | "error">("info");
  const [sending, setSending]         = useState(false);
  const [sent, setSent]               = useState(false);

  // Account status
  const [changingStatus, setChangingStatus] = useState(false);

  // Notes
  const [notes, setNotes]     = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved]   = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: prof }, { data: rels }] = await Promise.all([
        supabase.from("artist_profiles").select("*").eq("email", artistEmail).maybeSingle(),
        supabase.from("releases")
          .select("id, song_title, release_type, genre, status, submitted_at, release_date, cover_art_url, streams, royalties_usd, distribution_stage, isrc")
          .eq("email", artistEmail)
          .order("submitted_at", { ascending: false }),
      ]);
      setProfile(prof as Profile | null);
      setReleases((rels ?? []) as Release[]);
      setLoading(false);
    }
    load();
  }, [artistEmail]);

  async function sendNotification() {
    if (!profile || !notifTitle.trim() || !notifBody.trim()) return;
    setSending(true);
    await supabase.from("notifications").insert({
      email: artistEmail, type: notifType, title: notifTitle.trim(), body: notifBody.trim(), link: "/portal",
    });
    await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "artist-reminder",
        data: {
          email:       artistEmail,
          artist_name: profile.artist_name ?? artistEmail,
          reminder_type: "profile",
        },
      }),
    }).catch(() => {});
    setSending(false); setSent(true);
    setTimeout(() => { setSent(false); setShowNotify(false); setNotifTitle(""); setNotifBody(""); }, 3000);
  }

  async function changeStatus(status: string) {
    if (!profile) return;
    setChangingStatus(true);
    await supabase.from("artist_profiles").update({ account_status: status }).eq("email", artistEmail);
    const notifMap: Record<string, { title: string; body: string; type: "info" | "warning" | "error" }> = {
      suspended: { title: "Account suspended",  body: "Your account has been suspended. Contact info@orinlabi.com if you believe this is a mistake.", type: "error" },
      inactive:  { title: "Account inactive",   body: "Your account has been marked inactive. Contact us for more information.", type: "warning" },
      takedown:  { title: "Releases under review", body: "Your releases have been flagged for review. Contact info@orinlabi.com for details.", type: "error" },
      active:    { title: "Account reactivated", body: "Your account is now active again. Welcome back!", type: "info" },
    };
    const notif = notifMap[status];
    if (notif) {
      await supabase.from("notifications").insert({ email: artistEmail, ...notif, link: "/portal" });
    }
    setProfile((p) => p ? { ...p, account_status: status as Profile["account_status"] } : p);
    setChangingStatus(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  if (!profile && releases.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/admin/artists" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={14} /> Artists
        </Link>
        <div className="text-center py-20 text-white/30">
          <User2 size={36} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">No artist profile found for {artistEmail}.</p>
        </div>
      </div>
    );
  }

  const acctCfg = ACCOUNT_CFG[profile?.account_status ?? "active"] ?? ACCOUNT_CFG.active;
  const totalStreams   = releases.reduce((s, r) => s + Object.values(r.streams ?? {}).reduce((a, b) => a + b, 0), 0);
  const totalRoyalties = releases.reduce((s, r) => s + (r.royalties_usd ?? 0), 0);
  const approvedCount  = releases.filter((r) => r.status === "approved").length;
  const pendingCount   = releases.filter((r) => r.status === "pending" || r.status === "revision_requested").length;
  const liveCount      = releases.filter((r) => r.distribution_stage === "live").length;

  const platforms: { label: string; id: string | null; href: (id: string) => string; color: string }[] = [
    { label: "Spotify",      id: profile?.spotify_artist_id ?? null,       href: (id) => `https://open.spotify.com/artist/${id}`,         color: "#1DB954" },
    { label: "Apple Music",  id: profile?.apple_music_artist_id ?? null,   href: (id) => `https://music.apple.com/artist/${id}`,          color: "#FC3C44" },
    { label: "Audiomack",    id: profile?.audiomack_id ?? null,             href: (id) => `https://audiomack.com/${id}`,                   color: "#F5A623" },
    { label: "Boomplay",     id: profile?.boomplay_id ?? null,              href: (id) => `https://www.boomplay.com/artists/${id}`,        color: "#FF6B35" },
    { label: "Deezer",       id: profile?.deezer_id ?? null,                href: (id) => `https://www.deezer.com/artist/${id}`,           color: "#A238FF" },
    { label: "SoundCloud",   id: profile?.soundcloud_id ?? null,            href: (id) => `https://soundcloud.com/${id}`,                  color: "#FF5500" },
  ];

  const socials = [
    { Icon: Link2, label: "Instagram",  href: profile?.instagram_handle ? `https://instagram.com/${profile.instagram_handle.replace("@", "")}` : null },
    { Icon: Link2, label: "X / Twitter", href: profile?.x_handle ? `https://x.com/${profile.x_handle.replace("@", "")}` : null },
    { Icon: Link2, label: "YouTube",    href: profile?.youtube_channel ?? null },
    { Icon: Link2, label: "Facebook",   href: profile?.facebook_url ?? null },
    { Icon: Globe, label: "Website",    href: profile?.website_url ?? null },
  ].filter((s) => s.href);

  const hasPayoutDetails = Boolean(profile?.payout_method);
  const initials = (profile?.artist_name ?? artistEmail).split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/admin/artists" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
        <ArrowLeft size={14} /> Artists Roster
      </Link>

      {/* ── Hero card ─────────────────────────────────────────────── */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Banner gradient */}
        <div className="h-24 bg-gradient-to-r from-[#007bff]/20 via-purple-600/10 to-transparent" />

        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end gap-5 flex-wrap">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-[#080808] flex-shrink-0">
              {profile?.artist_image_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={profile.artist_image_url} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-[#007bff] to-purple-600 flex items-center justify-center text-white font-bold text-xl">{initials}</div>}
            </div>

            <div className="flex-1 min-w-0 mb-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-white font-bold text-2xl leading-tight">
                  {profile?.artist_name ?? artistEmail}
                </h1>
                {/* Account status badge */}
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest ${acctCfg.bg} ${acctCfg.color}`}>
                  <acctCfg.Icon size={10} />
                  {acctCfg.label}
                </span>
                {profile?.plan_status === "active" && profile.plan && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#007bff]/30 bg-[#007bff]/10 text-[#007bff] uppercase tracking-widest">
                    <Zap size={9} /> {profile.plan}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {profile?.country && <span className="text-white/40 text-xs flex items-center gap-1"><Globe size={11} />{profile.country}</span>}
                {profile?.record_label && <span className="text-white/40 text-xs">{profile.record_label}</span>}
                <span className="text-white/25 text-xs">{artistEmail}</span>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => setShowNotify(!showNotify)}
                className="flex items-center gap-2 text-xs font-semibold border border-white/[0.1] text-white/50 hover:text-white hover:border-white/30 px-3 py-2 rounded-xl transition-colors"
              >
                <Bell size={13} /> Notify
              </button>
              <Link
                href={`/admin/releases?search=${encodeURIComponent(artistEmail)}`}
                className="flex items-center gap-2 text-xs font-semibold bg-[#007bff] hover:bg-[#0066dd] text-white px-3 py-2 rounded-xl transition-colors"
              >
                <Music2 size={13} /> Releases
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Notify panel ──────────────────────────────────────────── */}
      {showNotify && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-white font-semibold text-sm flex items-center gap-2"><Bell size={15} className="text-[#007bff]" /> Send Notification</p>
            <button onClick={() => setShowNotify(false)} className="text-white/30 hover:text-white text-xs transition-colors">✕</button>
          </div>

          <div className="flex gap-1.5">
            {(["info", "success", "warning", "error"] as const).map((t) => {
              const colors = { info: "#007bff", success: "#10B981", warning: "#F59E0B", error: "#F43F5E" };
              return (
                <button key={t} onClick={() => setNotifType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${notifType === t ? "text-white" : "border-white/10 text-white/30 hover:text-white"}`}
                  style={notifType === t ? { background: colors[t] + "22", borderColor: colors[t] + "44", color: colors[t] } : {}}>
                  {t}
                </button>
              );
            })}
          </div>
          <input className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-3 py-2.5 rounded-xl transition-colors"
            value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} placeholder="Notification title…" />
          <textarea className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-3 py-2.5 rounded-xl transition-colors resize-none"
            rows={3} value={notifBody} onChange={(e) => setNotifBody(e.target.value)} placeholder="Message body…" />

          {sent ? (
            <p className="text-emerald-400 text-xs flex items-center gap-1.5"><CheckCircle2 size={13} /> Sent — artist notified in-app.</p>
          ) : (
            <button onClick={() => requestUnlock(sendNotification)} disabled={sending || !notifTitle.trim() || !notifBody.trim()}
              className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0066dd] disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {sending ? "Sending…" : "Send Notification"}
            </button>
          )}
        </div>
      )}

      {/* ── Stats row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Releases",   value: String(releases.length),  icon: Music2,     color: "#60a5fa" },
          { label: "Approved",   value: String(approvedCount),    icon: CheckCircle2, color: "#10B981" },
          { label: "Live",       value: String(liveCount),        icon: Zap,         color: "#10B981" },
          { label: "Streams",    value: fmtN(totalStreams),       icon: BarChart3,   color: "#a78bfa" },
          { label: "Royalties",  value: fmtUsd(totalRoyalties),  icon: DollarSign,  color: "#34d399" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
            <Icon size={16} style={{ color }} className="mx-auto mb-2 opacity-70" />
            <p className="text-white font-bold text-lg tabular-nums">{value}</p>
            <p className="text-white/35 text-[10px] mt-0.5 uppercase tracking-widest">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ─────────────────────────────────── */}
        <div className="space-y-5">
          {/* Bio */}
          {profile?.bio && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <p className="text-white/35 text-[10px] uppercase tracking-widest font-bold mb-3">About</p>
              <p className="text-white/70 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Member info */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
            <p className="text-white/35 text-[10px] uppercase tracking-widest font-bold">Details</p>
            {[
              { label: "Email",    value: artistEmail },
              { label: "Country",  value: profile?.country ?? "—" },
              { label: "Label",    value: profile?.record_label ?? "Independent" },
              { label: "Plan",     value: profile?.plan_status === "active" ? profile?.plan ?? "—" : "No active plan" },
              { label: "Member since", value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="text-white/30 text-xs w-24 flex-shrink-0 pt-0.5">{label}</span>
                <span className="text-white/70 text-xs break-all">{value}</span>
              </div>
            ))}
          </div>

          {/* Social links */}
          {socials.length > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <p className="text-white/35 text-[10px] uppercase tracking-widest font-bold mb-3">Social</p>
              <div className="space-y-2">
                {socials.map(({ Icon, label, href }) => (
                  <a key={label} href={href!} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-white/50 hover:text-white transition-colors">
                    <Icon size={14} className="flex-shrink-0 text-white/30" />
                    <span className="text-xs truncate">{label}</span>
                    <ExternalLink size={10} className="ml-auto flex-shrink-0 opacity-40" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Platform presence */}
          {platforms.some((p) => p.id) && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <p className="text-white/35 text-[10px] uppercase tracking-widest font-bold mb-3">Platform Presence</p>
              <div className="space-y-2">
                {platforms.filter((p) => p.id).map(({ label, id, href, color }) => (
                  <a key={label} href={href(id!)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 group">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-white/50 text-xs group-hover:text-white transition-colors flex-1">{label}</span>
                    <span className="text-white/20 text-[10px] font-mono truncate max-w-[80px]">{id}</span>
                    <ExternalLink size={10} className="text-white/20 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Payout status */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
            <p className="text-white/35 text-[10px] uppercase tracking-widest font-bold mb-3">Payment Details</p>
            {hasPayoutDetails ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 size={13} /> Payout method set
                </div>
                <p className="text-white/40 text-xs capitalize">{profile?.payout_method?.replace(/_/g, " ")}</p>
                {profile?.payout_method === "bank_transfer" && (
                  <div className="space-y-1 text-xs">
                    <p className="text-white/40">{profile.bank_name} · {profile.bank_country}</p>
                    <p className="text-white/30">{profile.bank_account_name}</p>
                    <p className="text-white/30 font-mono">****{(profile.bank_account_number ?? "").slice(-4)}</p>
                  </div>
                )}
                {profile?.payout_method === "paypal" && (
                  <p className="text-white/40 text-xs">{profile.paypal_email}</p>
                )}
                {profile?.payout_method === "mobile_money" && (
                  <p className="text-white/40 text-xs">{profile.mobile_money_provider} · {profile.mobile_money_number}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-400 text-xs">
                <AlertTriangle size={13} /> No payout details set — cannot pay out
              </div>
            )}
          </div>

          {/* Account management */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
            <p className="text-white/35 text-[10px] uppercase tracking-widest font-bold mb-3">Account Control</p>
            <div className="space-y-2">
              {(["active", "inactive", "suspended", "takedown"] as const).map((s) => {
                const cfg = ACCOUNT_CFG[s];
                const current = (profile?.account_status ?? "active") === s;
                return (
                  <button key={s}
                    onClick={() => requestUnlock(() => changeStatus(s))}
                    disabled={changingStatus || current}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all disabled:cursor-default ${
                      current ? `${cfg.bg} ${cfg.color}` : "border-white/[0.06] text-white/35 hover:text-white hover:bg-white/[0.04]"
                    }`}>
                    <cfg.Icon size={12} />
                    {cfg.label}
                    {current && <CheckCircle2 size={11} className="ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right column — Releases ──────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Releases timeline */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <p className="text-white font-semibold text-sm flex items-center gap-2">
                <Music2 size={15} className="text-[#60a5fa]" /> Releases
                <span className="text-white/30 font-normal">({releases.length})</span>
              </p>
              <div className="flex items-center gap-2 text-xs">
                {pendingCount > 0 && (
                  <span className="text-yellow-400 font-semibold">{pendingCount} pending</span>
                )}
              </div>
            </div>

            {releases.length === 0 ? (
              <div className="text-center py-12 text-white/20 text-sm">No releases yet.</div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {releases.map((r) => {
                  const cfg    = STATUS_CFG[r.status] ?? STATUS_CFG.pending;
                  const Icon   = cfg.Icon;
                  const rStreams = Object.values(r.streams ?? {}).reduce((a, b) => a + b, 0);
                  return (
                    <div key={r.id} className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                      {/* Cover */}
                      <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-white/[0.06] flex items-center justify-center">
                        {r.cover_art_url
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={r.cover_art_url} alt="" className="w-full h-full object-cover" />
                          : <Music2 size={16} className="text-white/20" />}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-white/90 font-semibold text-sm truncate">{r.song_title}</p>
                          <span className="flex items-center gap-1 text-[10px] font-bold flex-shrink-0" style={{ color: cfg.color }}>
                            <Icon size={10} /> {r.distribution_stage === "live" ? "Live" : cfg.label}
                          </span>
                        </div>
                        <p className="text-white/35 text-xs mt-0.5">{r.release_type} · {r.genre}</p>
                        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                          <span className="text-white/25 text-[10px] flex items-center gap-1">
                            <Calendar size={9} />
                            {new Date(r.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          {rStreams > 0 && (
                            <span className="text-white/30 text-[10px]">{fmtN(rStreams)} streams</span>
                          )}
                          {(r.royalties_usd ?? 0) > 0 && (
                            <span className="text-[#34d399] text-[10px] font-semibold">{fmtUsd(r.royalties_usd!)}</span>
                          )}
                          {r.isrc && (
                            <span className="text-white/20 text-[10px] font-mono">ISRC: {r.isrc}</span>
                          )}
                        </div>
                      </div>
                      {/* Open release */}
                      <Link href={`/admin/releases?search=${encodeURIComponent(r.song_title)}`}
                        className="text-white/20 hover:text-[#007bff] transition-colors flex-shrink-0 mt-0.5">
                        <ExternalLink size={13} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Financial summary */}
          {totalRoyalties > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <p className="text-white/35 text-[10px] uppercase tracking-widest font-bold mb-4">Financial Summary</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4">
                  <p className="text-[#34d399] font-bold text-xl tabular-nums">{fmtUsd(totalRoyalties)}</p>
                  <p className="text-white/35 text-xs mt-1">Total Royalties</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4">
                  <p className="text-[#60a5fa] font-bold text-xl tabular-nums">{fmtN(totalStreams)}</p>
                  <p className="text-white/35 text-xs mt-1">Total Streams</p>
                </div>
              </div>
              {/* Per-release breakdown */}
              <div className="space-y-2">
                {releases.filter((r) => (r.royalties_usd ?? 0) > 0).map((r) => (
                  <div key={r.id} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg overflow-hidden flex-shrink-0 bg-white/[0.05]">
                      {r.cover_art_url
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={r.cover_art_url} alt="" className="w-full h-full object-cover" />
                        : <Music2 size={10} className="text-white/20 m-auto" />}
                    </div>
                    <span className="text-white/55 text-xs flex-1 truncate">{r.song_title}</span>
                    <span className="text-[#34d399] text-xs font-bold tabular-nums flex-shrink-0">{fmtUsd(r.royalties_usd!)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes for admin */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/35 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
                <FileText size={12} /> Internal Notes
              </p>
              {notesSaved && <span className="text-emerald-400 text-xs">Saved ✓</span>}
            </div>
            <textarea
              className="w-full bg-white/[0.04] border border-white/[0.06] focus:border-[#007bff] outline-none text-white/70 placeholder-white/20 text-sm px-4 py-3 rounded-xl transition-colors resize-none"
              rows={4}
              placeholder="Add internal notes about this artist — not visible to them…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button
              onClick={async () => {
                setSavingNotes(true);
                await supabase.from("artist_profiles").update({ admin_notes: notes.trim() || null } as Record<string, string | null>).eq("email", artistEmail);
                setSavingNotes(false); setNotesSaved(true);
                setTimeout(() => setNotesSaved(false), 3000);
              }}
              disabled={savingNotes}
              className="mt-2 flex items-center gap-2 text-xs font-semibold text-white/40 hover:text-white border border-white/[0.08] hover:border-white/20 px-4 py-2 rounded-xl transition-colors"
            >
              {savingNotes ? <Loader2 size={12} className="animate-spin" /> : null}
              Save Notes
            </button>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/admin/messages?email=${encodeURIComponent(artistEmail)}`}
              className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] rounded-xl p-4 transition-colors">
              <MessageSquare size={17} className="text-white/30 flex-shrink-0" />
              <div>
                <p className="text-white/70 text-sm font-medium">Messages</p>
                <p className="text-white/25 text-xs">Direct conversation</p>
              </div>
            </Link>
            <Link href={`/admin/payouts?email=${encodeURIComponent(artistEmail)}`}
              className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] rounded-xl p-4 transition-colors">
              <CreditCard size={17} className="text-white/30 flex-shrink-0" />
              <div>
                <p className="text-white/70 text-sm font-medium">Payouts</p>
                <p className="text-white/25 text-xs">Payment history</p>
              </div>
            </Link>
            <Link href={`/admin/notify`}
              className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] rounded-xl p-4 transition-colors">
              <Radio size={17} className="text-white/30 flex-shrink-0" />
              <div>
                <p className="text-white/70 text-sm font-medium">Campaign Notify</p>
                <p className="text-white/25 text-xs">Templates + bulk</p>
              </div>
            </Link>
            <Link href={`/portal/contract/${releases[0]?.id ?? ""}`}
              className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] rounded-xl p-4 transition-colors">
              <FileText size={17} className="text-white/30 flex-shrink-0" />
              <div>
                <p className="text-white/70 text-sm font-medium">Contract</p>
                <p className="text-white/25 text-xs">Agreement record</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
