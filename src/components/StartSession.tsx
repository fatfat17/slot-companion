"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSession } from "@/lib/storage";
import type { Session } from "@/types";

export function StartSession({ machineId }: { machineId: string }) {
  const [open, setOpen] = useState(false); const [number, setNumber] = useState(""); const router = useRouter();
  function start() {
    const id = crypto.randomUUID(); const now = new Date().toISOString();
    const session: Session = { id, machineId, machineNumber: number.trim() || "未填", startedAt: now, startG: 0, actualG: 0, displayG: 0, investmentYen: 0, medals: 0, czCount: 0, atCount: 0, status: "active", counters: {}, events: [{ id: crypto.randomUUID(), sessionId: id, createdAt: now, type: "start", label: "開始 Session" }] };
    if (saveSession(session)) router.push(`/session/${id}`);
  }
  return <div className="bottom-bar">{open ? <div className="start-sheet"><label>台號（可略過）</label><div><input className="input" inputMode="numeric" value={number} onChange={e=>setNumber(e.target.value)} placeholder="例如 128" /><button onClick={start}>開始</button></div></div> : <button className="primary-button" onClick={()=>setOpen(true)}>🎰 開始玩</button>}</div>;
}
