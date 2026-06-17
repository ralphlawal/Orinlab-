"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  AlertCircle, ArrowLeft, Camera, CheckCircle2,
  Loader2, Save, User,
} from "lucide-react";

type Profile = {
  artist_name: string;
  bio: string;
  artist_type: string;
  genre: string;
  country: string;
  phone: string;
  record_label: string;
  artist_image_url: string;
  spotify_artist_id: string;
  apple_music_artist_id: string;
  audiomack_id: string;
  boomplay_id: string;
  soundcloud_id: string;
  deezer_id: string;
  amazon_id: string;
  instagram_handle: string;
  x_handle: string;
  tiktok_username: string;
  youtube_channel: string;
  facebook_url: string;
  website_url: string;
  // Payout details
  payout_method: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_country: string;
  paypal_email: string;
  mobile_money_provider: string;
  mobile_money_number: string;
};

const EMPTY: Profile = {
  artist_name: "",
  bio: "",
  artist_type: "Solo Artist",
  genre: "",
  country: "",
  phone: "",
  record_label: "",
  artist_image_url: "",
  spotify_artist_id: "",
  apple_music_artist_id: "",
  audiomack_id: "",
  boomplay_id: "",
  soundcloud_id: "",
  deezer_id: "",
  amazon_id: "",
  instagram_handle: "",
  x_handle: "",
  tiktok_username: "",
  youtube_channel: "",
  facebook_url: "",
  website_url: "",
  payout_method: "",
  bank_name: "",
  bank_account_name: "",
  bank_account_number: "",
  bank_country: "",
  paypal_email: "",
  mobile_money_provider: "",
  mobile_money_number: "",
};

const inp =
  "w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl transition-colors";

const ARTIST_TYPES = ["Solo Artist", "Band / Group", "DJ", "Producer", "Duo"];

const GENRES = [
  "Afrobeats", "Afropop", "Afro-fusion", "Amapiano", "Highlife",
  "Afro-soul", "R&B", "Hip-hop / Rap", "Dancehall / Reggae", "Gospel",
  "Jùjú", "Fuji", "Afrohouse", "Electronic / EDM", "Pop", "Alternative", "Other",
];

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "Tanzania", "Uganda",
  "Ethiopia", "Senegal", "Ivory Coast", "Cameroon", "Zimbabwe", "Rwanda",
  "Egypt", "Morocco", "Algeria", "Tunisia", "Mali", "Burkina Faso", "Guinea",
  "Benin", "Togo", "Sierra Leone", "Liberia", "Gambia", "Somalia", "Sudan",
  "DR Congo", "Congo", "Angola", "Mozambique", "Zambia", "Malawi", "Botswana",
  "Namibia", "Eswatini", "Lesotho", "Mauritius", "Seychelles", "Other",
];

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-5">
      <div>
        <p className="text-white font-semibold text-sm">{title}</p>
        {hint && <p className="text-white/40 text-xs mt-1 leading-relaxed">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-white/60 text-xs font-medium mb-1.5">{label}</label>
      {hint && <p className="text-white/30 text-xs mb-1.5 leading-relaxed">{hint}</p>}
      {children}
    </div>
  );
}

