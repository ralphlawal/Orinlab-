"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle2, Save, ArrowLeft } from "lucide-react";

type Profile = {
  artist_type: string;
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
};

const EMPTY: Profile = {
  artist_type: "Solo Artist",
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
};

const input = "w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl transition-colors";

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
      {hint && <p className="text-white/30 text-xs mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasApproved, setHasApproved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setEmail(session.user.email!);

      const [profileRes, releasesRes] = await Promise.all([
        supabase.from("artist_profiles").select("*").eq("email", session.user.email!).single(),
        supabase.from("releases").select("id").eq("email", session.user.email!).eq("status", "approved").limit(1),
      ]);

      if (profileRes.data) setProfile({ ...EMPTY, ...profileRes.data });
      setHasApproved((releasesRes.data?.length ?? 0) > 0);
      setLoading(false);
    }
    load();
  }, []);

  function set(key: keyof Profile) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setProfile(p => ({ ...p, [key]: e.target.value }));
  }

  async function save() {
    if (!email) return;
    setSaving(true);
    await supabase
      .from("artist_profiles")
      .upsert({ ...profile, email, updated_at: new Date().toISOString() }, { onConflict: "email" });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <Link
        href="/portal"
        className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft size={15} /> My Releases
      </Link>

      <div>
        <h1 className="text-white font-bold text-2xl">Distribution Profile</h1>
        <p className="text-white/40 text-sm mt-2 leading-relaxed">
          {hasApproved
            ? "Your release is approved. Fill in the details below so we can set up your distribution and link your release to your existing profiles on streaming platforms."
            : "Fill in your artist profile. This information will be used if your application is approved."}
        </p>
      </div>

      {hasApproved && (
        <div className="bg-[#007bff]/10 border border-[#007bff]/30 rounded-2xl px-5 py-4">
          <p className="text-[#007bff] text-sm font-semibold">Action required</p>
          <p className="text-white/60 text-xs mt-1">
            Complete all fields below — especially your Spotify and Apple Music IDs — so your release links to your existing artist profile instead of creating a new one.
          </p>
        </div>
      )}

      {/* Artist Details */}
      <Card title="Artist Details">
        <Field label="Artist Type">
          <select
            value={profile.artist_type}
            onChange={set("artist_type")}
            className={input + " bg-[#0a0a0a] appearance-none"}
          >
            {["Solo Artist", "Band / Group", "DJ", "Producer", "Duo"].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field
          label="Artist Photo URL"
          hint="A direct link to a high-quality press photo. Minimum 1000×1000px, ideally square."
        >
          <input
            value={profile.artist_image_url}
            onChange={set("artist_image_url")}
            placeholder="https://…"
            className={input}
          />
        </Field>
      </Card>

      {/* Platform IDs */}
      <Card
        title="Streaming Platform Artist IDs"
        hint="If you already have releases on these platforms, add your artist IDs so your new release links to your existing profile — not a duplicate. Leave blank if you're new to a platform."
      >
        <Field
          label="Spotify Artist ID"
          hint="Log into Spotify for Artists → click your profile → copy the ID from the URL (the long string after /artist/)"
        >
          <input
            value={profile.spotify_artist_id}
            onChange={set("spotify_artist_id")}
            placeholder="e.g. 6eUKZXaKkcviH0Ku9w2n3V"
            className={input}
          />
        </Field>
        <Field
          label="Apple Music Artist ID"
          hint="Found in your Apple Music artist page URL after /artist/"
        >
          <input
            value={profile.apple_music_artist_id}
            onChange={set("apple_music_artist_id")}
            placeholder="e.g. 1234567890"
            className={input}
          />
        </Field>
        <Field label="Audiomack Username">
          <input
            value={profile.audiomack_id}
            onChange={set("audiomack_id")}
            placeholder="Your Audiomack username"
            className={input}
          />
        </Field>
        <Field label="Boomplay Artist ID">
          <input
            value={profile.boomplay_id}
            onChange={set("boomplay_id")}
            placeholder="Your Boomplay artist ID"
            className={input}
          />
        </Field>
        <Field label="Deezer Artist ID">
          <input
            value={profile.deezer_id}
            onChange={set("deezer_id")}
            placeholder="e.g. 123456"
            className={input}
          />
        </Field>
        <Field label="SoundCloud Username">
          <input
            value={profile.soundcloud_id}
            onChange={set("soundcloud_id")}
            placeholder="Your SoundCloud username"
            className={input}
          />
        </Field>
        <Field label="Amazon Music Artist ID">
          <input
            value={profile.amazon_id}
            onChange={set("amazon_id")}
            placeholder="e.g. B00XXXXXXX"
            className={input}
          />
        </Field>
      </Card>

      {/* Social */}
      <Card title="Social Media & Online Presence">
        <Field label="Instagram Handle" hint="Without the @">
          <input
            value={profile.instagram_handle}
            onChange={set("instagram_handle")}
            placeholder="yourhandle"
            className={input}
          />
        </Field>
        <Field label="X (Twitter) Handle" hint="Without the @">
          <input
            value={profile.x_handle}
            onChange={set("x_handle")}
            placeholder="yourhandle"
            className={input}
          />
        </Field>
        <Field label="TikTok Username">
          <input
            value={profile.tiktok_username}
            onChange={set("tiktok_username")}
            placeholder="@yourusername"
            className={input}
          />
        </Field>
        <Field label="YouTube Channel">
          <input
            value={profile.youtube_channel}
            onChange={set("youtube_channel")}
            placeholder="https://youtube.com/@yourchannel"
            className={input}
          />
        </Field>
        <Field label="Facebook Page">
          <input
            value={profile.facebook_url}
            onChange={set("facebook_url")}
            placeholder="https://facebook.com/yourpage"
            className={input}
          />
        </Field>
        <Field label="Website">
          <input
            value={profile.website_url}
            onChange={set("website_url")}
            placeholder="https://yourwebsite.com"
            className={input}
          />
        </Field>
      </Card>

      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-50 text-white font-semibold py-4 rounded-full transition-colors flex items-center justify-center gap-2 text-sm"
      >
        {saving ? (
          <><Loader2 size={17} className="animate-spin" /> Saving…</>
        ) : saved ? (
          <><CheckCircle2 size={17} /> Profile Saved!</>
        ) : (
          <><Save size={17} /> Save Profile</>
        )}
      </button>
    </section>
  );
}
