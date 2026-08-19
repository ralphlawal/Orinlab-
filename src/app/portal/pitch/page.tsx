"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Loader2, CheckCircle2, ChevronDown, Radio, Tv, Mic2,
  Globe, Music2, Newspaper, ChevronRight, ArrowLeft, Clock, XCircle,
} from "lucide-react";
import Link from "next/link";

type Release = { id: string; song_title: string; artist_name: string; genre: string; status: string };

type PitchHistory = {
  id: string;
  song_title: string;
  genre: string | null;
  pitch_notes: string | null;
  status: "pending" | "submitted" | "placed" | "declined";
  admin_notes: string | null;
  created_at: string;
};

const MOODS   = ["Energetic", "Chill", "Romantic", "Sad", "Party", "Inspirational", "Late Night", "Workout", "Focus", "Road Trip", "Heartbreak", "Uplifting"];
const TARGETS = {
  playlist: ["Spotify Editorial", "Apple Music Editorial", "Deezer Editorial", "Independent Curators", "YouTube Playlist", "Genre Playlists", "Gospel Playlists", "Mood Playlists"],
  radio:    ["BBC 1Xtra", "Capital XTRA", "Beats 1 (Apple Music)", "SiriusXM", "iHeartRadio", "COLORS Berlin", "NTS Radio", "Rinse FM"],
  blog:     ["The FADER", "Pitchfork", "Notion Magazine", "Complex", "Audiomack Blog", "Boomplay Blog", "Ones To Watch", "Pigeons & Planes"],
  sync:     ["Film & TV Licensing", "Advertising / Brand Sync", "Sports Broadcast", "Netflix / Prime / Hulu", "Video Game Soundtrack", "Documentary Features"],
  social:   ["TikTok Viral Push", "Instagram Reels", "YouTube Shorts", "Facebook Push", "Twitter / X Trending"],
};

type PitchType = "playlist" | "radio" | "blog" | "sync" | "social";
type UpperPitchType = "PLAYLIST" | "RADIO" | "BLOG" | "SYNC" | "SOCIAL";

