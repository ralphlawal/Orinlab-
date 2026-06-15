"use client";

import { useState } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const genres = [
  "Afrobeats", "Afropop", "Highlife", "Amapiano", "Afro-soul", "Afro-fusion",
  "Afrohouse", "Kuduro", "Bongo Flava", "Jùjú", "Afrofolk", "R&B",
  "Hip-Hop", "Gospel", "Reggae", "Electronic", "Jazz", "Classical", "Other",
];

const countries = [
  "Nigeria", "Ghana", "South Africa", "Kenya", "Tanzania", "Uganda",
  "Ethiopia", "Senegal", "Ivory Coast", "Cameroon", "Angola", "Zambia",
  "Zimbabwe", "Rwanda", "Mozambique", "Other",
];

type FormState = "idle" | "uploading" | "saving" | "success" | "error";

export default function SubmitPage() {
  const [state, setState] = useState<FormState>("idle");
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agreed) return;

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      setState("uploading");

      // Upload audio file
      let audioUrl = "";
      if (audioFile) {
        const ext = audioFile.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: audioError } = await supabase.storage
          .from("releases")
          .upload(path, audioFile);
        if (audioError) throw audioError;
        const { data: audioData } = supabase.storage.from("releases").getPublicUrl(path);
        audioUrl = audioData.publicUrl;
      }

      // Upload cover art
      let coverUrl = "";
      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: coverError } = await supabase.storage
          .from("cover-art")
          .upload(path, coverFile);
        if (coverError) throw coverError;
        const { data: coverData } = supabase.storage.from("cover-art").getPublicUrl(path);
        coverUrl = coverData.publicUrl;
      }

      setState("saving");

      // Save release to database
      const { error: dbError } = await supabase.from("releases").insert({
        artist_name: data.get("artistName"),
        legal_name: data.get("legalName"),
        email: data.get("email"),
        phone: data.get("phone"),
        country: data.get("country"),
        release_type: data.get("releaseType"),
        song_title: data.get("songTitle"),
        album_title: data.get("albumTitle") || null,
        genre: data.get("genre"),
        release_date: data.get("releaseDate"),
        explicit: data.get("explicit") === "Yes",
        audio_file_url: audioUrl || null,
        cover_art_url: coverUrl || null,
        songwriters: data.get("songwriters"),
        producers: data.get("producers"),
        featured_artists: data.get("featuredArtists") || null,
        isrc: data.get("isrc") || null,
        copyright_owner: data.get("copyrightOwner"),
        copyright_year: data.get("copyrightYear"),
        publishing_info: data.get("publishing") || null,
        status: "pending",
      });

      if (dbError) throw dbError;

      setState("success");
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again or contact support.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-[#007bff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-[#007bff]" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Release Submitted!</h2>
          <p className="text-white/60 leading-relaxed">
            Thank you for submitting your release to Orinlabi. Our team will
            review your submission and get back to you within 24–48 hours.
          </p>
          <button
            onClick={() => { setState("idle"); setAgreed(false); setAudioFile(null); setCoverFile(null); }}
            className="mt-8 bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-8 py-3 rounded-full transition-colors"
          >
            Submit Another Release
          </button>
        </div>
      </div>
    );
  }

  const isLoading = state === "uploading" || state === "saving";

  return (
    <>
      <section className="relative pt-32 pb-12 px-4 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#007bff]/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4">
            Release Submission
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Submit Your Release.
          </h1>
          <p className="text-white/60">
            Fill in your release details below. Our team reviews every
            submission within 24–48 hours.
          </p>
        </div>
      </section>

      <section className="py-8 px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          {state === "error" && (
            <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-5 py-4 rounded-xl">
              <AlertCircle size={18} className="flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">

            {/* Artist Information */}
            <div>
              <h2 className="text-white font-bold text-xl mb-6 pb-3 border-b border-white/10">
                Artist Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Artist Name" name="artistName" required />
                <Field label="Legal Name" name="legalName" required />
                <Field label="Email Address" name="email" type="email" required />
                <Field label="Phone Number" name="phone" type="tel" required />
                <div className="sm:col-span-2">
                  <Select label="Country" name="country" options={countries} required />
                </div>
              </div>
            </div>

            {/* Release Information */}
            <div>
              <h2 className="text-white font-bold text-xl mb-6 pb-3 border-b border-white/10">
                Release Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <Select label="Release Type" name="releaseType" options={["Single", "EP", "Album"]} required />
                <Field label="Song / Release Title" name="songTitle" required />
                <Field label="Album Title (if applicable)" name="albumTitle" />
                <Select label="Genre" name="genre" options={genres} required />
                <Field label="Release Date" name="releaseDate" type="date" required />
                <Select label="Explicit Content" name="explicit" options={["No", "Yes"]} required />
              </div>
            </div>

            {/* Uploads */}
            <div>
              <h2 className="text-white font-bold text-xl mb-6 pb-3 border-b border-white/10">
                Files & Uploads
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <FileUpload
                  label="Audio File"
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
              <h2 className="text-white font-bold text-xl mb-6 pb-3 border-b border-white/10">
                Metadata
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Songwriters" name="songwriters" placeholder="Separate with commas" required />
                <Field label="Producers" name="producers" placeholder="Separate with commas" required />
                <Field label="Featured Artists" name="featuredArtists" placeholder="If any" />
                <Field label="ISRC Code" name="isrc" placeholder="Optional — leave blank to auto-generate" />
              </div>
            </div>

            {/* Rights */}
            <div>
              <h2 className="text-white font-bold text-xl mb-6 pb-3 border-b border-white/10">
                Rights & Publishing
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Copyright Owner" name="copyrightOwner" placeholder="e.g. Orinlabi or Your Name" required />
                <Field label="Copyright Year" name="copyrightYear" placeholder="e.g. 2026" required />
                <div className="sm:col-span-2">
                  <Field label="Publishing Information" name="publishing" placeholder="Publisher name, PRO affiliation, etc." />
                </div>
              </div>
            </div>

            {/* Confirmation */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={18} className="text-[#007bff]" />
                <h3 className="text-white font-semibold">Distribution Authorization</h3>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 accent-[#007bff] flex-shrink-0"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  required
                />
                <span className="text-white/60 text-sm leading-relaxed">
                  I confirm that I own or control all rights to the music and
                  artwork submitted, that this release does not infringe on any
                  third-party rights, and that I authorize Orinlabi to distribute
                  this content globally on my behalf. Public release credits will
                  appear as ℗ 2026 Orinlabi / © 2026 Orinlabi as agreed.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!agreed || isLoading}
              className="w-full bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-full text-base transition-all duration-200 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {state === "uploading" ? "Uploading files…" : "Saving release…"}
                </>
              ) : (
                "Submit Release"
              )}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

