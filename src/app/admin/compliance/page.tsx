"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  ShieldAlert, CheckCircle2, AlertTriangle, Loader2, Send, RefreshCw,
  User, FileText, Link2, DollarSign, Music2, Clock, Filter, ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type GapType = "profile" | "contract" | "store-links" | "payout" | "lyrics";

type ArtistGap = {
  email: string;
  artistName: string;
  photo: string | null;
  gaps: { type: GapType; label: string; detail: string; releaseId?: string; songTitle?: string }[];
};

type NudgeState = "idle" | "sending" | "done" | "error";

const GAP_META: Record<GapType, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  "profile":     { label: "Profile Incomplete",   icon: <User size={13} />,       color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20" },
  "contract":    { label: "Unsigned Contract",     icon: <FileText size={13} />,   color: "text-yellow-400",  bg: "bg-yellow-400/10",  border: "border-yellow-400/20" },
  "store-links": { label: "Missing Store Links",   icon: <Link2 size={13} />,      color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20" },
  "payout":      { label: "No Payout Details",     icon: <DollarSign size={13} />, color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/20" },
  "lyrics":      { label: "Missing Lyrics",        icon: <Music2 size={13} />,     color: "text-purple-400",  bg: "bg-purple-400/10",  border: "border-purple-400/20" },
};

const FILTER_OPTIONS: { value: GapType | "all"; label: string }[] = [
  { value: "all",         label: "All Issues" },
  { value: "contract",    label: "Unsigned Contracts" },
  { value: "payout",      label: "No Payout Details" },
  { value: "store-links", label: "Missing Store Links" },
  { value: "profile",     label: "Incomplete Profiles" },
  { value: "lyrics",      label: "Missing Lyrics" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompliancePage() {
  const [artists, setArtists]   = useState<ArtistGap[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<GapType | "all">("all");
  const [showFilter, setShowFilter] = useState(false);
  const [nudgeState, setNudgeState] = useState<Record<string, NudgeState>>({});
  const [nudgeMsg, setNudgeMsg]     = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);

    const [{ data: profiles }, { data: releases }] = await Promise.all([
      supabase
        .from("artist_profiles")
        .select("email,artist_name,artist_image_url,bio,country,instagram_handle,x_handle,tiktok_username,payout_method,royalties_usd")
        .eq("status", "approved")
        .not("email", "is", null),
      supabase
        .from("releases")
        .select("id,email,song_title,status,store_links,lyrics,royalties_usd,contract_signed_at")
        .eq("status", "approved"),
    ]);

    const releasesByEmail: Record<string, NonNullable<typeof releases>> = {};
    for (const r of releases ?? []) {
      if (!releasesByEmail[r.email]) releasesByEmail[r.email] = [];
      releasesByEmail[r.email]!.push(r);
    }

    const result: ArtistGap[] = [];

    for (const p of profiles ?? []) {
      const artistReleases = releasesByEmail[p.email] ?? [];
      const gaps: ArtistGap["gaps"] = [];

      // 1. Profile gaps
      const missingFields: string[] = [];
      if (!p.bio)             missingFields.push("bio");
      if (!p.artist_image_url) missingFields.push("photo");
      if (!p.country)         missingFields.push("country");
      if (!p.instagram_handle && !p.x_handle && !p.tiktok_username) missingFields.push("social link");
      if (missingFields.length > 0) {
        gaps.push({ type: "profile", label: "Profile Incomplete", detail: `Missing: ${missingFields.join(", ")}` });
      }

      // 2. Unsigned contracts
      const unsigned = artistReleases.filter(r => !r.contract_signed_at);
      for (const r of unsigned) {
        gaps.push({ type: "contract", label: "Unsigned Contract", detail: `"${r.song_title}" has no signed agreement`, releaseId: r.id, songTitle: r.song_title ?? undefined });
      }

      // 3. Missing store links
      const noLinks = artistReleases.filter(r => !r.store_links || Object.keys(r.store_links).length === 0);
      for (const r of noLinks) {
        gaps.push({ type: "store-links", label: "Missing Store Links", detail: `"${r.song_title}" has no streaming links`, songTitle: r.song_title ?? undefined });
      }

      // 4. Has royalties but no payout method
      const hasEarnings = artistReleases.some(r => Number(r.royalties_usd ?? 0) > 0);
      if (hasEarnings && !p.payout_method) {
        gaps.push({ type: "payout", label: "No Payout Details", detail: "Artist has earnings but hasn't added payout details" });
      }

      // 5. Missing lyrics (one per artist)
      const noLyrics = artistReleases.find(r => !r.lyrics);
      if (noLyrics) {
        gaps.push({ type: "lyrics", label: "Missing Lyrics", detail: `"${noLyrics.song_title}" has no lyrics`, songTitle: noLyrics.song_title ?? undefined });
      }

      if (gaps.length > 0) {
        result.push({
          email: p.email,
          artistName: p.artist_name ?? p.email,
          photo: p.artist_image_url ?? null,
          gaps,
        });
      }
    }

    // Sort by gap count desc
    result.sort((a, b) => b.gaps.length - a.gaps.length);
    setArtists(result);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function nudge(artist: ArtistGap, gapType: GapType, songTitle?: string) {
    const key = `${artist.email}-${gapType}-${songTitle ?? ""}`;
    setNudgeState(s => ({ ...s, [key]: "sending" }));

    const reminderType = gapType === "payout" ? "payout-details" : gapType as "profile" | "store-links" | "lyrics" | "contract";

    try {
      await Promise.all([
        fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "artist-reminder",
            data: {
              email: artist.email,
              artist_name: artist.artistName,
              song_title: songTitle,
              reminder_type: reminderType,
            },
          }),
        }),
        supabase.from("notifications").insert({
          email: artist.email,
          title: GAP_META[gapType].label,
          body: artist.gaps.find(g => g.type === gapType)?.detail ?? "Action required on your OrinlabÍ Records account.",
          type: "warning",
          read: false,
          created_at: new Date().toISOString(),
        }),
      ]);
      setNudgeState(s => ({ ...s, [key]: "done" }));
      setNudgeMsg(m => ({ ...m, [key]: "Reminder sent" }));
    } catch {
      setNudgeState(s => ({ ...s, [key]: "error" }));
      setNudgeMsg(m => ({ ...m, [key]: "Failed" }));
    }
  }

  async function nudgeAll() {
    const filtered = filter === "all" ? artists : artists.filter(a => a.gaps.some(g => g.type === filter));
    for (const artist of filtered) {
      const gaps = filter === "all" ? artist.gaps : artist.gaps.filter(g => g.type === filter);
      const firstGap = gaps[0];
      if (firstGap) await nudge(artist, firstGap.type, firstGap.songTitle);
      await new Promise(r => setTimeout(r, 150));
    }
  }

  const filtered = filter === "all"
    ? artists
    : artists.filter(a => a.gaps.some(g => g.type === filter));

  const totalGaps = artists.reduce((n, a) => n + a.gaps.length, 0);
  const gapCounts = artists.reduce((acc, a) => {
    for (const g of a.gaps) acc[g.type] = (acc[g.type] ?? 0) + 1;
    return acc;
  }, {} as Record<GapType, number>);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-white font-bold text-2xl flex items-center gap-2">
            <ShieldAlert size={22} className="text-amber-400" />
            Artist Compliance
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Artists who haven&apos;t completed required steps. Nudge them individually or all at once.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load()}
            className="flex items-center gap-1.5 text-white/30 hover:text-white border border-white/[0.08] hover:border-white/20 text-xs px-3 py-2 rounded-xl transition-colors"
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            onClick={nudgeAll}
            className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-400 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            <Send size={13} /> Nudge All
          </button>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(gapCounts) as [GapType, number][]).map(([type, count]) => {
          const meta = GAP_META[type];
          return (
            <button
              key={type}
              onClick={() => setFilter(f => f === type ? "all" : type)}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                filter === type ? `${meta.bg} ${meta.border} ${meta.color}` : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white/70"
              }`}
            >
              {meta.icon}
              {meta.label}
              <span className="ml-0.5 opacity-70">{count}</span>
            </button>
          );
        })}
        {filter !== "all" && (
          <button
            onClick={() => setFilter("all")}
            className="text-xs text-white/30 hover:text-white px-3 py-1.5 transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Filter dropdown (alternative) */}
      <div className="flex items-center justify-between">
        <p className="text-white/30 text-sm">
          {loading ? "Loading…" : `${filtered.length} artist${filtered.length !== 1 ? "s" : ""} · ${totalGaps} issue${totalGaps !== 1 ? "s" : ""}`}
        </p>
        <div className="relative">
          <button
            onClick={() => setShowFilter(v => !v)}
            className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs border border-white/[0.08] px-3 py-2 rounded-xl transition-colors"
          >
            <Filter size={12} />
            {filter === "all" ? "All Issues" : FILTER_OPTIONS.find(o => o.value === filter)?.label}
            <ChevronDown size={12} />
          </button>
          {showFilter && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-[#111] border border-white/[0.1] rounded-xl overflow-hidden z-10 shadow-xl">
              {FILTER_OPTIONS.map(o => (
                <button
                  key={o.value}
                  onClick={() => { setFilter(o.value); setShowFilter(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                    filter === o.value ? "text-white bg-white/[0.06]" : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Artist cards */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={26} className="text-[#007bff] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 space-y-2">
          <CheckCircle2 size={36} className="text-green-400 mx-auto" />
          <p className="text-white/60 font-semibold">All clear!</p>
          <p className="text-white/30 text-sm">No compliance issues for the current filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(artist => {
            const visibleGaps = filter === "all" ? artist.gaps : artist.gaps.filter(g => g.type === filter);
            return (
              <div key={artist.email} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                {/* Artist header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.04]">
                  {artist.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={artist.photo} alt={artist.artistName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-white/30" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{artist.artistName}</p>
                    <p className="text-white/35 text-xs">{artist.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      artist.gaps.length >= 3 ? "bg-red-400/10 text-red-400 border border-red-400/20" :
                      artist.gaps.length === 2 ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" :
                      "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                    }`}>
                      {artist.gaps.length} issue{artist.gaps.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Gaps */}
                <div className="divide-y divide-white/[0.03]">
                  {visibleGaps.map((gap, i) => {
                    const meta = GAP_META[gap.type];
                    const key = `${artist.email}-${gap.type}-${gap.songTitle ?? ""}`;
                    const state = nudgeState[key] ?? "idle";
                    const msg = nudgeMsg[key];
                    return (
                      <div key={i} className="flex items-center gap-3 px-5 py-3">
                        <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.bg} ${meta.border} ${meta.color} flex-shrink-0`}>
                          {meta.icon}
                          {meta.label}
                        </div>
                        <p className="flex-1 text-white/40 text-xs truncate">{gap.detail}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {state === "done" ? (
                            <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
                              <CheckCircle2 size={12} /> {msg}
                            </span>
                          ) : state === "error" ? (
                            <span className="flex items-center gap-1 text-red-400 text-xs">
                              <AlertTriangle size={12} /> {msg}
                            </span>
                          ) : (
                            <button
                              onClick={() => nudge(artist, gap.type, gap.songTitle)}
                              disabled={state === "sending"}
                              className="flex items-center gap-1 text-xs font-semibold text-white/50 hover:text-white border border-white/[0.1] hover:border-white/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                            >
                              {state === "sending"
                                ? <Loader2 size={11} className="animate-spin" />
                                : <Send size={11} />}
                              {state === "sending" ? "Sending…" : "Nudge"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      {!loading && artists.length > 0 && (
        <div className="border-t border-white/[0.05] pt-5">
          <p className="text-white/20 text-xs leading-relaxed">
            <strong className="text-white/35">Nudge</strong> — sends an email reminder and a portal notification to the artist for that specific issue.{" "}
            <strong className="text-white/35">Nudge All</strong> — sends one reminder per artist for their first unresolved issue. Refresh after sending to see what&apos;s still outstanding.
          </p>
        </div>
      )}
    </div>
  );
}
