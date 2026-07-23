import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/portal", "/auth", "/api/"],
      },
    ],
    sitemap: "https://orinlabi.com/sitemap.xml",
  };
}
