"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMachine } from "@/data/machines";
import { loadSessions, saveSession } from "@/lib/storage";
import type { CounterDefinition, Session, SessionEvent } from "@/types";
import { CounterCard } from "./CounterCard";

type EditField = "actualG"|"displayG"|"medals"|null;
const time = (iso:string) => new Intl.DateTimeFormat("zh-TW",{hour:"2-digit",minute:"2-digit"}).format(new Date(iso));

export function SessionScreen({ id }: { id: string }) {
  const [session,setSession]=useState<Session>(); const [drawer,setDrawer]=useState(false); const [edit,setEdit]=useState<EditField>(null); const [editValue,setEditValue]=useState(""); const [help,setHelp]=useState<CounterDefinition>(); const [toast,setToast]=useState(""); const router=useRouter();
  useEffect(()=>setSession(loadSessions().find(item=>item.id===id)),[id]);
  const machine=useMemo(()=>session?getMachine(session.machineId):undefined,[session]);
  function persist(next:Session){setSession(next);if(!saveSession(next)){setToast("儲存失敗，請確認瀏覽器空間");return;} setToast("已儲存");window.setTimeout(()=>setToast(""),900)}
  function event(type:SessionEvent["type"],label:string,value?:number):SessionEvent{return{id:crypto.randomUUID(),sessionId:id,createdAt:new Date().toISOString(),type,label,value}}
  function update(patch:Partial<Session>,ev?:SessionEvent){if(!session)return;persist({...session,...patch,events:ev?[ev,...session.events]:session.events})}
  function addGames(delta:number){if(!session)return;update({actualG:Math.max(0,session.actualG+delta),displayG:Math.max(0,session.displayG+delta)},event("game",`實際 G +${delta}`,delta))}
  function adjustCounter(def:CounterDefinition,delta:number){if(!session)return;const current=session.counters[def.key]??0;const next=Math.max(0,current+delta);if(next===current)return;update({counters:{...session.counters,[def.key]:next}},event("counter",`${def.labelZh} ${delta>0?"+1":"-1"}`,next))}
  function openEdit(field:EditField,value:number){setEdit(field);setEditValue(String(value))}
  function commitEdit(){if(!session||!edit)return;const value=Math.max(0,Number.parseInt(editValue)||0);const labels={actualG:"實際 G",displayG:"液晶 G",medals:"持枚"};update({[edit]:value},event(edit==="medals"?"medals":"game",`${labels[edit]}修正`,value));setEdit(null)}
  function finish(){if(!session)return;const endedAt=new Date().toISOString();const next={...session,status:"completed" as const,endedAt,events:[event("end","Session 結算"),...session.events]};if(saveSession(next))router.push(`/summary/${id}`)}
  if(!session)return <main className="page"><div className="empty"><span className="text-4xl">🕹️</span><p className="mt-4">找不到這筆 Session</p><Link href="/" className="secondary-button mt-5">回首頁</Link></div></main>;
  if(!machine)return null;
  return <>
    <header className="session-header"><Link href="/" className="icon-button">×</Link><div><span>SESSION · 台號 {session.machineNumber}</span><h1>{machine.nameZh}</h1><small>{time(session.startedAt)} 開始</small></div><button className="session-more" onClick={()=>setDrawer(true)}>AI</button></header>
    <main className="page session-page">
      <section className="g-panel">
        <div onClick={()=>openEdit("actualG",session.actualG)}><span>實際 G</span><strong>{session.actualG.toLocaleString()}</strong><small>點擊編輯</small></div>
        <div onClick={()=>openEdit("displayG",session.displayG)}><span>液晶 G</span><strong>{session.displayG.toLocaleString()}</strong><small>點擊編輯</small></div>
      </section>
      <div className="game-actions"><button className="quick-button" onClick={()=>addGames(1)}>+1 <small>G</small></button><button className="quick-button accent" onClick={()=>addGames(10)}>+10 <small>G</small></button></div>
      <section className="stats-grid">
        <button onClick={()=>update({investmentYen:session.investmentYen+1000},event("investment","投入 +¥1,000",1000))}><span>投入</span><strong>¥{session.investmentYen.toLocaleString()}</strong><small>＋ ¥1,000</small></button>
        <button onClick={()=>openEdit("medals",session.medals)}><span>持枚</span><strong>{session.medals.toLocaleString()}</strong><small>點擊編輯</small></button>
        <button onClick={()=>update({czCount:session.czCount+1},event("cz","CZ +1",session.czCount+1))}><span>CZ</span><strong>{session.czCount}</strong><small>＋1</small></button>
        <button onClick={()=>update({atCount:session.atCount+1},event("at","AT +1",session.atCount+1))}><span>AT</span><strong>{session.atCount}</strong><small>＋1</small></button>
      </section>
      <section className="section"><div className="section-title"><h2>小役 Counter</h2><span>點大區塊快速 +1</span></div><div className="counter-stack">{machine.counters.map(def=><CounterCard key={def.key} definition={def} count={session.counters[def.key]??0} games={session.actualG} onChange={delta=>adjustCounter(def,delta)} onHelp={()=>setHelp(def)} />)}</div></section>
      <div className="session-secondary"><button onClick={()=>update({},event("special","記錄特殊畫面"))}>✦ 特殊畫面</button><button onClick={()=>setDrawer(true)}>✣ 問 AI</button></div>
      <button className="danger-button mt-3" onClick={finish}>結算 Session</button>
    </main>
    {edit&&<div className="modal-backdrop" onClick={()=>setEdit(null)}><div className="modal" onClick={e=>e.stopPropagation()}><h2>編輯數值</h2><input autoFocus className="input" inputMode="numeric" value={editValue} onChange={e=>setEditValue(e.target.value)} /><button className="primary-button mt-3" onClick={commitEdit}>儲存</button><button className="secondary-button mt-2" onClick={()=>setEdit(null)}>取消</button></div></div>}
    {help&&<div className="modal-backdrop" onClick={()=>setHelp(undefined)}><div className="modal" onClick={e=>e.stopPropagation()}><span className="text-4xl">{help.icon}</span><h2 className="mt-3">{help.labelZh}<small className="ja">{help.labelJa}</small></h2><dl className="help-list"><dt>簡短解釋</dt><dd>{help.description}</dd><dt>如何辨識</dt><dd>{help.recognition}</dd><dt>為什麼值得記</dt><dd>{help.reason}</dd></dl><button className="secondary-button mt-4" onClick={()=>setHelp(undefined)}>知道了</button></div></div>}
    {drawer&&<div className="drawer-backdrop" onClick={()=>setDrawer(false)}><aside className="drawer" onClick={e=>e.stopPropagation()}><div className="drawer-handle"/><div className="drawer-head"><div><span>AI COMPANION</span><h2>陪你看懂現在這局</h2></div><button onClick={()=>setDrawer(false)}>×</button></div><div className="ai-summary"><span>{machine.nameZh}</span><b>{session.actualG} G</b><span>投入 ¥{session.investmentYen.toLocaleString()}</span><span>持枚 {session.medals}</span><span>CZ {session.czCount} · AT {session.atCount}</span>{machine.counters.map(c=><span key={c.key}>{c.labelZh} {session.counters[c.key]??0}</span>)}</div><div className="mock-reply">AI 功能將於下一階段接入。</div><div className="suggestions"><button>這個畫面是什麼？</button><button>現在在玩什麼？</button><button>這台怎麼玩？</button></div><div className="ai-input"><input placeholder="輸入想問的問題…"/><button>送出</button></div></aside></div>}
    {toast&&<div className="toast">{toast}</div>}
  </>;
}
