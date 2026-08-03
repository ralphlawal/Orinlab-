"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import { LISTENING_PLATFORMS } from "@/lib/platforms";
import { PlatformIcon } from "@/components/PlatformIcon";
import {
  Link2, Plus, Copy, Check, Pencil, Trash2, Loader2,
  ExternalLink, X, Upload, Music2, Globe,
} from "lucide-react";
import Image from "next/image";

// Platforms shown in the form — main streaming DSPs
const FORM_PLATFORMS = LISTENING_PLATFORMS.filter((p) =>
  ["spotify","apple_music","youtube_music","boomplay","audiomack","deezer","tidal","soundcloud","amazon_music","tiktok","anghami"].includes(p.key)
);

const RELEASE_TYPES = ["single","ep","album","mixtape"] as const;

type SmartLink = {
  id: string;
  song_title: string;
  artist_name: string;
  genre: string;
  release_type: string;
  release_date: string | null;
  cover_art_url: string | null;
  store_links: Record<string, string> | null;
  ditto_smart_link: string | null;
  submitted_at: string;
};

type FormState = {
  songTitle: string;
  artistName: string;
  genre: string;
  releaseType: string;
  releaseDate: string;
  dittoLink: string;
  storeLinks: Record<string, string>;
  coverFile: File | null;
  coverPreview: string;
  existingCoverUrl: string;
};

function blankForm(): FormState {
  return {
    songTitle: "",
    artistName: "OrinlabÍ",
    genre: "",
    releaseType: "single",
    releaseDate: "",
    dittoLink: "",
    storeLinks: {},
    coverFile: null,
    coverPreview: "",
    existingCoverUrl: "",
  };
}

