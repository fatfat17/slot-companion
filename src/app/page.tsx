"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { findActiveSession } from "@/lib/storage";
import type { Session } from "@/types";
import { getMachine } from "@/data/machines";

const entries = [
  { href: "/identify", icon: "📷", title: "拍機台", sub: "拍照・AI 機種辨識", tone: "pink", wide: true },
  { href: "/catalog", icon: "📖", title: "機台攻略", sub: "搜尋機種・查看中文圖文指南・開始 Session", tone: "cyan", wide: true },
  { href: "/records", icon: "📊", title: "今日紀錄", sub: "查看今天的實戰", tone: "blue" },
  { href: "/halls", icon: "📍", title: "附近店家", sub: "P-WORLD 店家搜尋・Google Maps 導航", tone: "purple" },
];

export default function Home() {
  const [active, setActive] = useState<Session>();
  useEffect(() => setActive(findActiveSession()), []);
  const activeMachine = active ? getMachine(active.machineId) : undefined;

  return (
    <main className="page home-page">
      <div className="home-top">
        <div>
          <p className="brand-kicker">SLOT COMPANION</p>
          <h1>今晚，打得更明白。</h1>
          <p>記錄節奏、看懂流程，專心享受每一局。</p>
        </div>
        <div className="brand-mark">SC</div>
      </div>

      <Link href={active ? `/session/${active.id}` : "/identify"} className="session-hero">
        <span className="session-icon">🎰</span>
        <span className="flex-1">
          <small>{active ? "進行中的 SESSION" : "從辨識開始"}</small>
          <strong>{active ? `繼續 ${activeMachine?.nameZh ?? "Session"}` : "拍機台，開始記錄"}</strong>
          <em>{active ? `${active.trackers[activeMachine?.profile.gameTrackers.find(item=>item.primary)?.key??"dataGame"]??active.actualG} G · 投入 ¥${active.investmentYen.toLocaleString()}` : "辨識機種 → 查看指南 → 開始 Session"}</em>
        </span>
        <b>›</b>
      </Link>

      <div className="entry-grid">
        {entries.map((entry) => (
          <Link key={entry.href} href={entry.href} className={`entry-card ${entry.tone}${entry.wide ? " wide" : ""}`}>
            <span>{entry.icon}</span>
            <strong>{entry.title}</strong>
            <small>{entry.sub}</small>
          </Link>
        ))}
      </div>

      <Link href="/glossary" className="home-glossary-link"><span>新手第一次玩？</span><strong>用繁體中文看懂 Pachislot 常用術語</strong><b>›</b></Link>

    </main>
  );
}
