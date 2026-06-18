"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Radio, CheckCircle2, ChevronDown } from "lucide-react";
import Link from "next/link";

type Release = { id: string; song_title: string; genre: string; status: string };

const MOODS = ["Energetic", "Chill", "Romantic", "Sad", "Party", "Inspirational", "Afrobeats Vibes", "Late Night", "Workout", "Focus"];

export default function PitchPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading]   = useState(true);
  const [releaseId, setReleaseId] = useState("");
  const [mood, setMood]           = useState("");
  const [pitchNotes, setPitchNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]           = useState(false);
  const [email, setEmail]         = useState("");
  const [artistName, setArtistName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      setEmail(data.session.user.email!);
      const { data: releases } = await supabase
        .from("releases")
        .select("id, song_title, genre, status, artist_name")
        .eq("email", data.session.user.email!)
        .eq("status", "approved")
        .order("submitted_at", { ascending: false });
      const list = (releases ?? []) as (Release & { artist_name: string })[];
      setReleases(list);
      if (list.length > 0) {
        setReleaseId(list[0].id);
        setArtistName(list[0].artist_name);
      }
      setLoading(false);
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!releaseId || !pitchNotes.trim()) return;
    setSubmitting(true);
    const release = releases.find((r) => r.id === releaseId);
    await supabase.from("playlist_pitches").insert({
      email,
      artist_name: artistName,
      release_id: releaseId,
      song_title: release?.song_title ?? "",
      genre: release?.genre ?? null,
      mood: mood || null,
      pitch_notes: pitchNotes.trim(),
      status: "pending",
    });
    setSubmitting(false);
    setDone(true);
  }

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 size={26} className="text-[#007bff] animate-spin" />
    </div>
  );

  if (done) return (
    <section className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 size={32} className="text-green-400" />
      </div>
      <h1 className="text-white font-bold text-2xl mb-2">Pitch Submitted!</h1>
      <p className="text-white/50 text-sm leading-relaxed mb-8">
        We&apos;ve received your playlist pitch and will review it shortly. You&apos;ll be notified of any updates.
      </p>
      <Link href="/portal" className="text-[#007bff] text-sm hover:underline">← Back to releases</Link>
    </section>
  );

  if (releases.length === 0) return (
    <section className="max-w-lg mx-auto px-4 py-16 text-center">
      <Radio size={36} className="text-white/10 mx-auto mb-4" />
      <p className="text-white/50 text-sm">You need at least one approved release to submit a playlist pitch.</p>
      <Link href="/portal" className="text-[#007bff] text-sm mt-4 inline-block hover:underline">← Back</Link>
    </section>
  );

  return (
    <section className="max-w-lg mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <Radio size={18} className="text-purple-400" />
          </div>
          <h1 className="text-white font-bold text-2xl">Playlist Pitch</h1>
        </div>
        <p className="text-white/40 text-sm">Submit one of your approved releases for playlist consideration. We&apos;ll review and pitch it to curators on your behalf.</p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Release</label>
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

        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Mood / Vibe</label>
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

        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Why should this be playlisted? <span className="text-red-400">*</span>
          </label>
          <textarea value={pitchNotes} onChange={(e) => setPitchNotes(e.target.value)} rows={5} required
            placeholder="Describe the song's energy, target audience, similar artists, what playlists would be a good fit…"
            className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl resize-none transition-colors"
          />
        </div>

        <button type="submit" disabled={submitting || !pitchNotes.trim()}
          className="w-full flex items-center justify-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white font-semibold py-3.5 rounded-xl transition-colors">
          {submitting && <Loader2 size={15} className="animate-spin" />}
          Submit Pitch
        </button>
      </form>
    </section>
  );
}
