import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "打台夥伴｜日本 SLOT・柏青哥",
  description: "日本 SLOT・柏青哥機台指南、遊玩紀錄與 AI 陪打助手",
  applicationName: "打台夥伴",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "打台夥伴" },
};

export const viewport: Viewport = {
  themeColor: "#090a0e",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>
        <PwaRegister />
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
