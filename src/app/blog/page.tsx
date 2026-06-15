import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";

export const metadata = {
  title: "Blog – Orinlabí",
  description:
    "Music industry news, artist tips, marketing guides, distribution insights, and success stories for African artists.",
};

const categories = [
  "All",
  "Music Industry News",
  "Artist Tips",
  "Marketing",
  "Distribution Guides",
  "Success Stories",
];

const posts = [
  {
    category: "Distribution Guides",
    title: "How to Prepare Your Music for Global Distribution in 2026",
    excerpt:
      "A step-by-step guide to getting your audio files, cover art, and metadata release-ready for every major streaming platform.",
    date: "June 10, 2026",
    readTime: "6 min read",
    slug: "prepare-music-global-distribution-2026",
    featured: true,
  },
  {
    category: "Artist Tips",
    title: "The Ultimate Pre-Release Checklist for Independent Artists",
    excerpt:
      "From setting your release date to building your pre-save campaign — everything you need to launch your next release with impact.",
    date: "June 7, 2026",
    readTime: "8 min read",
    slug: "pre-release-checklist-independent-artists",
    featured: false,
  },
  {
    category: "Marketing",
    title: "How to Pitch Your Music to Playlist Curators (And Actually Get Placed)",
    excerpt:
      "Inside tips on crafting a pitch that curators respond to, the best platforms to target, and common mistakes to avoid.",
    date: "June 3, 2026",
    readTime: "5 min read",
    slug: "pitch-music-playlist-curators",
    featured: false,
  },
  {
    category: "Success Stories",
    title: "How Temi Adeyemi Hit 1M Streams in 30 Days",
    excerpt:
      "The Lagos-based Afrobeats artist shares his release strategy, marketing approach, and what he learned from his breakthrough moment.",
    date: "May 28, 2026",
    readTime: "7 min read",
    slug: "temi-adeyemi-1m-streams-30-days",
    featured: false,
  },
  {
    category: "Music Industry News",
    title: "Boomplay Hits 100 Million Users: What It Means for African Artists",
    excerpt:
      "Africa's largest music streaming platform reaches a major milestone. Here is what it means for distribution strategy in 2026.",
    date: "May 22, 2026",
    readTime: "4 min read",
    slug: "boomplay-100-million-users-african-artists",
    featured: false,
  },
  {
    category: "Artist Tips",
    title: "5 Ways to Grow Your Fanbase Without Spending Money on Ads",
    excerpt:
      "Organic growth strategies that actually work for independent African artists — from TikTok to community building.",
    date: "May 18, 2026",
    readTime: "6 min read",
    slug: "grow-fanbase-without-ads",
    featured: false,
  },
  {
    category: "Distribution Guides",
    title: "Understanding Royalties: What You Should Be Earning from Streams",
    excerpt:
      "A breakdown of streaming royalties, how they are calculated, and how to make sure you are collecting everything you are owed.",
    date: "May 14, 2026",
    readTime: "9 min read",
    slug: "understanding-streaming-royalties",
    featured: false,
  },
  {
    category: "Marketing",
    title: "Building Your Artist Brand: A Guide for African Creators",
    excerpt:
      "How to define your artistic identity, create a consistent visual presence, and build a brand that resonates with fans globally.",
    date: "May 8, 2026",
    readTime: "7 min read",
    slug: "building-artist-brand-african-creators",
    featured: false,
  },
];

const categoryColors: Record<string, string> = {
  "Music Industry News": "text-purple-400 bg-purple-400/10",
  "Artist Tips": "text-green-400 bg-green-400/10",
  "Marketing": "text-orange-400 bg-orange-400/10",
  "Distribution Guides": "text-[#007bff] bg-[#007bff]/10",
  "Success Stories": "text-yellow-400 bg-yellow-400/10",
};

function Hero() {
  return (
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
  );
}

function Categories() {
  return (
    <section className="px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((c) => (
            <button
              key={c}
              className={`text-sm font-medium px-5 py-2 rounded-full border transition-all duration-200 ${
                c === "All"
                  ? "bg-[#007bff] border-[#007bff] text-white"
                  : "bg-transparent border-white/10 text-white/60 hover:border-white/30 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function PostGrid() {
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  return (
    <section className="py-8 px-4 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Featured post */}
        {featured && (
          <div className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#007bff]/30 rounded-3xl overflow-hidden transition-all duration-300 grid md:grid-cols-5">
            <div className="md:col-span-2 aspect-video md:aspect-auto bg-gradient-to-br from-[#007bff]/20 to-black flex items-center justify-center">
              <div className="w-16 h-16 bg-[#007bff]/20 rounded-2xl flex items-center justify-center">
                <Tag size={28} className="text-[#007bff]" />
              </div>
            </div>
            <div className="md:col-span-3 p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[featured.category]}`}>
                  {featured.category}
                </span>
                <span className="text-white/20 text-xs">Featured</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 group-hover:text-[#007bff] transition-colors">
                {featured.title}
              </h2>
              <p className="text-white/50 leading-relaxed mb-6 flex-1">
                {featured.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-white/30 text-xs">
                  <span>{featured.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {featured.readTime}
                  </span>
                </div>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="flex items-center gap-2 text-[#007bff] text-sm font-semibold hover:gap-3 transition-all duration-200"
                >
                  Read More <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Post grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
            <article
              key={post.slug}
              className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#007bff]/30 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col"
            >
              <div className="aspect-video bg-gradient-to-br from-[#007bff]/10 to-black flex items-center justify-center">
                <div className="w-12 h-12 bg-[#007bff]/10 rounded-xl flex items-center justify-center">
                  <Tag size={20} className="text-[#007bff]/50" />
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full self-start mb-4 ${
                    categoryColors[post.category] || "text-white/40 bg-white/5"
                  }`}
                >
                  {post.category}
                </span>
                <h3 className="text-white font-bold text-lg mb-3 group-hover:text-[#007bff] transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6 flex-1">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3 text-white/30 text-xs">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {post.readTime}
                    </span>
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-[#007bff] text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all duration-200"
                  >
                    Read <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="py-20 px-4 bg-white/[0.02]">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Stay in the Loop.
        </h2>
        <p className="text-white/50 mb-8">
          Get the latest industry news, tips, and guides delivered to your
          inbox every week.
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
  );
}

export default function BlogPage() {
  return (
    <>
      <Hero />
      <Categories />
      <PostGrid />
      <Newsletter />
    </>
  );
}
