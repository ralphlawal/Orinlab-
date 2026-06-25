"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import {
  Music, MessageSquare, Clock, CheckCircle2, XCircle, ArrowRight,
  Mail, Users, Globe, DollarSign, LifeBuoy, Loader2, RefreshCw,
  Megaphone, Radio, Send, TrendingUp, Zap, Bell,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type PendingRelease = {
  id: string;
  artist_name: string;
  email: string;
  song_title: string;
  genre: string | null;
  release_type: string;
  submitted_at: string;
};

type PendingLabel = {
  id: string;
  name: string;
  email: string;
  country: string | null;
  submitted_at: string;
};

type OpenTicket = {
  id: string;
  artist_name: string;
  subject: string;
  category: string;
  created_at: string;
};

type PendingPayout = {
  id: string;
  artist_name: string;
  song_title: string;
  amount_usd: number;
  payout_method: string | null;
  created_at: string;
};

type RecentActivity = {
  id: string;
  type: "release" | "message" | "ticket" | "payout" | "label";
  title: string;
  sub: string;
  time: string;
  status: string;
};

type Stats = {
  totalArtists: number;
  totalReleases: number;
  pendingReleases: number;
  approvedReleases: number;
  totalLabels: number;
  pendingLabels: number;
  subscribers: number;
  openTickets: number;
  pendingPayouts: number;
  pendingPayoutsUsd: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function reltime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-400/10 text-yellow-400",
    approved: "bg-green-400/10 text-green-400",
    rejected: "bg-red-400/10 text-red-400",
    open: "bg-yellow-400/10 text-yellow-400",
    paid: "bg-green-400/10 text-green-400",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide capitalize ${map[status] ?? "bg-white/10 text-white/40"}`}>
      {status}
    </span>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color, bg, href, urgent }: {
  icon: React.ReactNode; label: string; value: number | string;
  sub?: string; color: string; bg: string; href?: string; urgent?: boolean;
}) {
  const inner = (
    <div className={`bg-white/[0.03] border rounded-2xl p-5 transition-all ${urgent && Number(value) > 0 ? "border-yellow-400/30 shadow-[0_0_20px_rgba(251,191,36,0.05)]" : "border-white/[0.06]"} ${href ? "hover:border-white/20 cursor-pointer" : ""}`}>
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center ${color} mb-4`}>
        {icon}
      </div>
      <p className="text-white font-bold text-3xl">{value}</p>
      <p className="text-white/40 text-xs mt-1">{label}</p>
      {sub && <p className="text-white/25 text-xs mt-0.5">{sub}</p>}
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

// ─── Quick Approve/Reject ────────────────────────────────────────────────────

