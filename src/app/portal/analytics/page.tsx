"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, BarChart2, TrendingUp, Music2, DollarSign, Globe } from "lucide-react";
import Link from "next/link";

type Release = {
  id: string;
  song_title: string;
  cover_art_url: string | null;
  streams: Record<string, number> | null;
  royalties_usd: number | null;
  release_date: string | null;
  created_at: string;
  status: string;
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function fmtUsd(n: number) {
  return `$${n.toFixed(2)}`;
}

function storeName(key: string) {
  const map: Record<string, string> = {
    spotify: "Spotify", apple_music: "Apple Music", tiktok: "TikTok",
    youtube: "YouTube Music", amazon: "Amazon Music", deezer: "Deezer",
    tidal: "Tidal", pandora: "Pandora", audiomack: "Audiomack",
    boomplay: "Boomplay", anghami: "Anghami", shazam: "Shazam",
  };
  return map[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function StreamChart({ releases }: { releases: Release[] }) {
  const sorted = [...releases].sort((a, b) =>
    new Date(a.release_date ?? a.created_at).getTime() - new Date(b.release_date ?? b.created_at).getTime()
  );
  const data = sorted.map((r) => ({
    label: r.song_title,
    value: r.streams ? Object.values(r.streams).reduce((s, v) => s + v, 0) : 0,
  }));
  const nonZero = data.filter((d) => d.value > 0);

  if (nonZero.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center gap-2">
        <BarChart2 size={28} className="text-white/10" />
        <p className="text-white/20 text-sm">Stream data will appear here once your music is live</p>
      </div>
    );
  }

  const W = 800;
  const H = 200;
  const pad = { left: 48, right: 16, top: 20, bottom: 28 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.value), 1);

  const pts = data.map((d, i) => ({
    x: pad.left + (data.length > 1 ? (i / (data.length - 1)) * cW : cW / 2),
    y: pad.top + (1 - d.value / max) * cH,
    label: d.label,
    value: d.value,
  }));

  function bezier(points: { x: number; y: number }[]) {
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    const parts = [`M ${points[0].x} ${points[0].y}`];
    for (let i = 1; i < points.length; i++) {
      const mx = (points[i].x + points[i - 1].x) / 2;
      parts.push(`C ${mx} ${points[i - 1].y}, ${mx} ${points[i].y}, ${points[i].x} ${points[i].y}`);
    }
    return parts.join(" ");
  }

  const linePath = bezier(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${pad.top + cH} L ${pts[0].x} ${pad.top + cH} Z`;

  const yLabels = [0, 0.5, 1].map((f) => ({
    y: pad.top + (1 - f) * cH,
    v: fmt(Math.round(f * max)),
  }));

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "192px" }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#007bff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#007bff" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="chartLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#007bff" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        {/* Grid */}
        {yLabels.map((t, i) => (
          <line key={i} x1={pad.left} x2={W - pad.right} y1={t.y} y2={t.y}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        {/* Y labels */}
        {yLabels.map((t, i) => (
          <text key={i} x={pad.left - 6} y={t.y + 4} textAnchor="end"
            fontSize="9" fill="rgba(255,255,255,0.2)">{t.v}</text>
        ))}
        {/* Area */}
        <path d={areaPath} fill="url(#chartFill)" />
        {/* Line */}
        <path d={linePath} fill="none" stroke="url(#chartLine)" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4.5" fill="#050505" stroke="#007bff" strokeWidth="2.5" />
        ))}
      </svg>
      {/* X axis labels */}
      <div className="flex mt-1" style={{ paddingLeft: `${(pad.left / W) * 100}%`, paddingRight: `${(pad.right / W) * 100}%` }}>
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            <p className="text-white/20 text-[10px] truncate px-1">{d.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [releases, setReleases] = useState<Release[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user?.email) { setLoading(false); return; }
      supabase
        .from("releases")
        .select("id, song_title, cover_art_url, streams, royalties_usd, release_date, created_at, status")
        .eq("artist_email", user.email)
        .order("release_date", { ascending: true, nullsFirst: false })
        .then(({ data }) => {
          setReleases(data ?? []);
          setLoading(false);
        });
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  const totalStreams = releases.reduce((sum, r) => {
    if (!r.streams) return sum;
    return sum + Object.values(r.streams).reduce((s, v) => s + v, 0);
  }, 0);

  const totalEarnings = releases.reduce((sum, r) => sum + (r.royalties_usd ?? 0), 0);

  const storeMap: Record<string, number> = {};
  for (const r of releases) {
    if (!r.streams) continue;
    for (const [store, count] of Object.entries(r.streams)) {
      storeMap[store] = (storeMap[store] ?? 0) + count;
    }
  }
  const stores = Object.entries(storeMap).sort((a, b) => b[1] - a[1]);
  const bestStore = stores[0]?.[0] ?? null;
  const storeMax = stores[0]?.[1] ?? 1;

  return (
    <div className="p-5 sm:p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-xl">Analytics & Trends</h1>
          <p className="text-white/35 text-sm mt-0.5">All-time streaming performance across your releases</p>
        </div>
        <Link
          href="/portal/earnings"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-white/40 hover:text-white border border-white/[0.08] hover:border-white/20 px-3 py-2 rounded-lg transition-all"
        >
          <DollarSign size={12} />
          Earnings & Payouts
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-[#007bff]/10 flex items-center justify-center">
              <BarChart2 size={13} className="text-[#007bff]" />
            </div>
            <p className="text-white/35 text-xs">Total Streams</p>
          </div>
          <p className="text-white text-2xl sm:text-3xl font-bold tracking-tight">{fmt(totalStreams)}</p>
          <p className="text-white/20 text-xs mt-1">All time</p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign size={13} className="text-emerald-400" />
            </div>
            <p className="text-white/35 text-xs">Total Earned</p>
          </div>
          <p className="text-white text-2xl sm:text-3xl font-bold tracking-tight">{fmtUsd(totalEarnings)}</p>
          <p className="text-white/20 text-xs mt-1">Before payouts</p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <TrendingUp size={13} className="text-purple-400" />
            </div>
            <p className="text-white/35 text-xs">Best Store</p>
          </div>
          <p className="text-white text-xl sm:text-2xl font-bold tracking-tight truncate">
            {bestStore ? storeName(bestStore) : "—"}
          </p>
          <p className="text-white/20 text-xs mt-1">
            {bestStore ? `${fmt(storeMap[bestStore])} streams` : "No data yet"}
          </p>
        </div>
      </div>

      {/* Performance chart */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold text-sm">Performance Data</h2>
            <p className="text-white/25 text-xs mt-0.5">Total streams per release</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-[2px] rounded-full" style={{ background: "linear-gradient(90deg,#007bff,#7c3aed)" }} />
              <span className="text-white/25 text-xs">{new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
        <StreamChart releases={releases} />
      </div>

      {/* Two columns: store breakdown + release list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Store breakdown */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Globe size={14} className="text-white/30" />
            <h2 className="text-white font-semibold text-sm">Store Breakdown</h2>
          </div>
          {stores.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-white/20 text-sm">No store data yet</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {stores.slice(0, 8).map(([store, count]) => (
                <div key={store} className="flex items-center gap-3">
                  <div className="w-24 flex-shrink-0">
                    <p className="text-white/50 text-xs truncate">{storeName(store)}</p>
                  </div>
                  <div className="flex-1 bg-white/[0.05] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(count / storeMax) * 100}%`,
                        background: "linear-gradient(90deg,#007bff,#7c3aed)",
                      }}
                    />
                  </div>
                  <div className="w-12 text-right flex-shrink-0">
                    <p className="text-white/40 text-xs">{fmt(count)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Release breakdown */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.05] flex items-center gap-2">
            <Music2 size={14} className="text-white/30" />
            <h2 className="text-white font-semibold text-sm">Releases</h2>
          </div>
          {releases.length === 0 ? (
            <div className="py-12 text-center px-5">
              <Music2 size={28} className="text-white/10 mx-auto mb-2" />
              <p className="text-white/25 text-sm mb-3">No releases yet</p>
              <Link
                href="/portal/releases/new"
                className="inline-flex items-center gap-1.5 text-xs text-[#007bff] hover:underline"
              >
                Submit your first release →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto">
              {releases.map((r) => {
                const streams = r.streams
                  ? Object.values(r.streams).reduce((s, v) => s + v, 0)
                  : 0;
                return (
                  <Link
                    key={r.id}
                    href={`/portal/releases/${r.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/[0.06] flex-shrink-0 flex items-center justify-center">
                      {r.cover_art_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.cover_art_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Music2 size={14} className="text-white/20" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{r.song_title}</p>
                      <p className="text-white/25 text-xs capitalize">{r.status}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white text-sm font-semibold">{fmt(streams)}</p>
                      <p className="text-white/25 text-xs">{fmtUsd(r.royalties_usd ?? 0)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Promote CTA */}
      <div
        className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: "linear-gradient(135deg,#007bff0d,#7c3aed0d)", border: "1px solid rgba(124,58,237,0.15)" }}
      >
        <div>
          <p className="text-white font-semibold text-sm">Want more streams?</p>
          <p className="text-white/40 text-xs mt-0.5">Boost your release with playlist pitching, promo videos & priority distribution.</p>
        </div>
        <Link
          href="/portal/services"
          className="flex-shrink-0 inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all"
          style={{ background: "linear-gradient(135deg,#007bff,#7c3aed)" }}
        >
          View Promotion Services
        </Link>
      </div>
    </div>
  );
}
