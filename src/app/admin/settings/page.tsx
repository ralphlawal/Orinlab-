"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import { Loader2, Save, CheckCircle2, Plus, Trash2, ShieldOff, GripVertical, Mail, RefreshCw } from "lucide-react";

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

function SystemTab() {
  const [pin, setPin]                 = useState("");
  const [migStatus, setMigStatus]     = useState<"idle"|"running"|"done"|"error">("idle");
  const [migResult, setMigResult]     = useState<{ sent: number; failed: { email: string; reason: string }[]; total: number } | null>(null);
  const [remStatus, setRemStatus]     = useState<"idle"|"running"|"done"|"error">("idle");
  const [remResult, setRemResult]     = useState<{ sent: number; skipped: number; failed: { email: string; reason: string }[]; total: number } | null>(null);

  async function sendMigration() {
    setMigStatus("running");
    setMigResult(null);
    try {
      const res = await fetch("/api/admin/migrate-passwords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMigResult(data);
      setMigStatus("done");
    } catch {
      setMigStatus("error");
    }
  }

  async function sendReminders() {
    setRemStatus("running");
    setRemResult(null);
    try {
      const res = await fetch("/api/admin/profile-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setRemResult(data);
      setRemStatus("done");
    } catch {
      setRemStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      {/* Auth */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <label className="block text-white/60 text-xs font-medium mb-2">Admin PIN (required to run tools)</label>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter your admin PIN"
          className="w-full max-w-xs bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-4 py-2.5 rounded-xl transition-colors"
        />
      </div>

      {/* Password Migration */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[#007bff]/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <RefreshCw size={18} className="text-[#007bff]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold mb-1">Password Migration</h3>
            <p className="text-white/40 text-sm leading-relaxed mb-4">
              Send password-setup emails to all artists and labels. Anyone who signed up via magic link will receive a link to set a permanent password. Safe to run multiple times.
            </p>
            <button
              onClick={sendMigration}
              disabled={migStatus === "running"}
              className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              {migStatus === "running" && <Loader2 size={15} className="animate-spin" />}
              {migStatus === "running" ? "Sending…" : "Send Password Setup Emails"}
            </button>
            {migStatus === "done" && migResult && (
              <div className="mt-3 p-3 bg-green-400/5 border border-green-400/20 rounded-xl">
                <p className="text-green-400 text-sm font-semibold">
                  Done — {migResult.sent} email{migResult.sent !== 1 ? "s" : ""} sent out of {migResult.total}
                </p>
                {migResult.failed.length > 0 && (
                  <p className="text-red-400/80 text-xs mt-1">{migResult.failed.length} failed: {migResult.failed.map(f => f.email).join(", ")}</p>
                )}
              </div>
            )}
            {migStatus === "error" && (
              <p className="mt-2 text-red-400 text-sm">Request failed — check the PIN and try again.</p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Completion Reminders */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Mail size={18} className="text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold mb-1">Profile Completion Reminders</h3>
            <p className="text-white/40 text-sm leading-relaxed mb-4">
              Send reminder emails to approved artists and labels who have incomplete profiles (missing bio, photo, socials, etc.). Only incomplete profiles are emailed.
            </p>
            <button
              onClick={sendReminders}
              disabled={remStatus === "running"}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              {remStatus === "running" && <Loader2 size={15} className="animate-spin" />}
              {remStatus === "running" ? "Sending…" : "Send Profile Reminders"}
            </button>
            {remStatus === "done" && remResult && (
              <div className="mt-3 p-3 bg-green-400/5 border border-green-400/20 rounded-xl">
                <p className="text-green-400 text-sm font-semibold">
                  Done — {remResult.sent} reminder{remResult.sent !== 1 ? "s" : ""} sent, {remResult.skipped} already complete
                </p>
                {remResult.failed.length > 0 && (
                  <p className="text-red-400/80 text-xs mt-1">{remResult.failed.length} failed: {remResult.failed.map(f => f.email).join(", ")}</p>
                )}
              </div>
            )}
            {remStatus === "error" && (
              <p className="mt-2 text-red-400 text-sm">Request failed — check the PIN and try again.</p>
            )}
          </div>
        </div>
      </div>
    </div>
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
