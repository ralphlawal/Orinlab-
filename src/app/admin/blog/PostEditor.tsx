"use client";

import { useState, useEffect } from "react";
import { slugify, readTime } from "@/lib/blogUtils";
import { Loader2, Eye, EyeOff } from "lucide-react";

const categories = [
  "Music Industry News", "Artist Tips", "Marketing",
  "Distribution Guides", "Success Stories",
];

type PostData = {
  title: string; slug: string; excerpt: string; content: string;
  category: string; featured: boolean; published: boolean; cover_image_url: string;
};

type Props = {
  title: string;
  initial?: Partial<PostData>;
  saving: boolean;
  onSave: (data: PostData) => void;
  onCancel: () => void;
};

export default function PostEditor({ title, initial, saving, onSave, onCancel }: Props) {
  const [form, setForm] = useState<PostData>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    category: initial?.category ?? "",
    featured: initial?.featured ?? false,
    published: initial?.published ?? false,
    cover_image_url: initial?.cover_image_url ?? "",
  });
  const [preview, setPreview] = useState(false);
  const [slugEdited, setSlugEdited] = useState(!!initial?.slug);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugEdited && form.title) {
      setForm((f) => ({ ...f, slug: slugify(form.title) }));
    }
  }, [form.title, slugEdited]);

  function set(key: keyof PostData, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(published: boolean) {
    onSave({ ...form, published });
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-white font-bold text-2xl">{title}</h1>
        <button
          onClick={() => setPreview(!preview)}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-3 py-2 rounded-xl transition-colors"
        >
          {preview ? <EyeOff size={15} /> : <Eye size={15} />}
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {preview ? (
        <PreviewPane form={form} />
      ) : (
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="label">Title <Required /></label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. How to Prepare Your Music for Global Distribution"
              className="input text-lg font-semibold"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* Slug */}
            <div>
              <label className="label">URL Slug <Required /></label>
              <input
                value={form.slug}
                onChange={(e) => { setSlugEdited(true); set("slug", e.target.value); }}
                placeholder="auto-generated from title"
                className="input font-mono text-sm"
              />
              {form.slug && (
                <p className="text-white/25 text-xs mt-1">/blog/{form.slug}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="label">Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="input bg-[#0a0a0a] appearance-none"
              >
                <option value="">Select category…</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Cover image */}
          <div>
            <label className="label">Cover Image URL</label>
            <input
              value={form.cover_image_url}
              onChange={(e) => set("cover_image_url", e.target.value)}
              placeholder="https://… (paste a direct image link)"
              className="input text-sm"
            />
            {form.cover_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.cover_image_url} alt="preview" className="mt-2 h-32 rounded-xl object-cover border border-white/[0.06]" />
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label className="label">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              placeholder="Short description shown on the blog list page (1–2 sentences)"
              rows={2}
              className="input resize-none"
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Content <Required /></label>
              {form.content && (
                <span className="text-white/25 text-xs">{readTime(form.content)}</span>
              )}
            </div>
            <textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder={`Write your post here…\n\nTip: Use a blank line between paragraphs.\nUse ## for headings, **bold**, *italic*.`}
              rows={20}
              className="input resize-y font-mono text-sm leading-relaxed"
            />
            <p className="text-white/20 text-xs mt-1">
              Supports Markdown: **bold**, *italic*, ## Heading, - list item, [link](url)
            </p>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <Toggle
              label="Featured post"
              checked={form.featured}
              onChange={(v) => set("featured", v)}
            />
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
        <button
          onClick={onCancel}
          className="text-sm font-medium text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-5 py-3 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <div className="flex-1" />
        <button
          onClick={() => handleSubmit(false)}
          disabled={saving || !form.title || !form.content}
          className="text-sm font-medium text-white/60 hover:text-white border border-white/10 hover:border-white/30 disabled:opacity-40 px-5 py-3 rounded-xl transition-colors"
        >
          Save Draft
        </button>
        <button
          onClick={() => handleSubmit(true)}
          disabled={saving || !form.title || !form.content}
          className="flex items-center gap-2 text-sm font-semibold bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white px-6 py-3 rounded-xl transition-colors"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          {form.published ? "Update & Publish" : "Publish"}
        </button>
      </div>
    </div>
  );
}

/* ── Preview ── */
function PreviewPane({ form }: { form: PostData }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 space-y-4">
      {form.category && (
        <span className="text-xs font-semibold text-[#007bff] bg-[#007bff]/10 px-3 py-1 rounded-full">
          {form.category}
        </span>
      )}
      <h2 className="text-white font-bold text-3xl leading-snug">{form.title || "Untitled"}</h2>
      {form.excerpt && <p className="text-white/50 text-lg leading-relaxed">{form.excerpt}</p>}
      {form.content && (
        <div className="text-white/25 text-xs">{readTime(form.content)}</div>
      )}
      <hr className="border-white/[0.06]" />
      <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
        {form.content || <span className="text-white/20 italic">No content yet…</span>}
      </div>
    </div>
  );
}

/* ── Small components ── */
function Required() {
  return <span className="text-[#007bff] ml-1">*</span>;
}

function Toggle({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${checked ? "bg-[#007bff]" : "bg-white/10"}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
      <span className="text-white/60 text-sm group-hover:text-white transition-colors">{label}</span>
    </label>
  );
}
