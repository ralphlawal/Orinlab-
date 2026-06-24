"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Loader2, ArrowLeft } from "lucide-react";

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const EMPTY = {
  name: "",
  email: "",
  bio: "",
  country: "",
  founded_year: "",
  genre_focus: "",
  roster_size: "",
  website_url: "",
  instagram_handle: "",
  x_handle: "",
};

export default function LabelApplyPage() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setError("");
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setLoading(true);
    setError("");

    const slug = toSlug(form.name);

    // Check if email or slug already applied
    const { data: existing } = await supabase
      .from("label_profiles")
      .select("id")
      .or(`email.eq.${form.email.trim().toLowerCase()},slug.eq.${slug}`)
      .maybeSingle();

    if (existing) {
      setError("A label with this name or email has already applied. Log in at the Label Portal.");
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from("label_profiles").insert({
      name: form.name.trim(),
      slug,
      email: form.email.trim().toLowerCase(),
      bio: form.bio.trim() || null,
      country: form.country.trim() || null,
      founded_year: form.founded_year ? parseInt(form.founded_year) : null,
      genre_focus: form.genre_focus.trim() || null,
      website_url: form.website_url.trim() || null,
      instagram_handle: form.instagram_handle.trim() || null,
      x_handle: form.x_handle.trim() || null,
      contact_email: form.email.trim().toLowerCase(),
      status: "pending",
      submitted_at: new Date().toISOString(),
    });

    if (dbError) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    // Notify admin
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "label-application",
        data: {
          name: form.name.trim(),
          email: form.email.trim(),
          country: form.country.trim(),
          genre_focus: form.genre_focus.trim(),
          roster_size: form.roster_size.trim(),
          bio: form.bio.trim(),
          website_url: form.website_url.trim(),
        },
      }),
    }).catch(() => {});

    setDone(true);
    setLoading(false);
  }

  const inp = "w-full bg-white/[0.04] border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-[#007bff]/50 placeholder:text-white/20 transition-colors";

  if (done) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 pt-20">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-green-400" />
          </div>
          <h2 className="text-white font-bold text-2xl mb-3">Application Received</h2>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            We&apos;ll review your label&apos;s application and get back to you at{" "}
            <strong className="text-white">{form.email}</strong> within 2–5 business days.
            Once approved, you can log in to your Label Portal to manage your profile.
          </p>
          <Link
            href="/labels"
            className="inline-block bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-7 py-3 rounded-full transition-colors text-sm"
          >
            Browse Labels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-center mb-10">
          <Link href="/">
            <Image
              src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png"
              alt="Orinlabí"
              width={130}
              height={35}
              className="object-contain"
            />
          </Link>
        </div>

        <Link href="/labels" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors mb-8">
          <ArrowLeft size={14} /> All Labels
        </Link>

        <div className="mb-8">
          <p className="text-[#007bff] text-xs font-semibold uppercase tracking-widest mb-2">Label Partnership</p>
          <h1 className="text-white font-bold text-3xl mb-3">Register Your Label</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Apply to distribute your label&apos;s entire roster through Orinlabí. Each application is reviewed by our team.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Label identity */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <p className="text-white/40 text-xs uppercase tracking-widest">Label Identity</p>

            <div>
              <label className="block text-white/60 text-xs mb-1.5">Label Name *</label>
              <input value={form.name} onChange={set("name")} placeholder="e.g. Empire Records" required className={inp} />
            </div>

            <div>
              <label className="block text-white/60 text-xs mb-1.5">Contact Email *</label>
              <input type="email" value={form.email} onChange={set("email")} placeholder="label@example.com" required className={inp} />
              <p className="text-white/20 text-xs mt-1">This becomes your Label Portal login email.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-xs mb-1.5">Country</label>
                <input value={form.country} onChange={set("country")} placeholder="e.g. Nigeria" className={inp} />
              </div>
              <div>
                <label className="block text-white/60 text-xs mb-1.5">Founded Year</label>
                <input type="number" value={form.founded_year} onChange={set("founded_year")} placeholder="e.g. 2018" className={inp} />
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-xs mb-1.5">Genre Focus</label>
              <input value={form.genre_focus} onChange={set("genre_focus")} placeholder="e.g. Afrobeats, Highlife, Amapiano" className={inp} />
            </div>
          </div>

          {/* Roster */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <p className="text-white/40 text-xs uppercase tracking-widest">Roster</p>

            <div>
              <label className="block text-white/60 text-xs mb-1.5">Number of Artists on Roster</label>
              <select value={form.roster_size} onChange={set("roster_size")} className={inp + " cursor-pointer"}>
                <option value="">Select range…</option>
                <option value="1–5">1–5 artists</option>
                <option value="6–15">6–15 artists</option>
                <option value="16–50">16–50 artists</option>
                <option value="50+">50+ artists</option>
              </select>
            </div>

            <div>
              <label className="block text-white/60 text-xs mb-1.5">About Your Label</label>
              <textarea
                value={form.bio}
                onChange={set("bio")}
                placeholder="Tell us about your label — your story, your artists, and what makes your roster unique."
                rows={4}
                className={inp + " resize-none"}
              />
            </div>
          </div>

          {/* Online presence */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <p className="text-white/40 text-xs uppercase tracking-widest">Online Presence</p>

            <div>
              <label className="block text-white/60 text-xs mb-1.5">Website</label>
              <input value={form.website_url} onChange={set("website_url")} placeholder="https://yourlabel.com" className={inp} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-xs mb-1.5">Instagram Handle</label>
                <input value={form.instagram_handle} onChange={set("instagram_handle")} placeholder="handle (no @)" className={inp} />
              </div>
              <div>
                <label className="block text-white/60 text-xs mb-1.5">X (Twitter) Handle</label>
                <input value={form.x_handle} onChange={set("x_handle")} placeholder="handle (no @)" className={inp} />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !form.name.trim() || !form.email.trim()}
            className="w-full bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Submit Application
          </button>

          <p className="text-center text-white/25 text-xs">
            Already applied?{" "}
            <Link href="/labels/portal/login" className="text-[#007bff] hover:underline">
              Log in to your Label Portal
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
