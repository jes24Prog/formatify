import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Formatify",
    short_name: "Formatify",
    description: "Format, validate, convert and compare JSON, XML and YAML files.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f5f6",
    theme_color: "#3b52d4",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
