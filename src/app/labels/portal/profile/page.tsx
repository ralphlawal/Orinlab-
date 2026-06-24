"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Save, Loader2, CheckCircle2 } from "lucide-react";

type Profile = {
  name: string;
  logo_url: string;
  bio: string;
  country: string;
  founded_year: string;
  genre_focus: string;
  website_url: string;
  instagram_handle: string;
  x_handle: string;
  contact_email: string;
};

const EMPTY: Profile = {
  name: "",
  logo_url: "",
  bio: "",
  country: "",
  founded_year: "",
  genre_focus: "",
  website_url: "",
  instagram_handle: "",
  x_handle: "",
  contact_email: "",
};

export default function LabelPortalProfilePage() {
  const [profile, setProfile]   = useState<Profile>(EMPTY);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [labelId, setLabelId]   = useState<string | null>(null);
  const [status, setStatus]     = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("label_profiles")
        .select("id,name,logo_url,bio,country,founded_year,genre_focus,website_url,instagram_handle,x_handle,contact_email,status")
        .eq("email", session.user.email!)
        .maybeSingle();

      if (data) {
        setLabelId(data.id);
        setStatus(data.status ?? "");
        setProfile({
          name:              data.name ?? "",
          logo_url:          data.logo_url ?? "",
          bio:               data.bio ?? "",
          country:           data.country ?? "",
          founded_year:      data.founded_year ? String(data.founded_year) : "",
          genre_focus:       data.genre_focus ?? "",
          website_url:       data.website_url ?? "",
          instagram_handle:  data.instagram_handle ?? "",
          x_handle:          data.x_handle ?? "",
          contact_email:     data.contact_email ?? "",
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  function set(key: keyof Profile) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setProfile((p) => ({ ...p, [key]: e.target.value }));
      setSaved(false);
    };
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!labelId) return;
    setSaving(true);

    await supabase
      .from("label_profiles")
      .update({
        name:             profile.name.trim(),
        logo_url:         profile.logo_url.trim() || null,
        bio:              profile.bio.trim() || null,
        country:          profile.country.trim() || null,
        founded_year:     profile.founded_year ? parseInt(profile.founded_year) : null,
        genre_focus:      profile.genre_focus.trim() || null,
        website_url:      profile.website_url.trim() || null,
        instagram_handle: profile.instagram_handle.trim() || null,
        x_handle:         profile.x_handle.trim() || null,
        contact_email:    profile.contact_email.trim() || null,
      })
      .eq("id", labelId);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inp = "w-full bg-white/[0.04] border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-[#007bff]/50 placeholder:text-white/20 transition-colors";

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-white font-bold text-2xl mb-1">Label Profile</h1>
        <p className="text-white/40 text-sm">
          {status === "approved"
            ? "Changes appear on your public label page immediately."
            : "Your profile will be visible once your application is approved."}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identity */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <p className="text-white/40 text-xs uppercase tracking-widest">Label Identity</p>

          <div>
            <label className="block text-white/60 text-xs mb-1.5">Label Name</label>
            <input value={profile.name} onChange={set("name")} placeholder="Label name" required className={inp} />
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-1.5">Logo URL</label>
            <input value={profile.logo_url} onChange={set("logo_url")} placeholder="https://… (Cloudinary or direct link)" className={inp} />
            {profile.logo_url && (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profile.logo_url} alt="Logo preview" className="w-16 h-16 rounded-xl object-cover bg-white/5" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-1.5">About Your Label</label>
            <textarea value={profile.bio} onChange={set("bio")} placeholder="Tell your story…" rows={4} className={inp + " resize-none"} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs mb-1.5">Country</label>
              <input value={profile.country} onChange={set("country")} placeholder="e.g. Nigeria" className={inp} />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1.5">Founded Year</label>
              <input type="number" value={profile.founded_year} onChange={set("founded_year")} placeholder="e.g. 2018" className={inp} />
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-1.5">Genre Focus</label>
            <input value={profile.genre_focus} onChange={set("genre_focus")} placeholder="e.g. Afrobeats, Amapiano" className={inp} />
          </div>
        </div>

        {/* Online Presence */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <p className="text-white/40 text-xs uppercase tracking-widest">Online Presence</p>

          <div>
            <label className="block text-white/60 text-xs mb-1.5">Website</label>
            <input value={profile.website_url} onChange={set("website_url")} placeholder="https://yourlabel.com" className={inp} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs mb-1.5">Instagram Handle</label>
              <input value={profile.instagram_handle} onChange={set("instagram_handle")} placeholder="handle (no @)" className={inp} />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1.5">X (Twitter) Handle</label>
              <input value={profile.x_handle} onChange={set("x_handle")} placeholder="handle (no @)" className={inp} />
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-1.5">Public Contact Email</label>
            <input type="email" value={profile.contact_email} onChange={set("contact_email")} placeholder="booking@yourlabel.com" className={inp} />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors"
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Saving…</>
          ) : saved ? (
            <><CheckCircle2 size={16} /> Saved</>
          ) : (
            <><Save size={16} /> Save Profile</>
          )}
        </button>
      </form>
    </div>
  );
}
