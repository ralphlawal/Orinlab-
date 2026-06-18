"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Users, Music, DollarSign, BarChart2, TrendingUp, Globe } from "lucide-react";

type Stats = {
  totalArtists: number;
  totalReleases: number;
  pendingReleases: number;
  approvedReleases: number;
  rejectedReleases: number;
  totalStreams: number;
  totalRoyalties: number;
  totalSubscribers: number;
  platformStreams: Record<string, number>;
  recentReleases: { artist_name: string; song_title: string; status: string; submitted_at: string }[];
};

function StatCard({ icon, label, value, sub, color = "#007bff" }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/40 text-xs font-medium uppercase tracking-widest">{label}</p>
        <span style={{ color }}>{icon}</span>
      </div>
      <p className="text-white font-bold text-2xl">{value}</p>
      {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function fmt(n: number) {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K`
    : n.toString();
}

const PLATFORM_LABELS: Record<string, string> = {
  spotify: "Spotify", apple_music: "Apple Music", youtube_music: "YouTube Music",
  boomplay: "Boomplay", audiomack: "Audiomack", deezer: "Deezer",
  tidal: "TIDAL", amazon_music: "Amazon Music",
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [releasesRes, subscribersRes] = await Promise.all([
        supabase.from("releases").select("artist_name, song_title, status, submitted_at, streams, royalties_usd, email"),
        supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
      ]);

      const releases = releasesRes.data ?? [];
      const uniqueArtists = new Set(releases.map((r: { email: string }) => r.email)).size;
      const approved = releases.filter((r: { status: string }) => r.status === "approved");
      const pending  = releases.filter((r: { status: string }) => r.status === "pending");
      const rejected = releases.filter((r: { status: string }) => r.status === "rejected");

      let totalStreams = 0;
      let totalRoyalties = 0;
      const platformStreams: Record<string, number> = {};

      for (const r of approved) {
        totalRoyalties += (r as { royalties_usd?: number }).royalties_usd ?? 0;
        const streams = (r as { streams?: Record<string, number> }).streams ?? {};
        for (const [platform, count] of Object.entries(streams)) {
          totalStreams += count;
          platformStreams[platform] = (platformStreams[platform] ?? 0) + count;
        }
      }

      const recentReleases = [...releases]
        .sort((a: { submitted_at: string }, b: { submitted_at: string }) =>
          new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
        )
        .slice(0, 8)
        .map((r: { artist_name: string; song_title: string; status: string; submitted_at: string }) => ({
          artist_name: r.artist_name,
          song_title: r.song_title,
          status: r.status,
          submitted_at: r.submitted_at,
        }));

      setStats({
        totalArtists: uniqueArtists,
        totalReleases: releases.length,
        pendingReleases: pending.length,
        approvedReleases: approved.length,
        rejectedReleases: rejected.length,
        totalStreams,
        totalRoyalties,
        totalSubscribers: subscribersRes.count ?? 0,
        platformStreams,
        recentReleases,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-60"><Loader2 size={28} className="text-[#007bff] animate-spin" /></div>;
  }
  if (!stats) return null;

  const sortedPlatforms = Object.entries(stats.platformStreams).sort(([, a], [, b]) => b - a);
  const maxPlatformStreams = sortedPlatforms[0]?.[1] ?? 1;

  const STATUS_COLOR: Record<string, string> = { pending: "text-yellow-400", approved: "text-green-400", rejected: "text-red-400" };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-white font-bold text-2xl">Platform Analytics</h1>
        <p className="text-white/40 text-sm mt-1">Live overview across all artists and releases.</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users size={16} />}     label="Artists"     value={stats.totalArtists}               sub="unique emails" />
        <StatCard icon={<Music size={16} />}     label="Releases"    value={stats.totalReleases}              sub={`${stats.pendingReleases} pending`} />
        <StatCard icon={<BarChart2 size={16} />} label="Total Streams" value={fmt(stats.totalStreams)}        sub="across all platforms" color="#1db954" />
        <StatCard icon={<DollarSign size={16} />} label="Royalties Paid" value={`$${stats.totalRoyalties.toFixed(2)}`} sub="USD total" color="#16a34a" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<TrendingUp size={16} />} label="Approved"    value={stats.approvedReleases} color="#16a34a" />
        <StatCard icon={<Music size={16} />}      label="Pending"     value={stats.pendingReleases}  color="#f59e0b" />
        <StatCard icon={<Music size={16} />}      label="Rejected"    value={stats.rejectedReleases} color="#ef4444" />
        <StatCard icon={<Globe size={16} />}      label="Subscribers" value={stats.totalSubscribers} sub="newsletter" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Platform breakdown */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-white font-semibold text-sm mb-4">Streams by Platform</p>
          {sortedPlatforms.length === 0 ? (
            <p className="text-white/30 text-sm">No stream data yet.</p>
          ) : (
            <div className="space-y-3">
              {sortedPlatforms.map(([platform, count]) => (
                <div key={platform}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">{PLATFORM_LABELS[platform] ?? platform}</span>
                    <span className="text-white font-medium">{fmt(count)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06]">
                    <div
                      className="h-1.5 rounded-full bg-[#007bff]"
                      style={{ width: `${(count / maxPlatformStreams) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent releases */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-white font-semibold text-sm mb-4">Recent Submissions</p>
          <div className="space-y-3">
            {stats.recentReleases.map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white text-xs font-medium truncate">{r.song_title}</p>
                  <p className="text-white/40 text-xs">{r.artist_name}</p>
                </div>
                <span className={`text-xs font-semibold capitalize flex-shrink-0 ${STATUS_COLOR[r.status] ?? "text-white/40"}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
