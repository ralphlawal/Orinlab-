import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: post } = await supabase
    .from("blog_posts")
    .select("title,excerpt,category")
    .eq("slug", slug)
    .maybeSingle();

  const title = post?.title ?? "Orinlabí Blog";
  const excerpt = post?.excerpt ?? "Music industry insights for independent artists worldwide.";
  const category = post?.category ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#000",
          position: "relative",
          padding: 64,
        }}
      >
        {/* Top accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "#007bff",
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,123,255,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: "auto",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, fontWeight: 600, letterSpacing: "2px" }}>
            ORINLABÍ BLOG
          </span>
          {category && (
            <>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16 }}>·</span>
              <span style={{ color: "#007bff", fontSize: 16, fontWeight: 600 }}>{category}</span>
            </>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 60 ? 48 : 60,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            maxWidth: 900,
            marginBottom: 24,
          }}
        >
          {title}
        </div>

        {/* Excerpt */}
        {excerpt && (
          <div
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.5,
              maxWidth: 800,
              marginBottom: 48,
            }}
          >
            {excerpt.length > 120 ? excerpt.slice(0, 120) + "…" : excerpt}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#007bff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, fontWeight: 600 }}>
            orinlabi.com/blog
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
