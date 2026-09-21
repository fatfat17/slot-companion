"use client";

import { useEffect,useMemo,useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { getMachine } from "@/data/machines";
import { loadSessions } from "@/lib/storage";
import { buildSessionUiModel } from "@/lib/sessionUi";
import { RECORD_RANGE_OPTIONS,observedGame,recordSummary,sessionsInRange,type RecordRange } from "@/lib/records";
import { catalogIdFromSession } from "@/lib/playerLibrary";
import type { Machine,Session } from "@/types";
import { loadPachinkoSessions,pachinkoSessionSummary } from "@/lib/pachinko/storage";
import type { PachinkoSession } from "@/types/pachinko";

const time=(iso?:string)=>iso?new Intl.DateTimeFormat("zh-TW",{hour:"2-digit",minute:"2-digit"}).format(new Date(iso)):"進行中";
const date=(iso:string)=>new Intl.DateTimeFormat("zh-TW",{month:"numeric",day:"numeric",weekday:"short"}).format(new Date(iso));
function recordItems(session:Session,machine:Machine|undefined){
  if(!machine)return[];
  const ui=buildSessionUiModel(machine),items:Array<{label:string;value:string}>=[];
  if(ui.showGenericCz)items.push({label:"CZ",value:String(session.czCount)});
  if(ui.showGenericAt)items.push({label:"AT",value:String(session.atCount)});
  for(const control of ui.recordControls){
    if(items.length>=2)break;
    const definition=control.counter,value=definition?session.counters[definition.key]:session.counters[control.capability.writeTarget.key];
    if(definition?.type==="choice"){if(typeof value==="string")items.push({label:definition.labelZh,value:definition.choices?.find(choice=>choice.value===value)?.labelZh??value});continue}
    const count=typeof value==="number"?value:control.capability.observationKey==="cz"?session.czCount:control.capability.observationKey==="at"?session.atCount:0;
    items.push({label:definition?.labelZh??control.capability.labelZh,value:`${count} 次`});
  }
  return items;
}
function pachinkoSessionsInRange(sessions:PachinkoSession[],range:RecordRange){
  if(range==="all")return sessions;
  const start=new Date();
  start.setHours(0,0,0,0);
  if(range==="7days")start.setDate(start.getDate()-6);
  return sessions.filter(session=>new Date(session.startedAt)>=start).sort((a,b)=>b.startedAt.localeCompare(a.startedAt));
}

export default function RecordsPage(){
  const[sessions,setSessions]=useState<Session[]>([]),[pachinkoSessions,setPachinkoSessions]=useState<PachinkoSession[]>([]),[range,setRange]=useState<RecordRange>("today");
  useEffect(()=>{setSessions(loadSessions());setPachinkoSessions(loadPachinkoSessions())},[]);
  const visible=sessionsInRange(sessions,range),summary=recordSummary(visible);
  const visiblePachinko=useMemo(()=>pachinkoSessionsInRange(pachinkoSessions,range),[pachinkoSessions,range]);
  const pachinkoOverview=useMemo(()=>visiblePachinko.reduce((total,session)=>{const item=pachinkoSessionSummary(session);return{sessions:total.sessions+1,spins:total.spins+item.spins,investment:total.investment+session.investmentYen,initialHits:total.initialHits+session.initialHits}}, {sessions:0,spins:0,investment:0,initialHits:0}),[visiblePachinko]);
  return <><PageHeader title="遊玩記帳" eyebrow="Play Log"/><main className="page records-page">
    <nav className="record-range-tabs" aria-label="紀錄範圍">{RECORD_RANGE_OPTIONS.map(option=><button key={option.value} className={range===option.value?"active":""} onClick={()=>setRange(option.value)}>{option.label}</button>)}</nav>
    <div className="section-title"><h2>SLOT 紀錄</h2><span>{visible.length} 筆</span></div>
    <section className="record-overview record-overview-wide card"><div><span>Session</span><strong>{summary.sessions}</strong></div><div><span>實際觀測</span><strong>{summary.totalGame.toLocaleString()} G</strong></div><div><span>投入合計</span><strong>¥{summary.investment.toLocaleString()}</strong></div><div><span>最終持枚合計</span><strong>{summary.medals.toLocaleString()}</strong></div></section>
    <p className="record-auto-note">Session 結算後會自動出現在這裡，不必重複抄寫。</p>
    <section className="section"><div className="section-title"><h2>實戰列表</h2><span>{visible.length} 筆</span></div>
      {visible.length===0?<div className="empty card"><span className="text-4xl">📓</span><p className="mt-3">這個範圍還沒有遊玩紀錄</p><Link href="/catalog" className="primary-button mt-5">從機種資料庫開始</Link></div>:<div className="record-list">{visible.map(session=>{const machine=session.profileSnapshot??getMachine(session.machineId),items=recordItems(session,machine),catalogId=catalogIdFromSession(session);return <article className="record-card" key={session.id}><Link href={session.status==="active"?`/session/${session.id}`:`/summary/${session.id}`}><div className="record-status"><i className={session.status}/><span>{session.status==="active"?"進行中":"已結算"}</span><b>{date(session.startedAt)} · {time(session.startedAt)} — {time(session.endedAt)}</b></div><h2>{machine?.nameZh??"未知機種"}<small>台號 {session.machineNumber}</small></h2><div className="record-metrics"><span>觀測 G<b>{observedGame(session).toLocaleString()}</b></span><span>投入<b>¥{session.investmentYen.toLocaleString()}</b></span><span>持枚<b>{session.medals.toLocaleString()}</b></span>{items[0]?<span>{items[0].label}<b>{items[0].value}</b></span>:<span>記錄<b>基本模式</b></span>}</div>{items[1]&&<p className="record-secondary-metric">{items[1].label}：{items[1].value}</p>}</Link>{catalogId&&<Link className="record-catalog-link" href={`/catalog/${encodeURIComponent(catalogId)}`}>查看機台與指南 →</Link>}</article>})}</div>}
    </section>
    <section className="section"><div className="section-title"><h2>柏青哥紀錄</h2><span>{visiblePachinko.length} 筆</span></div>
      {visiblePachinko.length>0&&<section className="record-overview record-overview-wide card"><div><span>遊玩次數</span><strong>{pachinkoOverview.sessions}</strong></div><div><span>液晶回轉</span><strong>{pachinkoOverview.spins.toLocaleString()}</strong></div><div><span>投入合計</span><strong>¥{pachinkoOverview.investment.toLocaleString()}</strong></div><div><span>初當</span><strong>{pachinkoOverview.initialHits}</strong></div></section>}
      {visiblePachinko.length===0?<div className="empty card"><span className="text-4xl">🔴</span><p className="mt-3">這個範圍還沒有柏青哥紀錄</p><Link href="/pachinko" className="primary-button mt-5 pachinko-primary">從柏青哥資料庫開始</Link></div>:<div className="record-list">{visiblePachinko.map(session=>{const item=pachinkoSessionSummary(session);return <article className="record-card" key={session.id}><Link href={`/pachinko/session/${session.id}`}><div className="record-status"><i className={session.status}/><span>{session.status==="active"?"進行中":"已結算"}</span><b>{date(session.startedAt)} · {time(session.startedAt)} — {time(session.endedAt)}</b></div><h2>{session.machineName}<small>台號 {session.machineNumber}</small></h2><div className="record-metrics"><span>液晶回轉<b>{item.spins.toLocaleString()}</b></span><span>投入<b>¥{session.investmentYen.toLocaleString()}</b></span><span>初當<b>{session.initialHits}</b></span><span>RUSH 突入<b>{session.rushEntries}</b></span></div><p className="record-secondary-metric">持玉：{session.heldBalls.toLocaleString()} 玉{item.rotationsPerThousand!==null?` · 每 ¥1,000 約 ${item.rotationsPerThousand.toFixed(1)} 回轉`:""}</p></Link><Link className="record-catalog-link" href={`/pachinko/${encodeURIComponent(session.catalogId)}`}>查看機台說明 →</Link></article>})}</div>}
    </section>
  </main></>;
}
