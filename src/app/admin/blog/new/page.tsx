"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/blogUtils";
import PostEditor from "../PostEditor";
import { usePinGate } from "@/context/AdminPinContext";

export default function NewPostPage() {
  const router = useRouter();
  const { requestUnlock } = usePinGate();
  const [saving, setSaving] = useState(false);

  async function handleSave(data: {
    title: string; slug: string; excerpt: string; content: string;
    category: string; featured: boolean; published: boolean; cover_image_url: string;
  }) {
    setSaving(true);
    const finalSlug = data.slug || slugify(data.title);
    const { error } = await supabase.from("blog_posts").insert({
      ...data,
      slug: finalSlug,
    });
    setSaving(false);
    if (!error) router.push("/admin/blog");
    else alert("Error saving post: " + error.message);
  }

  return (
    <PostEditor
      title="New Post"
      saving={saving}
      onSave={(data) => requestUnlock(() => handleSave(data))}
      onCancel={() => router.push("/admin/blog")}
    />
  );
}
