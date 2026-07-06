import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "zfhtnqhnqqstxyyonjul.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        // FFmpeg WASM requires SharedArrayBuffer — needs COOP + COEP headers
        source: "/portal/tools",
        headers: [
          { key: "Cross-Origin-Opener-Policy",  value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};

export default nextConfig;
