import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          position: "relative",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,123,255,0.25) 0%, transparent 70%)",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(0,123,255,0.12)",
            border: "1px solid rgba(0,123,255,0.3)",
            borderRadius: 100,
            padding: "8px 20px",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#007bff",
            }}
          />
          <span style={{ color: "#007bff", fontSize: 16, fontWeight: 600 }}>
            Global Music Distribution · 150+ Platforms
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.05,
            letterSpacing: "-2px",
            maxWidth: 900,
          }}
        >
          Release Your Music{" "}
          <span style={{ color: "#007bff" }}>Worldwide.</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
            marginTop: 24,
            maxWidth: 700,
            lineHeight: 1.5,
          }}
        >
          Release unlimited music. Keep 100% of your royalties. Every application
          reviewed by our team. 150+ platforms worldwide.
        </div>

        {/* Brand */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "1px",
            }}
          >
            ORINLABÍ
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
