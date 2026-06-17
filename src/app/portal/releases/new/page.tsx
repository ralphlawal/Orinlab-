"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload, CheckCircle2, AlertCircle, Loader2, ArrowLeft,
  Music2, Plus, Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const genres = [
  "Afrobeats", "Afropop", "Highlife", "Amapiano", "Afro-soul", "Afro-fusion",
  "Afrohouse", "Kuduro", "Bongo Flava", "Jùjú", "Afrofolk", "R&B",
  "Hip-Hop", "Gospel", "Reggae", "Electronic", "Jazz", "Classical", "Other",
];

type ArtistProfile = {
  artist_name: string;
  legal_name: string;
  email: string;
  phone: string;
  country: string;
  artist_bio: string;
  social_links: string;
};

type Track = { title: string; file: File | null };

type FormState = "idle" | "uploading" | "saving" | "success" | "error";

export default function NewReleasePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [releaseType, setReleaseType] = useState("Single");
  // Single mode: one file
  const [audioFile, setAudioFile] = useState<File | null>(null);
  // Album/EP mode: multiple tracks
  const [tracks, setTracks] = useState<Track[]>([{ title: "", file: null }]);
  const [uploadProgress, setUploadProgress] = useState("");

  const isMultiTrack = releaseType === "Album" || releaseType === "EP";

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/portal/login"); return; }

      const { data } = await supabase
        .from("releases")
        .select("artist_name, legal_name, email, phone, country, artist_bio, social_links")
        .eq("email", session.user.email!)
        .eq("status", "approved")
        .order("submitted_at", { ascending: false })
        .limit(1)
        .single();

      if (!data) {
        router.push("/portal");
        return;
      }

      setProfile(data as ArtistProfile);
      setLoading(false);
    }
    load();
  }, [router]);

  function addTrack() {
    setTracks(t => [...t, { title: "", file: null }]);
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
      let uploadedTracks: { track_number: number; title: string; audio_file_url: string }[] = [];

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
        legal_name:       profile.legal_name,
        email:            profile.email,
        phone:            profile.phone,
        country:          profile.country,
        artist_bio:       profile.artist_bio,
        social_links:     profile.social_links,
        release_type:     data.get("releaseType"),
        song_title:       leadTitle,
        album_title:      data.get("albumTitle") || null,
        genre:            data.get("genre"),
        release_date:     data.get("releaseDate"),
        explicit:         data.get("explicit") === "Yes",
        audio_file_url:   audioFileUrl,
        cover_art_url:    coverData.publicUrl,
        songwriters:      data.get("songwriters"),
        producers:        data.get("producers"),
        featured_artists: data.get("featuredArtists") || null,
        isrc:             data.get("isrc") || null,
        copyright_owner:  data.get("copyrightOwner"),
        copyright_year:   data.get("copyrightYear"),
        publishing_info:  data.get("publishing") || null,
        status:           "pending",
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
            artist_name:  profile.artist_name,
            song_title:   leadTitle,
            release_type: data.get("releaseType"),
            genre:        data.get("genre"),
            email:        profile.email,
            phone:        profile.phone,
            country:      profile.country,
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
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
              setTracks([{ title: "", file: null }]);
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

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* Release Info */}
        <div>
          <h2 className="text-white font-bold text-lg mb-6 pb-3 border-b border-white/10">
            Release Details
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <Select
              label="Release Type"
              name="releaseType"
              options={["Single", "EP", "Album"]}
              required
              value={releaseType}
              onChange={(v) => {
                setReleaseType(v);
                // Reset tracks when switching type
                setTracks([{ title: "", file: null }]);
                setAudioFile(null);
              }}
            />
            {!isMultiTrack && (
              <Field label="Song Title" name="songTitle" required />
            )}
            {isMultiTrack && (
              <Field label={`${releaseType} Title`} name="albumTitle" placeholder="Full project title" required />
            )}
            <Select label="Genre" name="genre" options={genres} required />
            <Field label="Desired Release Date" name="releaseDate" type="date" required />
            <Select label="Explicit Content" name="explicit" options={["No", "Yes"]} required />
          </div>
        </div>

        {/* Cover Art — always shown */}
        <div>
          <h2 className="text-white font-bold text-lg mb-2 pb-3 border-b border-white/10">
            Cover Artwork
          </h2>
          <p className="text-white/30 text-xs mb-5">JPG or PNG · Min. 3000×3000px</p>
          <FileUpload
            label="Cover Artwork"
            name="coverFile"
            accept=".jpg,.jpeg,.png"
            hint="JPG or PNG · Min. 3000×3000px"
            file={coverFile}
            onChange={setCoverFile}
            required
          />
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
            <Field label="Songwriters" name="songwriters" placeholder="Separate with commas" required />
            <Field label="Producers" name="producers" placeholder="Separate with commas" required />
            <Field label="Featured Artists" name="featuredArtists" placeholder="If any" />
            <Field label="ISRC Code" name="isrc" placeholder="Leave blank to auto-generate" />
          </div>
        </div>

        {/* Rights */}
        <div>
          <h2 className="text-white font-bold text-lg mb-6 pb-3 border-b border-white/10">
            Rights & Publishing
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Copyright Owner" name="copyrightOwner" placeholder="e.g. Your Name" required />
            <Field label="Copyright Year" name="copyrightYear" placeholder="e.g. 2026" required />
            <div className="sm:col-span-2">
              <Field label="Publishing Information" name="publishing" placeholder="Publisher name, PRO affiliation, etc." />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
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
      </form>
    </section>
  );
}

function Field({
  label, name, type = "text", placeholder, required,
}: {
  label: string; name: string; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-white/70 text-sm font-medium mb-2">
        {label}{required && <span className="text-[#007bff] ml-1">*</span>}
      </label>
      <input
        type={type} name={name} placeholder={placeholder} required={required}
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
