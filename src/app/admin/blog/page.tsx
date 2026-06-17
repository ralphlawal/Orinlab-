"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Star, Loader2,
} from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  featured: boolean;
  published: boolean;
  created_at: string;
};

export default function AdminBlogPage() {
  const { requestUnlock } = usePinGate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from("blog_posts")
      .select("id,title,slug,category,featured,published,created_at")
      .order("created_at", { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

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

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-2xl">Blog</h1>
          <p className="text-white/40 text-sm mt-1">Write and publish posts for your artists.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} /> New Post
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="text-[#007bff] animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <p className="text-white/30 mb-4">No posts yet.</p>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={16} /> Write your first post
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-4"
            >
              {/* Status dot */}
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${post.published ? "bg-green-400" : "bg-white/20"}`} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-semibold text-sm truncate">{post.title}</p>
                  {post.featured && (
                    <span className="text-xs bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-full font-medium">
                      Featured
                    </span>
                  )}
                  {post.category && (
                    <span className="text-xs bg-[#007bff]/10 text-[#007bff] px-2 py-0.5 rounded-full">
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-white/30 text-xs">
                    {post.published ? "Published" : "Draft"} ·{" "}
                    {new Date(post.created_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                  {post.published && (
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#007bff] text-xs hover:underline"
                    >
                      View live ↗
                    </a>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <ActionBtn
                  onClick={() => requestUnlock(() => toggleFeatured(post))}
                  loading={toggling === post.id + "f"}
                  title={post.featured ? "Unfeature" : "Feature"}
                  active={post.featured}
                >
                  <Star size={15} />
                </ActionBtn>
                <ActionBtn
                  onClick={() => requestUnlock(() => togglePublished(post))}
                  loading={toggling === post.id}
                  title={post.published ? "Unpublish" : "Publish"}
                  active={post.published}
                >
                  {post.published ? <EyeOff size={15} /> : <Eye size={15} />}
                </ActionBtn>
                <Link
                  href={`/admin/blog/${post.id}/edit`}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                  title="Edit"
                >
                  <Pencil size={15} />
                </Link>
                <button
                  onClick={() => requestUnlock(() => deletePost(post.id))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ onClick, loading, title, active, children }: {
  onClick: () => void; loading: boolean; title: string; active: boolean; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
        active
          ? "text-[#007bff] bg-[#007bff]/10 hover:bg-[#007bff]/20"
          : "text-white/40 hover:text-white hover:bg-white/[0.06]"
      }`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : children}
    </button>
  );
}
