"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import {
  Loader2, Music2, CheckCircle2, Zap, Globe2,
  ChevronRight, MoreHorizontal, RefreshCw,
} from "lucide-react";
import Link from "next/link";

type Stage = "approved" | "in_distribution" | "live";

type Release = {
  id: string;
  artist_name: string;
  song_title: string;
  release_type: string;
  genre: string;
  cover_art_url: string | null;
  email: string;
  distribution_stage: string | null;
  submitted_at: string;
  release_date: string | null;
  distribution_priority: "standard" | "priority" | null;
};

const STAGES: { key: Stage; label: string; color: string; Icon: typeof CheckCircle2; desc: string }[] = [
  { key: "approved",        label: "Approved",        color: "#60a5fa", Icon: CheckCircle2, desc: "Ready to distribute" },
  { key: "in_distribution", label: "In Distribution", color: "#F59E0B", Icon: ChevronRight, desc: "Currently being pushed to DSPs" },
  { key: "live",            label: "Live",            color: "#10B981", Icon: Globe2,        desc: "Available on all platforms" },
];

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

export default function PipelinePage() {
  usePinGate();

  const [releases, setReleases]   = useState<Release[]>([]);
  const [loading, setLoading]     = useState(true);
  const [moving, setMoving]       = useState<string | null>(null);
  const [openMenu, setOpenMenu]   = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("releases")
      .select("id, artist_name, song_title, release_type, genre, cover_art_url, email, distribution_stage, submitted_at, release_date, distribution_priority")
      .eq("status", "approved")
      .order("submitted_at", { ascending: true });
    setReleases((data ?? []) as Release[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Close open menu on outside click
  useEffect(() => {
    if (!openMenu) return;
    function close() { setOpenMenu(null); }
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenu]);

  async function moveStage(release: Release, stage: Stage | null) {
    setMoving(release.id);
    setOpenMenu(null);

    const newStage = stage === "approved" ? null : stage;

    const adminEmail = (await supabase.auth.getSession()).data.session?.user?.email ?? "";

    const { error } = await supabase
      .from("releases")
      .update({ distribution_stage: newStage })
      .eq("id", release.id);

    if (!error) {
      // In-app notification to artist
      if (newStage) {
        await supabase.from("notifications").insert({
          email: release.email,
          type:  newStage === "live" ? "release_live" : "info",
          title: newStage === "live"
            ? `🎉 "${release.song_title}" is now live on all platforms!`
            : `Your release "${release.song_title}" is now in distribution.`,
          body: newStage === "live"
            ? "Your music is officially live! Share it with your fans."
            : "We are distributing your release to all streaming platforms. This may take a few days.",
          link: `/portal/releases/${release.id}`,
        });

        // Email the artist
        await fetch("/api/email", {
          method: "POST",
          headers: {
            "Content-Type":  "application/json",
            "x-admin-email": adminEmail,
          },
          body: JSON.stringify({
            type: "stage-update",
            data: {
              email:       release.email,
              artist_name: release.artist_name,
              song_title:  release.song_title,
              stage:       newStage,
              store_links: {},
            },
          }),
        }).catch(() => {});
      }

      setReleases((prev) => prev.map((r) => r.id === release.id ? { ...r, distribution_stage: newStage } : r));
    }

    setMoving(null);
  }

  function stageOf(r: Release): Stage {
    if (r.distribution_stage === "live") return "live";
    if (r.distribution_stage === "in_distribution") return "in_distribution";
    return "approved";
  }

  const columns: Record<Stage, Release[]> = {
    approved:        releases.filter((r) => stageOf(r) === "approved"),
    in_distribution: releases.filter((r) => stageOf(r) === "in_distribution"),
    live:            releases.filter((r) => stageOf(r) === "live"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-2xl">Distribution Pipeline</h1>
          <p className="text-white/40 text-sm mt-1">
            {releases.length} approved release{releases.length !== 1 ? "s" : ""} ·{" "}
            {columns.live.length} live · {columns.in_distribution.length} in transit
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 text-xs text-white/40 hover:text-white border border-white/[0.08] hover:border-white/20 px-3.5 py-2 rounded-xl transition-colors"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={28} className="text-[#007bff] animate-spin" />
        </div>
      ) : releases.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <Music2 size={36} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">No approved releases yet.</p>
          <p className="text-white/20 text-xs mt-1">Releases appear here once you approve them in the Releases section.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {STAGES.map(({ key, label, color, Icon, desc }) => {
            const cards = columns[key];
            return (
              <div key={key} className="flex flex-col gap-3">
                {/* Column header */}
                <div className="flex items-center gap-3 px-1">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{label}</p>
                    <p className="text-white/30 text-[10px]">{desc}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ color, background: `${color}15`, border: `1px solid ${color}25` }}>
                    {cards.length}
                  </span>
                </div>

                {/* Drop zone */}
                <div className="space-y-2 min-h-[120px] p-3 rounded-2xl border border-white/[0.05] bg-white/[0.015]">
                  {cards.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-white/15 text-xs">
                      No releases here
                    </div>
                  )}
                  {cards.map((r) => {
                    const isMoving = moving === r.id;
                    const isPriority = r.distribution_priority === "priority";

                    return (
                      <div key={r.id}
                        className={`bg-[#0a0a0a] border rounded-xl p-3.5 transition-all ${
                          isMoving ? "opacity-50 pointer-events-none" : "border-white/[0.07] hover:border-white/15"
                        }`}>
                        <div className="flex items-start gap-3">
                          {/* Cover */}
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/[0.06] flex-shrink-0 flex items-center justify-center">
                            {r.cover_art_url
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={r.cover_art_url} alt="" className="w-full h-full object-cover" />
                              : <Music2 size={14} className="text-white/20" />}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-1.5">
                              <p className="text-white/90 text-xs font-semibold truncate leading-tight">{r.song_title}</p>
                              {isPriority && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 flex-shrink-0">
                                  PRIO
                                </span>
                              )}
                            </div>
                            <p className="text-white/35 text-[10px] mt-0.5 truncate">{r.artist_name}</p>
                            <p className="text-white/20 text-[10px]">{r.release_type} · {r.genre}</p>
                            {r.release_date && (
                              <p className="text-white/25 text-[10px] mt-1">
                                Release: {new Date(r.release_date + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            )}
                          </div>

                          {/* Menu */}
                          <div className="relative flex-shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === r.id ? null : r.id); }}
                              disabled={isMoving}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white hover:bg-white/[0.06] transition-colors"
                            >
                              {isMoving ? <Loader2 size={12} className="animate-spin" /> : <MoreHorizontal size={14} />}
                            </button>

                            {openMenu === r.id && (
                              <div
                                className="absolute right-0 top-full mt-1 bg-[#0d0d0d] border border-white/[0.10] rounded-xl shadow-xl z-20 w-44 py-1 overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <p className="text-white/20 text-[10px] px-3 pt-2 pb-1 uppercase tracking-widest">Move to</p>
                                {STAGES.filter((s) => s.key !== key).map((s) => (
                                  <button
                                    key={s.key}
                                    onClick={() => moveStage(r, s.key)}
                                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-white/[0.05] transition-colors"
                                    style={{ color: s.color }}
                                  >
                                    <s.Icon size={12} />
                                    {s.label}
                                  </button>
                                ))}
                                <div className="border-t border-white/[0.06] mt-1 pt-1">
                                  <Link
                                    href={`/admin/releases?id=${r.id}`}
                                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-white/40 hover:text-white hover:bg-white/[0.05] transition-colors"
                                  >
                                    <Zap size={12} />
                                    Open Release
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3 flex items-center gap-1.5">
                          {STAGES.map((s, si) => {
                            const stageIdx = STAGES.findIndex((st) => st.key === key);
                            const active   = si <= stageIdx;
                            return (
                              <div key={s.key} className="flex-1 h-0.5 rounded-full transition-all"
                                style={{ background: active ? color : "rgba(255,255,255,0.07)" }} />
                            );
                          })}
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

      {/* Footer note */}
      <p className="text-white/15 text-xs text-center pb-2">
        Moving a release to "In Distribution" or "Live" sends the artist an in-app notification and email automatically.
      </p>
    </div>
  );
}