const FIELD_LABELS: Partial<Record<keyof Profile, string>> = {
  artist_name: "Artist Name", bio: "Bio", artist_type: "Artist Type",
  genre: "Genre", country: "Country", phone: "Phone", record_label: "Record Label",
  artist_image_url: "Profile Photo URL", spotify_artist_id: "Spotify Artist ID",
  apple_music_artist_id: "Apple Music Artist ID", audiomack_id: "Audiomack ID",
  boomplay_id: "Boomplay ID", soundcloud_id: "SoundCloud ID",
  deezer_id: "Deezer ID", amazon_id: "Amazon Music ID",
  instagram_handle: "Instagram", x_handle: "X / Twitter",
  tiktok_username: "TikTok", youtube_channel: "YouTube Channel",
  facebook_url: "Facebook URL", website_url: "Website",
  payout_method: "Payout Method", bank_name: "Bank Name",
  bank_account_name: "Account Name", bank_account_number: "Account Number",
  bank_country: "Bank Country", paypal_email: "PayPal Email",
  mobile_money_provider: "Mobile Money Provider", mobile_money_number: "Mobile Money Number",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [originalProfile, setOriginalProfile] = useState<Profile>(EMPTY);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [hasApproved, setHasApproved] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const e = session.user.email!;
      setEmail(e);

      const [profileRes, releasesRes, approvedRes] = await Promise.all([
        supabase.from("artist_profiles").select("*").eq("email", e).maybeSingle(),
        supabase.from("releases").select("artist_name").eq("email", e)
          .order("submitted_at", { ascending: false }).limit(1),
        supabase.from("releases").select("id").eq("email", e).eq("status", "approved").limit(1),
      ]);

      const merged: Profile = { ...EMPTY, ...(profileRes.data ?? {}) };
      // Pre-fill artist_name from releases if profile doesn't have one yet
      if (!merged.artist_name && releasesRes.data?.[0]?.artist_name) {
        merged.artist_name = releasesRes.data[0].artist_name;
      }

      setProfile(merged);
      setOriginalProfile(merged);
      setHasApproved((approvedRes.data?.length ?? 0) > 0);
      setLoading(false);
    }
    load();
  }, []);

  function set(key: keyof Profile) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setProfile(p => ({ ...p, [key]: e.target.value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function save() {
    if (!email) return;
    setSaving(true);
    setSaveError("");

    let imageUrl = profile.artist_image_url;

    if (photoFile) {
      setUploadingPhoto(true);
      const ext = photoFile.name.split(".").pop();
      const safeMail = email.replace(/[@.]/g, "_");
      const path = `profiles/${safeMail}/photo-${Date.now()}.${ext}`;
      const { data: up, error: upErr } = await supabase.storage
        .from("cover-art")
        .upload(path, photoFile, { upsert: true });
      setUploadingPhoto(false);
      if (up && !upErr) {
        const { data: { publicUrl } } = supabase.storage.from("cover-art").getPublicUrl(up.path);
        imageUrl = publicUrl;
      }
    }

    const { error } = await supabase
      .from("artist_profiles")
      .upsert(
        { ...profile, artist_image_url: imageUrl, email, updated_at: new Date().toISOString() },
        { onConflict: "email" }
      );

    if (error) {
      setSaveError(error.message);
      setSaving(false);
      return;
    }

    // Sync identity fields to releases (powers the public artist showcase pages)
    const releaseSync: Record<string, string> = {};
    if (profile.artist_name) releaseSync.artist_name = profile.artist_name;
    if (profile.bio)         releaseSync.artist_bio  = profile.bio;
    if (profile.country)     releaseSync.country     = profile.country;
    if (Object.keys(releaseSync).length > 0) {
      await supabase.from("releases").update(releaseSync).eq("email", email);
    }

    setProfile(p => ({ ...p, artist_image_url: imageUrl }));
    setPhotoFile(null);
    setPhotoPreview("");
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);

    // Build field-level diff and notify Ralph — fire and forget
    const changes: { field: string; from: string; to: string }[] = [];
    for (const [key, label] of Object.entries(FIELD_LABELS)) {
      const k = key as keyof Profile;
      const oldVal = String(originalProfile[k] ?? "").trim();
      const newVal = String((k === "artist_image_url" ? imageUrl : profile[k]) ?? "").trim();
      if (oldVal !== newVal) changes.push({ field: label!, from: oldVal, to: newVal });
    }
    if (changes.length > 0) {
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "profile-updated",
          data: { email, artist_name: profile.artist_name, changes },
        }),
      }).catch(() => {});
    }
    setOriginalProfile({ ...profile, artist_image_url: imageUrl });
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  const displayPhoto = photoPreview || profile.artist_image_url;

  return (
    <section className="max-w-2xl mx-auto px-4 py-12 pb-20 space-y-8">
      <Link
        href="/portal"
        className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft size={15} /> My Releases
      </Link>

      <div>
        <h1 className="text-white font-bold text-2xl">Edit Profile</h1>
        <p className="text-white/40 text-sm mt-2 leading-relaxed">
          {hasApproved
            ? "Your release is approved. Complete your profile to finish distribution setup."
            : "Update your artist profile. Changes will apply to all your submissions."}
        </p>
      </div>

      {hasApproved && !profile.spotify_artist_id && (
        <div className="bg-[#007bff]/10 border border-[#007bff]/30 rounded-2xl px-5 py-4">
          <p className="text-[#007bff] text-sm font-semibold">Action required</p>
          <p className="text-white/60 text-xs mt-1">
            Add your Spotify and Apple Music IDs so your release links to your existing artist profile instead of creating a new one.
          </p>
        </div>
      )}

      {saveError && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{saveError}</p>
        </div>
      )}

      {/* ── Identity ── */}
      <Card title="Artist Identity" hint="Your public-facing name and how you present yourself to fans.">
        {/* Photo upload */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/[0.05] border border-white/[0.08] flex-shrink-0 flex items-center justify-center">
            {displayPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayPhoto} alt="Artist photo" className="w-full h-full object-cover" />
            ) : (
              <User size={28} className="text-white/20" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/60 text-xs font-medium mb-2">Profile Photo</p>
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              className="flex items-center gap-2 border border-white/[0.12] hover:border-[#007bff]/50 text-white/50 hover:text-[#007bff] text-xs font-medium px-4 py-2 rounded-xl transition-all"
            >
              <Camera size={13} />
              {displayPhoto ? "Change Photo" : "Upload Photo"}
            </button>
            <p className="text-white/25 text-xs mt-1.5">JPG or PNG · min 500×500px</p>
            <input
              ref={photoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
        </div>

        <Field label="Artist / Stage Name">
          <input
            value={profile.artist_name}
            onChange={set("artist_name")}
            placeholder="Your artist or stage name"
            className={inp}
          />
          <p className="text-white/20 text-xs mt-1.5">
            Saving updates your name on all submitted releases.
          </p>
        </Field>

        <Field label="Bio" hint="Tell fans who you are — 2–4 sentences works best.">
          <textarea
            value={profile.bio}
            onChange={set("bio")}
            placeholder="Who are you as an artist? What's your sound, your story, your mission?"
            rows={4}
            className={inp + " resize-none"}
          />
        </Field>
      </Card>

      {/* ── Details ── */}
      <Card title="Artist Details">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Artist Type">
            <select value={profile.artist_type} onChange={set("artist_type")} className={inp + " bg-[#0a0a0a] appearance-none"}>
              {ARTIST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Primary Genre">
            <select value={profile.genre} onChange={set("genre")} className={inp + " bg-[#0a0a0a] appearance-none"}>
              <option value="">Select genre…</option>
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Country">
            <select value={profile.country} onChange={set("country")} className={inp + " bg-[#0a0a0a] appearance-none"}>
              <option value="">Select country…</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Phone Number" hint="Optional — business contact only.">
            <input value={profile.phone} onChange={set("phone")} placeholder="+234 800 000 0000" type="tel" className={inp} />
          </Field>
        </div>
        <Field label="Record Label" hint="Leave blank if you're independent.">
          <input value={profile.record_label} onChange={set("record_label")} placeholder="Self-released / Your Label Name" className={inp} />
        </Field>
      </Card>

      {/* ── Platform IDs ── */}
      <Card
        title="Streaming Platform Artist IDs"
        hint="If you already have releases on these platforms, add your artist IDs so your new release links to your existing profile — not a duplicate. Leave blank if you're new to a platform."
      >
        <Field label="Spotify Artist ID" hint="Spotify for Artists → your profile → copy the ID from the URL after /artist/">
          <input value={profile.spotify_artist_id} onChange={set("spotify_artist_id")} placeholder="e.g. 6eUKZXaKkcviH0Ku9w2n3V" className={inp} />
        </Field>
        <Field label="Apple Music Artist ID" hint="Found in your Apple Music artist page URL after /artist/">
          <input value={profile.apple_music_artist_id} onChange={set("apple_music_artist_id")} placeholder="e.g. 1234567890" className={inp} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Audiomack Username">
            <input value={profile.audiomack_id} onChange={set("audiomack_id")} placeholder="Your Audiomack username" className={inp} />
          </Field>
          <Field label="Boomplay Artist ID">
            <input value={profile.boomplay_id} onChange={set("boomplay_id")} placeholder="Your Boomplay artist ID" className={inp} />
          </Field>
          <Field label="Deezer Artist ID">
            <input value={profile.deezer_id} onChange={set("deezer_id")} placeholder="e.g. 123456" className={inp} />
          </Field>
          <Field label="SoundCloud Username">
            <input value={profile.soundcloud_id} onChange={set("soundcloud_id")} placeholder="Your SoundCloud username" className={inp} />
          </Field>
          <Field label="Amazon Music Artist ID">
            <input value={profile.amazon_id} onChange={set("amazon_id")} placeholder="e.g. B00XXXXXXX" className={inp} />
          </Field>
        </div>
      </Card>

      {/* ── Social ── */}
      <Card title="Social Media & Online Presence">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Instagram" hint="Without the @">
            <input value={profile.instagram_handle} onChange={set("instagram_handle")} placeholder="yourhandle" className={inp} />
          </Field>
          <Field label="X (Twitter)" hint="Without the @">
            <input value={profile.x_handle} onChange={set("x_handle")} placeholder="yourhandle" className={inp} />
          </Field>
          <Field label="TikTok Username">
            <input value={profile.tiktok_username} onChange={set("tiktok_username")} placeholder="@yourusername" className={inp} />
          </Field>
          <Field label="YouTube Channel">
            <input value={profile.youtube_channel} onChange={set("youtube_channel")} placeholder="https://youtube.com/@yourchannel" className={inp} />
          </Field>
          <Field label="Facebook Page">
            <input value={profile.facebook_url} onChange={set("facebook_url")} placeholder="https://facebook.com/yourpage" className={inp} />
          </Field>
          <Field label="Website">
            <input value={profile.website_url} onChange={set("website_url")} placeholder="https://yourwebsite.com" className={inp} />
          </Field>
        </div>
      </Card>

      {/* ── Payout Details ── */}
      <Card
        title="Payout Details"
        hint="This information is private and used only to process your royalty payouts. Fill it in so we know where to send your earnings when you request a payout."
      >
        <Field label="Payout Method">
          <select value={profile.payout_method} onChange={set("payout_method")} className={inp + " bg-[#0a0a0a] appearance-none"}>
            <option value="">Select method…</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="paypal">PayPal</option>
            <option value="mobile_money">Mobile Money</option>
          </select>
        </Field>

        {profile.payout_method === "bank_transfer" && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Bank Name">
                <input value={profile.bank_name} onChange={set("bank_name")} placeholder="e.g. Access Bank, GTBank" className={inp} />
              </Field>
              <Field label="Bank Country">
                <select value={profile.bank_country} onChange={set("bank_country")} className={inp + " bg-[#0a0a0a] appearance-none"}>
                  <option value="">Select country…</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Account Name" hint="Full name on the bank account — must match your bank records exactly.">
              <input value={profile.bank_account_name} onChange={set("bank_account_name")} placeholder="e.g. John Adewale Doe" className={inp} />
            </Field>
            <Field label="Account Number">
              <input value={profile.bank_account_number} onChange={set("bank_account_number")} placeholder="10-digit account number" className={inp} />
            </Field>
          </div>
        )}

        {profile.payout_method === "paypal" && (
          <Field label="PayPal Email">
            <input value={profile.paypal_email} onChange={set("paypal_email")} type="email" placeholder="your@paypal.com" className={inp} />
          </Field>
        )}

        {profile.payout_method === "mobile_money" && (
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Provider">
              <select value={profile.mobile_money_provider} onChange={set("mobile_money_provider")} className={inp + " bg-[#0a0a0a] appearance-none"}>
                <option value="">Select provider…</option>
                <option value="M-Pesa">M-Pesa</option>
                <option value="MTN Mobile Money">MTN Mobile Money</option>
                <option value="Airtel Money">Airtel Money</option>
                <option value="Orange Money">Orange Money</option>
                <option value="Wave">Wave</option>
                <option value="Opay">Opay</option>
                <option value="Palmpay">Palmpay</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Phone Number">
              <input value={profile.mobile_money_number} onChange={set("mobile_money_number")} type="tel" placeholder="+234 800 000 0000" className={inp} />
            </Field>
          </div>
        )}

        {!profile.payout_method && (
          <p className="text-white/25 text-xs">Select a payout method above to enter your details.</p>
        )}
      </Card>

      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-50 text-white font-semibold py-4 rounded-full transition-colors flex items-center justify-center gap-2 text-sm"
      >
        {saving ? (
          <><Loader2 size={17} className="animate-spin" /> {uploadingPhoto ? "Uploading photo…" : "Saving…"}</>
        ) : saved ? (
          <><CheckCircle2 size={17} /> Profile Saved!</>
        ) : (
          <><Save size={17} /> Save Profile</>
        )}
      </button>
    </section>
  );
}
