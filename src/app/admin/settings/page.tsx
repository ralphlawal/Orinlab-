"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import { Loader2, Save, CheckCircle2, Plus, Trash2, ShieldOff, GripVertical, Mail, RefreshCw, Send, Download, Users, BarChart2 } from "lucide-react";

const SUPER_ADMIN = (
  process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL ||
  (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",")[0]
).trim().toLowerCase();

import {
  DEFAULT_HERO,
  DEFAULT_TESTIMONIALS,
  DEFAULT_ARTISTS_PAGE,
  DEFAULT_CONTACT,
  DEFAULT_SPOTLIGHT,
  DEFAULT_FEATURES,
  DEFAULT_WHY,
  DEFAULT_FAQ,
  type HeroSettings,
  type Testimonial,
  type ArtistsPageSettings,
  type ContactInfo,
  type SpotlightArtist,
  type FeatureCard,
  type WhyCard,
  type FaqItem,
} from "@/lib/siteSettings";

type Tab = "homepage" | "spotlight" | "features" | "why" | "faq" | "artists" | "contact" | "system";

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

// ─── Spotlight Tab ────────────────────────────────────────────────────────────

function SpotlightTab() {
  const { requestUnlock } = usePinGate();
  const [artists, setArtists] = useState<SpotlightArtist[]>(DEFAULT_SPOTLIGHT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "spotlight").maybeSingle().then(({ data }) => {
      if (data?.value) setArtists(data.value as SpotlightArtist[]);
      setLoading(false);
    });
  }, []);

  async function doSave() {
    setSaving(true);
    await supabase.from("site_settings").upsert({ key: "spotlight", value: artists, updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function update(i: number, field: keyof SpotlightArtist, val: string) {
    setArtists((arr) => arr.map((a, idx) => (idx === i ? { ...a, [field]: val } : a)));
  }

  function add() {
    setArtists((arr) => [...arr, { name: "", genre: "", country: "", streams: "", image_url: "" }]);
  }

  function remove(i: number) {
    setArtists((arr) => arr.filter((_, idx) => idx !== i));
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
      <Section title="Artist Spotlight Cards">
        <p className="text-white/40 text-xs -mt-2">
          These cards appear in the &quot;Artist Spotlight&quot; section on the homepage. Add a photo URL to show a real image.
        </p>

        {artists.map((a, i) => (
          <div key={i} className="border border-white/[0.06] rounded-xl p-4 space-y-3 relative">
            <div className="flex items-center gap-2">
              <GripVertical size={14} className="text-white/20" />
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Artist {i + 1}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Name">
                <input className={input} value={a.name} placeholder="e.g. Temi Adeyemi" onChange={(e) => update(i, "name", e.target.value)} />
              </Field>
              <Field label="Genre">
                <input className={input} value={a.genre} placeholder="e.g. Afrobeats" onChange={(e) => update(i, "genre", e.target.value)} />
              </Field>
              <Field label="Country">
                <input className={input} value={a.country} placeholder="e.g. Nigeria" onChange={(e) => update(i, "country", e.target.value)} />
              </Field>
              <Field label="Streams / Stat">
                <input className={input} value={a.streams} placeholder="e.g. 2.4M streams" onChange={(e) => update(i, "streams", e.target.value)} />
              </Field>
            </div>

            <Field label="Photo URL" hint="Paste a Cloudinary or any direct image URL. Leave blank to show a placeholder.">
              <input className={input} value={a.image_url} placeholder="https://res.cloudinary.com/..." onChange={(e) => update(i, "image_url", e.target.value)} />
            </Field>

            {a.image_url && (
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image_url} alt={a.name} className="w-full h-full object-cover" />
              </div>
            )}

            {artists.length > 1 && (
              <button
                onClick={() => remove(i)}
                className="absolute top-3 right-3 text-white/20 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}

        <button
          onClick={add}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
        >
          <Plus size={14} /> Add artist card
        </button>

        <div className="pt-2">
          <SaveBtn loading={saving} saved={saved} onClick={() => requestUnlock(doSave)} />
        </div>
      </Section>
    </div>
  );
}

// ─── Features Tab ─────────────────────────────────────────────────────────────

function FeaturesTab() {
  const { requestUnlock } = usePinGate();
  const [features, setFeatures] = useState<FeatureCard[]>(DEFAULT_FEATURES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "features").maybeSingle().then(({ data }) => {
      if (data?.value) setFeatures(data.value as FeatureCard[]);
      setLoading(false);
    });
  }, []);

  async function doSave() {
    setSaving(true);
    await supabase.from("site_settings").upsert({ key: "features", value: features, updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function update(i: number, field: keyof FeatureCard, val: string) {
    setFeatures((arr) => arr.map((f, idx) => (idx === i ? { ...f, [field]: val } : f)));
  }

  function add() {
    setFeatures((arr) => [...arr, { title: "", desc: "" }]);
  }

  function remove(i: number) {
    setFeatures((arr) => arr.filter((_, idx) => idx !== i));
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
      <Section title="Feature Cards">
        <p className="text-white/40 text-xs -mt-2">
          The 6 feature cards in the &quot;Built For Artists&quot; section. Icons are assigned automatically by position.
        </p>

        {features.map((f, i) => (
          <div key={i} className="border border-white/[0.06] rounded-xl p-4 space-y-3 relative">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Feature {i + 1}</p>
            <Field label="Title">
              <input className={input} value={f.title} placeholder="e.g. Global Distribution" onChange={(e) => update(i, "title", e.target.value)} />
            </Field>
            <Field label="Description">
              <textarea className={textarea} rows={2} value={f.desc} placeholder="Short description of this feature…" onChange={(e) => update(i, "desc", e.target.value)} />
            </Field>
            {features.length > 1 && (
              <button onClick={() => remove(i)} className="absolute top-3 right-3 text-white/20 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}

        <button onClick={add} className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
          <Plus size={14} /> Add feature card
        </button>

        <div className="pt-2">
          <SaveBtn loading={saving} saved={saved} onClick={() => requestUnlock(doSave)} />
        </div>
      </Section>
    </div>
  );
}

// ─── Why Tab ──────────────────────────────────────────────────────────────────

function WhyTab() {
  const { requestUnlock } = usePinGate();
  const [cards, setCards] = useState<WhyCard[]>(DEFAULT_WHY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "why").maybeSingle().then(({ data }) => {
      if (data?.value) setCards(data.value as WhyCard[]);
      setLoading(false);
    });
  }, []);

  async function doSave() {
    setSaving(true);
    await supabase.from("site_settings").upsert({ key: "why", value: cards, updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function update(i: number, field: keyof WhyCard, val: string) {
    setCards((arr) => arr.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));
  }

  function add() {
    setCards((arr) => [...arr, { title: "", desc: "" }]);
  }

  function remove(i: number) {
    setCards((arr) => arr.filter((_, idx) => idx !== i));
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
      <Section title="Why Orinlabí Cards">
        <p className="text-white/40 text-xs -mt-2">
          The reason cards in the &quot;Why Choose Us&quot; section. Icons are assigned automatically by position.
        </p>

        {cards.map((c, i) => (
          <div key={i} className="border border-white/[0.06] rounded-xl p-4 space-y-3 relative">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Reason {i + 1}</p>
            <Field label="Title">
              <input className={input} value={c.title} placeholder="e.g. African-Focused" onChange={(e) => update(i, "title", e.target.value)} />
            </Field>
            <Field label="Description">
              <textarea className={textarea} rows={2} value={c.desc} placeholder="Short description…" onChange={(e) => update(i, "desc", e.target.value)} />
            </Field>
            {cards.length > 1 && (
              <button onClick={() => remove(i)} className="absolute top-3 right-3 text-white/20 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}

        <button onClick={add} className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
          <Plus size={14} /> Add reason
        </button>

        <div className="pt-2">
          <SaveBtn loading={saving} saved={saved} onClick={() => requestUnlock(doSave)} />
        </div>
      </Section>
    </div>
  );
}

// ─── FAQ Tab ──────────────────────────────────────────────────────────────────

function FaqTab() {
  const { requestUnlock } = usePinGate();
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQ);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "faq").maybeSingle().then(({ data }) => {
      if (data?.value) setFaqs(data.value as FaqItem[]);
      setLoading(false);
    });
  }, []);

  async function doSave() {
    setSaving(true);
    await supabase.from("site_settings").upsert({ key: "faq", value: faqs, updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function update(i: number, field: keyof FaqItem, val: string) {
    setFaqs((arr) => arr.map((f, idx) => (idx === i ? { ...f, [field]: val } : f)));
  }

  function add() {
    setFaqs((arr) => [...arr, { q: "", a: "" }]);
  }

  function remove(i: number) {
    setFaqs((arr) => arr.filter((_, idx) => idx !== i));
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
      <Section title="FAQ Items">
        <p className="text-white/40 text-xs -mt-2">
          Questions and answers shown in the FAQ accordion on the homepage.
        </p>

        {faqs.map((f, i) => (
          <div key={i} className="border border-white/[0.06] rounded-xl p-4 space-y-3 relative">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Question {i + 1}</p>
            <Field label="Question">
              <input className={input} value={f.q} placeholder="e.g. How does Orinlabí distribute my music?" onChange={(e) => update(i, "q", e.target.value)} />
            </Field>
            <Field label="Answer">
              <textarea className={textarea} rows={3} value={f.a} placeholder="The full answer to this question…" onChange={(e) => update(i, "a", e.target.value)} />
            </Field>
            {faqs.length > 1 && (
              <button onClick={() => remove(i)} className="absolute top-3 right-3 text-white/20 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}

        <button onClick={add} className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
          <Plus size={14} /> Add question
        </button>

        <div className="pt-2">
          <SaveBtn loading={saving} saved={saved} onClick={() => requestUnlock(doSave)} />
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

// ─── System Tools Tab ─────────────────────────────────────────────────────────

type ToolStatus = "idle" | "running" | "done" | "error";

function ToolCard({
  icon, color, title, desc, children,
}: { icon: React.ReactNode; color: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold mb-1">{title}</h3>
          <p className="text-white/40 text-sm leading-relaxed mb-4">{desc}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function StatusBanner({ status, result }: { status: ToolStatus; result?: React.ReactNode }) {
  if (status === "done" && result) return <div className="mt-3 p-3 bg-green-400/5 border border-green-400/20 rounded-xl">{result}</div>;
  if (status === "error") return <p className="mt-2 text-red-400 text-sm">Request failed — check the PIN and try again.</p>;
  return null;
}

function RunBtn({ status, label, runLabel, onClick, color = "bg-[#007bff] hover:bg-[#0069d9]" }: {
  status: ToolStatus; label: string; runLabel?: string; onClick: () => void; color?: string;
}) {
  return (
    <button onClick={onClick} disabled={status === "running"}
      className={`flex items-center gap-2 ${color} disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors`}>
      {status === "running" && <Loader2 size={15} className="animate-spin" />}
      {status === "running" ? (runLabel ?? "Working…") : label}
    </button>
  );
}

function SystemTab() {
  const [pin, setPin] = useState("");

  // Password migration
  const [migStatus, setMigStatus] = useState<ToolStatus>("idle");
  const [migResult, setMigResult] = useState<{ sent: number; failed: { email: string; reason: string }[]; total: number } | null>(null);

  // Profile reminders
  const [remStatus, setRemStatus] = useState<ToolStatus>("idle");
  const [remResult, setRemResult] = useState<{ sent: number; skipped: number; failed: { email: string; reason: string }[]; total: number } | null>(null);

  // Bulk email
  const [bulkStatus, setBulkStatus] = useState<ToolStatus>("idle");
  const [bulkResult, setBulkResult] = useState<{ sent: number; total: number; failed: { email: string; reason: string }[] } | null>(null);
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkBody, setBulkBody] = useState("");
  const [bulkAudience, setBulkAudience] = useState<"artists" | "labels" | "all">("artists");

  // Export
  const [exportStatus, setExportStatus] = useState<ToolStatus>("idle");

  async function sendMigration() {
    setMigStatus("running"); setMigResult(null);
    try {
      const res = await fetch("/api/admin/migrate-passwords", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMigResult(data); setMigStatus("done");
    } catch { setMigStatus("error"); }
  }

  async function sendReminders() {
    setRemStatus("running"); setRemResult(null);
    try {
      const res = await fetch("/api/admin/profile-reminders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRemResult(data); setRemStatus("done");
    } catch { setRemStatus("error"); }
  }

  async function sendBulkEmail() {
    setBulkStatus("running"); setBulkResult(null);
    try {
      const res = await fetch("/api/admin/bulk-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, subject: bulkSubject, body: bulkBody, audience: bulkAudience }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBulkResult(data); setBulkStatus("done");
    } catch { setBulkStatus("error"); }
  }

  async function exportData(type: "releases" | "artists" | "labels") {
    setExportStatus("running");
    try {
      const res = await fetch("/api/admin/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, type }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ?? `${type}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus("done");
      setTimeout(() => setExportStatus("idle"), 3000);
    } catch { setExportStatus("error"); setTimeout(() => setExportStatus("idle"), 3000); }
  }

  const inp = "w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-4 py-2.5 rounded-xl transition-colors";

  return (
    <div className="space-y-5">
      <h2 className="text-white font-bold text-lg">System Tools</h2>

      {/* PIN */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <label className="block text-white/60 text-xs font-medium mb-2">Admin PIN — required for all tools below</label>
        <input type="password" value={pin} onChange={(e) => setPin(e.target.value)}
          placeholder="Enter your admin PIN" className={`${inp} max-w-xs`} />
      </div>

      {/* ── Communications ──────────────────────────────────────────── */}
      <p className="text-white/25 text-[11px] uppercase tracking-widest font-semibold px-1">Communications</p>

      <ToolCard icon={<Send size={18} className="text-violet-400" />} color="bg-violet-400/10"
        title="Broadcast Email"
        desc="Compose and send a custom email to all approved artists, all labels, or everyone. Write in plain text — line breaks are preserved.">
        <div className="space-y-3 mb-4">
          <select value={bulkAudience} onChange={(e) => setBulkAudience(e.target.value as typeof bulkAudience)}
            className={inp}>
            <option value="artists">Artists only</option>
            <option value="labels">Labels only</option>
            <option value="all">Everyone (artists + labels)</option>
          </select>
          <input value={bulkSubject} onChange={(e) => setBulkSubject(e.target.value)}
            placeholder="Email subject…" className={inp} />
          <textarea value={bulkBody} onChange={(e) => setBulkBody(e.target.value)}
            placeholder="Email body… (plain text, line breaks preserved)"
            rows={5} className={`${inp} resize-y`} />
        </div>
        <RunBtn status={bulkStatus} label="Send Broadcast" runLabel="Sending…"
          color="bg-violet-600 hover:bg-violet-700" onClick={sendBulkEmail} />
        <StatusBanner status={bulkStatus} result={bulkResult && (
          <p className="text-green-400 text-sm font-semibold">
            Sent to {bulkResult.sent} of {bulkResult.total} recipients
            {bulkResult.failed.length > 0 && ` · ${bulkResult.failed.length} failed`}
          </p>
        )} />
      </ToolCard>

      <ToolCard icon={<Mail size={18} className="text-amber-400" />} color="bg-amber-400/10"
        title="Profile Completion Reminders"
        desc="Email approved artists and labels who have incomplete profiles (missing bio, photo, socials, etc.). Skips complete profiles automatically.">
        <RunBtn status={remStatus} label="Send Reminders" runLabel="Sending…"
          color="bg-amber-500 hover:bg-amber-600" onClick={sendReminders} />
        <StatusBanner status={remStatus} result={remResult && (
          <p className="text-green-400 text-sm font-semibold">
            {remResult.sent} reminder{remResult.sent !== 1 ? "s" : ""} sent · {remResult.skipped} already complete
            {remResult.failed.length > 0 && <span className="text-red-400/80 text-xs ml-2">{remResult.failed.length} failed</span>}
          </p>
        )} />
      </ToolCard>

      {/* ── Account Management ──────────────────────────────────────── */}
      <p className="text-white/25 text-[11px] uppercase tracking-widest font-semibold px-1 pt-2">Account Management</p>

      <ToolCard icon={<RefreshCw size={18} className="text-[#007bff]" />} color="bg-[#007bff]/10"
        title="Password Migration"
        desc="Send password-setup emails to ALL artists and labels. Anyone who joined via magic link can set a permanent password. Safe to run multiple times.">
        <RunBtn status={migStatus} label="Send Password Setup Emails" runLabel="Sending…" onClick={sendMigration} />
        <StatusBanner status={migStatus} result={migResult && (
          <p className="text-green-400 text-sm font-semibold">
            Done — {migResult.sent} email{migResult.sent !== 1 ? "s" : ""} sent of {migResult.total}
            {migResult.failed.length > 0 && <span className="text-red-400/80 text-xs ml-2">{migResult.failed.length} failed</span>}
          </p>
        )} />
      </ToolCard>

      {/* ── Data Export ─────────────────────────────────────────────── */}
      <p className="text-white/25 text-[11px] uppercase tracking-widest font-semibold px-1 pt-2">Data Export</p>

      <ToolCard icon={<Download size={18} className="text-emerald-400" />} color="bg-emerald-400/10"
        title="Export Data as CSV"
        desc="Download a full CSV snapshot of releases, artist profiles, or label profiles. Includes all fields including status, emails, and metadata.">
        <div className="flex flex-wrap gap-2">
          {(["releases", "artists", "labels"] as const).map((type) => (
            <button key={type} onClick={() => exportData(type)} disabled={exportStatus === "running"}
              className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/30 text-emerald-400 text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 capitalize">
              {exportStatus === "running" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {type}
            </button>
          ))}
        </div>
        <StatusBanner status={exportStatus} result={<p className="text-green-400 text-sm font-semibold">Download started</p>} />
      </ToolCard>

      {/* ── Platform Stats ──────────────────────────────────────────── */}
      <p className="text-white/25 text-[11px] uppercase tracking-widest font-semibold px-1 pt-2">Platform Stats</p>

      <PlatformStatsCard pin={pin} />
    </div>
  );
}

function PlatformStatsCard({ pin }: { pin: string }) {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!pin) return;
    setLoading(true);
    const { supabase: db } = await import("@/lib/supabase");
    const [
      { count: totalArtists },
      { count: approvedArtists },
      { count: totalLabels },
      { count: approvedLabels },
      { count: totalReleases },
      { count: approvedReleases },
      { count: pendingReleases },
      { count: openTickets },
      { count: pendingPayouts },
    ] = await Promise.all([
      db.from("artist_profiles").select("*", { count: "exact", head: true }),
      db.from("artist_profiles").select("*", { count: "exact", head: true }).eq("status", "approved"),
      db.from("label_profiles").select("*", { count: "exact", head: true }),
      db.from("label_profiles").select("*", { count: "exact", head: true }).eq("status", "approved"),
      db.from("releases").select("*", { count: "exact", head: true }),
      db.from("releases").select("*", { count: "exact", head: true }).eq("status", "approved"),
      db.from("releases").select("*", { count: "exact", head: true }).eq("status", "pending"),
      db.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
      db.from("payout_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    setStats({
      totalArtists: totalArtists ?? 0, approvedArtists: approvedArtists ?? 0,
      totalLabels: totalLabels ?? 0, approvedLabels: approvedLabels ?? 0,
      totalReleases: totalReleases ?? 0, approvedReleases: approvedReleases ?? 0,
      pendingReleases: pendingReleases ?? 0,
      openTickets: openTickets ?? 0, pendingPayouts: pendingPayouts ?? 0,
    });
    setLoading(false);
  }

  return (
    <ToolCard icon={<BarChart2 size={18} className="text-sky-400" />} color="bg-sky-400/10"
      title="Platform Statistics"
      desc="A real-time snapshot of your platform's key numbers.">
      <button onClick={load} disabled={loading}
        className="flex items-center gap-2 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-600/30 text-sky-400 text-sm font-semibold px-4 py-2 rounded-xl transition-colors mb-4 disabled:opacity-50">
        {loading ? <Loader2 size={14} className="animate-spin" /> : <BarChart2 size={14} />}
        Load Stats
      </button>
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Artists",    value: stats.totalArtists },
            { label: "Active Artists",   value: stats.approvedArtists },
            { label: "Total Labels",     value: stats.totalLabels },
            { label: "Active Labels",    value: stats.approvedLabels },
            { label: "Total Releases",   value: stats.totalReleases },
            { label: "Live Releases",    value: stats.approvedReleases },
            { label: "Pending Review",   value: stats.pendingReleases },
            { label: "Open Tickets",     value: stats.openTickets },
            { label: "Pending Payouts",  value: stats.pendingPayouts },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/[0.04] rounded-xl p-3 text-center">
              <p className="text-white font-bold text-xl">{value}</p>
              <p className="text-white/40 text-[11px] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}
    </ToolCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: [Tab, string][] = [
  ["homepage", "Homepage"],
  ["spotlight", "Spotlight"],
  ["features", "Features"],
  ["why", "Why Us"],
  ["faq", "FAQ"],
  ["artists", "Artists Page"],
  ["contact", "Contact Info"],
  ["system", "System Tools"],
];

export default function SettingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("homepage");
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = (data.session?.user?.email ?? "").toLowerCase();
      setAllowed(email === SUPER_ADMIN);
    });
  }, []);

  if (allowed === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
          <ShieldOff size={24} className="text-red-400" />
        </div>
        <div>
          <p className="text-white font-semibold">Access Restricted</p>
          <p className="text-white/40 text-sm mt-1">Site settings can only be changed by the primary administrator.</p>
        </div>
        <button onClick={() => router.push("/admin")} className="text-[#007bff] text-sm hover:underline">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-white font-bold text-2xl">Site Settings</h1>
        <p className="text-white/40 text-sm mt-1">
          Edit live content across the website without touching code.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-white/[0.06] pb-4">
        {TABS.map(([t, label]) => (
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
      {tab === "spotlight" && <SpotlightTab />}
      {tab === "features" && <FeaturesTab />}
      {tab === "why" && <WhyTab />}
      {tab === "faq" && <FaqTab />}
      {tab === "artists" && <ArtistsTab />}
      {tab === "contact" && <ContactTab />}
      {tab === "system" && <SystemTab />}
    </div>
  );
}
