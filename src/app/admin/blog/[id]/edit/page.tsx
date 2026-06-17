"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/blogUtils";
import PostEditor from "../../PostEditor";
import { Loader2 } from "lucide-react";

type Post = {
  id: string; title: string; slug: string; excerpt: string;
  content: string; category: string; featured: boolean; published: boolean;
  cover_image_url: string;
};

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("blog_posts").select("*").eq("id", id).single().then(({ data }) => {
      setPost(data);
    });
  }, [id]);

  async function handleSave(data: {
    title: string; slug: string; excerpt: string; content: string;
    category: string; featured: boolean; published: boolean; cover_image_url: string;
  }) {
    setSaving(true);
    const finalSlug = data.slug || slugify(data.title);
    const { error } = await supabase.from("blog_posts").update({
      ...data,
      slug: finalSlug,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    setSaving(false);
    if (!error) router.push("/admin/blog");
    else alert("Error saving post: " + error.message);
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  return (
    <PostEditor
      title="Edit Post"
      initial={post}
      saving={saving}
      onSave={handleSave}
      onCancel={() => router.push("/admin/blog")}
    />
  );
}
