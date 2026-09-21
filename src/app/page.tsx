"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { findActiveSession } from "@/lib/storage";
import type { Session } from "@/types";
import { getMachine } from "@/data/machines";
import { findActivePachinkoSession } from "@/lib/pachinko/storage";
import type { PachinkoSession } from "@/types/pachinko";

const entries = [
  { href: "/catalog", icon: "🎰", title: "打柏青嫂（SLOT）", sub: "找機台・拍照辨識・最近打過", tone: "cyan", wide: true },
  { href: "/pachinko", icon: "🔴", title: "打柏青哥（Pachinko）", sub: "找機台・拍照辨識・最近打過", tone: "purple", wide: true },
  { href: "/records", icon: "📊", title: "今日紀錄", sub: "查看今天的實戰", tone: "blue" },
  { href: "/halls", icon: "📍", title: "附近店家", sub: "P-WORLD 店家搜尋・Google Maps 導航", tone: "purple" },
];

export default function Home() {
  const [active, setActive] = useState<Session>();
  const [activePachinko,setActivePachinko]=useState<PachinkoSession>();
  useEffect(() => {setActive(findActiveSession());setActivePachinko(findActivePachinkoSession())}, []);
  const activeMachine = active ? getMachine(active.machineId) : undefined;
  const activeHref=active?`/session/${active.id}`:activePachinko?`/pachinko/session/${activePachinko.id}`:null;

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

      {activeHref&&<Link href={activeHref} className="session-hero">
        <span className="session-icon">{activePachinko&&!active?"🔴":"🎰"}</span>
        <span className="flex-1">
          <small>進行中的 SESSION</small>
          <strong>{active ? `繼續 ${activeMachine?.nameZh ?? "Session"}`:`繼續 ${activePachinko?.machineName}`}</strong>
          <em>{active ? `${active.trackers[activeMachine?.profile.gameTrackers.find(item=>item.primary)?.key??"dataGame"]??active.actualG} G · 投入 ¥${active.investmentYen.toLocaleString()}`:`${Math.max(0,(activePachinko?.currentSpins??0)-(activePachinko?.startSpins??0))} 回 · 投入 ¥${(activePachinko?.investmentYen??0).toLocaleString()}`}</em>
        </span>
        <b>›</b>
      </Link>}

      <div className="entry-grid">
        {entries.map((entry) => (
          <Link key={entry.href} href={entry.href} className={`entry-card ${entry.tone}${entry.wide ? " wide" : ""}`}>
            <span>{entry.icon}</span>
            <strong>{entry.title}</strong>
            <small>{entry.sub}</small>
          </Link>
        ))}
      </div>

      <section className="home-beginner card">
        <div><span>📖 NEW PLAYER</span><strong>新手第一次玩？</strong><small>先用繁體中文看懂現場常用術語</small></div>
        <nav aria-label="新手常用術語"><Link href="/glossary?kind=slot" className="slot"><b>🎰</b><span>SLOT 術語<small>CZ・AT・天井・設定示唆</small></span></Link><Link href="/glossary?kind=pachinko" className="pachinko"><b>🔴</b><span>柏青哥術語<small>大當・RUSH・ST・右打ち</small></span></Link></nav>
      </section>

      <Link href="/help" className="home-help-link"><span>📘</span><span><strong>APP 使用指南</strong><small>找機台、建立指南、遊玩紀錄與 AI 功能</small></span><b>›</b></Link>

    </main>
  );
}
