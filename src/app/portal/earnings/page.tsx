"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, DollarSign, BarChart2, TrendingUp, ExternalLink, Download, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { PlatformIcon } from "@/components/PlatformIcon";
import { getPlatform } from "@/lib/platforms";

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
type PayoutRequest = { id: string; song_title: string; amount_usd: number; status: "pending" | "paid" | "rejected"; payout_method: string | null; created_at: string; paid_at: string | null; admin_notes: string | null };


function fmt(n: number) {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : n.toString();
}

type PayoutState = "idle" | "confirm" | "loading" | "sent";

export default function EarningsPage() {
  const [releases, setReleases]       = useState<Release[]>([]);
  const [splits, setSplits]           = useState<Record<string, Split[]>>({});
  const [payouts, setPayouts]         = useState<PayoutRequest[]>([]);
  const [loading, setLoading]         = useState(true);
  const [payoutStates, setPayoutStates] = useState<Record<string, PayoutState>>({});
  const [hasPayoutDetails, setHasPayoutDetails] = useState(false);
  const [userEmail, setUserEmail]     = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const email = data.session.user.email!;

        setUserEmail(email);

      const [relRes, payRes, profileRes] = await Promise.all([
        supabase
          .from("releases")
          .select("id, song_title, release_type, genre, cover_art_url, streams, royalties_usd, store_links, status")
          .eq("email", email)
          .eq("status", "approved")
          .order("submitted_at", { ascending: false }),
        supabase
          .from("payout_requests")
          .select("id, song_title, amount_usd, status, payout_method, created_at, paid_at, admin_notes")
          .eq("email", email)
          .order("created_at", { ascending: false }),
        supabase
          .from("artist_profiles")
          .select("payout_method")
          .eq("email", email)
          .maybeSingle(),
      ]);

      setHasPayoutDetails(!!profileRes.data?.payout_method);

      const list = (relRes.data ?? []) as Release[];
      setReleases(list);
      setPayouts((payRes.data ?? []) as PayoutRequest[]);

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

  async function handlePayout(r: Release) {
    setPayoutStates((s) => ({ ...s, [r.id]: "loading" }));
    try {
      const { data: profile } = await supabase
        .from("artist_profiles")
        .select("payout_method,bank_name,bank_account_name,bank_account_number,bank_country,paypal_email,mobile_money_provider,mobile_money_number,artist_name")
        .eq("email", userEmail)
        .maybeSingle();

      await supabase.from("payout_requests").insert({
        email: userEmail,
        artist_name: profile?.artist_name ?? "",
        song_title: r.song_title,
        release_id: r.id,
        amount_usd: r.royalties_usd ?? 0,
        payout_method: profile?.payout_method ?? null,
        bank_name: profile?.bank_name ?? null,
        bank_account_name: profile?.bank_account_name ?? null,
        bank_account_number: profile?.bank_account_number ?? null,
        bank_country: profile?.bank_country ?? null,
        paypal_email: profile?.paypal_email ?? null,
        mobile_money_provider: profile?.mobile_money_provider ?? null,
        mobile_money_number: profile?.mobile_money_number ?? null,
        status: "pending",
      });

      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payout-request",
          data: { email: userEmail, artist_name: profile?.artist_name ?? "", song_title: r.song_title, royalties_usd: r.royalties_usd, release_id: r.id, payout_method: profile?.payout_method ?? null },
        }),
      });

      fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "payout-confirmation", data: { email: userEmail, artist_name: profile?.artist_name ?? "", song_title: r.song_title, amount_usd: r.royalties_usd ?? 0 } }),
      }).catch(() => {});

      setPayoutStates((s) => ({ ...s, [r.id]: "sent" }));
    } catch {
      setPayoutStates((s) => ({ ...s, [r.id]: "idle" }));
    }
  }

  if (loading) return (
    <section className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="skeleton h-8 w-48 rounded-xl" />
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
      <div className="skeleton h-48 rounded-2xl" />
      <div className="skeleton h-64 rounded-2xl" />
    </section>
  );

  const totalStreams   = releases.reduce((s, r) => s + Object.values(r.streams ?? {}).reduce((a, b) => a + b, 0), 0);
  const totalEarnings = releases.reduce((s, r) => s + (r.royalties_usd ?? 0), 0);

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-white font-bold text-2xl flex items-center gap-2"><DollarSign size={22} /> Earnings</h1>
          <p className="text-white/40 text-sm mt-1">Revenue breakdown across all your approved releases.</p>
        </div>
        {releases.length > 0 && (
          <button
            onClick={() => {
              const rows = releases.map((r) => ({
                Release: r.song_title,
                Type: r.release_type,
                Genre: r.genre,
                Status: r.status,
                "Total Streams": Object.values(r.streams ?? {}).reduce((a, b) => a + b, 0),
                ...Object.fromEntries(Object.entries(r.streams ?? {}).map(([k, v]) => [`Streams – ${k}`, v])),
                "Royalties (USD)": r.royalties_usd ?? 0,
              }));
              const keys = Object.keys(rows[0]);
              const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
              const csv = [keys.join(","), ...rows.map((row) => keys.map((k) => esc((row as Record<string, unknown>)[k])).join(","))].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `orinlabi-earnings-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(a.href);
            }}
            className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex-shrink-0"
          >
            <Download size={14} /> Export CSV
          </button>
        )}
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

                {/* Stream breakdown with platform icons + animated bars */}
                {r.streams && Object.keys(r.streams).length > 0 && (() => {
                  const sortedPlatforms = Object.entries(r.streams)
                    .filter(([, v]) => v > 0)
                    .sort(([, a], [, b]) => b - a);
                  const maxPlatformStreams = sortedPlatforms[0]?.[1] ?? 1;
                  return (
                    <div className="px-5 py-4 border-b border-white/[0.04]">
                      <p className="text-white/30 text-xs uppercase tracking-widest mb-3">By Platform</p>
                      <div className="space-y-2.5">
                        {sortedPlatforms.map(([platform, count]) => {
                          const plt = getPlatform(platform);
                          return (
                            <div key={platform} className="flex items-center gap-3">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: `${plt.color}22`, color: plt.color }}
                              >
                                <PlatformIcon platformKey={platform} size={14} />
                              </div>
                              <span className="text-white/60 text-xs w-24 flex-shrink-0 truncate">{plt.label}</span>
                              <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-700 ease-out"
                                  style={{ width: `${(count / maxPlatformStreams) * 100}%`, background: plt.color }}
                                />
                              </div>
                              <span className="text-white/60 text-xs w-12 text-right flex-shrink-0 font-medium tabular-nums">
                                {fmt(count)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

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
                    {(() => {
                      const ps = payoutStates[r.id] ?? "idle";
                      if (ps === "sent") return (
                        <div className="flex items-center gap-2 text-green-400 text-xs">
                          <CheckCircle2 size={13} /> Payout request sent — we&apos;ll reach out within 3–5 business days.
                        </div>
                      );
                      if (ps === "confirm") return (
                        <div className="space-y-2">
                          {!hasPayoutDetails && (
                            <p className="text-yellow-400/80 text-xs">
                              No payout method on file.{" "}
                              <Link href="/portal/profile" className="underline">Add one in your profile</Link> first.
                            </p>
                          )}
                          <p className="text-white/70 text-xs">Request <span className="text-white font-semibold">${r.royalties_usd!.toFixed(2)}</span> for &quot;{r.song_title}&quot;?</p>
                          <div className="flex gap-2">
                            <button onClick={() => handlePayout(r)} className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors">
                              <Send size={11} /> Confirm
                            </button>
                            <button onClick={() => setPayoutStates((s) => ({ ...s, [r.id]: "idle" }))} className="text-white/40 hover:text-white text-xs px-3 py-1.5 rounded-full border border-white/10 transition-colors">Cancel</button>
                          </div>
                        </div>
                      );
                      if (ps === "loading") return (
                        <div className="flex items-center gap-2 text-white/40 text-xs">
                          <Loader2 size={12} className="animate-spin" /> Submitting…
                        </div>
                      );
                      return (
                        <button
                          onClick={() => setPayoutStates((s) => ({ ...s, [r.id]: "confirm" }))}
                          className="flex items-center gap-1.5 text-green-400 hover:text-green-300 text-xs font-semibold transition-colors"
                        >
                          <DollarSign size={13} /> Request payout
                        </button>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Payout history */}
      {payouts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-white font-bold text-lg mb-4">Payout History</h2>
          <div className="space-y-3">
            {payouts.map((p) => {
              const statusStyle = p.status === "paid"
                ? { label: "Paid", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" }
                : p.status === "rejected"
                ? { label: "Rejected", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" }
                : { label: "Pending", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" };
              return (
                <div key={p.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{p.song_title}</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {p.payout_method ? p.payout_method.replace(/_/g, " ") : "—"} · Requested {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    {p.paid_at && <p className="text-green-400/60 text-xs mt-0.5">Paid {new Date(p.paid_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>}
                    {p.admin_notes && <p className="text-white/30 text-xs mt-1 italic">{p.admin_notes}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-white font-bold">${p.amount_usd.toFixed(2)}</p>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest ${statusStyle.bg} ${statusStyle.color}`}>{statusStyle.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
