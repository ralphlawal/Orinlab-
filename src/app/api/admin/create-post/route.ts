import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_PIN = process.env.ADMIN_PIN ?? "";

function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set in environment");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

export async function POST(req: NextRequest) {
  const {
    pin, title, slug, excerpt, content,
    category, featured, published, cover_image_url,
  } = await req.json();

  if (!pin || pin !== ADMIN_PIN) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }
  if (!title?.trim() || !slug?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "title, slug, and content are required" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = serviceClient();
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt?.trim() ?? "",
      content: content.trim(),
      category: category?.trim() ?? "",
      featured: featured ?? false,
      published: published ?? true,
      cover_image_url: cover_image_url?.trim() ?? "",
    })
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data.id, slug: data.slug });
}