export default function AdminSmartLinksPage() {
  const { requestUnlock } = usePinGate();
  const [releases, setReleases] = useState<SmartLink[]>([]);
  const [loading, setLoading]   = useState(true);
  const [panel, setPanel]       = useState<"none" | "create" | "edit">("none");
  const [editing, setEditing]   = useState<SmartLink | null>(null);
  const [form, setForm]         = useState<FormState>(blankForm());
  const [saving, setSaving]     = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadReleases();
  }, []);

  async function loadReleases() {
    setLoading(true);
    const { data } = await supabase
      .from("releases")
      .select("id,song_title,artist_name,genre,release_type,release_date,cover_art_url,store_links,ditto_smart_link,submitted_at")
      .eq("email", "ralph@orinlabi.com")
      .order("submitted_at", { ascending: false });
    setReleases((data ?? []) as SmartLink[]);
    setLoading(false);
  }

  function openCreate() {
    setForm(blankForm());
    setEditing(null);
    setSaveError("");
    setPanel("create");
  }

  function openEdit(r: SmartLink) {
    setForm({
      songTitle: r.song_title,
      artistName: r.artist_name,
      genre: r.genre,
      releaseType: r.release_type,
      releaseDate: r.release_date ?? "",
      dittoLink: r.ditto_smart_link ?? "",
      storeLinks: r.store_links ?? {},
      coverFile: null,
      coverPreview: "",
      existingCoverUrl: r.cover_art_url ?? "",
    });
    setEditing(r);
    setSaveError("");
    setPanel("edit");
  }

  function closePanel() {
    setPanel("none");
    setEditing(null);
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (form.coverPreview) URL.revokeObjectURL(form.coverPreview);
    setForm((f) => ({ ...f, coverFile: file, coverPreview: URL.createObjectURL(file) }));
  }

  async function uploadCover(file: File): Promise<string> {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `orinlabi_own/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("cover-art").upload(path, file, { upsert: true });
    if (error) throw new Error(error.message);
    return supabase.storage.from("cover-art").getPublicUrl(path).data.publicUrl;
  }

  async function handleSave() {
    if (!form.songTitle.trim() || !form.artistName.trim() || !form.genre.trim()) return;

    requestUnlock(async () => {
      setSaving(true);
      setSaveError("");
      try {
        let coverUrl = form.existingCoverUrl;
        if (form.coverFile) coverUrl = await uploadCover(form.coverFile);

        const filteredLinks = Object.fromEntries(
          Object.entries(form.storeLinks).filter(([, v]) => v.trim())
        );

        const payload = {
          song_title:       form.songTitle.trim(),
          artist_name:      form.artistName.trim(),
          genre:            form.genre.trim(),
          release_type:     form.releaseType,
          release_date:     form.releaseDate || null,
          cover_art_url:    coverUrl || null,
          store_links:      Object.keys(filteredLinks).length ? filteredLinks : null,
          ditto_smart_link: form.dittoLink.trim() || null,
        };

        let dbError: { message: string } | null = null;

        if (panel === "create") {
          const { error } = await supabase.from("releases").insert({
            ...payload,
            email:        "ralph@orinlabi.com",
            status:       "approved",
            submitted_at: new Date().toISOString(),
          });
          dbError = error;
        } else if (panel === "edit" && editing) {
          const { error } = await supabase.from("releases").update(payload).eq("id", editing.id).eq("email", "ralph@orinlabi.com");
          dbError = error;
        }

        if (dbError) throw new Error(dbError.message);

        await loadReleases();
        closePanel();
      } catch (err) {
        setSaveError((err as Error).message);
      } finally {
        setSaving(false);
      }
    });
  }

  function doDelete(id: string) {
    requestUnlock(async () => {
      setDeletingId(id);
      try {
        await supabase.from("releases").delete().eq("id", id).eq("email", "ralph@orinlabi.com");
        await loadReleases();
      } finally {
        setDeletingId(null);
        setConfirmDelete(null);
      }
    });
  }

  function copyLink(id: string) {
    navigator.clipboard.writeText(`https://orinlabi.com/listen/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const now = new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-white font-bold text-2xl mb-1">Smart Links</h1>
          <p className="text-white/40 text-sm">
            Generate listen pages for OrinlabÍ&apos;s own releases — no artist portal needed.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors flex-shrink-0"
        >
          <Plus size={15} /> New Smart Link
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="text-[#007bff] animate-spin" />
        </div>
      ) : releases.length === 0 ? (
        <div className="text-center py-24 border border-white/[0.06] rounded-2xl">
          <Link2 size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm mb-1">No smart links yet.</p>
          <p className="text-white/20 text-xs">Click &quot;New Smart Link&quot; to create your first listen page.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {releases.map((r) => {
            const isUpcoming = !!r.release_date && new Date(r.release_date) > now;
            const linkCount  = r.store_links
              ? Object.values(r.store_links).filter(Boolean).length
              : 0;

            return (
              <div
                key={r.id}
                className="flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 transition-colors"
              >
                {/* Cover */}
                <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden bg-white/[0.05]">
                  {r.cover_art_url ? (
                    <Image
                      src={r.cover_art_url}
                      alt={r.song_title}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music2 size={20} className="text-white/20" />
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{r.song_title}</p>
                  <p className="text-white/40 text-xs capitalize">
                    {r.artist_name} · {r.genre} · {r.release_type}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        isUpcoming
                          ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
                          : "text-green-400 bg-green-400/10 border-green-400/20"
                      }`}
                    >
                      {isUpcoming
                        ? `Upcoming · ${new Date(r.release_date!).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                        : "Live"}
                    </span>
                    {linkCount > 0 && (
                      <span className="text-[11px] text-white/25">
                        {linkCount} platform{linkCount !== 1 ? "s" : ""}
                      </span>
                    )}
                    {!linkCount && r.ditto_smart_link && (
                      <span className="text-[11px] text-white/25">Smart link</span>
                    )}
                    {!linkCount && !r.ditto_smart_link && (
                      <span className="text-[11px] text-amber-400/60">No links yet</span>
                    )}
                  </div>
                </div>

                {/* Listen link */}
                <div className="hidden sm:flex items-center gap-1.5 text-white/25 text-xs font-mono flex-shrink-0">
                  /listen/<span className="text-white/40">{r.id.slice(0, 8)}…</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <a
                    href={`/listen/${r.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open listen page"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => copyLink(r.id)}
                    title="Copy listen link"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-colors"
                  >
                    {copiedId === r.id
                      ? <Check size={14} className="text-green-400" />
                      : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => openEdit(r)}
                    title="Edit"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  {confirmDelete === r.id ? (
                    <div className="flex items-center gap-2 pl-1">
                      <button
                        onClick={() => doDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                      >
                        {deletingId === r.id && <Loader2 size={11} className="animate-spin" />}
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs text-white/30 hover:text-white/60 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(r.id)}
                      title="Delete"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Panel ─────────────────────────────────────────────── */}
      {panel !== "none" && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={closePanel}
          />

          {/* Slide panel */}
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0a0a0a] border-l border-white/[0.08] flex flex-col overflow-hidden shadow-2xl">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] flex-shrink-0">
              <h2 className="text-white font-bold text-base">
                {panel === "create" ? "New Smart Link" : "Edit Smart Link"}
              </h2>
              <button
                onClick={closePanel}
                className="text-white/30 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

              {/* Cover art */}
              <div>
                <label className="text-white/40 text-xs uppercase tracking-widest block mb-2">
                  Cover Art
                </label>
                <div className="flex items-end gap-4">
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-dashed border-white/[0.12] hover:border-[#007bff]/50 cursor-pointer transition-colors group flex-shrink-0"
                  >
                    {form.coverPreview || form.existingCoverUrl ? (
                      <Image
                        src={form.coverPreview || form.existingCoverUrl}
                        alt="Cover preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-white/25 group-hover:text-white/50 transition-colors">
                        <Upload size={18} />
                        <span className="text-[11px]">Upload</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5 text-xs text-white/30">
                    <p>Square image recommended</p>
                    <p>JPG or PNG · max 10MB</p>
                    {(form.coverPreview || form.existingCoverUrl) && (
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="text-[#007bff] hover:text-[#60a5fa] transition-colors"
                      >
                        Change photo
                      </button>
                    )}
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </div>

              {/* Song title */}
              <div>
                <label className="text-white/40 text-xs uppercase tracking-widest block mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={form.songTitle}
                  onChange={(e) => setForm((f) => ({ ...f, songTitle: e.target.value }))}
                  placeholder="e.g. Afrobeats Vibes, Vol. 1"
                  className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-4 py-3 rounded-xl transition-colors"
                />
              </div>

              {/* Artist name */}
              <div>
                <label className="text-white/40 text-xs uppercase tracking-widest block mb-2">
                  Artist Name *
                </label>
                <input
                  type="text"
                  value={form.artistName}
                  onChange={(e) => setForm((f) => ({ ...f, artistName: e.target.value }))}
                  placeholder="OrinlabÍ"
                  className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-4 py-3 rounded-xl transition-colors"
                />
              </div>

              {/* Genre + Release type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-widest block mb-2">
                    Genre *
                  </label>
                  <input
                    type="text"
                    value={form.genre}
                    onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
                    placeholder="Afrobeats"
                    className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-3 py-3 rounded-xl transition-colors"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-widest block mb-2">
                    Type
                  </label>
                  <select
                    value={form.releaseType}
                    onChange={(e) => setForm((f) => ({ ...f, releaseType: e.target.value }))}
                    className="w-full bg-[#111] border border-white/[0.10] focus:border-[#007bff] outline-none text-white text-sm px-3 py-3 rounded-xl transition-colors"
                  >
                    {RELEASE_TYPES.map((t) => (
                      <option key={t} value={t} className="capitalize">
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Release date */}
              <div>
                <label className="text-white/40 text-xs uppercase tracking-widest block mb-1.5">
                  Release Date
                  <span className="ml-2 normal-case text-white/20 text-[11px]">
                    optional — future date shows &quot;upcoming&quot; page
                  </span>
                </label>
                <input
                  type="date"
                  value={form.releaseDate}
                  onChange={(e) => setForm((f) => ({ ...f, releaseDate: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white text-sm px-4 py-3 rounded-xl transition-colors"
                />
              </div>

              {/* Platform links */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white/40 text-xs uppercase tracking-widest">
                    Platform URLs
                  </label>
                  <span className="text-white/20 text-[11px]">leave blank to skip</span>
                </div>
                <div className="space-y-2">
                  {FORM_PLATFORMS.map((p) => (
                    <div key={p.key} className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${p.color}20`, color: p.color }}
                      >
                        <PlatformIcon platformKey={p.key} size={14} />
                      </div>
                      <input
                        type="url"
                        value={form.storeLinks[p.key] ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((f) => ({
                            ...f,
                            storeLinks: val
                              ? { ...f.storeLinks, [p.key]: val }
                              : Object.fromEntries(Object.entries(f.storeLinks).filter(([k]) => k !== p.key)),
                          }));
                        }}
                        placeholder={`${p.label} URL`}
                        className="flex-1 bg-white/[0.04] border border-white/[0.07] focus:border-white/25 outline-none text-white placeholder-white/15 text-xs px-3 py-2 rounded-lg transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Single smart link (fallback) */}
              <div>
                <label className="text-white/40 text-xs uppercase tracking-widest block mb-1.5">
                  <Globe className="inline w-3 h-3 mr-1 -mt-px" />
                  Single Smart Link URL
                  <span className="ml-2 normal-case text-white/20 text-[11px]">
                    shown when no platform links above
                  </span>
                </label>
                <input
                  type="url"
                  value={form.dittoLink}
                  onChange={(e) => setForm((f) => ({ ...f, dittoLink: e.target.value }))}
                  placeholder="https://orinlabi.lnk.to/your-release"
                  className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-4 py-3 rounded-xl transition-colors"
                />
              </div>

              {saveError && (
                <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  {saveError}
                </p>
              )}
            </div>

            {/* Panel footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3 flex-shrink-0">
              <button
                onClick={closePanel}
                className="flex-1 border border-white/[0.10] hover:border-white/20 text-white/50 hover:text-white font-medium py-3 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.songTitle.trim() || !form.artistName.trim() || !form.genre.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {panel === "create" ? "Create Link" : "Save Changes"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
