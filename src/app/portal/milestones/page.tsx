"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Lock } from "lucide-react";

type Release = {
  id: string;
  status: string;
  streams: Record<string, number> | null;
  royalties_usd: number | null;
};

type Milestone = {
  id: string;
  category: string;
  emoji: string;
  title: string;
  description: string;
  threshold: number;
  value: number;
  unlocked: boolean;
  next?: { threshold: number; label: string };
};

function totalStreams(r: Release[]) {
  return r.reduce((sum, rel) => {
    if (!rel.streams) return sum;
    return sum + Object.values(rel.streams).reduce((s, v) => s + v, 0);
  }, 0);
}

function fmtStreams(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-1.5 w-full bg-white/[0.07] rounded-full overflow-hidden mt-3">
      <div
        className="h-full bg-[#007bff] rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function MilestoneCard({ m }: { m: Milestone }) {
  return (
    <div className={`relative flex flex-col gap-3 rounded-2xl border p-5 transition-all ${
      m.unlocked
        ? "bg-[#0e0e10] border-white/[0.12]"
        : "bg-[#09090c] border-white/[0.06] opacity-60"
    }`}>
      {/* Badge */}
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
        m.unlocked ? "bg-white/[0.08]" : "bg-white/[0.03]"
      }`}>
        {m.unlocked ? m.emoji : <Lock size={18} className="text-white/20" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className={`font-bold text-sm ${m.unlocked ? "text-white" : "text-white/30"}`}>
            {m.title}
          </p>
          {m.unlocked && (
            <span className="text-[10px] font-bold bg-[#007bff]/15 text-[#007bff] px-2 py-0.5 rounded-full uppercase tracking-widest">
              Unlocked
            </span>
          )}
        </div>
        <p className={`text-xs leading-relaxed ${m.unlocked ? "text-white/50" : "text-white/25"}`}>
          {m.description}
        </p>

        {!m.unlocked && m.next && (
          <>
            <p className="text-white/25 text-[10px] mt-2">
              {fmtStreams(m.value)} / {fmtStreams(m.next.threshold)} {m.next.label}
            </p>
            <ProgressBar value={m.value} max={m.next.threshold} />
          </>
        )}
      </div>
    </div>
  );
}

function CategorySection({ title, milestones }: { title: string; milestones: Milestone[] }) {
  const unlocked = milestones.filter((m) => m.unlocked).length;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-white font-bold text-sm">{title}</h2>
        <span className="text-white/30 text-xs">{unlocked}/{milestones.length} unlocked</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {milestones.map((m) => <MilestoneCard key={m.id} m={m} />)}
      </div>
    </div>
  );
}

export default function MilestonesPage() {
  const [loading, setLoading] = useState(true);
  const [releases, setReleases] = useState<Release[]>([]);
  const [pitchCount, setPitchCount] = useState(0);
  const [token, setToken] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const accessToken = data.session.access_token;
      setToken(accessToken);

      const [{ data: rels }] = await Promise.all([
        supabase
          .from("releases")
          .select("id, status, streams, royalties_usd")
          .eq("email", data.session.user.email!),
      ]);
      setReleases((rels ?? []) as Release[]);

      // Fetch pitch count via API (service-role bypass)
      fetch("/api/pitch", { headers: { Authorization: `Bearer ${accessToken}` } })
        .then((r) => r.ok ? r.json() : { pitches: [] })
        .then(({ pitches }) => setPitchCount((pitches ?? []).length))
        .catch(() => {});

      setLoading(false);
    });
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={26} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  const approved = releases.filter((r) => r.status === "approved");
  const streams  = totalStreams(releases);
  const earnings = releases.reduce((s, r) => s + (r.royalties_usd ?? 0), 0);
  const totalUnlocked = (() => {
    let n = 0;
    if (streams >= 1) n++;
    if (streams >= 1_000) n++;
    if (streams >= 10_000) n++;
    if (streams >= 100_000) n++;
    if (streams >= 1_000_000) n++;
    if (earnings >= 1) n++;
    if (earnings >= 50) n++;
    if (earnings >= 500) n++;
    if (earnings >= 5_000) n++;
    if (approved.length >= 1) n++;
    if (approved.length >= 3) n++;
    if (approved.length >= 5) n++;
    if (pitchCount >= 1) n++;
    if (pitchCount >= 5) n++;
    if (pitchCount >= 10) n++;
    return n;
  })();

  const streamMilestones: Milestone[] = [
    {
      id: "s1", category: "Streaming", emoji: "🎵", title: "First Stream",
      description: "Someone played your music. The journey begins.", threshold: 1,
      value: streams, unlocked: streams >= 1,
      next: streams < 1 ? { threshold: 1, label: "streams needed" } : undefined,
    },
    {
      id: "s2", category: "Streaming", emoji: "📻", title: "Gaining Momentum",
      description: "1,000 streams — your music is reaching real audiences.", threshold: 1_000,
      value: streams, unlocked: streams >= 1_000,
      next: streams < 1_000 ? { threshold: 1_000, label: "total streams" } : undefined,
    },
    {
      id: "s3", category: "Streaming", emoji: "🔥", title: "On Fire",
      description: "10,000 streams — you're building a real fanbase.", threshold: 10_000,
      value: streams, unlocked: streams >= 10_000,
      next: streams < 10_000 ? { threshold: 10_000, label: "total streams" } : undefined,
    },
    {
      id: "s4", category: "Streaming", emoji: "⭐", title: "Star Power",
      description: "100,000 streams — you're making waves in the scene.", threshold: 100_000,
      value: streams, unlocked: streams >= 100_000,
      next: streams < 100_000 ? { threshold: 100_000, label: "total streams" } : undefined,
    },
    {
      id: "s5", category: "Streaming", emoji: "💎", title: "Platinum Status",
      description: "1 million streams — you're a certified streaming artist.", threshold: 1_000_000,
      value: streams, unlocked: streams >= 1_000_000,
      next: streams < 1_000_000 ? { threshold: 1_000_000, label: "total streams" } : undefined,
    },
  ];

  const earningsMilestones: Milestone[] = [
    {
      id: "e1", category: "Earnings", emoji: "💰", title: "First Dollar",
      description: "Your music is generating real revenue.", threshold: 1,
      value: earnings, unlocked: earnings >= 1,
      next: earnings < 1 ? { threshold: 1, label: "USD earned" } : undefined,
    },
    {
      id: "e2", category: "Earnings", emoji: "💵", title: "Payout Ready",
      description: "You've hit the $50 payout threshold — time to cash out.", threshold: 50,
      value: earnings, unlocked: earnings >= 50,
      next: earnings < 50 ? { threshold: 50, label: "USD earned" } : undefined,
    },
    {
      id: "e3", category: "Earnings", emoji: "🤑", title: "Money Making",
      description: "$500 in royalties — your catalogue is working hard.", threshold: 500,
      value: earnings, unlocked: earnings >= 500,
      next: earnings < 500 ? { threshold: 500, label: "USD earned" } : undefined,
    },
    {
      id: "e4", category: "Earnings", emoji: "👑", title: "Top Earner",
      description: "$5,000 in royalties — you're a serious recording artist.", threshold: 5_000,
      value: earnings, unlocked: earnings >= 5_000,
      next: earnings < 5_000 ? { threshold: 5_000, label: "USD earned" } : undefined,
    },
  ];

  const releaseMilestones: Milestone[] = [
    {
      id: "r1", category: "Releases", emoji: "🎤", title: "Debut",
      description: "Your first approved release — welcome to the catalogue.", threshold: 1,
      value: approved.length, unlocked: approved.length >= 1,
      next: approved.length < 1 ? { threshold: 1, label: "approved release" } : undefined,
    },
    {
      id: "r2", category: "Releases", emoji: "🎸", title: "Artist",
      description: "3 approved releases — you're building a real discography.", threshold: 3,
      value: approved.length, unlocked: approved.length >= 3,
      next: approved.length < 3 ? { threshold: 3, label: "approved releases" } : undefined,
    },
    {
      id: "r3", category: "Releases", emoji: "🎼", title: "Prolific",
      description: "5 approved releases — a body of work to be proud of.", threshold: 5,
      value: approved.length, unlocked: approved.length >= 5,
      next: approved.length < 5 ? { threshold: 5, label: "approved releases" } : undefined,
    },
  ];

  const pitchMilestones: Milestone[] = [
    {
      id: "p1", category: "Pitching", emoji: "🎯", title: "Pitcher",
      description: "First pitch submitted — you're putting your music in front of curators.", threshold: 1,
      value: pitchCount, unlocked: pitchCount >= 1,
      next: pitchCount < 1 ? { threshold: 1, label: "pitch submitted" } : undefined,
    },
    {
      id: "p2", category: "Pitching", emoji: "📡", title: "On The Radar",
      description: "5 pitches — you're consistently pushing your music.", threshold: 5,
      value: pitchCount, unlocked: pitchCount >= 5,
      next: pitchCount < 5 ? { threshold: 5, label: "pitches submitted" } : undefined,
    },
    {
      id: "p3", category: "Pitching", emoji: "🏆", title: "Campaign Pro",
      description: "10 pitches submitted — a true promoter of your craft.", threshold: 10,
      value: pitchCount, unlocked: pitchCount >= 10,
      next: pitchCount < 10 ? { threshold: 10, label: "pitches submitted" } : undefined,
    },
  ];

  const totalMilestones = streamMilestones.length + earningsMilestones.length + releaseMilestones.length + pitchMilestones.length;

  return (
    <section className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-white font-bold text-2xl mb-1">Milestones</h1>
          <p className="text-white/40 text-sm">Track your achievements as your music career grows.</p>
        </div>
        <div className="bg-[#0e0e10] border border-white/[0.09] rounded-2xl px-5 py-3 text-center flex-shrink-0">
          <p className="text-white font-black text-3xl tabular-nums">{totalUnlocked}</p>
          <p className="text-white/30 text-xs uppercase tracking-widest mt-0.5">of {totalMilestones} unlocked</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Streams",   value: fmtStreams(streams),          color: "text-[#007bff]" },
          { label: "Total Earnings",  value: `$${earnings.toFixed(2)}`,    color: "text-green-400" },
          { label: "Live Releases",   value: String(approved.length),      color: "text-purple-400" },
          { label: "Pitches Sent",    value: String(pitchCount),           color: "text-orange-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#0e0e10] border border-white/[0.09] rounded-2xl p-4 text-center">
            <p className={`font-black text-2xl tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-white/30 text-[11px] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <CategorySection title="Streaming" milestones={streamMilestones} />
      <CategorySection title="Earnings"  milestones={earningsMilestones} />
      <CategorySection title="Releases"  milestones={releaseMilestones} />
      <CategorySection title="Pitching"  milestones={pitchMilestones} />
    </section>
  );
}
