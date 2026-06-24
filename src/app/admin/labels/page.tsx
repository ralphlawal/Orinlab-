"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import {
  Plus, Pencil, Trash2, X, Save, Loader2, Globe, Star, ExternalLink,
} from "lucide-react";

type Label = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  bio: string | null;
  country: string | null;
  founded_year: number | null;
  genre_focus: string | null;
  website_url: string | null;
  instagram_handle: string | null;
  x_handle: string | null;
  contact_email: string | null;
  is_featured: boolean;
  created_at: string;
};

const EMPTY_FORM = {
  name: "",
  slug: "",
  logo_url: "",
  bio: "",
  country: "",
  founded_year: "",
  genre_focus: "",
  website_url: "",
  instagram_handle: "",
  x_handle: "",
  contact_email: "",
  is_featured: false,
};

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminLabelsPage() {
  const { requestUnlock } = usePinGate();
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Label | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Label | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [artistCounts, setArtistCounts] = useState<Record<string, number>>({});

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("label_profiles")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("name");
    setLabels((data as Label[]) ?? []);

    // Count artists per label
    const { data: profiles } = await supabase
      .from("artist_profiles")
      .select("record_label")
      .not("record_label", "is", null);
    const map: Record<string, number> = {};
    for (const p of profiles ?? []) {
      if (p.record_label) {
        const k = p.record_label.toLowerCase().trim();
        map[k] = (map[k] ?? 0) + 1;
      }
    }
    setArtistCounts(map);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(l: Label) {
    setEditing(l);
    setForm({
      name: l.name,
      slug: l.slug,
      logo_url: l.logo_url ?? "",
      bio: l.bio ?? "",
      country: l.country ?? "",
      founded_year: l.founded_year ? String(l.founded_year) : "",
      genre_focus: l.genre_focus ?? "",
      website_url: l.website_url ?? "",
      instagram_handle: l.instagram_handle ?? "",
      x_handle: l.x_handle ?? "",
      contact_email: l.contact_email ?? "",
      is_featured: l.is_featured,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  function setField(key: string, value: string | boolean) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "name" && typeof value === "string" && !editing) {
        next.slug = toSlug(value);
      }
      return next;
    });
  }

  async function handleSave() {
    if (!form.name.trim() || !form.slug.trim()) return;
    requestUnlock(async () => {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        logo_url: form.logo_url.trim() || null,
        bio: form.bio.trim() || null,
        country: form.country.trim() || null,
        founded_year: form.founded_year ? parseInt(form.founded_year) : null,
        genre_focus: form.genre_focus.trim() || null,
        website_url: form.website_url.trim() || null,
        instagram_handle: form.instagram_handle.trim() || null,
        x_handle: form.x_handle.trim() || null,
        contact_email: form.contact_email.trim() || null,
        is_featured: form.is_featured,
      };
      if (editing) {
        await supabase.from("label_profiles").update(payload).eq("id", editing.id);
      } else {
        await supabase.from("label_profiles").insert(payload);
      }
      setSaving(false);
      closeForm();
      load();
    });
  }

  async function handleDelete(l: Label) {
    requestUnlock(async () => {
      await supabase.from("label_profiles").delete().eq("id", l.id);
      if (selected?.id === l.id) setSelected(null);
      load();
    });
  }

  async function toggleFeatured(l: Label) {
    requestUnlock(async () => {
      await supabase
        .from("label_profiles")
        .update({ is_featured: !l.is_featured })
        .eq("id", l.id);
      load();
    });
  }

  const inp = "w-full bg-white/[0.04] border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-[#007bff]/50 placeholder:text-white/20";
  const textarea = inp + " resize-none";

  return (
    <div className="flex gap-6 h-full">
      {/* Left: list */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-3">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors w-full justify-center"
        >
          <Plus size={16} /> New Label
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={22} className="text-[#007bff] animate-spin" />
          </div>
        ) : labels.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">No labels yet</p>
        ) : (
          labels.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelected(selected?.id === l.id ? null : l)}
              className={`w-full text-left bg-white/[0.03] hover:bg-white/[0.06] border rounded-xl p-3 transition-colors ${
                selected?.id === l.id ? "border-[#007bff]/40 bg-[#007bff]/5" : "border-white/[0.06]"
              }`}
            >
              <div className="flex items-center gap-3">
                {l.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-white/5" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[#007bff]/10 flex items-center justify-center flex-shrink-0">
                    <Globe size={18} className="text-[#007bff]/40" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-white text-sm font-semibold truncate">{l.name}</p>
                    {l.is_featured && <Star size={11} className="text-[#007bff] flex-shrink-0" />}
                  </div>
                  <p className="text-white/30 text-xs mt-0.5">
                    {artistCounts[l.name.toLowerCase().trim()] ?? 0} artist{(artistCounts[l.name.toLowerCase().trim()] ?? 0) !== 1 ? "s" : ""}
                    {l.country ? ` · ${l.country}` : ""}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Right: detail panel */}
      <div className="flex-1 min-w-0">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-white/20 text-sm">
            Select a label to view details, or create a new one
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              {selected.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.logo_url} alt="" className="w-20 h-20 rounded-2xl object-cover bg-white/5 flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#007bff]/10 flex items-center justify-center flex-shrink-0">
                  <Globe size={32} className="text-[#007bff]/30" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-white font-bold text-xl">{selected.name}</h2>
                  {selected.is_featured && (
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-[#007bff]/10 text-[#007bff] border border-[#007bff]/20 px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-white/30 text-xs font-mono">/labels/{selected.slug}</p>
                {selected.bio && (
                  <p className="text-white/50 text-sm mt-2 leading-relaxed line-clamp-3">{selected.bio}</p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => openEdit(selected)}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(selected)}
                  className="flex items-center gap-1.5 text-xs text-red-400/60 hover:text-red-400 border border-red-400/10 hover:border-red-400/30 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Country", value: selected.country },
                { label: "Founded", value: selected.founded_year ? String(selected.founded_year) : null },
                { label: "Genre Focus", value: selected.genre_focus },
                { label: "Contact", value: selected.contact_email },
              ].map((row) =>
                row.value ? (
                  <div key={row.label} className="bg-white/[0.03] rounded-xl px-4 py-3">
                    <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">{row.label}</p>
                    <p className="text-white/80 text-sm">{row.value}</p>
                  </div>
                ) : null
              )}
            </div>

            {/* Links */}
            {(selected.website_url || selected.instagram_handle || selected.x_handle) && (
              <div className="flex flex-wrap gap-2">
                {selected.website_url && (
                  <a href={selected.website_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-full transition-colors">
                    <ExternalLink size={11} /> Website
                  </a>
                )}
                {selected.instagram_handle && (
                  <a href={`https://instagram.com/${selected.instagram_handle}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-full transition-colors">
                    @{selected.instagram_handle}
                  </a>
                )}
                {selected.x_handle && (
                  <a href={`https://x.com/${selected.x_handle}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-full transition-colors">
                    @{selected.x_handle}
                  </a>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-white/[0.06]">
              <button
                onClick={() => toggleFeatured(selected)}
                className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors ${
                  selected.is_featured
                    ? "bg-[#007bff]/10 border-[#007bff]/30 text-[#007bff] hover:bg-[#007bff]/20"
                    : "border-white/10 text-white/40 hover:text-white hover:border-white/30"
                }`}
              >
                <Star size={12} />
                {selected.is_featured ? "Unfeature" : "Mark Featured"}
              </button>
              <a
                href={`/labels/${selected.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs border border-white/10 text-white/40 hover:text-white hover:border-white/30 px-3 py-2 rounded-lg transition-colors"
              >
                <ExternalLink size={12} /> View Public Page
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-white font-semibold text-sm">
                {editing ? "Edit Label" : "New Label"}
              </h3>
              <button onClick={closeForm} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Label Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="e.g. Empire Records"
                  className={inp}
                />
              </div>

              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">URL Slug *</label>
                <input
                  value={form.slug}
                  onChange={(e) => setField("slug", e.target.value)}
                  placeholder="e.g. empire-records"
                  className={inp}
                />
                <p className="text-white/20 text-xs mt-1">
                  Public URL: /labels/{form.slug || "…"}
                  {" · "}Must match artists&apos; &ldquo;Record Label&rdquo; field (case-insensitive)
                </p>
              </div>

              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Logo URL</label>
                <input
                  value={form.logo_url}
                  onChange={(e) => setField("logo_url", e.target.value)}
                  placeholder="https://…"
                  className={inp}
                />
              </div>

              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setField("bio", e.target.value)}
                  placeholder="A short description of the label"
                  rows={3}
                  className={textarea}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Country</label>
                  <input value={form.country} onChange={(e) => setField("country", e.target.value)} placeholder="e.g. Nigeria" className={inp} />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Founded Year</label>
                  <input value={form.founded_year} onChange={(e) => setField("founded_year", e.target.value)} placeholder="e.g. 2018" type="number" className={inp} />
                </div>
              </div>

              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Genre Focus</label>
                <input value={form.genre_focus} onChange={(e) => setField("genre_focus", e.target.value)} placeholder="e.g. Afrobeats, Amapiano" className={inp} />
              </div>

              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Website URL</label>
                <input value={form.website_url} onChange={(e) => setField("website_url", e.target.value)} placeholder="https://…" className={inp} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Instagram Handle</label>
                  <input value={form.instagram_handle} onChange={(e) => setField("instagram_handle", e.target.value)} placeholder="handle (no @)" className={inp} />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">X (Twitter) Handle</label>
                  <input value={form.x_handle} onChange={(e) => setField("x_handle", e.target.value)} placeholder="handle (no @)" className={inp} />
                </div>
              </div>

              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Contact Email</label>
                <input value={form.contact_email} onChange={(e) => setField("contact_email", e.target.value)} placeholder="label@example.com" type="email" className={inp} />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setField("is_featured", e.target.checked)}
                  className="w-4 h-4 accent-[#007bff]"
                />
                <span className="text-white/60 text-sm">Mark as Featured (shown first on /labels)</span>
              </label>
            </div>

            <div className="flex gap-3 px-5 pb-5">
              <button
                onClick={closeForm}
                className="flex-1 border border-white/10 text-white/50 hover:text-white text-sm py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.slug.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {editing ? "Save Changes" : "Create Label"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
