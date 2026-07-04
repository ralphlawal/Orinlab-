import { supabase } from "@/lib/supabase";
import NewsletterForm from "@/components/NewsletterForm";
import BlogPosts from "@/components/BlogPosts";
import { AnimateIn } from "@/components/AnimateIn";

export const revalidate = 60; // refresh every 60s

export const metadata = {
  title: "Blog – OrinlabÍ Records",
  description:
    "Music industry news, artist tips, marketing guides, distribution insights, and success stories for independent artists worldwide.",
};

async function getPosts() {
  const { data } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,content,category,featured,created_at,cover_image_url")
    .eq("published", true)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <section className="relative pt-32 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-[#007bff]/7 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-pink-500/4 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <AnimateIn>
            <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4">
              The OrinlabÍ Records Blog
            </p>
          </AnimateIn>
          <AnimateIn delay={80}>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
              Knowledge for Artists.
            </h1>
          </AnimateIn>
          <AnimateIn delay={140}>
            <p className="text-white/60 text-lg">
              Industry news, release tips, marketing guides, and success stories
              for independent artists worldwide.
            </p>
          </AnimateIn>
        </div>
      </section>

      <BlogPosts posts={posts} />

      {/* Newsletter */}
      <section className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-xl mx-auto text-center">
          <AnimateIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Stay in the Loop.</h2>
          </AnimateIn>
          <AnimateIn delay={80}>
            <p className="text-white/50 mb-8">
              Get the latest industry news, tips, and guides delivered to your inbox every week.
            </p>
          </AnimateIn>
          <AnimateIn delay={140}>
            <NewsletterForm />
          </AnimateIn>
        </div>
      </section>
    </>
  );
}
