"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeActiveSessions, findActiveSession, saveSession } from "@/lib/storage";
import type { IdentificationContext, Machine, Session, SessionMode } from "@/types";
import { getMachine } from "@/data/machines";
import { buildSessionUiModel } from "@/lib/sessionUi";
import { buildFirstTimeTutorial, createSessionSnapshot, loadLastSessionMode, saveLastSessionMode } from "@/lib/sessionModes";
import { SessionModePicker } from "./SessionModePicker";
import { FirstTimeTutorial } from "./FirstTimeTutorial";
import styles from "./SessionModes.module.css";

type Phase="closed"|"mode"|"tutorial"|"number";

export function StartSession({machine,identification}:{machine:Machine;identification?:IdentificationContext}){
  const[phase,setPhase]=useState<Phase>("closed"),[mode,setMode]=useState<SessionMode>(),[lastMode,setLastMode]=useState<SessionMode>(),[number,setNumber]=useState(""),[conflict,setConflict]=useState<Session>();const router=useRouter();
  const uiModel=buildSessionUiModel(machine),tutorial=buildFirstTimeTutorial(machine,uiModel);
  useEffect(()=>setLastMode(loadLastSessionMode(machine.id)),[machine.id,phase]);
  function choose(next:SessionMode){setMode(next);setPhase(next==="first_time"?"tutorial":"number")}
  function createSession(){if(!mode)return;const session=createSessionSnapshot(machine,mode,number,identification);if(saveSession(session)){saveLastSessionMode(machine.id,mode);router.push(`/session/${session.id}`)}}
  function start(){const active=findActiveSession();if(active){setConflict(active);return}createSession()}
  function switchSession(){if(completeActiveSessions())createSession()}
  const conflictMachine=conflict?conflict.profileSnapshot??getMachine(conflict.machineId):undefined;
  return <><div className="bottom-bar"><button className="primary-button" onClick={()=>setPhase("mode")}>🎰 開始玩</button></div>
    {phase==="mode"&&<div className="modal-backdrop" onClick={()=>setPhase("closed")}><div className="modal" onClick={event=>event.stopPropagation()}><p className="eyebrow">PLAY STYLE</p><h2>這次想怎麼玩？</h2><p className={styles.modeHint}>只調整畫面資訊量，所有模式都使用同一份 Session 紀錄。</p><SessionModePicker lastMode={lastMode} onSelect={choose}/><button className="secondary-button mt-3" onClick={()=>setPhase("closed")}>取消</button></div></div>}
    {phase==="tutorial"&&<div className="modal-backdrop" onClick={()=>setPhase("closed")}><div className="modal" onClick={event=>event.stopPropagation()}><FirstTimeTutorial tutorial={tutorial} onContinue={()=>setPhase("number")} onSkip={()=>setPhase("number")}/></div></div>}
    {phase==="number"&&<div className="modal-backdrop" onClick={()=>setPhase("closed")}><div className="modal" onClick={event=>event.stopPropagation()}><p className="eyebrow">START SESSION</p><h2>{mode==="first_time"?"第一次玩這台":mode==="full"?"完整記錄":"快速開始"}</h2><label className="mt-4">台號（可略過）</label><input className="input mt-2" inputMode="numeric" value={number} onChange={event=>setNumber(event.target.value)} placeholder="例如 128"/><button className="primary-button mt-3" onClick={start}>開始 Session</button><button className="secondary-button mt-2" onClick={()=>setPhase("mode")}>返回選擇</button></div></div>}
    {conflict&&<div className="modal-backdrop" onClick={()=>setConflict(undefined)}><div className="modal" onClick={event=>event.stopPropagation()}><p className="eyebrow">ACTIVE SESSION</p><h2>已有進行中的 Session</h2><p className="conflict-copy">{conflictMachine?.nameZh??"上一台機種"} · 台號 {conflict.machineNumber}</p><button className="primary-button mt-4" onClick={switchSession}>結束上一台並換台</button><button className="secondary-button mt-2" onClick={()=>router.push(`/session/${conflict.id}`)}>返回上一台</button><button className="secondary-button mt-2" onClick={()=>setConflict(undefined)}>取消</button></div></div>}
  </>;
}
