import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "OrinlabÍ Records – Global Music Distribution for Independent Artists";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#050505",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "72px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient blue glow — top right */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,123,255,0.18) 0%, transparent 70%)",
          }}
        />
        {/* Ambient gold glow — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,160,23,0.14) 0%, transparent 70%)",
          }}
        />

        {/* Kente-stripe top edge */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "linear-gradient(90deg, #D4A017 0%, #2A5C3F 20%, #8B1A1A 40%, #D4A017 60%, #2A5C3F 80%, #8B1A1A 100%)",
          }}
        />

        {/* Vinyl ring decoration — right side */}
        <div
          style={{
            position: "absolute",
            right: "-120px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "520px",
            height: "520px",
            borderRadius: "50%",
            border: "32px solid rgba(212,160,23,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "380px",
              height: "380px",
              borderRadius: "50%",
              border: "24px solid rgba(0,123,255,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "240px",
                height: "240px",
                borderRadius: "50%",
                border: "16px solid rgba(212,160,23,0.10)",
              }}
            />
          </div>
        </div>

        {/* Logo pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "100px",
            padding: "10px 20px",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#007bff",
            }}
          />
          <span
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "18px",
              fontWeight: 600,
              fontFamily: "sans-serif",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            OrinlabÍ Records
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0px",
            marginBottom: "28px",
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontSize: "80px",
              fontWeight: 900,
              fontFamily: "sans-serif",
              lineHeight: 0.9,
              letterSpacing: "-3px",
            }}
          >
            Release
          </span>
          <span
            style={{
              color: "#007bff",
              fontSize: "80px",
              fontWeight: 900,
              fontFamily: "sans-serif",
              lineHeight: 0.9,
              letterSpacing: "-3px",
            }}
          >
            unlimited
          </span>
          <span
            style={{
              color: "#ffffff",
              fontSize: "80px",
              fontWeight: 900,
              fontFamily: "sans-serif",
              lineHeight: 0.9,
              letterSpacing: "-3px",
            }}
          >
            music.
          </span>
        </div>

        {/* Subline */}
        <p
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: "24px",
            fontFamily: "sans-serif",
            fontWeight: 400,
            maxWidth: "540px",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Distribute to 150+ platforms worldwide. Keep 100% of your royalties.
        </p>

        {/* Kente-stripe bottom edge */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #2A5C3F 0%, #D4A017 25%, #8B1A1A 50%, #2A5C3F 75%, #D4A017 100%)",
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
