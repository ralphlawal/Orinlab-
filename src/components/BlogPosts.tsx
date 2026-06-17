"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { readTime } from "@/lib/blogUtils";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  featured: boolean;
  created_at: string;
};

const categories = [
  "All", "Music Industry News", "Artist Tips",
  "Marketing", "Distribution Guides", "Success Stories",
];

const categoryColors: Record<string, string> = {
  "Music Industry News": "text-purple-400 bg-purple-400/10",
  "Artist Tips": "text-green-400 bg-green-400/10",
  "Marketing": "text-orange-400 bg-orange-400/10",
  "Distribution Guides": "text-[#007bff] bg-[#007bff]/10",
  "Success Stories": "text-yellow-400 bg-yellow-400/10",
};

export default function BlogPosts({ posts }: { posts: Post[] }) {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? posts : posts.filter((p) => p.category === active);
  const featured = filtered.find((p) => p.featured) ?? filtered[0];
  const rest = filtered.filter((p) => p.id !== featured?.id);

  return (
    <>
      {/* Category filter */}
      <section className="px-4 pb-12">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3 justify-center">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`text-sm font-medium px-5 py-2 rounded-full border transition-all duration-200 ${
                c === active
                  ? "bg-[#007bff] border-[#007bff] text-white"
                  : "bg-transparent border-white/10 text-white/60 hover:border-white/30 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="py-8 px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-white/30">
              No posts in this category yet.
            </div>
          ) : (
            <div className="space-y-8">
              {/* Featured */}
              {featured && (
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#007bff]/30 rounded-3xl overflow-hidden transition-all duration-300 grid md:grid-cols-5 block"
                >
                  <div className="md:col-span-2 aspect-video md:aspect-auto bg-gradient-to-br from-[#007bff]/20 to-black flex items-center justify-center">
                    <div className="w-16 h-16 bg-[#007bff]/20 rounded-2xl flex items-center justify-center">
                      <Tag size={28} className="text-[#007bff]" />
                    </div>
                  </div>
                  <div className="md:col-span-3 p-8 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      {featured.category && (
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[featured.category] ?? "text-white/40 bg-white/5"}`}>
                          {featured.category}
                        </span>
                      )}
                      <span className="text-white/20 text-xs">Featured</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 group-hover:text-[#007bff] transition-colors">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="text-white/50 leading-relaxed mb-6 flex-1">{featured.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-white/30 text-xs">
                        <span>{new Date(featured.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                        {featured.content && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />{readTime(featured.content)}
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-2 text-[#007bff] text-sm font-semibold">
                        Read More <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#007bff]/30 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col"
                    >
                      <div className="aspect-video bg-gradient-to-br from-[#007bff]/10 to-black flex items-center justify-center">
                        <div className="w-12 h-12 bg-[#007bff]/10 rounded-xl flex items-center justify-center">
                          <Tag size={20} className="text-[#007bff]/50" />
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        {post.category && (
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full self-start mb-4 ${categoryColors[post.category] ?? "text-white/40 bg-white/5"}`}>
                            {post.category}
                          </span>
                        )}
                        <h3 className="text-white font-bold text-lg mb-3 group-hover:text-[#007bff] transition-colors leading-snug">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-white/50 text-sm leading-relaxed mb-6 flex-1">{post.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-3 text-white/30 text-xs">
                            <span>{new Date(post.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                            {post.content && (
                              <span className="flex items-center gap-1">
                                <Clock size={11} />{readTime(post.content)}
                              </span>
                            )}
                          </div>
                          <span className="text-[#007bff] text-xs font-semibold flex items-center gap-1">
                            Read <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
