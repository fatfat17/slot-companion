"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { machines } from "@/data/machines";

export default function HunterPage(){const [done,setDone]=useState(false);const [machineId,setMachineId]=useState(machines[0].id);const machine=machines.find(item=>item.id===machineId)??machines[0];return <><PageHeader title="晚上撿台" eyebrow="Night Hunter"/><main className="page pt-5!">
  <div className="notice">此頁只整理現場條件，不提供真實狙い目或期待值。所有判斷欄位均為 placeholder。</div>
  <section className="section hunter-form card"><div className="field"><label>機種</label><select className="select" value={machineId} onChange={event=>{setMachineId(event.target.value);setDone(false)}}>{machines.map(m=><option key={m.id} value={m.id}>{m.nameZh}</option>)}</select></div><div className="grid-2">{machine.profile.nightHunterFields.map(field=><div className={`field ${field.inputType==="time"?"hunter-wide":""}`} key={field.key}><label>{field.labelZh}<small className="ja">{field.labelJa}</small></label><input className="input" type={field.inputType} inputMode={field.inputType==="number"?"numeric":undefined} placeholder={field.placeholder}/></div>)}</div><button className="primary-button" onClick={()=>setDone(true)}>整理條件</button></section>
  {done&&<section className="section hunter-result"><div><span>EDGE</span><strong>—</strong><small>待驗證資料</small></div><div><span>COVERAGE</span><strong>—</strong><small>待驗證資料</small></div><div><span>TIME</span><strong>—</strong><small>待驗證資料</small></div><p>待接入 Verified Machine Data</p></section>}
  </main></>}
