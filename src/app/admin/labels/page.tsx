"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import {
  Plus, Pencil, Trash2, X, Save, Loader2, Globe, Star, ExternalLink,
  CheckCircle2, XCircle, Clock,
} from "lucide-react";

type Label = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
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
  status: string | null;
  submitted_at: string | null;
  rejection_reason: string | null;
  created_at: string;
};

const EMPTY_FORM = {
  name: "",
  slug: "",
  email: "",
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

const STATUS_COLORS: Record<string, string> = {
  pending:  "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  approved: "text-green-400 bg-green-400/10 border-green-400/20",
  rejected: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function AdminLabelsPage() {
  const { requestUnlock } = usePinGate();
  const [labels, setLabels]         = useState<Label[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<Label | null>(null);
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<Label | null>(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [artistCounts, setArtistCounts] = useState<Record<string, number>>({});
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [tab, setTab]               = useState<"all" | "pending">("pending");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("label_profiles")
      .select("*")
      .order("submitted_at", { ascending: false });
    setLabels((data as Label[]) ?? []);

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

  const pending  = labels.filter((l) => l.status === "pending" || l.status === null);
  const approved = labels.filter((l) => l.status === "approved");
  const rejected = labels.filter((l) => l.status === "rejected");
  const displayed = tab === "pending" ? pending : labels;

  async function approveLabel(l: Label) {
    requestUnlock(async () => {
      await supabase.from("label_profiles").update({ status: "approved" }).eq("id", l.id);
      // Notify the label
      if (l.email) {
        await fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "label-approved",
            data: { name: l.name, email: l.email, slug: l.slug },
          }),
        }).catch(() => {});
      }
      load();
    });
  }

  async function rejectLabel(l: Label) {
    if (!rejectReason.trim()) return;
    requestUnlock(async () => {
      await supabase.from("label_profiles")
        .update({ status: "rejected", rejection_reason: rejectReason.trim() })
        .eq("id", l.id);
      // Notify the label
      if (l.email) {
        await fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "label-rejected",
            data: { name: l.name, email: l.email, reason: rejectReason.trim() },
          }),
        }).catch(() => {});
      }
      setShowRejectBox(false);
      setRejectReason("");
      load();
    });
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(l: Label) {
    setEditing(l);
    setForm({
      name:             l.name,
      slug:             l.slug,
      email:            l.email ?? "",
      logo_url:         l.logo_url ?? "",
      bio:              l.bio ?? "",
      country:          l.country ?? "",
      founded_year:     l.founded_year ? String(l.founded_year) : "",
      genre_focus:      l.genre_focus ?? "",
      website_url:      l.website_url ?? "",
      instagram_handle: l.instagram_handle ?? "",
      x_handle:         l.x_handle ?? "",
      contact_email:    l.contact_email ?? "",
      is_featured:      l.is_featured,
    });
    setShowForm(true);
  }

  function closeForm() { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); }

  function setField(key: string, value: string | boolean) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "name" && typeof value === "string" && !editing) next.slug = toSlug(value);
      return next;
    });
  }

  async function handleSave() {
    if (!form.name.trim() || !form.slug.trim()) return;
    requestUnlock(async () => {
      setSaving(true);
      const payload = {
        name:             form.name.trim(),
        slug:             form.slug.trim(),
        email:            form.email.trim() || null,
        logo_url:         form.logo_url.trim() || null,
        bio:              form.bio.trim() || null,
        country:          form.country.trim() || null,
        founded_year:     form.founded_year ? parseInt(form.founded_year) : null,
        genre_focus:      form.genre_focus.trim() || null,
        website_url:      form.website_url.trim() || null,
        instagram_handle: form.instagram_handle.trim() || null,
        x_handle:         form.x_handle.trim() || null,
        contact_email:    form.contact_email.trim() || null,
        is_featured:      form.is_featured,
      };
      if (editing) {
        await supabase.from("label_profiles").update(payload).eq("id", editing.id);
      } else {
        await supabase.from("label_profiles").insert({ ...payload, status: "approved" });
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
      await supabase.from("label_profiles").update({ is_featured: !l.is_featured }).eq("id", l.id);
      load();
    });
  }

  const inp = "w-full bg-white/[0.04] border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-[#007bff]/50 placeholder:text-white/20";
  const textarea = inp + " resize-none";

  return (
    <div className="flex gap-6 h-full">
      {/* Left: list */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-3">
        {/* Tabs + create */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab("pending")}
            className={`flex-1 text-xs font-semibold py-2 rounded-xl border transition-colors relative ${
              tab === "pending"
                ? "bg-[#007bff]/10 border-[#007bff]/30 text-[#007bff]"
                : "border-white/10 text-white/40 hover:text-white"
            }`}
          >
            Pending
            {pending.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {pending.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("all")}
            className={`flex-1 text-xs font-semibold py-2 rounded-xl border transition-colors ${
              tab === "all"
                ? "bg-[#007bff]/10 border-[#007bff]/30 text-[#007bff]"
                : "border-white/10 text-white/40 hover:text-white"
            }`}
          >
            All ({labels.length})
          </button>
          <button
            onClick={openCreate}
            className="bg-[#007bff] hover:bg-[#0069d9] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex-shrink-0"
          >
            <Plus size={14} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={22} className="text-[#007bff] animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <p className="text-white/30 text-xs text-center py-8">
            {tab === "pending" ? "No pending applications" : "No labels yet"}
          </p>
        ) : (
          displayed.map((l) => (
            <button
              key={l.id}
              onClick={() => { setSelected(selected?.id === l.id ? null : l); setShowRejectBox(false); setRejectReason(""); }}
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
                  <div className="flex items-center gap-2 mt-0.5">
                    {l.status && (
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[l.status] ?? "text-white/30 bg-white/5 border-white/10"}`}>
                        {l.status}
                      </span>
                    )}
                    <p className="text-white/30 text-xs">
                      {artistCounts[l.name.toLowerCase().trim()] ?? 0} artists
                    </p>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Right: detail */}
      <div className="flex-1 min-w-0">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-white/20 text-sm">
            Select a label to review, or create a new one
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-5">
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
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-white font-bold text-xl">{selected.name}</h2>
                  {selected.status && (
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_COLORS[selected.status] ?? "text-white/30 bg-white/5 border-white/10"}`}>
                      {selected.status}
                    </span>
                  )}
                  {selected.is_featured && (
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-[#007bff]/10 text-[#007bff] border border-[#007bff]/20 px-2 py-0.5 rounded-full">Featured</span>
                  )}
                </div>
                <p className="text-white/30 text-xs font-mono">/labels/{selected.slug}</p>
                {selected.bio && <p className="text-white/50 text-sm mt-2 leading-relaxed line-clamp-2">{selected.bio}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(selected)} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-lg transition-colors">
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => handleDelete(selected)} className="flex items-center gap-1.5 text-xs text-red-400/60 hover:text-red-400 border border-red-400/10 hover:border-red-400/30 px-3 py-1.5 rounded-lg transition-colors">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>

            {/* Application info */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Email",        value: selected.email },
                { label: "Country",      value: selected.country },
                { label: "Founded",      value: selected.founded_year ? String(selected.founded_year) : null },
                { label: "Genre Focus",  value: selected.genre_focus },
                { label: "Contact",      value: selected.contact_email },
                { label: "Applied",      value: selected.submitted_at ? new Date(selected.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null },
              ].map((row) =>
                row.value ? (
                  <div key={row.label} className="bg-white/[0.03] rounded-xl px-4 py-3">
                    <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">{row.label}</p>
                    <p className="text-white/80 text-sm break-all">{row.value}</p>
                  </div>
                ) : null
              )}
              {selected.rejection_reason && (
                <div className="col-span-2 bg-red-400/5 border border-red-400/20 rounded-xl px-4 py-3">
                  <p className="text-red-400/60 text-[10px] uppercase tracking-widest mb-0.5">Rejection Reason</p>
                  <p className="text-red-400/80 text-sm">{selected.rejection_reason}</p>
                </div>
              )}
            </div>

            {/* Links */}
            {(selected.website_url || selected.instagram_handle || selected.x_handle) && (
              <div className="flex flex-wrap gap-2">
                {selected.website_url && (
                  <a href={selected.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-full transition-colors">
                    <ExternalLink size={11} /> Website
                  </a>
                )}
                {selected.instagram_handle && (
                  <a href={`https://instagram.com/${selected.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-full transition-colors">
                    @{selected.instagram_handle}
                  </a>
                )}
              </div>
            )}

            {/* Approve / reject */}
            <div className="pt-2 border-t border-white/[0.06]">
              {selected.status !== "approved" && (
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => approveLabel(selected)}
                    className="flex items-center gap-1.5 text-xs bg-green-400/10 hover:bg-green-400/20 border border-green-400/20 text-green-400 px-4 py-2 rounded-lg transition-colors"
                  >
                    <CheckCircle2 size={13} /> Approve
                  </button>
                  {selected.status !== "rejected" && (
                    <button
                      onClick={() => setShowRejectBox(!showRejectBox)}
                      className="flex items-center gap-1.5 text-xs bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 text-red-400 px-4 py-2 rounded-lg transition-colors"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  )}
                </div>
              )}

              {showRejectBox && (
                <div className="space-y-2 mb-3">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection (sent to the label)…"
                    rows={2}
                    className="w-full bg-red-400/5 border border-red-400/20 text-white/80 text-sm rounded-lg px-3 py-2 outline-none resize-none placeholder:text-white/20"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => rejectLabel(selected)} disabled={!rejectReason.trim()} className="flex items-center gap-1.5 text-xs bg-red-400 hover:bg-red-500 disabled:opacity-40 text-black font-semibold px-4 py-2 rounded-lg transition-colors">
                      Confirm Rejection
                    </button>
                    <button onClick={() => { setShowRejectBox(false); setRejectReason(""); }} className="text-xs text-white/40 hover:text-white px-3 py-2 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => toggleFeatured(selected)} className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors ${
                  selected.is_featured ? "bg-[#007bff]/10 border-[#007bff]/30 text-[#007bff] hover:bg-[#007bff]/20" : "border-white/10 text-white/40 hover:text-white hover:border-white/30"
                }`}>
                  <Star size={12} />{selected.is_featured ? "Unfeature" : "Mark Featured"}
                </button>
                {selected.status === "approved" && (
                  <a href={`/labels/${selected.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs border border-white/10 text-white/40 hover:text-white hover:border-white/30 px-3 py-2 rounded-lg transition-colors">
                    <ExternalLink size={12} /> Public Page
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-white font-semibold text-sm">{editing ? "Edit Label" : "New Label"}</h3>
              <button onClick={closeForm} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Label Name *</label>
                <input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. Empire Records" className={inp} />
              </div>
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">URL Slug *</label>
                <input value={form.slug} onChange={(e) => setField("slug", e.target.value)} placeholder="e.g. empire-records" className={inp} />
                <p className="text-white/20 text-xs mt-1">/labels/{form.slug || "…"}</p>
              </div>
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Login Email</label>
                <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="label@example.com" className={inp} />
              </div>
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Logo URL</label>
                <input value={form.logo_url} onChange={(e) => setField("logo_url", e.target.value)} placeholder="https://…" className={inp} />
              </div>
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Bio</label>
                <textarea value={form.bio} onChange={(e) => setField("bio", e.target.value)} placeholder="A short description" rows={3} className={textarea} />
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
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Instagram</label>
                  <input value={form.instagram_handle} onChange={(e) => setField("instagram_handle", e.target.value)} placeholder="handle" className={inp} />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">X Handle</label>
                  <input value={form.x_handle} onChange={(e) => setField("x_handle", e.target.value)} placeholder="handle" className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Contact Email (Public)</label>
                <input type="email" value={form.contact_email} onChange={(e) => setField("contact_email", e.target.value)} placeholder="booking@label.com" className={inp} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setField("is_featured", e.target.checked)} className="w-4 h-4 accent-[#007bff]" />
                <span className="text-white/60 text-sm">Mark as Featured</span>
              </label>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={closeForm} className="flex-1 border border-white/10 text-white/50 hover:text-white text-sm py-2.5 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.slug.trim()} className="flex-1 flex items-center justify-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
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
