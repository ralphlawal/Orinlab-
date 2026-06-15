import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { readTime } from "@/lib/blogUtils";

export const revalidate = 60; // refresh every 60s

export const metadata = {
  title: "Blog – Orinlabí",
  description:
    "Music industry news, artist tips, marketing guides, distribution insights, and success stories for African artists.",
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

async function getPosts() {
  const { data } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,content,category,featured,created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function BlogPage() {
  const posts = await getPosts();
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  return (
    <>
      <section className="relative pt-32 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#007bff]/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4">
            The Orinlabí Blog
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            Knowledge for Artists.
          </h1>
          <p className="text-white/60 text-lg">
            Industry news, release tips, marketing guides, and success stories
            for independent African artists.
          </p>
        </div>
      </section>

      {/* Category filter — visual only for now */}
      <section className="px-4 pb-12">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3 justify-center">
          {categories.map((c) => (
            <span
              key={c}
              className={`text-sm font-medium px-5 py-2 rounded-full border transition-all duration-200 cursor-default ${
                c === "All"
                  ? "bg-[#007bff] border-[#007bff] text-white"
                  : "bg-transparent border-white/10 text-white/60"
              }`}
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      <section className="py-8 px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-24 text-white/30">
              No posts published yet. Check back soon.
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

      {/* Newsletter */}
      <section className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Stay in the Loop.</h2>
          <p className="text-white/50 mb-8">
            Get the latest industry news, tips, and guides delivered to your inbox every week.
          </p>
          <form className="flex gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-5 py-3.5 rounded-full transition-colors"
            />
            <button
              type="submit"
              className="bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-6 py-3.5 rounded-full text-sm transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
