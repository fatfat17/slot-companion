"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import type {PachinkoPlayState,PachinkoSession} from "@/types/pachinko";
import {loadPachinkoSessions,pachinkoSessionSummary,savePachinkoSession} from "@/lib/pachinko/storage";

const states:Array<{value:PachinkoPlayState;label:string}>=[{value:"normal",label:"通常"},{value:"rush",label:"RUSH"},{value:"st",label:"ST"},{value:"time_short",label:"時短"},{value:"other",label:"其他"}];

export function PachinkoSessionScreen({id}:{id:string}){
  const[session,setSession]=useState<PachinkoSession>(),[spins,setSpins]=useState(""),[balls,setBalls]=useState(""),[message,setMessage]=useState("");
  useEffect(()=>{const found=loadPachinkoSessions().find(item=>item.id===id);setSession(found);setSpins(String(found?.currentSpins??0));setBalls(String(found?.heldBalls??0))},[id]);
  function update(patch:Partial<PachinkoSession>){if(!session)return;const next={...session,...patch};if(savePachinkoSession(next))setSession(next);else setMessage("儲存失敗，請確認瀏覽器空間。");}
  function addHit(){if(!session)return;update({initialHits:session.initialHits+1,playState:"normal"})}
  function enterRush(){if(!session)return;update({rushEntries:session.rushEntries+1,currentRushStreak:0,playState:"rush"})}
  function rushHit(){if(!session)return;const streak=session.currentRushStreak+1;update({rushHits:session.rushHits+1,currentRushStreak:streak,maxRushStreak:Math.max(session.maxRushStreak,streak),playState:"rush"})}
  function finish(){if(!session)return;const next={...session,status:"completed"as const,endedAt:new Date().toISOString()};if(savePachinkoSession(next)){setSession(next);setMessage("本次紀錄已結算。")}}
  if(!session)return<main className="page"><div className="empty card"><p>找不到這筆柏青哥紀錄。</p><Link href="/pachinko" className="primary-button mt-3">返回柏青哥資料庫</Link></div></main>;
  const summary=pachinkoSessionSummary(session);
  return <main className="page pachinko-session">
    <header className="pachinko-session-head"><div><span>PACHINKO PLAY LOG</span><h1>{session.machineName}</h1><p>台號 {session.machineNumber} · {session.status==="active"?"進行中":"已結算"}</p></div><Link href={`/pachinko/${session.catalogId}`}>機台說明</Link></header>
    <section className="pachinko-state-switcher" aria-label="目前狀態">{states.map(item=><button key={item.value} className={session.playState===item.value?"active":""} onClick={()=>update({playState:item.value})}>{item.label}</button>)}</section>
    <section className="card pachinko-spin-card"><small>本次總回轉</small><strong>{summary.spins.toLocaleString()}</strong><span>開始 {session.startSpins} → 現在 {session.currentSpins}</span><div className="pachinko-inline-edit"><input className="input" inputMode="numeric" value={spins} onChange={event=>setSpins(event.target.value)}/><button className="secondary-button" onClick={()=>update({currentSpins:Math.max(session.startSpins,Number.parseInt(spins)||0)})}>更新液晶回轉</button></div></section>
    <section className="pachinko-log-grid"><button onClick={()=>update({investmentYen:session.investmentYen+1000})}><span>投入</span><strong>¥{session.investmentYen.toLocaleString()}</strong><small>＋ ¥1,000</small></button><button onClick={addHit}><span>初當</span><strong>{session.initialHits}</strong><small>＋1</small></button><button onClick={enterRush}><span>RUSH 突入</span><strong>{session.rushEntries}</strong><small>＋1</small></button><button onClick={rushHit}><span>RUSH 大當</span><strong>{session.rushHits}</strong><small>目前 {session.currentRushStreak} 連</small></button></section>
    <section className="card pachinko-balls"><div><span>持玉</span><strong>{session.heldBalls.toLocaleString()} 玉</strong></div><div className="pachinko-inline-edit"><input className="input" inputMode="numeric" value={balls} onChange={event=>setBalls(event.target.value)}/><button className="secondary-button" onClick={()=>update({heldBalls:Math.max(0,Number.parseInt(balls)||0)})}>更新持玉</button></div></section>
    <section className="card pachinko-session-summary"><h2>目前實績</h2><dl><dt>最高連莊</dt><dd>{session.maxRushStreak} 連</dd></dl><dl><dt>每 ¥1,000 回轉</dt><dd>{summary.rotationsPerThousand===null?"尚無投入資料":`${summary.rotationsPerThousand.toFixed(1)} 回`}</dd></dl><p>這是本次手動紀錄，不代表未來中獎率或機台期待值。</p></section>
    <label className="card pachinko-note"><span>備註</span><textarea value={session.note} onChange={event=>update({note:event.target.value})} placeholder="例如：右打結束、換台原因"/></label>
    {message&&<p role="status" className="notice">{message}</p>}
    {session.status==="active"?<button className="primary-button pachinko-finish" onClick={finish}>結束並保存紀錄</button>:<><Link href="/pachinko?view=recent" className="primary-button pachinko-finish">回柏青哥最近打過</Link><Link href="/records" className="secondary-button mt-2">查看今日紀錄</Link><Link href="/" className="secondary-button mt-2">回首頁</Link></>}
  </main>
}
