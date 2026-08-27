import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "Slot Companion",
  description: "手機優先的日本角子機實戰記錄助手",
  applicationName: "Slot Companion",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Slot Companion" },
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
