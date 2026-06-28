"use client";

import { useState } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader2, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";

const genres = [
  "Pop", "Hip-Hop / Rap", "R&B / Soul", "Afrobeats", "Afropop", "Amapiano",
  "Electronic / Dance", "House", "Dancehall / Reggae", "Gospel / Christian",
  "Jazz", "Classical", "Rock", "Alternative / Indie", "Latin",
  "Country", "K-Pop", "Drill", "Trap", "Lo-Fi", "Highlife",
  "Afro-soul", "Afro-fusion", "World Music", "Instrumental", "Podcast / Spoken Word", "Other",
];

const languages = [
  "English", "Spanish", "French", "Portuguese", "Arabic", "Mandarin",
  "Hindi", "Yoruba", "Igbo", "Hausa", "Swahili", "Amharic",
  "Zulu", "Twi / Akan", "Wolof", "Korean", "Japanese", "German", "Italian", "Other",
];

const trackVersions = [
  "Original", "Radio Edit", "Remix", "Acoustic", "Instrumental",
  "Extended Mix", "Live", "Alternate Version", "Cover", "Other",
];

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Nigeria",
  "Ghana", "South Africa", "Kenya", "Tanzania", "Uganda", "Ethiopia",
  "Senegal", "Ivory Coast", "Cameroon", "Angola", "Zimbabwe",
  "France", "Germany", "Brazil", "Mexico", "Colombia", "India",
  "Japan", "South Korea", "Indonesia", "Philippines", "Jamaica", "Trinidad & Tobago",
  "Other",
];

type FormState = "idle" | "uploading" | "saving" | "success" | "error";

