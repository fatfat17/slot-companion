"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { findActiveSession } from "@/lib/storage";
import type { Session } from "@/types";
import { getMachine } from "@/data/machines";
import { findActivePachinkoSession } from "@/lib/pachinko/storage";
import type { PachinkoSession } from "@/types/pachinko";

const entries = [
  { href: "/catalog", icon: "🎰", title: "柏青嫂資料庫", sub: "搜尋 Slot・查看中文圖文指南・開始 Session", tone: "cyan", wide: true },
  { href: "/pachinko", icon: "🔴", title: "柏青哥資料庫", sub: "搜尋 Pachinko・查看機台說明・簡易紀錄", tone: "purple", wide: true },
  { href: "/records", icon: "📊", title: "今日紀錄", sub: "查看今天的實戰", tone: "blue" },
  { href: "/halls", icon: "📍", title: "附近店家", sub: "P-WORLD 店家搜尋・Google Maps 導航", tone: "purple" },
];

export default function Home() {
  const [active, setActive] = useState<Session>();
  const [activePachinko,setActivePachinko]=useState<PachinkoSession>();
  useEffect(() => {setActive(findActiveSession());setActivePachinko(findActivePachinkoSession())}, []);
  const activeMachine = active ? getMachine(active.machineId) : undefined;
  const activeHref=active?`/session/${active.id}`:activePachinko?`/pachinko/session/${activePachinko.id}`:"/start";

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

      <Link href={activeHref} className="session-hero">
        <span className="session-icon">{activePachinko&&!active?"🔴":"🎰"}</span>
        <span className="flex-1">
          <small>{active||activePachinko ? "進行中的 SESSION" : "準備開始"}</small>
          <strong>{active ? `繼續 ${activeMachine?.nameZh ?? "Session"}`:activePachinko?`繼續 ${activePachinko.machineName}`:"開始一局"}</strong>
          <em>{active ? `${active.trackers[activeMachine?.profile.gameTrackers.find(item=>item.primary)?.key??"dataGame"]??active.actualG} G · 投入 ¥${active.investmentYen.toLocaleString()}`:activePachinko?`${Math.max(0,activePachinko.currentSpins-activePachinko.startSpins)} 回 · 投入 ¥${activePachinko.investmentYen.toLocaleString()}`:"拍照辨識，或從熟悉的機種開始"}</em>
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
