"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Upload, CheckCircle2, AlertCircle, Loader2, ArrowLeft,
  Music2, Plus, Trash2, Save,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const genres = [
  "Afrobeats", "Afropop", "Highlife", "Amapiano", "Afro-soul", "Afro-fusion",
  "Afrohouse", "Kuduro", "Bongo Flava", "Jùjú", "Afrofolk", "R&B",
  "Hip-Hop", "Gospel", "Reggae", "Electronic", "Jazz", "Classical", "Other",
];

const languages = [
  "English", "Yoruba", "Igbo", "Hausa", "Nigerian Pidgin", "French",
  "Portuguese", "Swahili", "Amharic", "Zulu", "Twi / Akan", "Afrikaans",
  "Arabic", "Wolof", "Somali", "Other",
];

const trackVersions = [
  "Original", "Radio Edit", "Remix", "Acoustic", "Instrumental",
  "Extended Mix", "Live", "Alternate Version", "Cover", "Other",
];

type ArtistProfile = {
  artist_name: string;
  email: string;
};

type Track = { title: string; file: File | null; version: string; explicit: boolean; instrumental: boolean };

type FormState = "idle" | "uploading" | "saving" | "success" | "error";

const DRAFT_KEY = "orinlabi_release_draft";

function readDraft(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  try { const s = localStorage.getItem(DRAFT_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}

function clearDraftStorage() {
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
}

export default function NewReleasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromId = searchParams.get("from");
  // Read draft once on mount (lazy init — runs before any render)
  const [draft] = useState<Record<string, string> | null>(() => readDraft());
  const draftWasRestored = !!(draft && (draft.songTitle || draft.genre || draft.songwriters));
  const formRef = useRef<HTMLFormElement>(null);
  const draftStateRef = useRef<{ samplesUsed: boolean; coverSong: boolean; featuredArtists: { name: string; spotify_id: string; apple_id: string }[]; tracks: Track[] }>({
    samplesUsed: draft?._samplesUsed === "true",
    coverSong: draft?._coverSong === "true",
    featuredArtists: (() => { try { return draft?._featuredArtists ? JSON.parse(draft._featuredArtists) : []; } catch { return []; } })(),
    tracks: (() => { try { const t = draft?._tracks ? JSON.parse(draft._tracks) : null; return t?.length ? t.map((tr: { title: string; version: string; explicit: boolean; instrumental: boolean }) => ({ title: tr.title ?? "", file: null, version: tr.version ?? "Original", explicit: tr.explicit ?? false, instrumental: tr.instrumental ?? false })) : null; } catch { return null; } })() ?? [{ title: "", file: null, version: "Original", explicit: false, instrumental: false }],
  });
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [releaseType, setReleaseType] = useState(draft?.releaseType ?? "Single");
  const [genre, setGenre] = useState(draft?.genre ?? "");
  const [language, setLanguage] = useState(draft?.language ?? "");
  const [explicitContent, setExplicitContent] = useState(draft?.explicit ?? "Clean");
  const [trackVersion, setTrackVersion] = useState(draft?.trackVersion ?? "Original");
  // Single mode: one file
  const [audioFile, setAudioFile] = useState<File | null>(null);
  // Album/EP mode: multiple tracks
  const [tracks, setTracks] = useState<Track[]>(draftStateRef.current.tracks);
  const [uploadProgress, setUploadProgress] = useState("");
  const [samplesUsed, setSamplesUsed] = useState(draftStateRef.current.samplesUsed);
  const [coverSong, setCoverSong] = useState(draftStateRef.current.coverSong);
  const [artworkError, setArtworkError] = useState("");
  const [selectedStores, setSelectedStores] = useState<"all" | string[]>("all");
  const [youtubeContentId, setYoutubeContentId] = useState(false);
  const [featuredArtists, setFeaturedArtists] = useState<{ name: string; spotify_id: string; apple_id: string }[]>(draftStateRef.current.featuredArtists);
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);
  const [newLyrics, setNewLyrics] = useState(draft?.lyrics ?? "");
  const [newVideoUrl, setNewVideoUrl] = useState(draft?.music_video_url ?? "");
  const [newSongStory, setNewSongStory] = useState(draft?.song_story ?? "");
  const [newMixingEngineer, setNewMixingEngineer] = useState(draft?.mixing_engineer ?? "");
  const [newMasteringEngineer, setNewMasteringEngineer] = useState(draft?.mastering_engineer ?? "");

  const isMultiTrack = releaseType === "Album" || releaseType === "EP" || releaseType === "Compilation";

  function saveDraft() {
    const fd = formRef.current ? new FormData(formRef.current) : null;
    const snapshot: Record<string, string> = {};
    if (fd) {
      for (const [k, v] of fd.entries()) {
        if (typeof v === "string") snapshot[k] = v;
      }
    }
    snapshot._samplesUsed = String(samplesUsed);
    snapshot._coverSong = String(coverSong);
    snapshot._featuredArtists = JSON.stringify(featuredArtists);
    snapshot._tracks = JSON.stringify(tracks.map((t) => ({ title: t.title, version: t.version, explicit: t.explicit, instrumental: t.instrumental })));
    snapshot.lyrics = newLyrics;
    snapshot.music_video_url = newVideoUrl;
    snapshot.song_story = newSongStory;
    snapshot.mixing_engineer = newMixingEngineer;
    snapshot.mastering_engineer = newMasteringEngineer;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(snapshot)); setDraftSavedAt(new Date()); } catch {}
  }

  // Save draft whenever the state-controlled fields change
  useEffect(() => {
    if (!profile) return;
    saveDraft();
  }, [samplesUsed, coverSong, featuredArtists, tracks, releaseType, genre, language, explicitContent, trackVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/portal/login"); return; }

      const { data } = await supabase
        .from("releases")
        .select("artist_name, email")
        .eq("email", session.user.email!)
        .eq("status", "approved")
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Allow resubmission from a rejected release even if no approved releases
      const hasApproved = !!data;
      if (!hasApproved && !fromId) {
        router.push("/portal");
        return;
      }

      // If resubmitting from a rejected release, pre-fill state from that release
      if (fromId) {
        const { data: prev } = await supabase
          .from("releases")
          .select("artist_name, email, song_title, genre, language, release_type, copyright_owner, copyright_year")
          .eq("id", fromId)
          .eq("email", session.user.email!)
          .maybeSingle();
        if (prev) {
          setGenre(prev.genre ?? "");
          setLanguage(prev.language ?? "");
          setReleaseType(prev.release_type ?? "Single");
          setProfile({ artist_name: prev.artist_name, email: prev.email });
          setLoading(false);
          return;
        }
      }

      setProfile(data as ArtistProfile);
      setLoading(false);
    }
    load();
  }, [router, fromId]); // eslint-disable-line react-hooks/exhaustive-deps

  function validateArtwork(file: File | null) {
    setCoverFile(file);
    if (!file) { setArtworkError(""); return; }
    setArtworkError("");
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (w !== h) {
        setArtworkError(`Image must be square (1:1 ratio). Yours is ${w}×${h}px — crop it to ${Math.min(w, h)}×${Math.min(w, h)}px first.`);
      } else if (w < 3000 || h < 3000) {
        setArtworkError(`Image is ${w}×${h}px — minimum is 3000×3000px. DSPs will reject smaller artwork.`);
      }
    };
    img.src = url;
  }

  function addTrack() {
    setTracks(t => [...t, { title: "", file: null, version: "Original", explicit: false, instrumental: false }]);
  }

  function removeTrack(i: number) {
    setTracks(t => t.filter((_, idx) => idx !== i));
  }

  function updateTrackTitle(i: number, title: string) {
    setTracks(t => t.map((tr, idx) => idx === i ? { ...tr, title } : tr));
  }

  function updateTrackFile(i: number, file: File | null) {
    setTracks(t => t.map((tr, idx) => idx === i ? { ...tr, file } : tr));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;

    // Validate
    if (!coverFile) {
      setErrorMsg("Please upload your cover artwork before submitting.");
      setState("error");
      return;
    }
    if (artworkError) {
      setErrorMsg(artworkError);
      setState("error");
      return;
    }
    if (isMultiTrack) {
      const missing = tracks.findIndex(tr => !tr.file);
      if (missing !== -1) {
        setErrorMsg(`Track ${missing + 1} is missing an audio file.`);
        setState("error");
        return;
      }
      const untitled = tracks.findIndex(tr => !tr.title.trim());
      if (untitled !== -1) {
        setErrorMsg(`Track ${untitled + 1} needs a title.`);
        setState("error");
        return;
      }
    } else {
      if (!audioFile) {
        setErrorMsg("Please upload your audio file before submitting.");
        setState("error");
        return;
      }
    }

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      setState("uploading");

      // Upload cover art
      setUploadProgress("Uploading cover artwork…");
      const coverExt = coverFile.name.split(".").pop();
      const coverPath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${coverExt}`;
      const { error: coverErr } = await supabase.storage.from("cover-art").upload(coverPath, coverFile);
      if (coverErr) throw coverErr;
      const { data: coverData } = supabase.storage.from("cover-art").getPublicUrl(coverPath);

      let audioFileUrl = "";
      let leadTitle = data.get("songTitle") as string;
      let uploadedTracks: { track_number: number; title: string; audio_file_url: string; version: string; explicit: boolean; instrumental: boolean }[] = [];

      if (isMultiTrack) {
        // Upload all tracks sequentially so progress is visible
        for (let i = 0; i < tracks.length; i++) {
          const track = tracks[i];
          setUploadProgress(`Uploading track ${i + 1} of ${tracks.length}…`);
          const ext = track.file!.name.split(".").pop();
          const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: trackErr } = await supabase.storage.from("releases").upload(path, track.file!);
          if (trackErr) throw trackErr;
          const { data: urlData } = supabase.storage.from("releases").getPublicUrl(path);
          uploadedTracks.push({
            track_number: i + 1,
            title: track.title.trim(),
            audio_file_url: urlData.publicUrl,
            version: track.version,
            explicit: track.explicit,
            instrumental: track.instrumental,
          });
        }
        audioFileUrl = uploadedTracks[0].audio_file_url;
        leadTitle = uploadedTracks[0].title;
      } else {
        setUploadProgress("Uploading audio file…");
        const audioExt = audioFile!.name.split(".").pop();
        const audioPath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${audioExt}`;
        const { error: audioErr } = await supabase.storage.from("releases").upload(audioPath, audioFile!);
        if (audioErr) throw audioErr;
        const { data: audioData } = supabase.storage.from("releases").getPublicUrl(audioPath);
        audioFileUrl = audioData.publicUrl;
      }

      setState("saving");
      setUploadProgress("");

      const releasePayload: Record<string, unknown> = {
        artist_name:      profile.artist_name,
        email:            profile.email,
        release_type:     data.get("releaseType"),
        song_title:       leadTitle,
        album_title:      data.get("albumTitle") || null,
        genre:            data.get("genre"),
        release_date:     data.get("releaseDate"),
        explicit:         data.get("explicit") === "Explicit",
        audio_file_url:   audioFileUrl,
        cover_art_url:    coverData.publicUrl,
        songwriters:      data.get("songwriters"),
        producers:        data.get("producers"),
        featured_artists: featuredArtists.length > 0
          ? JSON.stringify(featuredArtists.filter((a) => a.name.trim()))
          : null,
        isrc:             data.get("isrc") || null,
        copyright_owner:  data.get("copyrightOwner"),
        copyright_year:   data.get("copyrightYear"),
        publishing_info:  data.get("publishing") || null,
        language:         data.get("language") || null,
        upc:              data.get("upc") || null,
        track_version:    data.get("trackVersion") || "Original",
        instrumental:     data.get("instrumental") === "Yes",
        samples_used:     samplesUsed,
        sample_details:   samplesUsed ? (data.get("sampleDetails") as string | null) : null,
        cover_song:           coverSong,
        cover_song_details:   coverSong ? (data.get("coverSongDetails") as string | null) : null,
        store_platforms:      selectedStores === "all" ? "all" : selectedStores.join(","),
        youtube_content_id:   youtubeContentId,
        lyrics:               newLyrics.trim() || null,
        music_video_url:      newVideoUrl.trim() || null,
        song_story:           newSongStory.trim() || null,
        mixing_engineer:      newMixingEngineer.trim() || null,
        mastering_engineer:   newMasteringEngineer.trim() || null,
        status:               "pending",
      };

      if (isMultiTrack && uploadedTracks.length > 0) {
        releasePayload.tracks = uploadedTracks;
      }

      const { error: dbErr } = await supabase.from("releases").insert(releasePayload);
      if (dbErr) throw dbErr;

      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new-submission",
          data: {
            artist_name:      profile.artist_name,
            email:            profile.email,
            song_title:       leadTitle,
            album_title:      data.get("albumTitle") || null,
            release_type:     data.get("releaseType"),
            genre:            data.get("genre"),
            release_date:     data.get("releaseDate"),
            explicit:         data.get("explicit"),
            language:         data.get("language") || null,
            isrc:             data.get("isrc") || null,
            songwriters:      data.get("songwriters") || null,
            producers:        data.get("producers") || null,
            featured_artists: featuredArtists.length > 0
              ? JSON.stringify(featuredArtists.filter((a) => a.name.trim()))
              : null,
            copyright_owner:  data.get("copyrightOwner") || null,
            copyright_year:   data.get("copyrightYear") || null,
            publishing_info:  data.get("publishing") || null,
            cover_art_url:    coverData.publicUrl,
            audio_file_url:   isMultiTrack ? null : audioFileUrl,
            tracks:           isMultiTrack ? uploadedTracks : null,
          },
        }),
      }).catch(() => {});

      fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "submission",
          release: {
            artist_name:  profile.artist_name,
            song_title:   leadTitle,
            release_type: data.get("releaseType"),
            genre:        data.get("genre"),
            release_date: data.get("releaseDate"),
            email:        profile.email,
          },
        }),
      }).catch(() => {});

      clearDraftStorage();
      setState("success");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "";
      if (msg.toLowerCase().includes("storage") || msg.toLowerCase().includes("bucket")) {
        setErrorMsg("File upload failed. Please check your files and try again.");
      } else {
        setErrorMsg(msg || "Something went wrong. Please try again or contact info@orinlabi.com.");
      }
      setState("error");
      setUploadProgress("");
    }
  }

  if (loading) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="skeleton h-5 w-24 rounded-lg" />
        <div className="skeleton h-8 w-64 rounded-xl" />
        <div className="skeleton h-24 rounded-2xl" />
        <div className="skeleton h-72 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-14 rounded-full" />
      </section>
    );
  }

  if (state === "success") {
    return (
      <section className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-[#007bff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-[#007bff]" />
        </div>
        <h2 className="text-white font-bold text-2xl mb-3">
          {isMultiTrack ? "Album Submitted!" : "Release Submitted!"}
        </h2>
        <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
          Your {isMultiTrack ? `${releaseType.toLowerCase()} with ${tracks.length} track${tracks.length !== 1 ? "s" : ""}` : "release"} has been received.
          Our team will prepare it for distribution within 3–5 business days.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/portal"
            className="bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors"
          >
            Back to My Releases
          </Link>
          <button
            onClick={() => {
              setState("idle");
              setAudioFile(null);
              setCoverFile(null);
              setReleaseType("Single");
              setTracks([{ title: "", file: null, version: "Original", explicit: false, instrumental: false }]);
              setSamplesUsed(false);
              setCoverSong(false);
            }}
            className="border border-white/10 hover:border-white/30 text-white/60 hover:text-white font-medium px-6 py-3 rounded-full text-sm transition-all"
          >
            Submit Another Release
          </button>
        </div>
      </section>
    );
  }

  const isLoading = state === "uploading" || state === "saving";

  return (
    <section className="max-w-2xl mx-auto px-4 py-12 pb-24">
      <Link
        href="/portal"
        className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors mb-8"
      >
        <ArrowLeft size={15} /> My Releases
      </Link>

      <div className="mb-8">
        <h1 className="text-white font-bold text-2xl">Submit a New Release</h1>
        <p className="text-white/40 text-sm mt-2">
          Upload your music and we will distribute it to all major platforms.
        </p>
      </div>

      {profile && (
        <div className="mb-8 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Submitting As</p>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#007bff]/15 rounded-full flex items-center justify-center flex-shrink-0">
              <Music2 size={18} className="text-[#007bff]" />
            </div>
            <div>
              <p className="text-white font-semibold">{profile.artist_name}</p>
              <p className="text-white/40 text-xs">{profile.email}</p>
            </div>
          </div>
        </div>
      )}

      {fromId && (
        <div className="mb-6 flex items-center gap-3 bg-amber-500/10 border border-amber-500/25 px-4 py-3 rounded-xl">
          <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-xs">Resubmitting from a previous release. Your genre and release type have been pre-filled — upload new audio and cover art, then fix any metadata before submitting.</p>
        </div>
      )}

      {draftWasRestored && (
        <div className="mb-6 flex items-center justify-between gap-3 bg-[#007bff]/8 border border-[#007bff]/20 px-4 py-3 rounded-xl">
          <div className="flex items-center gap-2 text-[#007bff] text-xs">
            <Save size={13} className="flex-shrink-0" />
            Draft restored from your last session. Files will need to be re-uploaded.
          </div>
          <button
            type="button"
            onClick={() => { clearDraftStorage(); window.location.reload(); }}
            className="text-white/30 hover:text-white text-xs underline transition-colors flex-shrink-0"
          >
            Start fresh
          </button>
        </div>
      )}

      {state === "error" && (
        <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-5 py-4 rounded-xl">
          <AlertCircle size={18} className="flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {(state === "uploading" || state === "saving") && uploadProgress && (
        <div className="mb-6 flex items-center gap-3 bg-[#007bff]/10 border border-[#007bff]/30 text-[#007bff] text-sm px-5 py-4 rounded-xl">
          <Loader2 size={16} className="flex-shrink-0 animate-spin" />
          {uploadProgress}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} onChange={saveDraft} className="space-y-10">

        {/* Release Info */}
        <div>
          <h2 className="text-white font-bold text-lg mb-6 pb-3 border-b border-white/10">
            Release Details
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <Select
              label="Release Type"
              name="releaseType"
              options={["Single", "EP", "Album", "Compilation"]}
              required
              value={releaseType}
              onChange={(v) => {
                setReleaseType(v);
                setTracks([{ title: "", file: null, version: "Original", explicit: false, instrumental: false }]);
                setAudioFile(null);
              }}
            />
            {!isMultiTrack && (
              <Field label="Song Title" name="songTitle" required defaultValue={draft?.songTitle} />
            )}
            {isMultiTrack && (
              <Field label={`${releaseType} Title`} name="albumTitle" placeholder="Full project title" required defaultValue={draft?.albumTitle} />
            )}
            <Select label="Genre" name="genre" options={genres} required value={genre} onChange={(v) => setGenre(v)} />
            <Select label="Language" name="language" options={languages} required value={language} onChange={(v) => setLanguage(v)} />
            <Field label="Desired Release Date" name="releaseDate" type="date" required defaultValue={draft?.releaseDate} />
            <Select label="Explicit Content" name="explicit" options={["Clean", "Explicit"]} required value={explicitContent} onChange={(v) => setExplicitContent(v)} />
            {!isMultiTrack && (
              <Select label="Track Version" name="trackVersion" options={trackVersions} required value={trackVersion} onChange={(v) => setTrackVersion(v)} />
            )}
          </div>
        </div>

        {/* Cover Art — always shown */}
        <div>
          <h2 className="text-white font-bold text-lg mb-4 pb-3 border-b border-white/10">
            Cover Artwork
          </h2>

          {/* Requirements banner */}
          <div className="mb-5 rounded-xl border border-[#007bff]/20 overflow-hidden">
            <div className="bg-[#007bff]/10 px-4 py-2.5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#007bff] animate-pulse" />
              <p className="text-[#60a5fa] text-xs font-bold uppercase tracking-widest">Artwork Requirements</p>
            </div>
            <div className="bg-white/[0.02] px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Format", value: "JPG or PNG" },
                { label: "Min. Size", value: "3000 × 3000px" },
                { label: "Aspect Ratio", value: "1:1 Square" },
                { label: "No text/URLs", value: "On the artwork" },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-white text-xs font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <FileUpload
            label="Cover Artwork"
            name="coverFile"
            accept=".jpg,.jpeg,.png"
            hint="JPG or PNG · Minimum 3000×3000px · No URLs or handles"
            file={coverFile}
            onChange={validateArtwork}
            required
          />
          {artworkError && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/25 text-red-400 text-xs px-4 py-3 rounded-xl mt-2">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              {artworkError}
            </div>
          )}
        </div>

        {/* Audio Files */}
        <div>
          <h2 className="text-white font-bold text-lg mb-2 pb-3 border-b border-white/10">
            {isMultiTrack ? `${releaseType} Tracks` : "Audio File"}
          </h2>

          {isMultiTrack ? (
            <div className="space-y-4">
              <p className="text-white/30 text-xs mb-2">
                Add all tracks in order. WAV, MP3, or FLAC · Min. 16-bit / 44.1kHz
              </p>
              {tracks.map((track, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#007bff] text-xs font-bold uppercase tracking-widest">
                      Track {i + 1}
                    </span>
                    {tracks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTrack(i)}
                        className="text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder={`Track ${i + 1} title`}
                      value={track.title}
                      onChange={(e) => updateTrackTitle(i, e.target.value)}
                      required
                      className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl transition-colors"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-white/30 text-xs mb-1">Version</p>
                        <select
                          value={track.version}
                          onChange={(e) => setTracks(t => t.map((tr, idx) => idx === i ? { ...tr, version: e.target.value } : tr))}
                          className="w-full bg-[#0a0a0a] border border-white/[0.1] focus:border-[#007bff] outline-none text-white text-xs px-3 py-2 rounded-xl appearance-none"
                        >
                          {trackVersions.map((v) => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="text-white/30 text-xs mb-1">Explicit</p>
                        <select
                          value={track.explicit ? "Yes" : "No"}
                          onChange={(e) => setTracks(t => t.map((tr, idx) => idx === i ? { ...tr, explicit: e.target.value === "Explicit" } : tr))}
                          className="w-full bg-[#0a0a0a] border border-white/[0.1] focus:border-[#007bff] outline-none text-white text-xs px-3 py-2 rounded-xl appearance-none"
                        >
                          <option value="No">Clean</option>
                          <option value="Yes">Explicit</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-white/30 text-xs mb-1">Instrumental</p>
                        <select
                          value={track.instrumental ? "Yes" : "No"}
                          onChange={(e) => setTracks(t => t.map((tr, idx) => idx === i ? { ...tr, instrumental: e.target.value === "Yes" } : tr))}
                          className="w-full bg-[#0a0a0a] border border-white/[0.1] focus:border-[#007bff] outline-none text-white text-xs px-3 py-2 rounded-xl appearance-none"
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                    </div>
                    <label className="flex items-center gap-3 bg-white/[0.03] border border-dashed border-white/[0.12] hover:border-[#007bff]/50 rounded-xl px-4 py-3 cursor-pointer transition-colors group">
                      {track.file ? (
                        <>
                          <CheckCircle2 size={16} className="text-[#007bff] flex-shrink-0" />
                          <span className="text-white/70 text-sm truncate">{track.file.name}</span>
                          <span className="text-white/30 text-xs ml-auto flex-shrink-0">Change</span>
                        </>
                      ) : (
                        <>
                          <Upload size={16} className="text-white/30 group-hover:text-[#007bff] flex-shrink-0 transition-colors" />
                          <span className="text-white/40 text-sm">Upload audio file</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept=".wav,.mp3,.flac"
                        className="sr-only"
                        onChange={(e) => updateTrackFile(i, e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addTrack}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-white/[0.15] hover:border-[#007bff]/40 text-white/40 hover:text-[#007bff] py-3 rounded-2xl text-sm transition-all"
              >
                <Plus size={15} /> Add Track
              </button>
            </div>
          ) : (
            <FileUpload
              label="Audio File"
              name="audioFile"
              accept=".wav,.mp3,.flac"
              hint="WAV, MP3, or FLAC · Min. 16-bit / 44.1kHz"
              file={audioFile}
              onChange={setAudioFile}
              required
            />
          )}
        </div>

        {/* Metadata */}
        <div>
          <h2 className="text-white font-bold text-lg mb-6 pb-3 border-b border-white/10">
            Metadata & Credits
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Songwriters" name="songwriters" placeholder="Separate with commas" required defaultValue={draft?.songwriters} />
            <Field label="Producers" name="producers" placeholder="Separate with commas" required defaultValue={draft?.producers} />
            {/* Featured Artists — dynamic */}
            <div className="sm:col-span-2">
              <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
                Featured Artists
              </label>

              {/* Info banner — only show when adding featured artists */}
              {featuredArtists.length > 0 && (
                <div className="mb-4 bg-[#007bff]/[0.06] border border-[#007bff]/20 rounded-xl px-4 py-3 space-y-1.5">
                  <p className="text-[#60a5fa] text-xs font-semibold">Add the featured artist&apos;s full details below.</p>
                  <p className="text-white/45 text-xs leading-relaxed">
                    Their <strong className="text-white/60">Spotify Artist ID</strong> and <strong className="text-white/60">Apple Music Artist ID</strong> are needed so the release links to their existing profiles on each platform — they get streams and followers credited to their account.
                  </p>
                  <p className="text-white/30 text-xs">
                    <strong className="text-white/45">Haven&apos;t released before?</strong> Their IDs won&apos;t exist yet — just leave those fields blank and we&apos;ll create their profile during distribution.
                  </p>
                  <p className="text-white/25 text-[11px]">Find an ID in the Spotify/Apple Music profile URL, e.g. <span className="font-mono text-white/40">open.spotify.com/artist/4Z8W4fKeB5YxbusRsdQVPb</span></p>
                </div>
              )}

              <div className="space-y-3 mb-2">
                {featuredArtists.map((fa, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[#007bff] text-[10px] font-bold uppercase tracking-widest flex-1">Featured Artist {featuredArtists.length > 1 ? i + 1 : ""}</span>
                      <button
                        type="button"
                        onClick={() => setFeaturedArtists(featuredArtists.filter((_, j) => j !== i))}
                        className="text-white/25 hover:text-red-400 transition-colors text-sm"
                      >✕</button>
                    </div>
                    <input
                      type="text"
                      placeholder="Artist / Stage name *"
                      value={fa.name}
                      onChange={(e) => {
                        const n = [...featuredArtists];
                        n[i] = { ...n[i], name: e.target.value };
                        setFeaturedArtists(n);
                      }}
                      className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-2.5 rounded-xl transition-colors"
                    />
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      <div>
                        <p className="text-white/30 text-[10px] mb-1">Spotify Artist ID <span className="text-white/20">(optional if unreleased)</span></p>
                        <input
                          type="text"
                          placeholder="e.g. 4Z8W4fKeB5YxbusRsdQVPb"
                          value={fa.spotify_id}
                          onChange={(e) => {
                            const n = [...featuredArtists];
                            n[i] = { ...n[i], spotify_id: e.target.value };
                            setFeaturedArtists(n);
                          }}
                          className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white/80 placeholder-white/20 text-xs px-3 py-2.5 rounded-xl transition-colors font-mono"
                        />
                      </div>
                      <div>
                        <p className="text-white/30 text-[10px] mb-1">Apple Music Artist ID <span className="text-white/20">(optional if unreleased)</span></p>
                        <input
                          type="text"
                          placeholder="e.g. 1234567890"
                          value={fa.apple_id}
                          onChange={(e) => {
                            const n = [...featuredArtists];
                            n[i] = { ...n[i], apple_id: e.target.value };
                            setFeaturedArtists(n);
                          }}
                          className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white/80 placeholder-white/20 text-xs px-3 py-2.5 rounded-xl transition-colors font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setFeaturedArtists([...featuredArtists, { name: "", spotify_id: "", apple_id: "" }])}
                className="text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white/80 px-3 py-2 rounded-lg transition-colors border border-white/[0.06]"
              >
                + Add Featured Artist
              </button>
            </div>
            {!isMultiTrack && (
              <Select label="Instrumental?" name="instrumental" options={["No", "Yes"]} required />
            )}
            <Field label="ISRC Code" name="isrc" placeholder="Leave blank to auto-generate" defaultValue={draft?.isrc} />
            <Field label="UPC / EAN Code" name="upc" placeholder="Optional — leave blank if unknown" defaultValue={draft?.upc} />
          </div>
        </div>

        {/* Rights */}
        <div>
          <h2 className="text-white font-bold text-lg mb-6 pb-3 border-b border-white/10">
            Rights & Publishing
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Copyright Owner" name="copyrightOwner" placeholder="e.g. Your Name" required defaultValue={draft?.copyrightOwner} />
            <Field label="Copyright Year" name="copyrightYear" placeholder="e.g. 2026" required defaultValue={draft?.copyrightYear} />
            <div className="sm:col-span-2">
              <Field label="Publishing Information" name="publishing" placeholder="Publisher name, PRO affiliation, etc." defaultValue={draft?.publishing} />
            </div>
          </div>
        </div>

        {/* Rights & Ownership */}
        <div>
          <h2 className="text-white font-bold text-lg mb-6 pb-3 border-b border-white/10">
            Rights & Ownership
          </h2>
          <div className="space-y-6">
            {/* Samples */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-3">
                Does this release contain any samples? <span className="text-[#007bff]">*</span>
              </label>
              <div className="flex gap-3">
                {["No", "Yes"].map((v) => (
                  <button key={v} type="button"
                    onClick={() => setSamplesUsed(v === "Yes")}
                    className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                      samplesUsed === (v === "Yes")
                        ? "bg-[#007bff]/15 border-[#007bff]/50 text-[#007bff]"
                        : "border-white/[0.1] text-white/40 hover:text-white"
                    }`}
                  >{v}</button>
                ))}
              </div>
              {samplesUsed && (
                <div className="mt-3 space-y-3">
                  <div className="bg-yellow-400/8 border border-yellow-400/20 rounded-xl px-4 py-3">
                    <p className="text-yellow-400 text-xs font-semibold mb-1">Sample clearance required</p>
                    <p className="text-white/50 text-xs">You must have written clearance before distribution. Uncleared samples will be taken down.</p>
                  </div>
                  <textarea name="sampleDetails" rows={3} placeholder="Describe the sample(s): original song, artist, and confirm you have clearance"
                    defaultValue={draft?.sampleDetails}
                    className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl resize-none transition-colors" />
                </div>
              )}
            </div>

            {/* Cover song */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-3">
                Is this a cover of someone else&apos;s song? <span className="text-[#007bff]">*</span>
              </label>
              <div className="flex gap-3">
                {["No", "Yes"].map((v) => (
                  <button key={v} type="button"
                    onClick={() => setCoverSong(v === "Yes")}
                    className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                      coverSong === (v === "Yes")
                        ? "bg-[#007bff]/15 border-[#007bff]/50 text-[#007bff]"
                        : "border-white/[0.1] text-white/40 hover:text-white"
                    }`}
                  >{v}</button>
                ))}
              </div>
              {coverSong && (
                <div className="mt-3 space-y-3">
                  <div className="bg-blue-400/8 border border-blue-400/20 rounded-xl px-4 py-3">
                    <p className="text-blue-400 text-xs font-semibold mb-1">Cover song licensing</p>
                    <p className="text-white/50 text-xs">We handle obtaining the mechanical licence for you through Ditto — you stay the rights holder, we just take care of the paperwork.</p>
                  </div>
                  <textarea name="coverSongDetails" rows={2} placeholder="Original song title and original artist/writer name"
                    defaultValue={draft?.coverSongDetails}
                    className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl resize-none transition-colors" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lyrics & Additional Credits */}
        <div>
          <h2 className="text-white font-bold text-lg mb-2 pb-3 border-b border-white/10">
            Lyrics &amp; Additional Credits
          </h2>
          <p className="text-white/30 text-xs mb-6">Optional — you can always add or update these from your release dashboard after submission.</p>
          <div className="space-y-5">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Lyrics</label>
              <textarea
                value={newLyrics}
                onChange={(e) => setNewLyrics(e.target.value)}
                rows={8}
                placeholder={"[Verse 1]\nYour lyrics here…\n\n[Chorus]\n…"}
                className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl resize-y transition-colors font-mono leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Music Video URL</label>
              <input
                type="url"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=…"
                className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl transition-colors"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Song Story / Press Notes</label>
              <textarea
                value={newSongStory}
                onChange={(e) => setNewSongStory(e.target.value)}
                rows={4}
                placeholder="Share the story behind this track — what inspired it, the creative process, what it means to you…"
                className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl resize-y transition-colors leading-relaxed"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Mixing Engineer</label>
                <input
                  type="text"
                  value={newMixingEngineer}
                  onChange={(e) => setNewMixingEngineer(e.target.value)}
                  placeholder="e.g. DJ Coublon"
                  className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Mastering Engineer</label>
                <input
                  type="text"
                  value={newMasteringEngineer}
                  onChange={(e) => setNewMasteringEngineer(e.target.value)}
                  placeholder="e.g. Sterling Sound"
                  className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Store Selection */}
        <div>
          <h2 className="text-white font-bold text-lg mb-6 pb-3 border-b border-white/10">
            Store & Platform Selection
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              {(["all", "select"] as const).map((v) => (
                <button key={v} type="button"
                  onClick={() => setSelectedStores(v === "all" ? "all" : [])}
                  className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                    (v === "all" ? selectedStores === "all" : selectedStores !== "all")
                      ? "bg-[#007bff]/15 border-[#007bff]/50 text-[#007bff]"
                      : "border-white/[0.1] text-white/40 hover:text-white"
                  }`}>
                  {v === "all" ? "All Stores (Recommended)" : "Choose Specific Stores"}
                </button>
              ))}
            </div>
            {selectedStores !== "all" && (
              <div className="flex flex-wrap gap-2">
                {["Spotify", "Apple Music", "YouTube Music", "Amazon Music", "Deezer", "TIDAL", "TikTok", "Instagram", "Facebook", "Pandora", "Audiomack", "Boomplay", "Anghami", "Shazam", "SoundCloud", "iHeartRadio"].map((store) => (
                  <button key={store} type="button"
                    onClick={() => {
                      const arr = selectedStores as string[];
                      setSelectedStores(arr.includes(store) ? arr.filter(s => s !== store) : [...arr, store]);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      (selectedStores as string[]).includes(store)
                        ? "bg-[#007bff]/20 border-[#007bff]/50 text-[#007bff]"
                        : "border-white/10 text-white/40 hover:text-white hover:border-white/30"
                    }`}>
                    {store}
                  </button>
                ))}
              </div>
            )}
            {/* YouTube Content ID */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-medium text-sm mb-1">YouTube Content ID</p>
                  <p className="text-white/40 text-xs leading-relaxed">
                    If someone uploads your music to YouTube, Ditto detects it, claims it, and collects the revenue for you. Recommended for all releases.
                  </p>
                </div>
                <button type="button"
                  onClick={() => setYoutubeContentId(!youtubeContentId)}
                  className={`flex-shrink-0 w-12 h-6 rounded-full border transition-colors relative ${
                    youtubeContentId ? "bg-[#007bff] border-[#007bff]" : "bg-white/[0.06] border-white/[0.12]"
                  }`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${youtubeContentId ? "left-6" : "left-0.5"}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pre-submission compliance reminder */}
        <div className="bg-yellow-400/[0.05] border border-yellow-400/20 rounded-2xl p-5">
          <p className="text-yellow-400 text-sm font-semibold mb-3">Before you submit — common reasons for rejection</p>
          <ul className="space-y-1.5 text-white/50 text-xs">
            {[
              "Artwork must be exactly square, min. 3000×3000px, no social handles or URLs",
              "Audio must be WAV or high-quality MP3 — no watermarks",
              "Uncleared samples or unlicensed beats will be rejected",
              "Artist name must match your Spotify/Apple Music profile exactly",
              "Cover songs require a mechanical licence (we handle this)",
              "Metadata (title, artist name) must match the audio file exactly",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-yellow-400/60 mt-0.5">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          disabled={isLoading || !!artworkError}
          className="w-full bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-full text-base transition-all duration-200 flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {state === "uploading" ? (uploadProgress || "Uploading files…") : "Saving release…"}
            </>
          ) : (
            isMultiTrack
              ? `Submit ${releaseType} for Distribution (${tracks.length} track${tracks.length !== 1 ? "s" : ""})`
              : "Submit Release for Distribution"
          )}
        </button>

        {draftSavedAt && (
          <p className="text-center text-white/20 text-xs flex items-center justify-center gap-1.5">
            <Save size={10} />
            Draft auto-saved · {draftSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </form>
    </section>
  );
}

function Field({
  label, name, type = "text", placeholder, required, defaultValue,
}: {
  label: string; name: string; type?: string; placeholder?: string; required?: boolean; defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-white/70 text-sm font-medium mb-2">
        {label}{required && <span className="text-[#007bff] ml-1">*</span>}
      </label>
      <input
        type={type} name={name} placeholder={placeholder} required={required}
        defaultValue={defaultValue}
        className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl transition-colors"
      />
    </div>
  );
}

function Select({
  label, name, options, required, value, onChange,
}: {
  label: string; name: string; options: string[]; required?: boolean;
  value?: string; onChange?: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-white/70 text-sm font-medium mb-2">
        {label}{required && <span className="text-[#007bff] ml-1">*</span>}
      </label>
      <select
        name={name} required={required}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-[#0a0a0a] border border-white/[0.1] focus:border-[#007bff] outline-none text-white text-sm px-4 py-3 rounded-xl transition-colors appearance-none"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function FileUpload({
  label, name, accept, hint, file, onChange, required,
}: {
  label: string; name: string; accept: string; hint: string;
  file: File | null; onChange: (f: File | null) => void; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-white/70 text-sm font-medium mb-2">
        {label}{required && <span className="text-[#007bff] ml-1">*</span>}
      </label>
      <label className="flex flex-col items-center justify-center gap-3 bg-white/[0.03] border border-dashed border-white/[0.12] hover:border-[#007bff]/50 rounded-xl p-8 cursor-pointer transition-colors group min-h-[140px]">
        {file ? (
          <>
            <CheckCircle2 size={24} className="text-[#007bff]" />
            <span className="text-white/70 text-sm text-center truncate max-w-full px-2">{file.name}</span>
            <span className="text-white/30 text-xs">Click to change</span>
          </>
        ) : (
          <>
            <Upload size={24} className="text-white/30 group-hover:text-[#007bff] transition-colors" />
            <span className="text-white/40 text-sm">Click to upload</span>
            <span className="text-white/20 text-xs text-center">{hint}</span>
          </>
        )}
        <input
          type="file" name={name} accept={accept} required={required} className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}
