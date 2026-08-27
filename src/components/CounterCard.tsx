"use client";

import type { ChangeEvent } from "react";
import type { CounterDefinition, CounterValue } from "@/types";

type Props = {
  definition: CounterDefinition; value: CounterValue | undefined; denominator?: number; relationshipStats?: { successes: number; total: number; pending: number };
  onCount: (delta: number) => void; onEvent: () => void;
  onOutcome: (outcome: "success" | "failure") => void;
  onChoice: (value: string, label: string) => void; onPhoto: (file: File) => void; onHelp: () => void;
};

export function CounterCard({ definition, value, denominator, relationshipStats, onCount, onEvent, onOutcome, onChoice, onPhoto, onHelp }: Props) {
  const count=typeof value==="number"?value:0;
  const ratio=count>0&&(denominator??0)>0?`1 / ${((denominator??0)/count).toFixed(1)}`:"尚無比率";
  const successRate=(relationshipStats?.total??0)>0?`${((relationshipStats?.successes??0)/(relationshipStats?.total??0)*100).toFixed(1)}%`:"尚無比率";
  const selected=typeof value==="string"?value:undefined;
  const photo=typeof value==="object"?value:undefined;
  function pickPhoto(event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];if(file&&file.type.startsWith("image/"))onPhoto(file);event.target.value=""}
  return <div className={`counter-card counter-type-${definition.type}`}>
    <div className="smart-counter-head"><span className="counter-emoji">{definition.icon}</span><span className="counter-name"><strong>{definition.labelZh}</strong><small>{definition.labelJa}</small></span><span className="counter-type-badge">{definition.type}</span></div>
    {definition.type==="count"&&<><button className="counter-main counter-action" onClick={()=>onCount(1)}><span className="counter-value"><b>{count}</b><small>{definition.denominatorMetricKey?`${count} 次 / ${denominator??0} G`:"實測次數"}</small>{definition.denominatorMetricKey&&<strong className="live-ratio">{ratio}</strong>}</span><em>＋1</em></button><div className="counter-tools"><button onClick={()=>onCount(-1)} disabled={count<=0}>−1 修正</button><button onClick={onHelp}>？怎麼看</button></div></>}
    {definition.type==="event"&&<>{relationshipStats?<><div className="trial-outcome-actions"><button onClick={()=>onOutcome("success")}>✓ 成功</button><button onClick={()=>onOutcome("failure")}>× 失敗</button></div><div className="event-live-stat"><span>{relationshipStats.successes} / {relationshipStats.total}<small>{relationshipStats.pending>0?`另有 ${relationshipStats.pending} 次待判定`:"已明確記錄結果"}</small></span><b>{successRate}</b></div></>:<button className="smart-event-button" onClick={onEvent}><span>記錄事件</span><b>{count} 次</b></button>}<button className="smart-help" onClick={onHelp}>？項目說明</button></>}
    {definition.type==="choice"&&<><div className="smart-choice-grid">{definition.choices?.map(choice=><button className={selected===choice.value?"active":""} key={choice.value} onClick={()=>onChoice(choice.value,choice.labelZh)}><strong>{choice.labelZh}</strong><small>{choice.labelJa}</small></button>)}</div><button className="smart-help" onClick={onHelp}>？項目說明</button></>}
    {definition.type==="photo"&&<><label className="smart-photo-button"><input type="file" accept="image/*" capture="environment" onChange={pickPhoto}/><span>{photo?"重新拍攝／選擇":"拍攝／選擇圖片"}</span><small>{photo?photo.fileName:"只保存檔名與記錄時間"}</small></label><button className="smart-help" onClick={onHelp}>？項目說明</button></>}
  </div>;
}
