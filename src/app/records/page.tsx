"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { getMachine } from "@/data/machines";
import { loadSessions } from "@/lib/storage";
import type { Session } from "@/types";

const format = (iso?:string) => iso ? new Intl.DateTimeFormat("zh-TW",{hour:"2-digit",minute:"2-digit"}).format(new Date(iso)) : "進行中";

export default function RecordsPage(){
  const [sessions,setSessions]=useState<Session[]>([]); useEffect(()=>setSessions(loadSessions()),[]);
  const today=sessions.filter(s=>new Date(s.startedAt).toDateString()===new Date().toDateString());
  return <><PageHeader title="今日紀錄" eyebrow="Today"/><main className="page pt-5!">
    <div className="record-overview card"><div><span>今日 Session</span><strong>{today.length}</strong></div><div><span>總投入</span><strong>¥{today.reduce((sum,s)=>sum+s.investmentYen,0).toLocaleString()}</strong></div><div><span>總 G</span><strong>{today.reduce((sum,s)=>sum+s.actualG,0).toLocaleString()}</strong></div></div>
    <section className="section"><div className="section-title"><h2>實戰列表</h2><span>{today.length} 筆</span></div>
      {today.length===0?<div className="empty card"><span className="text-4xl">📊</span><p className="mt-3">今天還沒有紀錄</p><Link href="/machines" className="primary-button mt-5">開始第一個 Session</Link></div>:<div className="record-list">{today.map(s=>{const m=s.profileSnapshot??getMachine(s.machineId);return <Link href={s.status==="active"?`/session/${s.id}`:`/summary/${s.id}`} className="record-card" key={s.id}><div className="record-status"><i className={s.status}/><span>{s.status==="active"?"進行中":"已結算"}</span><b>{format(s.startedAt)} — {format(s.endedAt)}</b></div><h2>{m?.nameZh??"未知機種"}<small>台號 {s.machineNumber}</small></h2><div className="record-metrics"><span>投入<b>¥{s.investmentYen.toLocaleString()}</b></span><span>持枚<b>{s.medals}</b></span><span>CZ<b>{s.czCount}</b></span><span>AT<b>{s.atCount}</b></span></div></Link>})}</div>}
    </section>
  </main></>;
}
