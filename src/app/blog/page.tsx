import { supabase } from "@/lib/supabase";
import NewsletterForm from "@/components/NewsletterForm";
import BlogPosts from "@/components/BlogPosts";

export const revalidate = 60; // refresh every 60s

export const metadata = {
  title: "Blog – Orinlabí",
  description:
    "Music industry news, artist tips, marketing guides, distribution insights, and success stories for African artists.",
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

      <BlogPosts posts={posts} />

      {/* Newsletter */}
      <section className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Stay in the Loop.</h2>
          <p className="text-white/50 mb-8">
            Get the latest industry news, tips, and guides delivered to your inbox every week.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
