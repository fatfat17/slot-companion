import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { id:"/",name: "打台夥伴｜日本 SLOT・柏青哥", short_name: "打台夥伴", description: "日本 SLOT・柏青哥機台指南、遊玩紀錄與 AI 陪打助手", start_url: "/", display: "standalone", background_color: "#090a0e", theme_color: "#090a0e", lang: "zh-Hant", orientation: "portrait", icons: [{ src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" }, { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" }] };
}
