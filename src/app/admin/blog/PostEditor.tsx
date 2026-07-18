"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { slugify, readTime } from "@/lib/blogUtils";
import {
  Loader2, Eye, EyeOff, Bold, Italic, Heading2, Heading3,
  Quote, List, Link2, ImageIcon, Minus, RotateCcw,
  AlignLeft, Clock, FileText,
} from "lucide-react";

const CATEGORIES = [
  "Music Industry News", "Artist Tips", "Marketing",
  "Distribution Guides", "Success Stories", "Announcements",
];

export type PostData = {
  title: string; slug: string; excerpt: string; content: string;
  category: string; featured: boolean; published: boolean;
  cover_image_url: string; meta_description: string;
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
    meta_description: initial?.meta_description ?? "",
  });
  const [preview, setPreview] = useState(false);
  const [slugEdited, setSlugEdited] = useState(!!initial?.slug);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!slugEdited && form.title) {
      setForm((f) => ({ ...f, slug: slugify(form.title) }));
    }
  }, [form.title, slugEdited]);

  const set = useCallback((key: keyof PostData, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  // Insert markdown at cursor
  function insertMarkdown(before: string, after = "", placeholder = "") {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = form.content.substring(start, end) || placeholder;
    const newText =
      form.content.substring(0, start) + before + selected + after + form.content.substring(end);
    set("content", newText);
    setTimeout(() => {
      ta.focus();
      const cursor = start + before.length + selected.length + after.length;
      ta.setSelectionRange(cursor, cursor);
    }, 0);
  }

  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;
  const charCount = form.content.length;
  const rt = form.content ? readTime(form.content) : "0 min read";

  return (
    <div className="min-h-screen -mt-6 -mx-6 bg-[#0d0d10]">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 bg-[#0d0d10]/95 backdrop-blur border-b border-white/[0.06] px-6 py-3 flex items-center gap-3">
        <button
          onClick={onCancel}
          className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-1.5"
        >
          <RotateCcw size={13} />
          All Posts
        </button>
        <span className="text-white/15">·</span>
        <span className="text-white/50 text-sm truncate max-w-[200px]">{form.title || "Untitled"}</span>

        <div className="ml-auto flex items-center gap-2">
          {/* Status pill */}
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            form.published
              ? "bg-green-400/10 text-green-400 border border-green-400/20"
              : "bg-amber-400/10 text-amber-400 border border-amber-400/20"
          }`}>
            {form.published ? "Published" : "Draft"}
          </span>

          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-lg transition-colors"
          >
            {preview ? <EyeOff size={13} /> : <Eye size={13} />}
            {preview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={() => onSave({ ...form, published: false })}
            disabled={saving || !form.title || !form.content}
            className="text-xs font-medium text-white/60 hover:text-white border border-white/10 hover:border-white/25 disabled:opacity-40 px-4 py-1.5 rounded-lg transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={() => onSave({ ...form, published: true })}
            disabled={saving || !form.title || !form.content}
            className="flex items-center gap-1.5 text-xs font-semibold bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            {form.published ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {preview ? (
        <PreviewPane form={form} />
      ) : (
        <div className="flex min-h-[calc(100vh-53px)]">
          {/* ── Main content ── */}
          <div className="flex-1 min-w-0 px-8 py-8 max-w-3xl mx-auto">
            {/* Title */}
            <textarea
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Add title"
              rows={2}
              className="w-full bg-transparent text-white text-4xl font-bold placeholder-white/20 outline-none resize-none mb-6 leading-tight"
            />

            {/* Toolbar */}
            <div className="flex items-center gap-0.5 mb-3 p-1.5 bg-white/[0.04] border border-white/[0.07] rounded-xl flex-wrap">
              <ToolbarBtn title="Bold" onClick={() => insertMarkdown("**", "**", "bold text")}>
                <Bold size={14} />
              </ToolbarBtn>
              <ToolbarBtn title="Italic" onClick={() => insertMarkdown("*", "*", "italic text")}>
                <Italic size={14} />
              </ToolbarBtn>
              <div className="w-px h-5 bg-white/10 mx-1" />
              <ToolbarBtn title="Heading 2" onClick={() => insertMarkdown("\n## ", "", "Heading")}>
                <Heading2 size={14} />
              </ToolbarBtn>
              <ToolbarBtn title="Heading 3" onClick={() => insertMarkdown("\n### ", "", "Heading")}>
                <Heading3 size={14} />
              </ToolbarBtn>
              <div className="w-px h-5 bg-white/10 mx-1" />
              <ToolbarBtn title="Blockquote" onClick={() => insertMarkdown("\n> ", "", "Quote text")}>
                <Quote size={14} />
              </ToolbarBtn>
              <ToolbarBtn title="Bullet list" onClick={() => insertMarkdown("\n- ", "", "List item")}>
                <List size={14} />
              </ToolbarBtn>
              <ToolbarBtn title="Divider" onClick={() => insertMarkdown("\n\n---\n\n")}>
                <Minus size={14} />
              </ToolbarBtn>
              <div className="w-px h-5 bg-white/10 mx-1" />
              <ToolbarBtn title="Link" onClick={() => insertMarkdown("[", "](url)", "link text")}>
                <Link2 size={14} />
              </ToolbarBtn>
              <ToolbarBtn title="Image" onClick={() => insertMarkdown("![", "](image-url)", "alt text")}>
                <ImageIcon size={14} />
              </ToolbarBtn>
              <div className="ml-auto flex items-center gap-3 pr-1">
                <span className="text-white/20 text-[11px]">{wordCount.toLocaleString()} words</span>
                <span className="text-white/20 text-[11px]">{charCount.toLocaleString()} chars</span>
              </div>
            </div>

            {/* Content */}
            <textarea
              ref={textareaRef}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder={"Start writing your post…\n\nTip: Use ## for headings, **bold**, *italic*, > blockquote, - list items"}
              className="w-full min-h-[560px] bg-transparent text-white/80 placeholder-white/20 outline-none resize-none text-sm leading-7 font-mono"
            />
          </div>

          {/* ── Right sidebar ── */}
          <div className="w-[280px] flex-shrink-0 border-l border-white/[0.06] bg-[#0a0a0d] overflow-y-auto">

            {/* Post Status */}
            <SidePanel title="Publish" icon={<FileText size={13} />}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs">Status</span>
                  <select
                    value={form.published ? "published" : "draft"}
                    onChange={(e) => set("published", e.target.value === "published")}
                    className="bg-white/[0.06] border border-white/[0.1] text-white text-xs px-2 py-1 rounded-lg outline-none appearance-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                {form.slug && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-white/50 text-xs flex-shrink-0 mt-0.5">Permalink</span>
                    <span className="text-[#007bff] text-xs break-all text-right">/blog/{form.slug}</span>
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onSave({ ...form, published: false })}
                    disabled={saving || !form.title || !form.content}
                    className="flex-1 text-xs font-medium text-white/60 hover:text-white border border-white/10 hover:border-white/25 disabled:opacity-40 py-2 rounded-lg transition-colors"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={() => onSave({ ...form, published: true })}
                    disabled={saving || !form.title || !form.content}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white py-2 rounded-lg transition-colors"
                  >
                    {saving && <Loader2 size={11} className="animate-spin" />}
                    {form.published ? "Update" : "Publish"}
                  </button>
                </div>
              </div>
            </SidePanel>

            {/* Post Details */}
            <SidePanel title="Post Details" icon={<AlignLeft size={13} />}>
              <div className="space-y-4">
                {/* Slug */}
                <div>
                  <label className="text-white/40 text-[11px] uppercase tracking-widest font-semibold block mb-1.5">URL Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => { setSlugEdited(true); set("slug", e.target.value); }}
                    placeholder="post-url-slug"
                    className="w-full bg-white/[0.05] border border-white/[0.08] text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#007bff] transition-colors font-mono"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-white/40 text-[11px] uppercase tracking-widest font-semibold block mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/[0.08] text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#007bff] transition-colors appearance-none"
                  >
                    <option value="">Select category…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="text-white/40 text-[11px] uppercase tracking-widest font-semibold block mb-1.5">Excerpt</label>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => set("excerpt", e.target.value)}
                    placeholder="Short description for the post list page…"
                    rows={3}
                    className="w-full bg-white/[0.05] border border-white/[0.08] text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#007bff] transition-colors resize-none leading-relaxed"
                  />
                </div>
              </div>
            </SidePanel>

            {/* Featured Image */}
            <SidePanel title="Featured Image" icon={<ImageIcon size={13} />}>
              <div className="space-y-3">
                <input
                  value={form.cover_image_url}
                  onChange={(e) => set("cover_image_url", e.target.value)}
                  placeholder="https://… (paste image URL)"
                  className="w-full bg-white/[0.05] border border-white/[0.08] text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#007bff] transition-colors"
                />
                {form.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.cover_image_url}
                    alt="cover preview"
                    className="w-full aspect-video rounded-xl object-cover border border-white/[0.06]"
                  />
                ) : (
                  <div className="w-full aspect-video rounded-xl border border-dashed border-white/[0.1] flex items-center justify-center">
                    <ImageIcon size={22} className="text-white/15" />
                  </div>
                )}
              </div>
            </SidePanel>

            {/* SEO */}
            <SidePanel title="SEO" icon={<AlignLeft size={13} />}>
              <div>
                <label className="text-white/40 text-[11px] uppercase tracking-widest font-semibold block mb-1.5">Meta Description</label>
                <textarea
                  value={form.meta_description}
                  onChange={(e) => set("meta_description", e.target.value)}
                  placeholder="Brief description for search engines (150–160 chars)"
                  rows={3}
                  maxLength={160}
                  className="w-full bg-white/[0.05] border border-white/[0.08] text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#007bff] transition-colors resize-none leading-relaxed"
                />
                <p className="text-white/20 text-[10px] mt-1 text-right">
                  {form.meta_description.length}/160
                </p>
              </div>
            </SidePanel>

            {/* Post Options */}
            <SidePanel title="Options" icon={<AlignLeft size={13} />}>
              <div className="space-y-3">
                <Toggle
                  label="Featured post"
                  desc="Pin to top of blog"
                  checked={form.featured}
                  onChange={(v) => set("featured", v)}
                />
                <div className="flex items-center gap-2 pt-1 text-white/25">
                  <Clock size={12} />
                  <span className="text-[11px]">{rt}</span>
                </div>
              </div>
            </SidePanel>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Toolbar button ── */
function ToolbarBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="w-7 h-7 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
    >
      {children}
    </button>
  );
}

/* ── Sidebar panel ── */
function SidePanel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-white/[0.06]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2 text-white/60">
          {icon}
          <span className="text-xs font-semibold uppercase tracking-widest">{title}</span>
        </div>
        <span className={`text-white/25 text-xs transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

/* ── Toggle ── */
function Toggle({ label, desc, checked, onChange }: {
  label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer group">
      <div>
        <p className="text-white/70 text-xs group-hover:text-white transition-colors">{label}</p>
        {desc && <p className="text-white/30 text-[10px] mt-0.5">{desc}</p>}
      </div>
      <div
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${checked ? "bg-[#007bff]" : "bg-white/10"}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
    </label>
  );
}

/* ── Preview pane ── */
function PreviewPane({ form }: { form: PostData }) {
  const lines = form.content.split("\n");
  return (
    <div className="max-w-2xl mx-auto px-8 py-12">
      {form.category && (
        <span className="text-xs font-semibold text-[#007bff] bg-[#007bff]/10 px-3 py-1 rounded-full">
          {form.category}
        </span>
      )}
      <h1 className="text-white font-bold text-4xl leading-tight mt-5 mb-4">{form.title || "Untitled"}</h1>
      {form.excerpt && <p className="text-white/50 text-lg leading-relaxed mb-6 pb-6 border-b border-white/[0.08]">{form.excerpt}</p>}
      {form.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={form.cover_image_url} alt="" className="w-full rounded-2xl object-cover mb-8 border border-white/[0.06]" />
      )}
      <div className="space-y-2">
        {lines.map((line, i) => {
          if (line.startsWith("## ")) return <h2 key={i} className="text-white font-bold text-2xl mt-8 mb-2">{line.slice(3)}</h2>;
          if (line.startsWith("### ")) return <h3 key={i} className="text-white font-semibold text-xl mt-6 mb-2">{line.slice(4)}</h3>;
          if (line.startsWith("> ")) return <blockquote key={i} className="border-l-4 border-[#007bff]/50 pl-4 text-white/60 italic my-4">{line.slice(2)}</blockquote>;
          if (line.startsWith("- ")) return <li key={i} className="text-white/70 text-sm leading-relaxed ml-4 list-disc">{line.slice(2)}</li>;
          if (line === "---") return <hr key={i} className="border-white/[0.08] my-8" />;
          if (line === "") return <div key={i} className="h-3" />;
          const rendered = line
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[#007bff] hover:underline">$1</a>');
          return <p key={i} className="text-white/70 text-sm leading-7" dangerouslySetInnerHTML={{ __html: rendered }} />;
        })}
      </div>
    </div>
  );
}
