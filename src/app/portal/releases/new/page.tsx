"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Music2,
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

type FormState = "idle" | "uploading" | "saving" | "success" | "error";

export default function NewReleasePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [releaseType, setReleaseType] = useState("Single");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/portal/login"); return; }

      // Fetch most recent approved release for artist info
      const { data } = await supabase
        .from("releases")
        .select("artist_name, legal_name, email, phone, country, artist_bio, social_links")
        .eq("email", session.user.email!)
        .eq("status", "approved")
        .order("submitted_at", { ascending: false })
        .limit(1)
        .single();

      if (!data) {
        // No approved release — redirect to portal
        router.push("/portal");
        return;
      }

      setProfile(data as ArtistProfile);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;

    if (!audioFile) {
      setErrorMsg("Please upload your audio file before submitting.");
      setState("error");
      return;
    }
    if (!coverFile) {
      setErrorMsg("Please upload your cover artwork before submitting.");
      setState("error");
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      setState("uploading");

      const audioExt = audioFile.name.split(".").pop();
      const audioPath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${audioExt}`;
      const { error: audioErr } = await supabase.storage.from("releases").upload(audioPath, audioFile);
      if (audioErr) throw audioErr;
      const { data: audioData } = supabase.storage.from("releases").getPublicUrl(audioPath);

      const coverExt = coverFile.name.split(".").pop();
      const coverPath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${coverExt}`;
      const { error: coverErr } = await supabase.storage.from("cover-art").upload(coverPath, coverFile);
      if (coverErr) throw coverErr;
      const { data: coverData } = supabase.storage.from("cover-art").getPublicUrl(coverPath);

      setState("saving");

      const releasePayload = {
        // Pre-filled artist info (locked from their approved release)
        artist_name:    profile.artist_name,
        legal_name:     profile.legal_name,
        email:          profile.email,
        phone:          profile.phone,
        country:        profile.country,
        artist_bio:     profile.artist_bio,
        social_links:   profile.social_links,
        // New release details
        release_type:   data.get("releaseType"),
        song_title:     data.get("songTitle"),
        album_title:    data.get("albumTitle") || null,
        genre:          data.get("genre"),
        release_date:   data.get("releaseDate"),
        explicit:       data.get("explicit") === "Yes",
        audio_file_url: audioData.publicUrl,
        cover_art_url:  coverData.publicUrl,
        songwriters:    data.get("songwriters"),
        producers:      data.get("producers"),
        featured_artists: data.get("featuredArtists") || null,
        isrc:           data.get("isrc") || null,
        copyright_owner: data.get("copyrightOwner"),
        copyright_year:  data.get("copyrightYear"),
        publishing_info: data.get("publishing") || null,
        status: "pending",
      };

      const { error: dbErr } = await supabase.from("releases").insert(releasePayload);
      if (dbErr) throw dbErr;

      // Notify admin
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new-submission",
          data: {
            artist_name:  profile.artist_name,
            song_title:   data.get("songTitle"),
            release_type: data.get("releaseType"),
            genre:        data.get("genre"),
            email:        profile.email,
            phone:        profile.phone,
            country:      profile.country,
          },
        }),
      }).catch(() => {});

      // Confirmation email to artist
      fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "submission",
          release: {
            artist_name:  profile.artist_name,
            song_title:   data.get("songTitle"),
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
        <h2 className="text-white font-bold text-2xl mb-3">Release Submitted!</h2>
        <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
          Your submission is now under review. Our team will get back to you within 3–5 business days.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/portal"
            className="bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors"
          >
            Back to My Releases
          </Link>
          <button
            onClick={() => { setState("idle"); setAudioFile(null); setCoverFile(null); setReleaseType("Single"); }}
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

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white font-bold text-2xl">Submit a New Release</h1>
        <p className="text-white/40 text-sm mt-2">
          Upload your next single, EP, or album. Our team will review and distribute it.
        </p>
      </div>

      {/* Artist identity (pre-filled, read-only) */}
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
              onChange={setReleaseType}
            />
            <Field
              label={releaseType === "Single" ? "Song Title" : "Release Title"}
              name="songTitle"
              required
            />
            {(releaseType === "EP" || releaseType === "Album") && (
              <Field
                label="Album / EP Title"
                name="albumTitle"
                placeholder="Full project title"
              />
            )}
            <Select label="Genre" name="genre" options={genres} required />
            <Field label="Desired Release Date" name="releaseDate" type="date" required />
            <Select label="Explicit Content" name="explicit" options={["No", "Yes"]} required />
          </div>
        </div>

        {/* Files */}
        <div>
          <h2 className="text-white font-bold text-lg mb-2 pb-3 border-b border-white/10">
            Files & Uploads
          </h2>
          <p className="text-white/30 text-xs mb-5">
            {releaseType === "Album" || releaseType === "EP"
              ? "Upload the primary/lead track audio and your cover artwork."
              : "Upload your audio file and cover artwork."}
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            <FileUpload
              label={releaseType === "Album" || releaseType === "EP" ? "Lead Track Audio" : "Audio File"}
              name="audioFile"
              accept=".wav,.mp3,.flac"
              hint="WAV, MP3, or FLAC · Min. 16-bit / 44.1kHz"
              file={audioFile}
              onChange={setAudioFile}
              required
            />
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
              {state === "uploading" ? "Uploading files…" : "Submitting release…"}
            </>
          ) : (
            `Submit ${releaseType} for Review`
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
