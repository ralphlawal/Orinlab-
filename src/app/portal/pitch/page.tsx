"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Loader2, CheckCircle2, ChevronDown, Radio, Tv, Mic2,
  Globe, Music2, Newspaper, ChevronRight, ArrowLeft,
} from "lucide-react";
import Link from "next/link";

type Release = { id: string; song_title: string; artist_name: string; genre: string; status: string };

const MOODS   = ["Energetic", "Chill", "Romantic", "Sad", "Party", "Inspirational", "Late Night", "Workout", "Focus", "Road Trip", "Heartbreak", "Uplifting"];
const TARGETS = {
  playlist: ["Spotify Editorial", "Apple Music Editorial", "Deezer Editorial", "Independent Curators", "YouTube Playlist", "Genre Playlists", "Gospel Playlists", "Mood Playlists"],
  radio:    ["BBC 1Xtra", "Capital XTRA", "Beats 1 (Apple Music)", "SiriusXM", "iHeartRadio", "COLORS Berlin", "NTS Radio", "Rinse FM"],
  blog:     ["The FADER", "Pitchfork", "Notion Magazine", "Complex", "Audiomack Blog", "Boomplay Blog", "Ones To Watch", "Pigeons & Planes"],
  sync:     ["Film & TV Licensing", "Advertising / Brand Sync", "Sports Broadcast", "Netflix / Prime / Hulu", "Video Game Soundtrack", "Documentary Features"],
  social:   ["TikTok Viral Push", "Instagram Reels", "YouTube Shorts", "Facebook Push", "Twitter / X Trending"],
};

type PitchType = "playlist" | "radio" | "blog" | "sync" | "social";

const PITCH_TYPES: { key: PitchType; icon: React.ElementType; label: string; desc: string; color: string }[] = [
  { key: "playlist", icon: Music2,     label: "Playlist Pitching",    desc: "Get added to curated playlists on Spotify, Apple Music & more.", color: "text-green-400 bg-green-400/10 border-green-400/20" },
  { key: "radio",    icon: Radio,      label: "Radio Promotion",       desc: "Pitch to radio stations across the UK, US, and worldwide.",      color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  { key: "blog",     icon: Newspaper,  label: "Blog & Press",          desc: "Get features, reviews and interviews in top music publications.",  color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  { key: "sync",     icon: Tv,         label: "Sync Licensing",        desc: "License your music for film, TV, ads, and streaming shows.",       color: "text-[#007bff] bg-[#007bff]/10 border-[#007bff]/20" },
  { key: "social",   icon: Mic2,       label: "Social Media Push",     desc: "Viral campaign across TikTok, Instagram Reels, and Shorts.",      color: "text-pink-400 bg-pink-400/10 border-pink-400/20" },
];

export default function PromotePage() {
  const [releases, setReleases]     = useState<Release[]>([]);
  const [loading, setLoading]       = useState(true);
  const [email, setEmail]           = useState("");
  const [artistName, setArtistName] = useState("");

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

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      setEmail(data.session.user.email!);
      const { data: rls } = await supabase
        .from("releases")
        .select("id, song_title, genre, status, artist_name")
        .eq("email", data.session.user.email!)
        .in("status", ["approved", "pending"])
        .order("submitted_at", { ascending: false });
      const list = (rls ?? []) as Release[];
      setReleases(list);
      if (list.length > 0) {
        setReleaseId(list[0].id);
        setArtistName(list[0].artist_name);
      }
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
    const release = releases.find((r) => r.id === releaseId);
    await supabase.from("playlist_pitches").insert({
      email,
      artist_name: artistName,
      release_id: releaseId,
      song_title:  release?.song_title ?? "",
      genre:       release?.genre ?? null,
      mood:        mood || null,
      pitch_notes: `[${pitchType.toUpperCase()}] Targets: ${targets.join(", ") || "Open"}\nSimilar Artists: ${similarArtists || "N/A"}\n\n${notes.trim()}`,
      status: "pending",
    });
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
  }

  if (loading) return (
    <section className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="skeleton h-5 w-24 rounded-lg" />
      <div className="skeleton h-8 w-56 rounded-xl" />
      <div className="skeleton h-32 rounded-2xl" />
      {[0, 1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
    </section>
  );

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
            className="text-[#007bff] text-sm border border-[#007bff]/30 px-4 py-2 rounded-xl hover:bg-[#007bff]/10 transition-colors">
            Submit Another
          </button>
          <Link href="/portal" className="text-white/40 text-sm hover:text-white transition-colors px-4 py-2">
            Back to Releases
          </Link>
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
      <div className="mb-8">
        <h1 className="text-white font-bold text-2xl mb-1">Promotion Hub</h1>
        <p className="text-white/40 text-sm">Choose a promotion service to pitch your music.</p>
      </div>
      <div className="space-y-3">
        {PITCH_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => selectType(t.key)}
            className="w-full flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-white/[0.14] rounded-2xl p-5 text-left transition-all group"
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
          <label className="block text-white/40 text-xs uppercase tracking-widest mb-2">Release</label>
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
            <label className="block text-white/40 text-xs uppercase tracking-widest mb-2">
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
            <label className="block text-white/40 text-xs uppercase tracking-widest mb-2">Mood / Vibe</label>
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
          <label className="block text-white/40 text-xs uppercase tracking-widest mb-2">Similar Artists</label>
          <input
            type="text"
            placeholder="e.g. Burna Boy, Wizkid, Davido"
            value={similarArtists}
            onChange={(e) => setSimilarArtists(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl transition-colors"
          />
        </div>

        {/* Pitch notes */}
        <div>
          <label className="block text-white/40 text-xs uppercase tracking-widest mb-2">
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
            className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl resize-none transition-colors"
          />
        </div>

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
