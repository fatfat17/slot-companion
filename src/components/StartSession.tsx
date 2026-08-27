"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeActiveSessions, findActiveSession, saveSession } from "@/lib/storage";
import type { IdentificationContext, Machine, Session } from "@/types";
import { getMachine } from "@/data/machines";

export function StartSession({ machine, identification }: { machine: Machine; identification?: IdentificationContext }) {
  const [open, setOpen] = useState(false); const [number, setNumber] = useState(""); const [conflict,setConflict]=useState<Session>(); const router = useRouter();
  function createSession() {
    const id = crypto.randomUUID(); const now = new Date().toISOString();
    const trackers=Object.fromEntries(machine.profile.gameTrackers.map(item=>[item.key,0]));
    const session: Session = { id, machineId:machine.id, profileSnapshot:structuredClone(machine), machineNumber: number.trim() || "未填", startedAt: now, startG: 0, actualG: 0, displayG: 0, investmentYen: 0, medals: 0, czCount: 0, atCount: 0, gameState: "normal", trackers, trackerBaselines: {}, metrics: {observedTotalGame:0,observedNormalGame:0}, trials:{}, status: "active", counters: {}, events: [{ id: crypto.randomUUID(), sessionId: id, createdAt: now, type: "start", label: "開始 Session" }], ...(identification?{identifiedByAI:true,identificationConfidence:identification.confidence,identificationTimestamp:identification.timestamp}:{}) };
    if (saveSession(session)) router.push(`/session/${id}`);
  }
  function start(){const active=findActiveSession();if(active){setConflict(active);return;}createSession()}
  function switchSession(){if(completeActiveSessions())createSession()}
  const conflictMachine=conflict?getMachine(conflict.machineId):undefined;
  return <><div className="bottom-bar">{open ? <div className="start-sheet"><label>台號（可略過）</label><div><input className="input" inputMode="numeric" value={number} onChange={e=>setNumber(e.target.value)} placeholder="例如 128" /><button onClick={start}>開始</button></div></div> : <button className="primary-button" onClick={()=>setOpen(true)}>🎰 開始玩</button>}</div>
    {conflict&&<div className="modal-backdrop" onClick={()=>setConflict(undefined)}><div className="modal" onClick={event=>event.stopPropagation()}><p className="eyebrow">ACTIVE SESSION</p><h2>已有進行中的 Session</h2><p className="conflict-copy">{conflictMachine?.nameZh??"上一台機種"} · 台號 {conflict.machineNumber}</p><button className="primary-button mt-4" onClick={switchSession}>結束上一台並換台</button><button className="secondary-button mt-2" onClick={()=>router.push(`/session/${conflict.id}`)}>返回上一台</button><button className="secondary-button mt-2" onClick={()=>setConflict(undefined)}>取消</button></div></div>}
  </>;
}
