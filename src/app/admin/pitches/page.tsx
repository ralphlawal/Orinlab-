"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase"; // used for auth.getSession()
import { usePinGate } from "@/context/AdminPinContext";
import { Loader2, Radio, Music2, Newspaper, Tv, Mic2, ChevronRight, Link2, CheckCircle2, X } from "lucide-react";

type Pitch = {
  id: string;
  email: string;
  artist_name: string;
  song_title: string;
  genre: string | null;
  mood: string | null;
  pitch_notes: string | null;
  status: "pending" | "submitted" | "placed" | "declined";
  admin_notes: string | null;
  placement_url: string | null;
  created_at: string;
};

type PitchType = "PLAYLIST" | "RADIO" | "BLOG" | "SYNC" | "SOCIAL";

const TYPE_CONFIG: Record<PitchType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PLAYLIST: { label: "Playlist",  color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20",  icon: <Music2 size={13} /> },
  RADIO:    { label: "Radio",     color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20", icon: <Radio size={13} /> },
  BLOG:     { label: "Blog/Press",color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20", icon: <Newspaper size={13} /> },
  SYNC:     { label: "Sync",      color: "text-[#007bff]",  bg: "bg-[#007bff]/10 border-[#007bff]/20",   icon: <Tv size={13} /> },
  SOCIAL:   { label: "Social",    color: "text-pink-400",   bg: "bg-pink-400/10 border-pink-400/20",     icon: <Mic2 size={13} /> },
};

const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  submitted: { label: "Submitted", color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20"    },
  placed:    { label: "Placed ✓",  color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20"  },
  declined:  { label: "Declined",  color: "text-red-400",    bg: "bg-red-400/10 border-red-400/20"      },
};

function parsePitchNotes(raw: string | null): { type: PitchType | null; targets: string; similar: string; notes: string } {
  if (!raw) return { type: null, targets: "", similar: "", notes: "" };
  const typeMatch = raw.match(/^\[([A-Z]+)\]/);
  const type = (typeMatch?.[1] as PitchType) ?? null;
  const body = raw.replace(/^\[[A-Z]+\]\s*/, "");
  const targetsMatch = body.match(/^Targets:\s*(.+?)(?:\n|$)/m);
  const similarMatch = body.match(/^Similar Artists:\s*(.+?)(?:\n|$)/m);
  const notesPart = body.replace(/^Targets:.*$/m, "").replace(/^Similar Artists:.*$/m, "").trim();
  return {
    type,
    targets: targetsMatch?.[1]?.trim() ?? "",
    similar: similarMatch?.[1]?.trim() ?? "",
    notes: notesPart,
  };
}

function detectPlatform(url: string): { name: string; color: string } | null {
  try { new URL(url); } catch { return null; }
  if (url.includes("spotify.com"))      return { name: "Spotify",     color: "#1DB954" };
  if (url.includes("music.apple.com"))  return { name: "Apple Music", color: "#FC3C44" };
  if (url.includes("deezer.com"))       return { name: "Deezer",      color: "#A238FF" };
  if (url.includes("youtube.com") || url.includes("youtu.be")) return { name: "YouTube", color: "#FF0000" };
  if (url.includes("audiomack.com"))    return { name: "Audiomack",   color: "#F5A623" };
  if (url.includes("boomplay.com"))     return { name: "Boomplay",    color: "#FF6B35" };
  if (url.includes("soundcloud.com"))   return { name: "SoundCloud",  color: "#FF5500" };
  if (url.startsWith("http"))           return { name: "Link",        color: "#007bff" };
  return null;
}

export default function PitchesPage() {
  const { requestUnlock } = usePinGate();
  const adminEmailRef = useRef<string>("");
  const [pitches, setPitches]       = useState<Pitch[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<Pitch | null>(null);
  const [adminNotes, setAdminNotes]     = useState("");
  const [status, setStatus]             = useState<Pitch["status"]>("pending");
  const [modalPlacementUrl, setModalPlacementUrl] = useState("");
  const [saving, setSaving]             = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | Pitch["status"]>("all");
  const [typeFilter, setTypeFilter]     = useState<"all" | PitchType>("all");

  // Record Placement panel
  const [showPlacement, setShowPlacement]       = useState(false);
  const [placementUrl, setPlacementUrl]         = useState("");
  const [placementPitchId, setPlacementPitchId] = useState("");
  const [placementNotes, setPlacementNotes]     = useState("");
  const [placementOutcome, setPlacementOutcome] = useState<"submitted" | "placed" | "declined">("submitted");
  const [recording, setRecording]               = useState(false);
  const [recordDone, setRecordDone]             = useState(false);

  function adminHeaders(): HeadersInit {
    return { "Content-Type": "application/json", "x-admin-email": adminEmailRef.current };
  }

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/pitches", { headers: { "x-admin-email": adminEmailRef.current } });
    if (res.ok) {
      const { pitches: data } = await res.json();
      setPitches((data ?? []) as Pitch[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      adminEmailRef.current = data.session?.user?.email ?? "";
      load();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function open(p: Pitch) {
    setSelected(p);
    setAdminNotes(p.admin_notes ?? "");
    setStatus(p.status);
    setModalPlacementUrl(p.placement_url ?? "");
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    await fetch(`/api/admin/pitches?id=${selected.id}`, {
      method: "PATCH",
      headers: adminHeaders(),
      body: JSON.stringify({ status, admin_notes: adminNotes, placement_url: modalPlacementUrl.trim() || null }),
    });
    setSaving(false);
    setSelected(null);
    load();
  }

  async function recordPlacement() {
    if (!placementPitchId || !placementUrl.trim()) return;
    setRecording(true);
    const pitch = pitches.find((p) => p.id === placementPitchId);
    await fetch(`/api/admin/pitches?id=${placementPitchId}`, {
      method: "PATCH",
      headers: adminHeaders(),
      body: JSON.stringify({
        status: placementOutcome,
        placement_url: placementOutcome !== "declined" ? placementUrl.trim() : null,
        ...(placementNotes.trim() ? { admin_notes: placementNotes.trim() } : {}),
      }),
    });
    // In-app notification + email for the artist
    if (pitch) {
      const notifMap = {
        submitted: {
          type: "info" as const,
          title: "Your pitch is being reviewed",
          body: `"${pitch.song_title}" has been submitted to a playlist curator and is currently pending their decision.`,
        },
        placed: {
          type: "success" as const,
          title: "Your song was placed! 🎉",
          body: `"${pitch.song_title}" has been placed on a playlist. Check your pitch history to see the link.`,
        },
        declined: {
          type: "warning" as const,
          title: "Pitch update for your song",
          body: `A curator has passed on "${pitch.song_title}" this time. We'll keep pitching — check your pitch history for details.`,
        },
      };
      const notif = notifMap[placementOutcome];
      await supabase.from("notifications").insert({
        email: pitch.email,
        link: "/portal/pitch",
        ...notif,
      });

      const emailTypeMap = { submitted: "pitch-submitted", placed: "pitch-placed", declined: "pitch-declined" };
      fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: emailTypeMap[placementOutcome],
          data: {
            email:        pitch.email,
            artist_name:  pitch.artist_name,
            song_title:   pitch.song_title,
            placement_url: placementOutcome !== "declined" ? placementUrl.trim() : undefined,
            admin_note:   placementNotes.trim() || undefined,
          },
        }),
      }).catch(() => {});
    }
    setRecording(false);
    setRecordDone(true);
    await load();
    setTimeout(() => {
      setRecordDone(false);
      setShowPlacement(false);
      setPlacementUrl("");
      setPlacementPitchId("");
      setPlacementNotes("");
      setPlacementOutcome("submitted");
    }, 2500);
  }

  const filtered = pitches.filter((p) => {
    const { type } = parsePitchNotes(p.pitch_notes);
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (typeFilter !== "all" && type !== typeFilter) return false;
    return true;
  });

  const pendingCount = pitches.filter((p) => p.status === "pending").length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-white font-bold text-2xl">Promotion Pitches</h1>
          <p className="text-white/40 text-sm mt-1">
            Review and action artist promotion pitch submissions.
            {pendingCount > 0 && <span className="ml-2 text-yellow-400 font-semibold">{pendingCount} pending</span>}
          </p>
        </div>
        <button
          onClick={() => { setShowPlacement(!showPlacement); setRecordDone(false); }}
          className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Link2 size={14} /> Record Placement
        </button>
      </div>

      {/* ── Record Placement panel ─────────────────────────────────────────── */}
      {showPlacement && (
        <div className="bg-[#0d0d10] border border-green-500/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm flex items-center gap-2">
                <Link2 size={14} className="text-green-400" /> Record a Placement
              </p>
              <p className="text-white/35 text-xs mt-0.5">
                Paste the playlist link from Spotify, Apple Music, or any platform — then pick which artist&apos;s pitch it matches.
              </p>
            </div>
            <button onClick={() => setShowPlacement(false)} className="text-white/25 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          {recordDone ? (
            <div className="flex items-center gap-3 bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3.5">
              <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
              <div>
                <p className="text-green-400 font-semibold text-sm">Saved & artist notified!</p>
                <p className="text-white/40 text-xs mt-0.5">The artist has been notified in-app.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Outcome selector */}
              <div>
                <label className="text-white/35 text-[10px] uppercase tracking-widest block mb-1.5">What happened with this pitch?</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: "submitted", label: "Pending", sub: "Submitted, awaiting curator decision", color: "border-blue-400/40 bg-blue-400/10 text-blue-400" },
                    { key: "placed",    label: "Approved", sub: "Curator accepted the song",           color: "border-green-400/40 bg-green-400/10 text-green-400" },
                    { key: "declined",  label: "Declined", sub: "Curator passed on it",               color: "border-red-400/40 bg-red-400/10 text-red-400" },
                  ] as const).map(({ key, label, sub, color }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPlacementOutcome(key)}
                      className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border text-center transition-all ${
                        placementOutcome === key ? color : "border-white/[0.08] text-white/30 hover:text-white/60 hover:border-white/20"
                      }`}
                    >
                      <span className="text-xs font-bold">{label}</span>
                      <span className="text-[10px] leading-tight opacity-70">{sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* URL input — hidden for declined */}
              {placementOutcome !== "declined" && (
                <div>
                  <label className="text-white/35 text-[10px] uppercase tracking-widest block mb-1.5">
                    {placementOutcome === "placed" ? "Playlist URL" : "Platform / Submission URL"}
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder={placementOutcome === "placed" ? "https://open.spotify.com/playlist/…" : "https://pitchplaylists.com/…"}
                      value={placementUrl}
                      onChange={(e) => setPlacementUrl(e.target.value)}
                      className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-green-500/50 outline-none text-white placeholder-white/20 text-sm px-3 py-2.5 rounded-xl transition-colors pr-28"
                    />
                    {(() => {
                      const platform = placementUrl ? detectPlatform(placementUrl) : null;
                      return platform ? (
                        <span
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2.5 py-1 rounded-full"
                          style={{ background: platform.color + "22", color: platform.color, border: `1px solid ${platform.color}44` }}
                        >
                          {platform.name}
                        </span>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}

              {/* Pitch selector */}
              <div>
                <label className="text-white/35 text-[10px] uppercase tracking-widest block mb-1.5">Which artist&apos;s pitch is this for?</label>
                <select
                  value={placementPitchId}
                  onChange={(e) => setPlacementPitchId(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-green-500/50 outline-none text-white text-sm px-3 py-2.5 rounded-xl transition-colors"
                >
                  <option value="">— Select artist &amp; song —</option>
                  {pitches
                    .filter((p) => p.status !== "declined")
                    .map((p) => {
                      const { type } = parsePitchNotes(p.pitch_notes);
                      const typeName = type ? type.charAt(0) + type.slice(1).toLowerCase() : "Pitch";
                      return (
                        <option key={p.id} value={p.id}>
                          {p.artist_name} — {p.song_title} ({typeName}){p.status === "placed" ? " ✓ placed" : p.status === "submitted" ? " · submitted" : ""}
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Optional note to artist */}
              <div>
                <label className="text-white/35 text-[10px] uppercase tracking-widest block mb-1.5">
                  Note to artist <span className="text-white/20 normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder={
                    placementOutcome === "placed"   ? "e.g. You're on Lofi Summer Beats — great work!" :
                    placementOutcome === "declined" ? "e.g. We're pitching to more curators next week" :
                    "e.g. Submitted to Spotify Editorial — decision in 5–7 days"
                  }
                  value={placementNotes}
                  onChange={(e) => setPlacementNotes(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-green-500/50 outline-none text-white placeholder-white/20 text-sm px-3 py-2.5 rounded-xl transition-colors"
                />
              </div>

              <button
                onClick={() => requestUnlock(recordPlacement)}
                disabled={
                  recording ||
                  !placementPitchId ||
                  (placementOutcome !== "declined" && (!placementUrl.trim() || !detectPlatform(placementUrl)))
                }
                className={`flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-40 ${
                  placementOutcome === "placed"   ? "bg-green-500 hover:bg-green-400" :
                  placementOutcome === "declined" ? "bg-red-500/80 hover:bg-red-500" :
                  "bg-[#007bff] hover:bg-[#0066dd]"
                }`}
              >
                {recording ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                {recording ? "Saving…" : "Save & Notify Artist"}
              </button>
            </>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "pending", "submitted", "placed", "declined"] as const).map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors ${
                statusFilter === f ? "bg-[#007bff] text-white" : "text-white/40 hover:text-white bg-white/[0.04]"
              }`}>
              {f === "all" ? "All Status" : f}
            </button>
          ))}
        </div>
        <div className="w-px bg-white/[0.06] self-stretch" />
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setTypeFilter("all")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              typeFilter === "all" ? "bg-white/10 text-white" : "text-white/40 hover:text-white bg-white/[0.04]"
            }`}>
            All Types
          </button>
          {(Object.entries(TYPE_CONFIG) as [PitchType, typeof TYPE_CONFIG[PitchType]][]).map(([key, cfg]) => (
            <button key={key} onClick={() => setTypeFilter(key)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                typeFilter === key ? `${cfg.bg} ${cfg.color} border` : "text-white/40 hover:text-white bg-white/[0.04]"
              }`}>
              {cfg.icon} {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={26} className="text-[#007bff] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30">No pitches found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => {
            const { type } = parsePitchNotes(p.pitch_notes);
            const typeCfg = type ? TYPE_CONFIG[type] : null;
            const statusCfg = STATUS_CONFIG[p.status];
            const date = new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
            return (
              <div key={p.id}
                onClick={() => open(p)}
                className="bg-[#0d0d10] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl px-5 py-4 cursor-pointer transition-all hover:bg-[#111114] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#007bff]/10 flex items-center justify-center flex-shrink-0">
                    {typeCfg ? (
                      <span className={typeCfg.color}>{typeCfg.icon}</span>
                    ) : (
                      <Radio size={15} className="text-[#007bff]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold text-sm truncate">{p.song_title}</p>
                      {typeCfg && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeCfg.bg} ${typeCfg.color}`}>
                          {typeCfg.icon} {typeCfg.label}
                        </span>
                      )}
                    </div>
                    <p className="text-white/40 text-xs mt-0.5">{p.artist_name} · {p.genre ?? "—"} · {date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {p.status === "placed" && p.placement_url && (
                    <a
                      href={p.placement_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-full hover:bg-green-400/20 transition-colors"
                    >
                      <Link2 size={9} /> View
                    </a>
                  )}
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                  <ChevronRight size={14} className="text-white/20" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail panel */}
      {selected && (() => {
        const parsed = parsePitchNotes(selected.pitch_notes);
        const typeCfg = parsed.type ? TYPE_CONFIG[parsed.type] : null;
        const submittedDate = new Date(selected.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-5 border-b border-white/[0.06]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white font-bold text-base truncate">{selected.song_title}</p>
                    <p className="text-white/40 text-sm mt-0.5">{selected.artist_name} · {selected.email}</p>
                  </div>
                  {typeCfg && (
                    <span className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${typeCfg.bg} ${typeCfg.color}`}>
                      {typeCfg.icon} {typeCfg.label}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Meta */}
                <div className="grid grid-cols-2 gap-3">
                  {selected.genre && (
                    <div>
                      <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Genre</p>
                      <p className="text-white/80 text-sm">{selected.genre}</p>
                    </div>
                  )}
                  {selected.mood && (
                    <div>
                      <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Mood</p>
                      <p className="text-white/80 text-sm">{selected.mood}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Submitted</p>
                    <p className="text-white/80 text-sm">{submittedDate}</p>
                  </div>
                </div>

                {/* Targets */}
                {parsed.targets && parsed.targets !== "Open" && (
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Targets</p>
                    <div className="flex flex-wrap gap-1.5">
                      {parsed.targets.split(",").map((t) => (
                        <span key={t.trim()} className="bg-white/[0.05] border border-white/[0.08] text-white/70 text-xs px-2.5 py-1 rounded-full">
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Similar Artists */}
                {parsed.similar && parsed.similar !== "N/A" && (
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Similar Artists</p>
                    <p className="text-white/70 text-sm">{parsed.similar}</p>
                  </div>
                )}

                {/* Notes */}
                {parsed.notes && (
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5">Pitch Notes</p>
                    <p className="text-white/70 text-sm leading-relaxed bg-white/[0.03] rounded-xl p-3 whitespace-pre-wrap">{parsed.notes}</p>
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="text-white/30 text-[10px] uppercase tracking-widest block mb-1.5">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as Pitch["status"])}
                    className="w-full bg-white/[0.05] border border-white/[0.10] outline-none text-white text-sm px-3 py-2 rounded-xl">
                    {(["pending", "submitted", "placed", "declined"] as const).map((s) => (
                      <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                    ))}
                  </select>
                </div>

                {/* Placement URL */}
                <div>
                  <label className="text-white/30 text-[10px] uppercase tracking-widest block mb-1.5">Placement URL</label>
                  <div className="relative">
                    <input
                      type="url"
                      value={modalPlacementUrl}
                      onChange={(e) => setModalPlacementUrl(e.target.value)}
                      placeholder="https://open.spotify.com/playlist/…"
                      className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-3 py-2 rounded-xl transition-colors pr-24"
                    />
                    {(() => {
                      const platform = modalPlacementUrl ? detectPlatform(modalPlacementUrl) : null;
                      return platform ? (
                        <span
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: platform.color + "22", color: platform.color, border: `1px solid ${platform.color}44` }}
                        >
                          {platform.name}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  {modalPlacementUrl && detectPlatform(modalPlacementUrl) && (
                    <a href={modalPlacementUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-green-400 text-xs mt-1.5 hover:underline">
                      <Link2 size={10} /> Open link
                    </a>
                  )}
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="text-white/30 text-[10px] uppercase tracking-widest block mb-1.5">Admin Notes</label>
                  <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3}
                    placeholder="e.g. Submitted to AfroBeats Weekly — awaiting response"
                    className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-3 py-2.5 rounded-xl resize-none transition-colors"
                  />
                </div>
              </div>

              <div className="p-5 border-t border-white/[0.06] flex gap-3">
                <button onClick={() => requestUnlock(save)} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                  {saving && <Loader2 size={13} className="animate-spin" />} Save
                </button>
                <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white text-sm px-5 py-2.5 border border-white/10 rounded-xl transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
