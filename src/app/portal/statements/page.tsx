"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  FileText, TrendingUp, Music2, Download, DollarSign, BarChart3,
  ChevronDown, ChevronUp,
} from "lucide-react";

type Release = {
  id: string;
  song_title: string;
  release_type: string;
  genre: string;
  cover_art_url: string | null;
  royalties_usd: number | null;
  streams: Record<string, number> | null;
  submitted_at: string;
  distribution_stage: string | null;
  status: string;
};

function formatUsd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

function totalStreams(streams: Record<string, number> | null) {
  if (!streams) return 0;
  return Object.values(streams).reduce((a, b) => a + b, 0);
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function StatementsPage() {
  const router   = useRouter();
  const [releases, setReleases]   = useState<Release[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push("/portal/login"); return; }
      const { data: rel } = await supabase
        .from("releases")
        .select("id, song_title, release_type, genre, cover_art_url, royalties_usd, streams, submitted_at, distribution_stage, status")
        .eq("email", data.session.user.email!)
        .order("submitted_at", { ascending: false });
      setReleases((rel ?? []) as Release[]);
      setLoading(false);
    });
  }, [router]);

  const totals = useMemo(() => {
    const royalties = releases.reduce((sum, r) => sum + (r.royalties_usd ?? 0), 0);
    const streams   = releases.reduce((sum, r) => sum + totalStreams(r.streams), 0);
    const live      = releases.filter((r) => r.distribution_stage === "live").length;
    return { royalties, streams, live };
  }, [releases]);

  // Group releases by quarter based on submitted_at
  const byQuarter = useMemo(() => {
    const map: Record<string, Release[]> = {};
    for (const r of releases) {
      const d = new Date(r.submitted_at);
      const q = Math.floor(d.getMonth() / 3) + 1;
      const key = `Q${q} ${d.getFullYear()}`;
      (map[key] ??= []).push(r);
    }
    return Object.entries(map);
  }, [releases]);

  function downloadCsv() {
    const header = "Title,Type,Genre,Streams,Royalties (USD),Status\n";
    const rows = releases.map((r) =>
      [
        `"${r.song_title.replace(/"/g, '""')}"`,
        r.release_type,
        r.genre,
        totalStreams(r.streams),
        (r.royalties_usd ?? 0).toFixed(2),
        r.status,
      ].join(",")
    );
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `orinlabi-royalty-statement-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="h-8 w-48 rounded-xl bg-white/[0.06] animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-white/[0.04] animate-pulse" />)}
        </div>
        <div className="h-64 rounded-2xl bg-white/[0.04] animate-pulse" />
      </section>
    );
  }

  const earningReleases = releases.filter((r) => (r.royalties_usd ?? 0) > 0 || totalStreams(r.streams) > 0);

  return (
    <section className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-white font-bold text-2xl flex items-center gap-2">
            <FileText size={22} className="text-[#34d399]" />
            Royalty Statements
          </h1>
          <p className="text-white/40 text-sm mt-1">Your earnings and streaming data across all releases.</p>
        </div>
        {releases.length > 0 && (
          <button
            onClick={downloadCsv}
            className="flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white border border-white/[0.08] hover:border-white/20 px-3.5 py-2 rounded-xl transition-colors flex-shrink-0"
          >
            <Download size={13} />
            Export CSV
          </button>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center">
          <DollarSign size={18} className="text-[#34d399] mx-auto mb-2 opacity-70" />
          <p className="text-white font-bold text-2xl tabular-nums">{formatUsd(totals.royalties)}</p>
          <p className="text-white/35 text-xs mt-1">Total Royalties</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center">
          <BarChart3 size={18} className="text-[#60a5fa] mx-auto mb-2 opacity-70" />
          <p className="text-white font-bold text-2xl tabular-nums">{fmtNum(totals.streams)}</p>
          <p className="text-white/35 text-xs mt-1">Total Streams</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center">
          <TrendingUp size={18} className="text-[#f472b6] mx-auto mb-2 opacity-70" />
          <p className="text-white font-bold text-2xl tabular-nums">{totals.live}</p>
          <p className="text-white/35 text-xs mt-1">Live Releases</p>
        </div>
      </div>

      {releases.length === 0 ? (
        <div className="text-center py-20 text-white/25">
          <FileText size={40} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm">No releases yet. Submit your first release to start earning.</p>
        </div>
      ) : (
        <>
          {/* Earnings per release */}
          {earningReleases.length > 0 && (
            <div className="mb-8">
              <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">
                Earnings by Release
              </p>
              <div className="space-y-2">
                {earningReleases.map((r) => {
                  const royalties = r.royalties_usd ?? 0;
                  const streams   = totalStreams(r.streams);
                  const isOpen    = expanded === r.id;
                  const streamBreakdown = r.streams ? Object.entries(r.streams).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a) : [];

                  return (
                    <div key={r.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                      <button
                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors"
                        onClick={() => setExpanded(isOpen ? null : r.id)}
                      >
                        <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden bg-white/[0.06] flex items-center justify-center">
                          {r.cover_art_url
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={r.cover_art_url} alt="" className="w-full h-full object-cover" />
                            : <Music2 size={15} className="text-white/20" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{r.song_title}</p>
                          <p className="text-white/35 text-xs">{r.release_type} · {r.genre}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[#34d399] font-bold text-sm tabular-nums">{formatUsd(royalties)}</p>
                          <p className="text-white/35 text-xs tabular-nums">{fmtNum(streams)} streams</p>
                        </div>
                        <div className="ml-2 text-white/25">
                          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </button>

                      {isOpen && streamBreakdown.length > 0 && (
                        <div className="px-4 pb-4 border-t border-white/[0.05]">
                          <p className="text-white/25 text-[10px] uppercase tracking-widest font-semibold pt-3 pb-2">Stream Breakdown</p>
                          <div className="space-y-1.5">
                            {streamBreakdown.map(([platform, count]) => {
                              const pct = streams > 0 ? (count / streams) * 100 : 0;
                              return (
                                <div key={platform} className="flex items-center gap-3">
                                  <span className="text-white/45 text-xs w-28 flex-shrink-0 capitalize">{platform.replace(/_/g, " ")}</span>
                                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-[#60a5fa]"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="text-white/50 text-xs tabular-nums w-14 text-right">{fmtNum(count)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All releases grouped by quarter */}
          <div>
            <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">
              All Submissions
            </p>
            <div className="space-y-6">
              {byQuarter.map(([quarter, qReleases]) => {
                const qRoyalties = qReleases.reduce((s, r) => s + (r.royalties_usd ?? 0), 0);
                const qStreams   = qReleases.reduce((s, r) => s + totalStreams(r.streams), 0);
                return (
                  <div key={quarter}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/50 text-xs font-bold">{quarter}</p>
                      <p className="text-white/30 text-xs tabular-nums">
                        {qStreams > 0 ? `${fmtNum(qStreams)} streams · ` : ""}
                        {formatUsd(qRoyalties)}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {qReleases.map((r) => (
                        <div key={r.id}
                          className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                          <div className="w-7 h-7 rounded-lg flex-shrink-0 overflow-hidden bg-white/[0.05] flex items-center justify-center">
                            {r.cover_art_url
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={r.cover_art_url} alt="" className="w-full h-full object-cover" />
                              : <Music2 size={11} className="text-white/20" />}
                          </div>
                          <span className="flex-1 text-white/70 text-xs font-medium truncate">{r.song_title}</span>
                          {(r.royalties_usd ?? 0) > 0 && (
                            <span className="text-[#34d399] text-xs font-bold tabular-nums flex-shrink-0">
                              {formatUsd(r.royalties_usd!)}
                            </span>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${
                            r.distribution_stage === "live"
                              ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/[0.08]"
                              : r.status === "approved"
                              ? "text-[#60a5fa] border-[#60a5fa]/20 bg-[#60a5fa]/[0.06]"
                              : r.status === "rejected"
                              ? "text-rose-400 border-rose-400/20 bg-rose-400/[0.07]"
                              : "text-yellow-400 border-yellow-400/20 bg-yellow-400/[0.07]"
                          }`}>
                            {r.distribution_stage === "live" ? "Live" : r.status === "approved" ? "Approved" : r.status === "rejected" ? "Not selected" : "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-10 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
            <p className="text-white/25 text-xs leading-relaxed">
              Royalty figures are updated by OrinlabÍ Records based on DSP reports. Streams and royalties may take 30–90 days to reflect after a release goes live. For queries about your earnings, contact{" "}
              <a href="mailto:info@orinlabi.com" className="text-[#007bff] hover:underline">info@orinlabi.com</a>.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
