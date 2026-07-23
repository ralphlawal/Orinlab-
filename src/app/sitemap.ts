import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE = "https://orinlabi.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                       lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/about`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/services`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/artists`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/blog`,             lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/pricing`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/submit`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/promotion`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/faq`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/contact`,          lastModified: new Date(), changeFrequency: "yearly",  priority: 0.6 },
    { url: `${BASE}/status`,           lastModified: new Date(), changeFrequency: "daily",   priority: 0.4 },
    { url: `${BASE}/privacy`,          lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,            lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/cookies`,          lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];

  const [{ data: posts }, { data: artistProfiles }, { data: releases }] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("slug, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("artist_profiles")
      .select("artist_name, updated_at"),
    supabase
      .from("releases")
      .select("id, updated_at")
      .eq("status", "approved"),
  ]);

  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const artistPages: MetadataRoute.Sitemap = (artistProfiles ?? [])
    .filter((a) => a.artist_name)
    .map((a) => ({
      url: `${BASE}/artists/${encodeURIComponent(a.artist_name.trim())}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  const listenPages: MetadataRoute.Sitemap = (releases ?? []).map((r) => ({
    url: `${BASE}/listen/${r.id}`,
    lastModified: r.updated_at ? new Date(r.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...artistPages, ...listenPages];
}