export default function SubmitPage() {
  const [state, setState] = useState<FormState>("idle");
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [samplesUsed, setSamplesUsed] = useState(false);
  const [coverSong, setCoverSong] = useState(false);
  const [featuredArtists, setFeaturedArtists] = useState<{ name: string; spotify_id: string; apple_id: string }[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agreed) return;

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

      const { error: dbError } = await supabase.from("releases").insert({
        artist_name: data.get("artistName"),
        legal_name: data.get("legalName"),
        email: (data.get("email") as string)?.toLowerCase().trim(),
        phone: data.get("phone"),
        country: data.get("country"),
        artist_bio: data.get("artistBio"),
        social_links: data.get("socialLinks"),
        sample_url: data.get("sampleUrl"),
        release_type: data.get("releaseType"),
        song_title: data.get("songTitle"),
        album_title: data.get("albumTitle") || null,
        genre: data.get("genre"),
        release_date: data.get("releaseDate"),
        explicit: data.get("explicit") === "Explicit",
        audio_file_url: audioUrl || null,
        cover_art_url: coverUrl || null,
        songwriters: data.get("songwriters"),
        producers: data.get("producers"),
        featured_artists: featuredArtists.length > 0
          ? JSON.stringify(featuredArtists.filter((a) => a.name.trim()))
          : null,
        isrc: data.get("isrc") || null,
        copyright_owner: data.get("copyrightOwner"),
        copyright_year: data.get("copyrightYear"),
        publishing_info:  data.get("publishing") || null,
        language:         data.get("language") || null,
        upc:              data.get("upc") || null,
        track_version:    data.get("trackVersion") || "Original",
        instrumental:     data.get("instrumental") === "Yes",
        samples_used:     samplesUsed,
        sample_details:   samplesUsed ? (data.get("sampleDetails") as string | null) : null,
        cover_song:       coverSong,
        cover_song_details: coverSong ? (data.get("coverSongDetails") as string | null) : null,
        status: "pending",
      });

      if (dbError) throw dbError;

      // Confirmation email to artist — fire and forget
      fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "submission",
          release: {
            artist_name: data.get("artistName"),
            song_title: data.get("songTitle"),
            release_type: data.get("releaseType"),
            genre: data.get("genre"),
            release_date: data.get("releaseDate"),
            email: data.get("email"),
          },
        }),
      }).catch(() => {});

      // Notify admin — fire and forget
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new-submission",
          data: {
            artist_name: data.get("artistName"),
            song_title: data.get("songTitle"),
            release_type: data.get("releaseType"),
            genre: data.get("genre"),
            email: data.get("email"),
            phone: data.get("phone"),
            country: data.get("country"),
          },
        }),
      }).catch(() => {});

      setState("success");
    } catch (err: unknown) {
      console.error(err);
      const msg = err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "";
      if (msg.toLowerCase().includes("storage") || msg.toLowerCase().includes("bucket")) {
        setErrorMsg("File upload failed. Please check your files and try again.");
      } else if (msg.toLowerCase().includes("row-level") || msg.toLowerCase().includes("policy") || msg.toLowerCase().includes("permission")) {
        setErrorMsg("Submission blocked by a permissions error. Please contact info@orinlabi.com.");
      } else if (msg) {
        setErrorMsg(`Submission failed: ${msg}`);
      } else {
        setErrorMsg("Something went wrong. Please try again or contact info@orinlabi.com.");
      }
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
          <h2 className="text-3xl font-bold text-white mb-4">Application Received!</h2>
          <p className="text-white/60 leading-relaxed">
            Thank you for applying to distribute with Orinlabí. We review every
            application carefully and reach out to selected artists within
            <strong className="text-white"> 3–5 business days</strong>.
          </p>
          <p className="text-white/40 text-sm mt-4">
            Check your email for a confirmation from info@orinlabi.com
          </p>
          <a
            href="/status"
            className="mt-3 inline-block text-[#007bff] text-sm hover:underline"
          >
            Track your application status →
          </a>
          <button
            onClick={() => { setState("idle"); setAgreed(false); setAudioFile(null); setCoverFile(null); setSamplesUsed(false); setCoverSong(false); }}
            className="mt-8 block w-full bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-8 py-3 rounded-full transition-colors"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  const isLoading = state === "uploading" || state === "saving";

  return (
    <>
      {/* Header */}
      <section className="relative pt-32 pb-12 px-4 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#007bff]/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4">
            Apply for Distribution
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Submit Your Application.
          </h1>
          <p className="text-white/60 leading-relaxed max-w-lg mx-auto">
            Submit your release below and our team will personally review it.
            We respond within 3–5 business days. Selected artists receive
            global distribution to 150+ platforms.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 pb-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#007bff]/5 border border-[#007bff]/20 rounded-2xl p-5 flex gap-4">
            <Info size={20} className="text-[#007bff] flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm text-white/60 leading-relaxed">
              <p><strong className="text-white">How it works:</strong></p>
              <p>1. Fill in your details and upload your release below.</p>
              <p>2. Our team reviews your application within 3–5 business days.</p>
              <p>3. Selected artists receive global distribution to 150+ platforms worldwide.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-4 px-4 pb-24">
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
                <div className="sm:col-span-2">
                  <TextArea
                    label="About You / Your Music"
                    name="artistBio"
                    placeholder="Tell us about yourself, your sound, and your goals as an artist (2–4 sentences)"
                    rows={3}
                    required
                  />
                </div>
                <Field
                  label="Social Media Links"
                  name="socialLinks"
                  placeholder="Instagram, TikTok, Twitter — separate with commas"
                />
                <Field
                  label="Sample of Your Work"
                  name="sampleUrl"
                  placeholder="Link to your music on YouTube, Spotify, SoundCloud, etc."
                />
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
                <Select label="Language" name="language" options={languages} required />
                <Field label="Desired Release Date" name="releaseDate" type="date" required />
                <Select label="Explicit Content" name="explicit" options={["Clean", "Explicit"]} required />
                <Select label="Track Version" name="trackVersion" options={trackVersions} required />
              </div>
            </div>

            {/* Uploads */}
            <div>
              <h2 className="text-white font-bold text-xl mb-2 pb-3 border-b border-white/10">
                Files & Uploads
              </h2>
              <p className="text-white/30 text-xs mb-5">
                Upload your audio and cover art so we can properly evaluate your release.
              </p>
              <div className="grid sm:grid-cols-2 gap-5">
                <FileUpload label="Audio File" name="audioFile" accept=".wav,.mp3,.flac"
                  hint="WAV, MP3, or FLAC · Min. 16-bit / 44.1kHz"
                  file={audioFile} onChange={setAudioFile} required />
                <FileUpload label="Cover Artwork" name="coverFile" accept=".jpg,.jpeg,.png"
                  hint="JPG or PNG · Min. 3000×3000px"
                  file={coverFile} onChange={setCoverFile} required />
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
                {/* Featured Artists — dynamic */}
                <div className="sm:col-span-2">
                  <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
                    Featured Artists
                  </label>
                  <div className="space-y-3 mb-2">
                    {featuredArtists.map((fa, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_1fr_28px] gap-2 items-start">
                        <div>
                          <input
                            type="text"
                            placeholder="Artist name *"
                            value={fa.name}
                            onChange={(e) => {
                              const n = [...featuredArtists];
                              n[i] = { ...n[i], name: e.target.value };
                              setFeaturedArtists(n);
                            }}
                            className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl transition-colors"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Spotify Artist ID (optional)"
                            value={fa.spotify_id}
                            onChange={(e) => {
                              const n = [...featuredArtists];
                              n[i] = { ...n[i], spotify_id: e.target.value };
                              setFeaturedArtists(n);
                            }}
                            className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl transition-colors"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Apple Music Artist ID (optional)"
                            value={fa.apple_id}
                            onChange={(e) => {
                              const n = [...featuredArtists];
                              n[i] = { ...n[i], apple_id: e.target.value };
                              setFeaturedArtists(n);
                            }}
                            className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl transition-colors"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setFeaturedArtists(featuredArtists.filter((_, j) => j !== i))}
                          className="text-white/30 hover:text-red-400 transition-colors text-sm pt-3"
                        >✕</button>
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
                  {featuredArtists.length > 0 && (
                    <p className="text-white/25 text-xs mt-2">
                      Spotify/Apple Music IDs help us properly credit featured artists on their profiles. Find them in the artist&apos;s profile URL.
                    </p>
                  )}
                </div>
                <Select label="Instrumental?" name="instrumental" options={["No", "Yes"]} required />
                <Field label="ISRC Code" name="isrc" placeholder="Optional — leave blank to auto-generate" />
                <Field label="UPC / EAN Code" name="upc" placeholder="Optional — leave blank if you don't have one" />
              </div>
            </div>

            {/* Rights */}
            <div>
              <h2 className="text-white font-bold text-xl mb-6 pb-3 border-b border-white/10">
                Rights & Publishing
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Copyright Owner" name="copyrightOwner" placeholder="e.g. Your Name" required />
                <Field label="Copyright Year" name="copyrightYear" placeholder="e.g. 2026" required />
                <div className="sm:col-span-2">
                  <Field label="Publishing Information" name="publishing"
                    placeholder="Publisher name, PRO affiliation, etc." />
                </div>

                {/* Samples */}
                <div className="sm:col-span-2">
                  <label className="block text-white/70 text-sm font-medium mb-2">
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
                        <p className="text-white/50 text-xs">You must have written clearance from the original rights holders before distribution. Uncleared samples will result in takedowns.</p>
                      </div>
                      <TextArea label="" name="sampleDetails" placeholder="Describe the sample(s): original song title, artist, and confirm you have clearance" rows={3} />
                    </div>
                  )}
                </div>

                {/* Cover song */}
                <div className="sm:col-span-2">
                  <label className="block text-white/70 text-sm font-medium mb-2">
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
                        <p className="text-white/50 text-xs">Orinlabí will obtain a mechanical licence on your behalf through Ditto. Provide the original song details below.</p>
                      </div>
                      <TextArea label="" name="coverSongDetails" placeholder="Original song title, original artist/writer name" rows={2} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Authorization */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={18} className="text-[#007bff]" />
                <h3 className="text-white font-semibold">Authorization</h3>
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
                  I confirm that I own or control all rights to the music and artwork
                  submitted. I understand this is an application and selection is at
                  Orinlabí&apos;s discretion. If selected, I authorize Orinlabí to
                  distribute this content globally on my behalf, with public credits
                  appearing as ℗ 2026 Orinlabí / © 2026 Orinlabí as agreed.
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
                  {state === "uploading" ? "Uploading files…" : "Submitting application…"}
                </>
              ) : "Submit Application"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

function Field({ label, name, type = "text", placeholder, required }: {
  label: string; name: string; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-white/70 text-sm font-medium mb-2">
        {label}{required && <span className="text-[#007bff] ml-1">*</span>}
      </label>
      <input type={type} name={name} placeholder={placeholder} required={required}
        className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl transition-colors duration-200" />
    </div>
  );
}

function TextArea({ label, name, placeholder, rows, required }: {
  label: string; name: string; placeholder?: string; rows?: number; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-white/70 text-sm font-medium mb-2">
        {label}{required && <span className="text-[#007bff] ml-1">*</span>}
      </label>
      <textarea name={name} placeholder={placeholder} rows={rows ?? 3} required={required}
        className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl transition-colors duration-200 resize-none" />
    </div>
  );
}

function Select({ label, name, options, required }: {
  label: string; name: string; options: string[]; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-white/70 text-sm font-medium mb-2">
        {label}{required && <span className="text-[#007bff] ml-1">*</span>}
      </label>
      <select name={name} required={required}
        className="w-full bg-[#0a0a0a] border border-white/[0.1] focus:border-[#007bff] outline-none text-white text-sm px-4 py-3 rounded-xl transition-colors duration-200 appearance-none">
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

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
        <input type="file" name={name} accept={accept} required={required} className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
}
