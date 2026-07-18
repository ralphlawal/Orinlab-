"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Star, Loader2, ShieldOff,
  Search, FileText, CheckCircle2, Clock, Bookmark,
} from "lucide-react";
import { useRouter } from "next/navigation";

const SUPER_ADMIN = (
  process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL ||
  (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",")[0]
).trim().toLowerCase();

type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  cover_image_url: string | null;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string | null;
};

type Filter = "all" | "published" | "draft" | "featured";

export default function AdminBlogPage() {
  const { requestUnlock } = usePinGate();
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  async function load() {
    const { data } = await supabase
      .from("blog_posts")
      .select("id,title,slug,category,excerpt,cover_image_url,featured,published,created_at,updated_at")
      .order("created_at", { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = (data.session?.user?.email ?? "").toLowerCase();
      setAllowed(email === SUPER_ADMIN);
    });
    load();
  }, []);

  async function togglePublished(post: Post) {
    setToggling(post.id);
    await supabase
      .from("blog_posts")
      .update({ published: !post.published, updated_at: new Date().toISOString() })
      .eq("id", post.id);
    await load();
    setToggling(null);
  }

  async function toggleFeatured(post: Post) {
    setToggling(post.id + "f");
    await supabase
      .from("blog_posts")
      .update({ featured: !post.featured, updated_at: new Date().toISOString() })
      .eq("id", post.id);
    await load();
    setToggling(null);
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    await load();
  }

  if (allowed === false) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
          <ShieldOff size={24} className="text-red-400" />
        </div>
        <div>
          <p className="text-white font-semibold">Access Restricted</p>
          <p className="text-white/40 text-sm mt-1">Blog management is only available to the primary administrator.</p>
        </div>
        <button onClick={() => router.push("/admin")} className="text-[#007bff] text-sm hover:underline">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const published = posts.filter(p => p.published);
  const drafts    = posts.filter(p => !p.published);
  const featured  = posts.filter(p => p.featured);

  const filtered = posts
    .filter(p => {
      if (filter === "published") return p.published;
      if (filter === "draft")     return !p.published;
      if (filter === "featured")  return p.featured;
      return true;
    })
    .filter(p =>
      !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.category ?? "").toLowerCase().includes(search.toLowerCase())
    );

  const TABS: { key: Filter; label: string; count: number; icon: React.ReactNode; color: string }[] = [
    { key: "all",       label: "All Posts",  count: posts.length,     icon: <FileText size={13} />,    color: "text-white/60" },
    { key: "published", label: "Published",  count: published.length, icon: <CheckCircle2 size={13} />, color: "text-green-400" },
    { key: "draft",     label: "Drafts",     count: drafts.length,    icon: <Clock size={13} />,       color: "text-amber-400" },
    { key: "featured",  label: "Featured",   count: featured.length,  icon: <Star size={13} />,        color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-0 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-bold text-2xl">Blog Posts</h1>
          <p className="text-white/35 text-sm mt-0.5">Write and publish content for your artists and audience.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} /> New Post
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
              filter === tab.key
                ? "bg-[#007bff]/10 border-[#007bff]/30"
                : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]"
            }`}
          >
            <div className={`${tab.color} ${filter === tab.key ? "" : "opacity-60"}`}>
              {tab.icon}
            </div>
            <div>
              <p className={`font-bold text-lg leading-none ${filter === tab.key ? "text-white" : "text-white/60"}`}>
                {tab.count}
              </p>
              <p className="text-white/30 text-xs mt-0.5">{tab.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts by title or category…"
          className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff]/50 text-white text-sm pl-9 pr-4 py-2.5 rounded-xl outline-none transition-colors placeholder-white/25"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="text-[#007bff] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          {posts.length === 0 ? (
            <>
              <Bookmark size={32} className="text-white/10 mx-auto mb-4" />
              <p className="text-white font-semibold mb-1">No posts yet</p>
              <p className="text-white/30 text-sm mb-5">Write your first post to get started.</p>
              <Link
                href="/admin/blog/new"
                className="inline-flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                <Plus size={16} /> Write your first post
              </Link>
            </>
          ) : (
            <>
              <Search size={28} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No posts match your filter.</p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_160px_100px_120px_130px] gap-4 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="w-16" />
            <p className="text-white/30 text-[11px] font-semibold uppercase tracking-widest">Title</p>
            <p className="text-white/30 text-[11px] font-semibold uppercase tracking-widest">Category</p>
            <p className="text-white/30 text-[11px] font-semibold uppercase tracking-widest">Status</p>
            <p className="text-white/30 text-[11px] font-semibold uppercase tracking-widest">Date</p>
            <p className="text-white/30 text-[11px] font-semibold uppercase tracking-widest text-right">Actions</p>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {filtered.map((post) => (
              <div
                key={post.id}
                className="grid grid-cols-[auto_1fr_160px_100px_120px_130px] gap-4 px-5 py-3.5 items-center hover:bg-white/[0.02] transition-colors group"
              >
                {/* Thumbnail */}
                <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/[0.05] border border-white/[0.07]">
                  {post.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.cover_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText size={14} className="text-white/20" />
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm truncate group-hover:text-[#007bff] transition-colors">
                      {post.title}
                    </p>
                    {post.featured && (
                      <Star size={11} className="text-yellow-400 flex-shrink-0" />
                    )}
                  </div>
                  {post.excerpt && (
                    <p className="text-white/30 text-xs truncate mt-0.5">{post.excerpt}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  {post.category ? (
                    <span className="text-xs bg-[#007bff]/10 text-[#007bff] px-2.5 py-1 rounded-full truncate block max-w-full">
                      {post.category}
                    </span>
                  ) : (
                    <span className="text-white/20 text-xs">—</span>
                  )}
                </div>

                {/* Status */}
                <div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    post.published
                      ? "bg-green-400/10 text-green-400"
                      : "bg-amber-400/10 text-amber-400"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${post.published ? "bg-green-400" : "bg-amber-400"}`} />
                    {post.published ? "Published" : "Draft"}
                  </span>
                </div>

                {/* Date */}
                <div>
                  <p className="text-white/35 text-xs">
                    {new Date(post.updated_at ?? post.created_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                  {post.published && (
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#007bff] text-[10px] hover:underline mt-0.5 block"
                    >
                      View live ↗
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 justify-end">
                  <ActionBtn
                    onClick={() => requestUnlock(() => toggleFeatured(post))}
                    loading={toggling === post.id + "f"}
                    title={post.featured ? "Unfeature" : "Feature"}
                    active={post.featured}
                    activeClass="text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20"
                  >
                    <Star size={14} />
                  </ActionBtn>
                  <ActionBtn
                    onClick={() => requestUnlock(() => togglePublished(post))}
                    loading={toggling === post.id}
                    title={post.published ? "Unpublish" : "Publish"}
                    active={post.published}
                    activeClass="text-green-400 bg-green-400/10 hover:bg-green-400/20"
                  >
                    {post.published ? <EyeOff size={14} /> : <Eye size={14} />}
                  </ActionBtn>
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </Link>
                  <button
                    onClick={() => requestUnlock(() => deletePost(post.id))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ onClick, loading, title, active, activeClass, children }: {
  onClick: () => void; loading: boolean; title: string;
  active: boolean; activeClass: string; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
        active ? activeClass : "text-white/40 hover:text-white hover:bg-white/[0.06]"
      }`}
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : children}
    </button>
  );
}