const PITCH_TYPES: { key: PitchType; icon: React.ElementType; label: string; desc: string; color: string }[] = [
  { key: "playlist", icon: Music2,     label: "Playlist Pitching",    desc: "Get added to curated playlists on Spotify, Apple Music & more.", color: "text-green-400 bg-green-400/10 border-green-400/20" },
  { key: "radio",    icon: Radio,      label: "Radio Promotion",       desc: "Pitch to radio stations across the UK, US, and worldwide.",      color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  { key: "blog",     icon: Newspaper,  label: "Blog & Press",          desc: "Get features, reviews and interviews in top music publications.",  color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  { key: "sync",     icon: Tv,         label: "Sync Licensing",        desc: "License your music for film, TV, ads, and streaming shows.",       color: "text-[#007bff] bg-[#007bff]/10 border-[#007bff]/20" },
  { key: "social",   icon: Mic2,       label: "Social Media Push",     desc: "Viral campaign across TikTok, Instagram Reels, and Shorts.",      color: "text-pink-400 bg-pink-400/10 border-pink-400/20" },
];

const TYPE_ICON: Record<UpperPitchType, { icon: React.ElementType; color: string }> = {
  PLAYLIST: { icon: Music2,    color: "text-green-400" },
  RADIO:    { icon: Radio,     color: "text-orange-400" },
  BLOG:     { icon: Newspaper, color: "text-purple-400" },
  SYNC:     { icon: Tv,        color: "text-[#007bff]" },
  SOCIAL:   { icon: Mic2,      color: "text-pink-400" },
};

const PITCH_STATUS = {
  pending:   { label: "Pending",   color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", icon: Clock },
  submitted: { label: "Submitted", color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20",     icon: CheckCircle2 },
  placed:    { label: "Placed",    color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20",   icon: CheckCircle2 },
  declined:  { label: "Declined",  color: "text-red-400",    bg: "bg-red-400/10 border-red-400/20",       icon: XCircle },
};

function parsePitchNotes(raw: string | null) {
  if (!raw) return { type: null as UpperPitchType | null, targets: "", notes: "" };
  const typeMatch = raw.match(/^\[([A-Z]+)\]/);
  const type = (typeMatch?.[1] as UpperPitchType) ?? null;
  const body = raw.replace(/^\[[A-Z]+\]\s*/, "");
  const targetsMatch = body.match(/^Targets:\s*(.+?)(?:\n|$)/m);
  const notesPart = body.replace(/^Targets:.*$/m, "").replace(/^Similar Artists:.*$/m, "").trim();
  return { type, targets: targetsMatch?.[1]?.trim() ?? "", notes: notesPart };
}

export default function PromotePage() {
  const [releases, setReleases]     = useState<Release[]>([]);
  const [pitches, setPitches]       = useState<PitchHistory[]>([]);
  const [loading, setLoading]       = useState(true);
  const [email, setEmail]           = useState("");
  const [artistName, setArtistName] = useState("");

  // Tab
  const [view, setView] = useState<"submit" | "history">("submit");

  // Form state
  const [step, setStep]           = useState<"select" | "form">("select");
  const [pitchType, setPitchType] = useState<PitchType | null>(null);
  const [releaseId, setReleaseId] = useState("");
  const [targets, setTargets]     = useState<string[]>([]);
  const [mood, setMood]           = useState("");
  const [notes, setNotes]         = useState("");
  const [similarArtists, setSimilarArtists] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]           = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [token, setToken] = useState("");

  // History detail
  const [selected, setSelected] = useState<PitchHistory | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const userEmail = data.session.user.email!;
      setEmail(userEmail);
      setToken(data.session.access_token);

      const [{ data: rls }, { data: pitchData }] = await Promise.all([
        supabase
          .from("releases")
          .select("id, song_title, genre, status, artist_name")
          .eq("email", userEmail)
          .neq("status", "rejected")
          .order("submitted_at", { ascending: false }),
        supabase
          .from("playlist_pitches")
          .select("id, song_title, genre, pitch_notes, status, admin_notes, created_at")
          .eq("email", userEmail)
          .order("created_at", { ascending: false }),
      ]);

      const list = (rls ?? []) as Release[];
      setReleases(list);
      if (list.length > 0) {
        setReleaseId(list[0].id);
        setArtistName(list[0].artist_name);
      }
      setPitches((pitchData ?? []) as PitchHistory[]);
      setLoading(false);
    });
  }, []);

  function selectType(key: PitchType) {
    setPitchType(key);
    setTargets([]);
    setStep("form");
  }

  function toggleTarget(t: string) {
    setTargets((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!releaseId || !pitchType || !notes.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    const release = releases.find((r) => r.id === releaseId);
    try {
      const pitchNotes = `[${pitchType.toUpperCase()}] Targets: ${targets.join(", ") || "Open"}\nSimilar Artists: ${similarArtists || "N/A"}\n\n${notes.trim()}`;
      const res = await fetch("/api/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          release_id: releaseId,
          artist_name: artistName,
          song_title: release?.song_title ?? "",
          genre: release?.genre ?? null,
          mood: mood || null,
          pitch_notes: pitchNotes,
        }),
      });
      if (!res.ok) { setSubmitError("Failed to submit your pitch. Please try again."); setSubmitting(false); return; }
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "pitch-submitted",
          data: {
            email, artist_name: artistName,
            song_title: release?.song_title ?? "",
            genre: release?.genre ?? null,
            mood: mood || null,
            pitch_type: pitchType,
            targets: targets.join(", "),
            pitch_notes: notes.trim(),
          },
        }),
      }).catch(() => {});
      fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "pitch-confirmation",
          data: { email, artist_name: artistName, song_title: release?.song_title ?? "" },
        }),
      }).catch(() => {});
      setSubmitting(false);
      setDone(true);
      // Refresh pitch history
      const { data: pitchData } = await supabase
        .from("playlist_pitches")
        .select("id, song_title, genre, pitch_notes, status, admin_notes, created_at")
        .eq("email", email)
        .order("created_at", { ascending: false });
      setPitches((pitchData ?? []) as PitchHistory[]);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading) return (
    <section className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="skeleton h-5 w-24 rounded-lg" />
      <div className="skeleton h-8 w-56 rounded-xl" />
      <div className="skeleton h-32 rounded-2xl" />
      {[0, 1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
    </section>
  );

  // ── Tab bar (always visible after loading) ──────────────────────────────────
  const TabBar = () => (
    <div className="flex gap-1 mb-8 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1 w-fit">
      {(["submit", "history"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => { setView(tab); if (tab === "submit") { setDone(false); setStep("select"); } }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
            view === tab
              ? "bg-[#007bff] text-white shadow-sm"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          {tab === "submit" ? "Submit Pitch" : `Pitch History${pitches.length > 0 ? ` (${pitches.length})` : ""}`}
        </button>
      ))}
    </div>
  );

  // ── History view ────────────────────────────────────────────────────────────
  if (view === "history") {
    return (
      <section className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-white font-bold text-2xl mb-1">Pitch History</h1>
          <p className="text-white/40 text-sm">All your promotion pitch submissions and their current status.</p>
        </div>
        <TabBar />

        {pitches.length === 0 ? (
          <div className="text-center py-20">
            <Radio size={36} className="text-white/10 mx-auto mb-4" />
            <p className="text-white font-semibold text-base mb-1">No pitches yet</p>
            <p className="text-white/40 text-sm mb-6">Submit a pitch to get your music featured on playlists, radio, and more.</p>
            <button onClick={() => setView("submit")}
              className="inline-flex items-center gap-2 bg-[#007bff] text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-[#0069d9] transition-colors">
              Submit Your First Pitch <ChevronRight size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {pitches.map((p) => {
              const parsed = parsePitchNotes(p.pitch_notes);
              const typeMeta = parsed.type ? TYPE_ICON[parsed.type] : null;
              const TypeIcon = typeMeta?.icon;
              const statusMeta = PITCH_STATUS[p.status] ?? PITCH_STATUS.pending;
              const StatusIcon = statusMeta.icon;
              const date = new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className="w-full flex items-center gap-4 bg-[#0d0d10] hover:bg-[#111114] border border-white/[0.07] hover:border-white/[0.14] rounded-2xl px-5 py-4 text-left transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeMeta ? "bg-white/[0.06]" : "bg-white/[0.04]"}`}>
                    {TypeIcon
                      ? <TypeIcon size={17} className={typeMeta?.color} />
                      : <Radio size={17} className="text-white/30" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{p.song_title}</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {parsed.type ? parsed.type.charAt(0) + parsed.type.slice(1).toLowerCase() : "Pitch"} · {p.genre ?? "—"} · {date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${statusMeta.bg} ${statusMeta.color}`}>
                      <StatusIcon size={11} />
                      {statusMeta.label}
                    </span>
                    <ChevronRight size={14} className="text-white/20" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Detail modal */}
        {selected && (() => {
          const parsed = parsePitchNotes(selected.pitch_notes);
          const statusMeta = PITCH_STATUS[selected.status] ?? PITCH_STATUS.pending;
          const StatusIcon = statusMeta.icon;
          const date = new Date(selected.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
          const typeMeta = parsed.type ? TYPE_ICON[parsed.type] : null;
          const TypeIcon = typeMeta?.icon;
          return (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#0d0d10] border border-white/[0.09] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto">
                <div className="p-5 border-b border-white/[0.07]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-white font-bold text-base truncate">{selected.song_title}</p>
                      <p className="text-white/40 text-xs mt-1">{date}</p>
                    </div>
                    <span className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${statusMeta.bg} ${statusMeta.color}`}>
                      <StatusIcon size={11} />
                      {statusMeta.label}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Type + genre */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {TypeIcon && (
                      <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] px-3 py-1.5 rounded-full">
                        <TypeIcon size={13} className={typeMeta?.color} />
                        <span className="text-white/70 text-xs font-medium">
                          {parsed.type ? parsed.type.charAt(0) + parsed.type.slice(1).toLowerCase() : ""}
                        </span>
                      </div>
                    )}
                    {selected.genre && (
                      <div className="bg-white/[0.05] border border-white/[0.08] px-3 py-1.5 rounded-full text-white/70 text-xs font-medium">
                        {selected.genre}
                      </div>
                    )}
                  </div>

                  {/* Targets */}
                  {parsed.targets && parsed.targets !== "Open" && (
                    <div>
                      <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Targets</p>
                      <div className="flex flex-wrap gap-1.5">
                        {parsed.targets.split(",").map((t) => (
                          <span key={t.trim()} className="bg-white/[0.05] border border-white/[0.08] text-white/60 text-xs px-2.5 py-1 rounded-full">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {parsed.notes && (
                    <div>
                      <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5">Your pitch</p>
                      <p className="text-white/70 text-sm leading-relaxed bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 whitespace-pre-wrap">{parsed.notes}</p>
                    </div>
                  )}

                  {/* Admin notes */}
                  {selected.admin_notes && (
                    <div className="bg-[#007bff]/[0.06] border border-[#007bff]/20 rounded-xl p-3">
                      <p className="text-[#007bff] text-[10px] uppercase tracking-widest mb-1.5 font-bold">Team note</p>
                      <p className="text-white/80 text-sm leading-relaxed">{selected.admin_notes}</p>
                    </div>
                  )}
                </div>

                <div className="p-5 border-t border-white/[0.07]">
                  <button onClick={() => setSelected(null)}
                    className="w-full text-white/50 hover:text-white text-sm font-medium py-2.5 border border-white/10 hover:border-white/20 rounded-xl transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </section>
    );
  }

  // ── Submit view ─────────────────────────────────────────────────────────────

  if (done) {
    const type = PITCH_TYPES.find((t) => t.key === pitchType);
    return (
      <section className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-green-400" />
        </div>
        <h1 className="text-white font-bold text-2xl mb-2">{type?.label} Submitted!</h1>
        <p className="text-white/50 text-sm leading-relaxed mb-6">
          Your pitch has been received. Our team will review it and get back to you within 3–5 business days.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setDone(false); setStep("select"); setPitchType(null); setNotes(""); setTargets([]); setSimilarArtists(""); setMood(""); }}
            className="text-[#007bff] text-sm border border-[#007bff]/30 px-4 py-2.5 rounded-xl hover:bg-[#007bff]/10 transition-colors">
            Submit Another
          </button>
          <button onClick={() => setView("history")}
            className="text-white/40 text-sm border border-white/10 hover:text-white hover:border-white/20 transition-colors px-4 py-2.5 rounded-xl">
            View History
          </button>
        </div>
      </section>
    );
  }

  if (releases.length === 0) return (
    <section className="max-w-lg mx-auto px-4 py-16 text-center">
      <Globe size={36} className="text-white/10 mx-auto mb-4" />
      <h1 className="text-white font-bold text-xl mb-2">No releases yet</h1>
      <p className="text-white/40 text-sm mb-6">Submit a release first to access promotion services.</p>
      <Link href="/portal/releases/new" className="inline-flex items-center gap-2 bg-[#007bff] text-white text-sm font-semibold px-5 py-3 rounded-xl">
        Submit a Release <ChevronRight size={14} />
      </Link>
    </section>
  );

  // Step 1 — pick pitch type
  if (step === "select") return (
    <section className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-white font-bold text-2xl mb-1">Promotion Hub</h1>
        <p className="text-white/40 text-sm">Choose a promotion service to pitch your music.</p>
      </div>
      <TabBar />
      <div className="space-y-3">
        {PITCH_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => selectType(t.key)}
            className="w-full flex items-center gap-4 bg-[#0d0d10] hover:bg-[#141418] border border-white/[0.07] hover:border-white/[0.14] rounded-2xl p-5 text-left transition-all group"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${t.color}`}>
              <t.icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">{t.label}</p>
              <p className="text-white/40 text-xs mt-0.5">{t.desc}</p>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </section>
  );

  // Step 2 — pitch form
  const type = PITCH_TYPES.find((t) => t.key === pitchType)!;
  const typeTargets = TARGETS[pitchType!] ?? [];

  return (
    <section className="max-w-2xl mx-auto px-4 py-10">
      <button onClick={() => setStep("select")} className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-7 transition-colors">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${type.color}`}>
          <type.icon size={20} />
        </div>
        <div>
          <h1 className="text-white font-bold text-xl">{type.label}</h1>
          <p className="text-white/40 text-xs mt-0.5">{type.desc}</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Release picker */}
        <div>
          <label className="block text-white/55 text-xs uppercase tracking-widest mb-2">Release</label>
          <div className="relative">
            <select value={releaseId} onChange={(e) => setReleaseId(e.target.value)}
              className="w-full appearance-none bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white text-sm px-4 py-3 rounded-xl transition-colors pr-9">
              {releases.map((r) => (
                <option key={r.id} value={r.id}>{r.song_title} — {r.genre}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>
        </div>

        {/* Target selection */}
        {typeTargets.length > 0 && (
          <div>
            <label className="block text-white/55 text-xs uppercase tracking-widest mb-2">
              Target {type.label.split(" ")[0]}s <span className="text-white/20">(select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {typeTargets.map((t) => (
                <button key={t} type="button" onClick={() => toggleTarget(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    targets.includes(t)
                      ? "bg-[#007bff]/20 border-[#007bff]/50 text-[#007bff]"
                      : "border-white/10 text-white/40 hover:text-white hover:border-white/30"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mood — playlist & social only */}
        {(pitchType === "playlist" || pitchType === "social") && (
          <div>
            <label className="block text-white/55 text-xs uppercase tracking-widest mb-2">Mood / Vibe</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button key={m} type="button" onClick={() => setMood(mood === m ? "" : m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    mood === m ? "bg-[#007bff]/20 border-[#007bff]/50 text-[#007bff]" : "border-white/10 text-white/40 hover:text-white hover:border-white/30"
                  }`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Similar artists */}
        <div>
          <label className="block text-white/55 text-xs uppercase tracking-widest mb-2">Similar Artists</label>
          <input
            type="text"
            placeholder="e.g. Burna Boy, Wizkid, Davido"
            value={similarArtists}
            onChange={(e) => setSimilarArtists(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl transition-colors"
          />
        </div>

        {/* Pitch notes */}
        <div>
          <label className="block text-white/55 text-xs uppercase tracking-widest mb-2">
            {pitchType === "sync" ? "Describe your music's mood and use case" :
             pitchType === "blog" ? "Your press story / artist bio" :
             "Why should this be featured?"} <span className="text-red-400">*</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            required
            placeholder={
              pitchType === "sync" ? "Describe the emotion, tempo, instruments. What kind of scene or ad would it suit?" :
              pitchType === "blog" ? "Tell your story — where you're from, your sound, what makes this release special…" :
              pitchType === "radio" ? "Why would listeners love this? Key streaming numbers, achievements, radio-ready qualities…" :
              "Describe the song's energy, what audience it speaks to, and why it fits these platforms…"
            }
            className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl resize-none transition-colors"
          />
        </div>

        {submitError && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{submitError}</p>
        )}
        <button
          type="submit"
          disabled={submitting || !notes.trim()}
          className="w-full flex items-center justify-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white font-semibold py-3.5 rounded-xl transition-colors"
        >
          {submitting && <Loader2 size={15} className="animate-spin" />}
          Submit {type.label} Pitch
        </button>
      </form>
    </section>
  );
}
