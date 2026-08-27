"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { findActiveSession } from "@/lib/storage";
import type { Session } from "@/types";
import { getMachine, machines } from "@/data/machines";

const entries = [
  { href: "/identify", icon: "📷", title: "拍機台", sub: "照片選擇・模擬辨識", tone: "pink" },
  { href: "/records", icon: "📊", title: "今日紀錄", sub: "查看今天的實戰", tone: "blue" },
  { href: "/hunter", icon: "🌙", title: "晚上撿台", sub: "快速評估表單", tone: "purple" },
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

      <Link href={active ? `/session/${active.id}` : "/machines"} className="session-hero">
        <span className="session-icon">🎰</span>
        <span className="flex-1">
          <small>{active ? "進行中的 SESSION" : "準備好了嗎？"}</small>
          <strong>{active ? `繼續 ${activeMachine?.nameZh ?? "Session"}` : "開始 Session"}</strong>
          <em>{active ? `${active.actualG} G · 投入 ¥${active.investmentYen.toLocaleString()}` : "選擇機種，立即開始記錄"}</em>
        </span>
        <b>›</b>
      </Link>

      <div className="entry-grid">
        {entries.map((entry) => (
          <Link key={entry.href} href={entry.href} className={`entry-card ${entry.tone}`}>
            <span>{entry.icon}</span>
            <strong>{entry.title}</strong>
            <small>{entry.sub}</small>
          </Link>
        ))}
      </div>

      <section className="section">
        <div className="section-title"><h2>內建機種</h2><span>Mock data</span></div>
        <div className="machine-strip">
          {machines.map((machine) => (
            <Link key={machine.id} href={`/machines/${machine.id}`} className="mini-machine" style={{ "--machine-accent": machine.accent } as React.CSSProperties}>
              <i />
              <div><strong>{machine.nameZh}</strong><span>{machine.nameJa}</span></div>
              <b>›</b>
            </Link>
          ))}
        </div>
      </section>
      <p className="home-foot">資料僅供記錄示範，不包含真實天井、Zone 或期待值。</p>
    </main>
  );
}