function QuickReleaseCard({ release, onDone }: { release: PendingRelease; onDone: () => void }) {
  const { requestUnlock } = usePinGate();
  const [acting, setActing] = useState<"approve" | "reject" | null>(null);

  async function act(action: "approve" | "reject") {
    setActing(action);
    await supabase.from("releases").update({
      status: action === "approve" ? "approved" : "rejected",
      reviewed_at: new Date().toISOString(),
    }).eq("id", release.id);
    // Email the artist
    fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: action === "approve" ? "approved" : "rejected",
        release: {
          email: release.email,
          artist_name: release.artist_name,
          song_title: release.song_title,
          release_type: release.release_type,
          genre: release.genre,
          review_notes: null,
        },
      }),
    }).catch(() => {});
    // In-app notification for artist
    supabase.from("notifications").insert({
      email: release.email,
      type: action === "approve" ? "approved" : "rejected",
      title: action === "approve"
        ? `"${release.song_title}" has been approved!`
        : `"${release.song_title}" was not selected`,
      body: action === "approve"
        ? "Your release has been approved and is being prepared for distribution."
        : "Your release was not selected at this time. Check your portal for details.",
      link: null,
    }).then(() => {}).then(undefined, () => {});
    // Admin record copy
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: action === "approve" ? "release-approved" : "release-rejected",
        data: {
          song_title: release.song_title,
          artist_name: release.artist_name,
          email: release.email,
          release_type: release.release_type,
          reviewed_at: new Date().toISOString(),
        },
      }),
    }).catch(() => {});
    setActing(null);
    onDone();
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{release.song_title}</p>
        <p className="text-white/40 text-xs">{release.artist_name} · {release.genre ?? release.release_type} · {reltime(release.submitted_at)}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => requestUnlock(() => act("approve"))}
          disabled={acting !== null}
          className="flex items-center gap-1 text-xs font-semibold text-green-400 hover:bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
        >
          {acting === "approve" ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
          Approve
        </button>
        <button
          onClick={() => requestUnlock(() => act("reject"))}
          disabled={acting !== null}
          className="flex items-center gap-1 text-xs font-semibold text-red-400/70 hover:bg-red-400/10 border border-red-400/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
        >
          {acting === "reject" ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
          Reject
        </button>
        <Link href="/admin/releases" className="text-white/20 hover:text-white/60 transition-colors">
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

// ─── Quick Approve Label ─────────────────────────────────────────────────────

function QuickLabelCard({ label, onDone }: { label: PendingLabel; onDone: () => void }) {
  const { requestUnlock } = usePinGate();
  const [acting, setActing] = useState<"approve" | "reject" | null>(null);

  async function act(action: "approve" | "reject") {
    setActing(action);
    await supabase.from("label_profiles").update({ status: action === "approve" ? "approved" : "rejected" }).eq("id", label.id);
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: action === "approve" ? "label-approved" : "label-rejected",
        data: { name: label.name, email: label.email, rejection_reason: action === "reject" ? "Application not approved at this time." : undefined },
      }),
    }).catch(() => {});
    setActing(null);
    onDone();
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{label.name}</p>
        <p className="text-white/40 text-xs">{label.email} · {label.country ?? "—"} · {reltime(label.submitted_at)}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => requestUnlock(() => act("approve"))}
          disabled={acting !== null}
          className="flex items-center gap-1 text-xs font-semibold text-green-400 hover:bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
        >
          {acting === "approve" ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
          Approve
        </button>
        <button
          onClick={() => requestUnlock(() => act("reject"))}
          disabled={acting !== null}
          className="flex items-center gap-1 text-xs font-semibold text-red-400/70 hover:bg-red-400/10 border border-red-400/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
        >
          {acting === "reject" ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
          Reject
        </button>
        <Link href="/admin/labels" className="text-white/20 hover:text-white/60 transition-colors">
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

// ─── Quick Announce ──────────────────────────────────────────────────────────

function QuickAnnounce() {
  const { requestUnlock } = usePinGate();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<"info" | "warning" | "success">("info");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function publish() {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    await supabase.from("announcements").insert({ title: title.trim(), body: body.trim(), type, active: true });
    setSaving(false);
    setDone(true);
    setTitle(""); setBody(""); setType("info");
    setTimeout(() => { setDone(false); setOpen(false); }, 2000);
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <Megaphone size={16} className="text-[#007bff]" />
        <span className="text-white font-semibold text-sm flex-1">Quick Announcement</span>
        <span className="text-white/30 text-xs">Post a message to all artists in the portal</span>
      </button>
      {open && (
        <div className="border-t border-white/[0.06] px-5 py-4 space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title…"
            className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-4 py-2.5 rounded-xl transition-colors" />
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={2} placeholder="Message…"
            className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-4 py-2.5 rounded-xl transition-colors resize-none" />
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {(["info", "warning", "success"] as const).map(t => (
                <button key={t} onClick={() => setType(t)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${type === t ? "bg-[#007bff]/15 border-[#007bff]/40 text-[#007bff]" : "border-white/10 text-white/30 hover:text-white"}`}>
                  {t}
                </button>
              ))}
            </div>
            <button onClick={() => requestUnlock(publish)} disabled={saving || done || !title.trim() || !body.trim()}
              className="flex items-center gap-1.5 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
              {saving ? <Loader2 size={12} className="animate-spin" /> : done ? <CheckCircle2 size={12} /> : <Send size={12} />}
              {done ? "Published!" : "Publish"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalArtists: 0, totalReleases: 0, pendingReleases: 0, approvedReleases: 0,
    totalLabels: 0, pendingLabels: 0, subscribers: 0, openTickets: 0,
    pendingPayouts: 0, pendingPayoutsUsd: 0,
  });
  const [pendingReleases, setPendingReleases] = useState<PendingRelease[]>([]);
  const [pendingLabels, setPendingLabels]     = useState<PendingLabel[]>([]);
  const [openTickets, setOpenTickets]         = useState<OpenTicket[]>([]);
  const [pendingPayouts, setPendingPayouts]   = useState<PendingPayout[]>([]);
  const [activity, setActivity]               = useState<RecentActivity[]>([]);
  const [adminName, setAdminName]             = useState("");
  const [loading, setLoading]                 = useState(true);
  const [refreshing, setRefreshing]           = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email ?? "";
      const name = email.split("@")[0];
      setAdminName(name.charAt(0).toUpperCase() + name.slice(1));
    });
  }, []);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    const [
      { count: totalArtists },
      { count: totalReleases },
      { count: pendingCount },
      { count: approvedCount },
      { count: totalLabels },
      { count: pendingLabels },
      { count: subscribers },
      { count: openTicketsCount },
      { data: pendingPayoutsData },
      { data: pendingReleasesData },
      { data: pendingLabelsData },
      { data: openTicketsData },
      { data: recentReleases },
      { data: recentMessages },
    ] = await Promise.all([
      supabase.from("artist_profiles").select("*", { count: "exact", head: true }),
      supabase.from("releases").select("*", { count: "exact", head: true }),
      supabase.from("releases").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("releases").select("*", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("label_profiles").select("*", { count: "exact", head: true }),
      supabase.from("label_profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("active", true),
      supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("payout_requests").select("id,artist_name,song_title,amount_usd,payout_method,created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
      supabase.from("releases").select("id,artist_name,email,song_title,genre,release_type,submitted_at").eq("status", "pending").order("submitted_at", { ascending: false }).limit(8),
      supabase.from("label_profiles").select("id,name,email,country,submitted_at").eq("status", "pending").order("submitted_at", { ascending: false }).limit(5),
      supabase.from("support_tickets").select("id,artist_name,subject,category,created_at").eq("status", "open").order("created_at", { ascending: false }).limit(5),
      supabase.from("releases").select("id,artist_name,song_title,status,submitted_at").order("submitted_at", { ascending: false }).limit(6),
      supabase.from("messages").select("id,artist_name,artist_email,content,created_at").order("created_at", { ascending: false }).limit(4),
    ]);

    const payouts = (pendingPayoutsData ?? []) as PendingPayout[];
    const pendingUsd = payouts.reduce((s, p) => s + p.amount_usd, 0);

    setStats({
      totalArtists: totalArtists ?? 0,
      totalReleases: totalReleases ?? 0,
      pendingReleases: pendingCount ?? 0,
      approvedReleases: approvedCount ?? 0,
      totalLabels: totalLabels ?? 0,
      pendingLabels: pendingLabels ?? 0,
      subscribers: subscribers ?? 0,
      openTickets: openTicketsCount ?? 0,
      pendingPayouts: payouts.length,
      pendingPayoutsUsd: pendingUsd,
    });

    setPendingReleases((pendingReleasesData ?? []) as PendingRelease[]);
    setPendingLabels((pendingLabelsData ?? []) as PendingLabel[]);
    setOpenTickets((openTicketsData ?? []) as OpenTicket[]);
    setPendingPayouts(payouts);

    // Build activity feed
    const acts: RecentActivity[] = [];
    for (const r of (recentReleases ?? []) as { id: string; artist_name: string; song_title: string; status: string; submitted_at: string }[]) {
      acts.push({ id: r.id, type: "release", title: r.song_title, sub: r.artist_name, time: r.submitted_at, status: r.status });
    }
    for (const m of (recentMessages ?? []) as { id: string; artist_name: string; artist_email: string; content: string; created_at: string }[]) {
      acts.push({ id: m.id, type: "message", title: m.artist_name || m.artist_email, sub: (m.content ?? "").slice(0, 60), time: m.created_at, status: "received" });
    }
    acts.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setActivity(acts.slice(0, 10));

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const needsAttention = stats.pendingReleases + stats.pendingLabels + stats.openTickets + stats.pendingPayouts;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#007bff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const ACTIVITY_ICON: Record<string, React.ReactNode> = {
    release: <Music size={13} />,
    message: <MessageSquare size={13} />,
    ticket: <LifeBuoy size={13} />,
    payout: <DollarSign size={13} />,
    label: <Globe size={13} />,
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-white font-bold text-2xl">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}{adminName ? `, ${adminName}` : ""}.
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {needsAttention > 0
              ? `${needsAttention} item${needsAttention !== 1 ? "s" : ""} need your attention.`
              : "Everything is up to date."}
          </p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing}
          className="flex items-center gap-2 text-white/30 hover:text-white text-xs border border-white/[0.08] hover:border-white/20 px-3 py-2 rounded-xl transition-colors">
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<Users size={18} />}     label="Artists"      value={stats.totalArtists}    color="text-[#007bff]"  bg="bg-[#007bff]/10" href="/admin/artists" />
        <StatCard icon={<Music size={18} />}      label="Releases"     value={stats.totalReleases}   color="text-purple-400" bg="bg-purple-400/10" href="/admin/releases" sub={`${stats.pendingReleases} pending`} urgent={stats.pendingReleases > 0} />
        <StatCard icon={<Globe size={18} />}      label="Labels"       value={stats.totalLabels}     color="text-cyan-400"   bg="bg-cyan-400/10"  href="/admin/labels"   sub={`${stats.pendingLabels} pending`}  urgent={stats.pendingLabels > 0} />
        <StatCard icon={<Mail size={18} />}       label="Subscribers"  value={stats.subscribers}     color="text-pink-400"   bg="bg-pink-400/10"  href="/admin/newsletter" />
        <StatCard icon={<Clock size={18} />}      label="Pending"      value={stats.pendingReleases} color="text-yellow-400" bg="bg-yellow-400/10" href="/admin/releases"  urgent={stats.pendingReleases > 0} />
        <StatCard icon={<CheckCircle2 size={18} />} label="Approved"   value={stats.approvedReleases} color="text-green-400" bg="bg-green-400/10" href="/admin/releases" />
        <StatCard icon={<LifeBuoy size={18} />}   label="Open Tickets" value={stats.openTickets}    color="text-orange-400" bg="bg-orange-400/10" href="/admin/support"   urgent={stats.openTickets > 0} />
        <StatCard icon={<DollarSign size={18} />} label="Payouts Due"  value={`$${stats.pendingPayoutsUsd.toFixed(0)}`} color="text-emerald-400" bg="bg-emerald-400/10" href="/admin/payouts" sub={`${stats.pendingPayouts} request${stats.pendingPayouts !== 1 ? "s" : ""}`} urgent={stats.pendingPayouts > 0} />
      </div>

      {/* Needs attention */}
      {needsAttention > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-yellow-400" />
            <h2 className="text-white font-semibold text-sm">Needs Attention</h2>
            <span className="bg-yellow-400/15 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full">{needsAttention}</span>
          </div>

          {/* Pending releases */}
          {pendingReleases.length > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <Music size={14} className="text-yellow-400" /> Pending Releases
                  <span className="bg-yellow-400/15 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full">{stats.pendingReleases}</span>
                </h3>
                <Link href="/admin/releases" className="text-[#007bff] text-xs flex items-center gap-1 hover:gap-2 transition-all">
                  View all <ArrowRight size={11} />
                </Link>
              </div>
              <div className="divide-y divide-white/[0.04] px-4 py-2">
                {pendingReleases.map(r => (
                  <div key={r.id} className="py-2">
                    <QuickReleaseCard release={r} onDone={() => load(true)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending labels */}
          {pendingLabels.length > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <Globe size={14} className="text-cyan-400" /> Pending Label Applications
                  <span className="bg-cyan-400/15 text-cyan-400 text-xs font-bold px-2 py-0.5 rounded-full">{stats.pendingLabels}</span>
                </h3>
                <Link href="/admin/labels" className="text-[#007bff] text-xs flex items-center gap-1 hover:gap-2 transition-all">
                  View all <ArrowRight size={11} />
                </Link>
              </div>
              <div className="divide-y divide-white/[0.04] px-4 py-2">
                {pendingLabels.map(l => (
                  <div key={l.id} className="py-2">
                    <QuickLabelCard label={l} onDone={() => load(true)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Open tickets */}
          {openTickets.length > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <LifeBuoy size={14} className="text-orange-400" /> Open Support Tickets
                  <span className="bg-orange-400/15 text-orange-400 text-xs font-bold px-2 py-0.5 rounded-full">{stats.openTickets}</span>
                </h3>
                <Link href="/admin/support" className="text-[#007bff] text-xs flex items-center gap-1 hover:gap-2 transition-all">
                  Respond <ArrowRight size={11} />
                </Link>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {openTickets.map(t => (
                  <Link key={t.id} href="/admin/support"
                    className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <LifeBuoy size={14} className="text-white/20 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{t.subject}</p>
                      <p className="text-white/40 text-xs">{t.artist_name} · {t.category}</p>
                    </div>
                    <p className="text-white/25 text-xs flex-shrink-0">{reltime(t.created_at)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Pending payouts */}
          {pendingPayouts.length > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <DollarSign size={14} className="text-emerald-400" /> Pending Payouts
                  <span className="bg-emerald-400/15 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">${stats.pendingPayoutsUsd.toFixed(0)} USD</span>
                </h3>
                <Link href="/admin/payouts" className="text-[#007bff] text-xs flex items-center gap-1 hover:gap-2 transition-all">
                  Process <ArrowRight size={11} />
                </Link>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {pendingPayouts.map(p => (
                  <Link key={p.id} href="/admin/payouts"
                    className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">{p.artist_name}</p>
                      <p className="text-white/40 text-xs">{p.song_title} · {p.payout_method?.replace(/_/g, " ") ?? "—"}</p>
                    </div>
                    <p className="text-emerald-400 font-bold text-sm flex-shrink-0">${p.amount_usd.toFixed(2)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom row — Quick tools + Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick tools */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={15} className="text-[#007bff]" />
            <h2 className="text-white font-semibold text-sm">Quick Actions</h2>
          </div>

          <QuickAnnounce />

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Send Newsletter",   sub: "Email subscribers",   href: "/admin/newsletter",    icon: <Mail size={16} />,        color: "text-pink-400" },
              { label: "Add Announcement",  sub: "Portal-wide message", href: "/admin/announcements", icon: <Megaphone size={16} />,   color: "text-[#007bff]" },
              { label: "Promotion Pitches", sub: "Review submissions",  href: "/admin/pitches",       icon: <Radio size={16} />,       color: "text-purple-400" },
              { label: "Site Settings",     sub: "Edit live content",   href: "/admin/settings",      icon: <Bell size={16} />,        color: "text-amber-400" },
              { label: "System Tools",      sub: "Emails & reminders",  href: "/admin/settings?tab=system", icon: <Zap size={16} />,  color: "text-cyan-400" },
              { label: "Blog",              sub: "Manage articles",     href: "/admin/blog",           icon: <MessageSquare size={16} />, color: "text-green-400" },
            ].map(q => (
              <Link key={q.label} href={q.href}
                className="bg-white/[0.03] border border-white/[0.06] hover:border-white/20 rounded-xl p-4 flex items-start gap-3 transition-all hover:bg-white/[0.05]">
                <span className={q.color}>{q.icon}</span>
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold">{q.label}</p>
                  <p className="text-white/30 text-[11px] mt-0.5">{q.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
            <RefreshCw size={14} className="text-[#007bff]" />
            <h3 className="text-white font-semibold text-sm">Recent Activity</h3>
          </div>
          {activity.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-10">No activity yet.</p>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {activity.map((a, i) => (
                <div key={`${a.id}-${i}`} className="flex items-start gap-3 px-5 py-3">
                  <div className="w-7 h-7 bg-white/[0.04] rounded-lg flex items-center justify-center flex-shrink-0 text-white/30 mt-0.5">
                    {ACTIVITY_ICON[a.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-xs font-medium truncate">{a.title}</p>
                    <p className="text-white/30 text-xs truncate">{a.sub}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StatusBadge status={a.status} />
                    <p className="text-white/20 text-[10px]">{reltime(a.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Platform summary */}
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl px-6 py-4 flex flex-wrap items-center gap-6">
        <div className="text-center">
          <p className="text-white font-bold text-xl">{stats.totalArtists}</p>
          <p className="text-white/30 text-xs mt-0.5">Artists</p>
        </div>
        <div className="w-px h-8 bg-white/[0.06]" />
        <div className="text-center">
          <p className="text-white font-bold text-xl">{stats.approvedReleases}</p>
          <p className="text-white/30 text-xs mt-0.5">Live Releases</p>
        </div>
        <div className="w-px h-8 bg-white/[0.06]" />
        <div className="text-center">
          <p className="text-white font-bold text-xl">{stats.totalLabels}</p>
          <p className="text-white/30 text-xs mt-0.5">Labels</p>
        </div>
        <div className="w-px h-8 bg-white/[0.06]" />
        <div className="text-center">
          <p className="text-white font-bold text-xl">{stats.subscribers}</p>
          <p className="text-white/30 text-xs mt-0.5">Newsletter</p>
        </div>
        <div className="flex-1" />
        <button onClick={() => router.push("/admin/analytics")} className="text-[#007bff] text-xs flex items-center gap-1 hover:gap-2 transition-all">
          Full Analytics <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
