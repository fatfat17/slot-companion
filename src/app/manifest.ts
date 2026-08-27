import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Slot Companion", short_name: "Slot Companion", description: "手機優先的日本角子機實戰記錄助手", start_url: "/", display: "standalone", background_color: "#090a0e", theme_color: "#090a0e", lang: "zh-Hant", orientation: "portrait", icons: [{ src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" }, { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" }] };
}
