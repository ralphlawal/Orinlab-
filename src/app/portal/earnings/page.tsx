"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, DollarSign, BarChart2, TrendingUp, ExternalLink } from "lucide-react";
import Link from "next/link";

type Release = {
  id: string;
  song_title: string;
  release_type: string;
  genre: string;
  cover_art_url: string | null;
  streams: Record<string, number> | null;
  royalties_usd: number | null;
  store_links: Record<string, string> | null;
  status: string;
};

type Split = { id: string; name: string; role: string | null; percentage: number };

const PLATFORM_COLORS: Record<string, string> = {
  spotify: "#1db954", apple_music: "#fc3c44", youtube_music: "#ff0000",
  boomplay: "#f5a623", audiomack: "#ffa500", deezer: "#a238ff",
  tidal: "#00ffff", amazon_music: "#00a8e1",
};

function fmt(n: number) {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : n.toString();
}

export default function EarningsPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [splits, setSplits]     = useState<Record<string, Split[]>>({});
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const { data: r } = await supabase
        .from("releases")
        .select("id, song_title, release_type, genre, cover_art_url, streams, royalties_usd, store_links, status")
        .eq("email", data.session.user.email!)
        .eq("status", "approved")
        .order("submitted_at", { ascending: false });

      const list = (r ?? []) as Release[];
      setReleases(list);

      if (list.length > 0) {
        const ids = list.map((x) => x.id);
        const { data: sp } = await supabase
          .from("royalty_splits")
          .select("id, release_id, name, role, percentage")
          .in("release_id", ids);
        const grouped: Record<string, Split[]> = {};
        for (const s of (sp ?? []) as (Split & { release_id: string })[]) {
          if (!grouped[s.release_id]) grouped[s.release_id] = [];
          grouped[s.release_id].push(s);
        }
        setSplits(grouped);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 size={26} className="text-[#007bff] animate-spin" /></div>;

  const totalStreams   = releases.reduce((s, r) => s + Object.values(r.streams ?? {}).reduce((a, b) => a + b, 0), 0);
  const totalEarnings = releases.reduce((s, r) => s + (r.royalties_usd ?? 0), 0);

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-white font-bold text-2xl flex items-center gap-2"><DollarSign size={22} /> Earnings</h1>
        <p className="text-white/40 text-sm mt-1">Revenue breakdown across all your approved releases.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <BarChart2 size={16} className="text-[#007bff] mb-2" />
          <p className="text-white font-bold text-2xl">{fmt(totalStreams)}</p>
          <p className="text-white/40 text-xs mt-0.5">Total Streams</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <TrendingUp size={16} className="text-green-400 mb-2" />
          <p className="text-white font-bold text-2xl">
            {totalEarnings > 0 ? `$${totalEarnings.toFixed(2)}` : "—"}
          </p>
          <p className="text-white/40 text-xs mt-0.5">Total Royalties</p>
        </div>
      </div>

      {releases.length === 0 ? (
        <div className="text-center py-16 text-white/30">No approved releases with earnings data yet.</div>
      ) : (
        <div className="space-y-4">
          {releases.map((r) => {
            const streamTotal = Object.values(r.streams ?? {}).reduce((a, b) => a + b, 0);
            const relSplits   = splits[r.id] ?? [];
            return (
              <div key={r.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-4 p-5 border-b border-white/[0.04]">
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden bg-white/[0.05]">
                    {r.cover_art_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={r.cover_art_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-[#007bff]/20 to-black" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{r.song_title}</p>
                    <p className="text-white/40 text-xs">{r.release_type} · {r.genre}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold">{r.royalties_usd ? `$${r.royalties_usd.toFixed(2)}` : "—"}</p>
                    <p className="text-white/30 text-xs">{fmt(streamTotal)} streams</p>
                  </div>
                </div>

                {/* Stream breakdown */}
                {r.streams && Object.keys(r.streams).length > 0 && (
                  <div className="px-5 py-3 border-b border-white/[0.04]">
                    <p className="text-white/30 text-xs uppercase tracking-widest mb-2">By Platform</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(r.streams).filter(([, v]) => v > 0).map(([platform, count]) => (
                        <span key={platform} className="text-xs px-2.5 py-1 rounded-full border"
                          style={{ color: PLATFORM_COLORS[platform] ?? "#007bff", borderColor: `${PLATFORM_COLORS[platform] ?? "#007bff"}30`, background: `${PLATFORM_COLORS[platform] ?? "#007bff"}10` }}>
                          {platform.replace(/_/g, " ")} · {fmt(count)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Royalty splits */}
                {relSplits.length > 0 && (
                  <div className="px-5 py-3 border-b border-white/[0.04]">
                    <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Royalty Splits</p>
                    <div className="space-y-1">
                      {relSplits.map((s) => (
                        <div key={s.id} className="flex items-center justify-between text-xs">
                          <span className="text-white/60">{s.name}{s.role ? ` (${s.role})` : ""}</span>
                          <span className="text-white font-semibold">{s.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                {r.store_links && Object.keys(r.store_links).length > 0 && (
                  <div className="px-5 py-3 flex items-center justify-between">
                    <span className="text-white/30 text-xs">Available on {Object.keys(r.store_links).length} platforms</span>
                    <Link href={`/listen/${r.id}`} target="_blank"
                      className="flex items-center gap-1 text-[#007bff] text-xs hover:underline">
                      Smart link <ExternalLink size={11} />
                    </Link>
                  </div>
                )}

                {/* Payout CTA */}
                {(r.royalties_usd ?? 0) > 0 && (
                  <div className="px-5 py-3 border-t border-white/[0.04]">
                    <Link href={`/portal/releases/${r.id}`}
                      className="text-green-400 text-xs hover:underline">
                      Request payout →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
