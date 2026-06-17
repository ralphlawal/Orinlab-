"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import { Loader2, Save, CheckCircle2, Plus, Trash2 } from "lucide-react";
import {
  DEFAULT_HERO,
  DEFAULT_TESTIMONIALS,
  DEFAULT_ARTISTS_PAGE,
  DEFAULT_CONTACT,
  type HeroSettings,
  type Testimonial,
  type ArtistsPageSettings,
  type ContactInfo,
} from "@/lib/siteSettings";

type Tab = "homepage" | "artists" | "contact";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-white/70 text-sm font-medium mb-1.5">{label}</label>
      {hint && <p className="text-white/30 text-xs mb-2">{hint}</p>}
      {children}
    </div>
  );
}

const input =
  "w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-4 py-2.5 rounded-xl transition-colors";

const textarea =
  "w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-4 py-3 rounded-xl transition-colors resize-none";

function SaveBtn({
  loading,
  saved,
  onClick,
}: {
  loading: boolean;
  saved: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
    >
      {loading ? (
        <><Loader2 size={15} className="animate-spin" /> Saving…</>
      ) : saved ? (
        <><CheckCircle2 size={15} /> Saved</>
      ) : (
        <><Save size={15} /> Save Changes</>
      )}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-5">
      <h3 className="text-white font-semibold">{title}</h3>
      {children}
    </div>
  );
}

// ─── Homepage Tab ─────────────────────────────────────────────────────────────