/* ── Field ── */
function Field({ label, name, type = "text", placeholder, required }: {
  label: string; name: string; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-white/70 text-sm font-medium mb-2">
        {label}{required && <span className="text-[#007bff] ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl transition-colors duration-200"
      />
    </div>
  );
}

/* ── Select ── */
function Select({ label, name, options, required }: {
  label: string; name: string; options: string[]; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-white/70 text-sm font-medium mb-2">
        {label}{required && <span className="text-[#007bff] ml-1">*</span>}
      </label>
      <select
        name={name}
        required={required}
        className="w-full bg-[#0a0a0a] border border-white/[0.1] focus:border-[#007bff] outline-none text-white text-sm px-4 py-3 rounded-xl transition-colors duration-200 appearance-none"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

/* ── FileUpload ── */
function FileUpload({ label, name, accept, hint, file, onChange, required }: {
  label: string; name: string; accept: string; hint: string;
  file: File | null; onChange: (f: File | null) => void; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-white/70 text-sm font-medium mb-2">
        {label}{required && <span className="text-[#007bff] ml-1">*</span>}
      </label>
      <label className="flex flex-col items-center justify-center gap-3 bg-white/[0.03] border border-dashed border-white/[0.12] hover:border-[#007bff]/50 rounded-xl p-8 cursor-pointer transition-colors duration-200 group min-h-[140px]">
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
          type="file"
          name={name}
          accept={accept}
          required={required}
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}
