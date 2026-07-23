import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { readTime } from "@/lib/blogUtils";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { ShareButtons } from "@/components/ShareButtons";

export const revalidate = 60;

const categoryColors: Record<string, string> = {
  "Music Industry News": "text-purple-400 bg-purple-400/10",
  "Artist Tips": "text-green-400 bg-green-400/10",
  "Marketing": "text-orange-400 bg-orange-400/10",
  "Distribution Guides": "text-[#007bff] bg-[#007bff]/10",
  "Success Stories": "text-yellow-400 bg-yellow-400/10",
};

async function getPost(slug: string) {
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data;
}

async function getRelated(category: string, currentSlug: string) {
  const { data } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,category,created_at")
    .eq("published", true)
    .eq("category", category)
    .neq("slug", currentSlug)
    .limit(3);
  return data ?? [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found – OrinlabÍ Records" };

  const ogImages = post.cover_image_url
    ? [{ url: post.cover_image_url, width: 1200, height: 630, alt: post.title }]
    : [];

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `https://orinlabi.com/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://orinlabi.com/blog/${slug}`,
      type: "article",
      publishedTime: post.created_at,
      authors: [post.author ?? "OrinlabÍ Records"],
      section: post.category,
      images: ogImages,
      siteName: "OrinlabÍ Records",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: ogImages.map((i) => i.url),
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await getRelated(post.category, slug);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url: `https://orinlabi.com/blog/${slug}`,
    datePublished: post.created_at,
    dateModified: post.updated_at ?? post.created_at,
    author: {
      "@type": "Organization",
      name: post.author ?? "OrinlabÍ Records",
      url: "https://orinlabi.com",
    },
    publisher: {
      "@type": "Organization",
      name: "OrinlabÍ Records",
      url: "https://orinlabi.com",
      logo: { "@type": "ImageObject", url: "https://orinlabi.com/icon.png" },
    },
    ...(post.cover_image_url && {
      image: { "@type": "ImageObject", url: post.cover_image_url },
    }),
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://orinlabi.com/blog/${slug}` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* Header */}
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-[#007bff]/6 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          {post.category && (
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6 ${categoryColors[post.category] ?? "text-white/40 bg-white/5"}`}>
              {post.category}
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-white/60 text-lg leading-relaxed mb-8">{post.excerpt}</p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-5 text-white/30 text-sm">
              <span className="flex items-center gap-2">
                <Calendar size={14} />
                {new Date(post.created_at).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </span>
              {post.content && (
                <span className="flex items-center gap-2">
                  <Clock size={14} />
                  {readTime(post.content)}
                </span>
              )}
            </div>
            <ShareButtons
              url={`https://orinlabi.com/blog/${slug}`}
              title={post.title}
            />
          </div>
        </div>
      </section>

      {/* Cover image */}
      <div className="max-w-3xl mx-auto px-4 mb-12">
        <div className="aspect-[2/1] rounded-2xl border border-white/[0.06] overflow-hidden bg-gradient-to-br from-[#007bff]/15 via-[#007bff]/5 to-black">
          {post.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
          )}
        </div>
      </div>

      {/* Content */}
      <section className="px-4 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="prose-orinlabi">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
          {/* End-of-article share row */}
          <div className="mt-10 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-white/30 text-sm">Found this useful? Share it with other artists.</p>
            <ShareButtons
              url={`https://orinlabi.com/blog/${slug}`}
              title={post.title}
            />
          </div>
        </div>
      </section>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="py-16 px-4 bg-white/[0.02] border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-white font-bold text-2xl mb-8">More from the Blog</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#007bff]/30 rounded-2xl p-5 transition-all duration-300"
                >
                  {r.category && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[r.category] ?? "text-white/40 bg-white/5"}`}>
                      {r.category}
                    </span>
                  )}
                  <h4 className="text-white font-semibold mt-3 mb-2 group-hover:text-[#007bff] transition-colors leading-snug">
                    {r.title}
                  </h4>
                  {r.excerpt && (
                    <p className="text-white/40 text-sm line-clamp-2">{r.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h3 className="text-white font-bold text-2xl mb-3">Ready to Release?</h3>
          <p className="text-white/50 mb-6">Apply to distribute your music through OrinlabÍ Records.</p>
          <Link
            href="/submit"
            className="inline-block bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-8 py-3.5 rounded-full transition-colors"
          >
            Apply Now
          </Link>
        </div>
      </section>
    </>
  );
}