function HomepageTab() {
  const { requestUnlock } = usePinGate();
  const [hero, setHero] = useState<HeroSettings>(DEFAULT_HERO);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [loadingHero, setLoadingHero] = useState(true);
  const [savingHero, setSavingHero] = useState(false);
  const [savedHero, setSavedHero] = useState(false);
  const [savingTesti, setSavingTesti] = useState(false);
  const [savedTesti, setSavedTesti] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("site_settings").select("value").eq("key", "hero").maybeSingle(),
      supabase.from("site_settings").select("value").eq("key", "testimonials").maybeSingle(),
    ]).then(([h, t]) => {
      if (h.data?.value) setHero(h.data.value as HeroSettings);
      if (t.data?.value) setTestimonials(t.data.value as Testimonial[]);
      setLoadingHero(false);
    });
  }, []);

  async function doSaveHero() {
    setSavingHero(true);
    await supabase.from("site_settings").upsert({ key: "hero", value: hero, updated_at: new Date().toISOString() });
    setSavingHero(false);
    setSavedHero(true);
    setTimeout(() => setSavedHero(false), 3000);
  }

  async function doSaveTesti() {
    setSavingTesti(true);
    await supabase.from("site_settings").upsert({ key: "testimonials", value: testimonials, updated_at: new Date().toISOString() });
    setSavingTesti(false);
    setSavedTesti(true);
    setTimeout(() => setSavedTesti(false), 3000);
  }

  function updateStat(i: number, field: "value" | "label", val: string) {
    setHero((h) => {
      const stats = [...h.stats];
      stats[i] = { ...stats[i], [field]: val };
      return { ...h, stats };
    });
  }

  function updateTestimonial(i: number, field: keyof Testimonial, val: string) {
    setTestimonials((ts) => ts.map((t, idx) => (idx === i ? { ...t, [field]: val } : t)));
  }

  function addTestimonial() {
    setTestimonials((ts) => [...ts, { name: "", role: "", quote: "" }]);
  }

  function removeTestimonial(i: number) {
    setTestimonials((ts) => ts.filter((_, idx) => idx !== i));
  }

  if (loadingHero) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={24} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Section title="Hero Section">
        <Field label="Badge Text" hint='Small text in the pill above the headline — e.g. "Now accepting artist applications"'>
          <input className={input} value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} />
        </Field>
        <Field label="Headline (normal)" hint='The part of the headline in white — e.g. "Release Your Music"'>
          <input className={input} value={hero.headline} onChange={(e) => setHero({ ...hero, headline: e.target.value })} />
        </Field>
        <Field label="Headline (highlighted)" hint='The part of the headline shown in blue — e.g. "Worldwide."'>
          <input className={input} value={hero.highlight} onChange={(e) => setHero({ ...hero, highlight: e.target.value })} />
        </Field>
        <Field label="Subheadline">
          <textarea className={textarea} rows={3} value={hero.subheadline} onChange={(e) => setHero({ ...hero, subheadline: e.target.value })} />
        </Field>
        <Field label="Stats" hint="Three numbers shown below the subheadline">
          <div className="grid grid-cols-3 gap-3">
            {hero.stats.map((s, i) => (
              <div key={i} className="space-y-1.5">
                <input
                  className={input}
                  placeholder="Value"
                  value={s.value}
                  onChange={(e) => updateStat(i, "value", e.target.value)}
                />
                <input
                  className={input}
                  placeholder="Label"
                  value={s.label}
                  onChange={(e) => updateStat(i, "label", e.target.value)}
                />
              </div>
            ))}
          </div>
        </Field>
        <div className="pt-2">
          <SaveBtn loading={savingHero} saved={savedHero} onClick={() => requestUnlock(doSaveHero)} />
        </div>
      </Section>

      {/* Testimonials */}
      <Section title="Testimonials">
        <p className="text-white/40 text-xs -mt-2">The artist quotes shown on the homepage.</p>
        {testimonials.map((t, i) => (
          <div key={i} className="border border-white/[0.06] rounded-xl p-4 space-y-3 relative">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Testimonial {i + 1}</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name">
                <input className={input} value={t.name} onChange={(e) => updateTestimonial(i, "name", e.target.value)} />
              </Field>
              <Field label="Role / Location">
                <input className={input} placeholder="e.g. Afrobeats Artist, Lagos" value={t.role} onChange={(e) => updateTestimonial(i, "role", e.target.value)} />
              </Field>
            </div>
            <Field label="Quote">
              <textarea className={textarea} rows={3} value={t.quote} onChange={(e) => updateTestimonial(i, "quote", e.target.value)} />
            </Field>
            {testimonials.length > 1 && (
              <button
                onClick={() => removeTestimonial(i)}
                className="absolute top-3 right-3 text-white/20 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addTestimonial}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
        >
          <Plus size={14} /> Add testimonial
        </button>
        <div className="pt-2">
          <SaveBtn loading={savingTesti} saved={savedTesti} onClick={() => requestUnlock(doSaveTesti)} />
        </div>
      </Section>
    </div>
  );
}

// ─── Artists Tab ──────────────────────────────────────────────────────────────

function ArtistsTab() {
  const { requestUnlock } = usePinGate();
  const [settings, setSettings] = useState<ArtistsPageSettings>(DEFAULT_ARTISTS_PAGE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "artists_page").maybeSingle().then(({ data }) => {
      if (data?.value) setSettings(data.value as ArtistsPageSettings);
      setLoading(false);
    });
  }, []);

  async function doSave() {
    setSaving(true);
    await supabase.from("site_settings").upsert({ key: "artists_page", value: settings, updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={24} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Section title="Artists Page Header">
        <Field label="Page Heading" hint='The big headline on the artists roster page — currently "Voices of Africa."'>
          <input
            className={input}
            value={settings.heading}
            onChange={(e) => setSettings({ ...settings, heading: e.target.value })}
          />
        </Field>
        <Field label="Body Text">
          <textarea
            className={textarea}
            rows={3}
            value={settings.body}
            onChange={(e) => setSettings({ ...settings, body: e.target.value })}
          />
        </Field>
        <div className="pt-2">
          <SaveBtn loading={saving} saved={saved} onClick={() => requestUnlock(doSave)} />
        </div>
      </Section>
    </div>
  );
}

// ─── Contact Tab ──────────────────────────────────────────────────────────────

function ContactTab() {
  const { requestUnlock } = usePinGate();
  const [info, setInfo] = useState<ContactInfo>(DEFAULT_CONTACT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "contact_info").maybeSingle().then(({ data }) => {
      if (data?.value) setInfo(data.value as ContactInfo);
      setLoading(false);
    });
  }, []);

  async function doSave() {
    setSaving(true);
    await supabase.from("site_settings").upsert({ key: "contact_info", value: info, updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function set(field: keyof ContactInfo, val: string) {
    setInfo((c) => ({ ...c, [field]: val }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={24} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Section title="Contact Details">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email Address">
            <input className={input} type="email" value={info.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Phone / WhatsApp Number">
            <input className={input} value={info.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="WhatsApp URL" hint="Full link — https://wa.me/234...">
            <input className={input} value={info.whatsapp_url} onChange={(e) => set("whatsapp_url", e.target.value)} />
          </Field>
          <Field label="Address">
            <input className={input} value={info.address} onChange={(e) => set("address", e.target.value)} />
          </Field>
          <Field label="Business Hours">
            <input className={input} value={info.hours} onChange={(e) => set("hours", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Social Media">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Instagram Handle" hint="e.g. @orinlabimusic">
            <input className={input} value={info.instagram} onChange={(e) => set("instagram", e.target.value)} />
          </Field>
          <Field label="Instagram URL">
            <input className={input} value={info.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} />
          </Field>
          <Field label="X / Twitter Handle" hint="e.g. @orinlabimusic">
            <input className={input} value={info.twitter} onChange={(e) => set("twitter", e.target.value)} />
          </Field>
          <Field label="X / Twitter URL">
            <input className={input} value={info.twitter_url} onChange={(e) => set("twitter_url", e.target.value)} />
          </Field>
        </div>
        <div className="pt-2">
          <SaveBtn loading={saving} saved={saved} onClick={() => requestUnlock(doSave)} />
        </div>
      </Section>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("homepage");

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-white font-bold text-2xl">Site Settings</h1>
        <p className="text-white/40 text-sm mt-1">
          Edit live content across the website without touching code.
        </p>
      </div>

      <div className="flex gap-1 border-b border-white/[0.06] pb-4">
        {(
          [
            ["homepage", "Homepage"],
            ["artists", "Artists Page"],
            ["contact", "Contact Info"],
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === t
                ? "bg-[#007bff]/15 text-[#007bff]"
                : "text-white/40 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "homepage" && <HomepageTab />}
      {tab === "artists" && <ArtistsTab />}
      {tab === "contact" && <ContactTab />}
    </div>
  );
}
