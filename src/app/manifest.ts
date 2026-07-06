import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OrinlabÍ Records",
    short_name: "OrinlabÍ",
    description: "Global music distribution for independent artists — 150+ platforms worldwide",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#007bff",
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
