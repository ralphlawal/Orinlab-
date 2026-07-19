import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 300;

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: release } = await supabase
    .from("releases")
    .select("song_title,artist_name,cover_art_url,release_type,genre")
    .eq("id", id)
    .maybeSingle();

  const title = release?.song_title ?? "New Release";
  const artist = release?.artist_name ?? "";
  const coverUrl = release?.cover_art_url;

  if (coverUrl) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "#000",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Cover art — left half */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.35) blur(4px)",
            }}
            alt=""
          />
          {/* Cover thumbnail — centred left */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            style={{
              position: "absolute",
              left: 80,
              top: "50%",
              transform: "translateY(-50%)",
              width: 380,
              height: 380,
              objectFit: "cover",
              borderRadius: 24,
              boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
            }}
            alt={title}
          />
          {/* Gradient overlay right side */}
          <div
            style={{
              position: "absolute",
              left: 350,
              top: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.95) 100%)",
            }}
          />
          {/* Text */}
          <div
            style={{
              position: "absolute",
              right: 80,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              maxWidth: 520,
              gap: 0,
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                margin: 0,
                marginBottom: 12,
              }}
            >
              {release?.release_type ?? "Single"} · {release?.genre ?? ""}
            </p>
            <p
              style={{
                color: "#ffffff",
                fontSize: 56,
                fontWeight: 800,
                lineHeight: 1.05,
                margin: 0,
                marginBottom: 14,
              }}
            >
              {title}
            </p>
            <p
              style={{
                color: "#60a5fa",
                fontSize: 28,
                fontWeight: 600,
                margin: 0,
                marginBottom: 32,
              }}
            >
              {artist}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.25)",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              ORINLABÍ RECORDS
            </p>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // No cover art — branded fallback
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #050505 0%, #0a0a1a 100%)",
          gap: 0,
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 500,
            background: "radial-gradient(circle, rgba(0,123,255,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <p
          style={{
            color: "rgba(255,255,255,0.25)",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            margin: 0,
            marginBottom: 20,
          }}
        >
          NOW AVAILABLE
        </p>
        <p
          style={{
            color: "#ffffff",
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.05,
            textAlign: "center",
            margin: 0,
            marginBottom: 16,
            maxWidth: 900,
          }}
        >
          {title}
        </p>
        <p
          style={{
            color: "#60a5fa",
            fontSize: 28,
            fontWeight: 600,
            margin: 0,
            marginBottom: 48,
          }}
        >
          {artist}
        </p>
        <p
          style={{
            color: "rgba(255,255,255,0.2)",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          ORINLABÍ RECORDS
        </p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
