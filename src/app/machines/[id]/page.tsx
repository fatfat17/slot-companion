import { notFound } from "next/navigation";
import { machines } from "@/data/machines";
import { getEffectiveMachineServer } from "@/lib/profile-promotion/runtime.server";
import { PageHeader } from "@/components/PageHeader";
import { StartSession } from "@/components/StartSession";
import { profileDraftRepository } from "@/lib/profile-builder/repository.server";
import { buildMachineCardMetrics,isPublishedDraftMatch,verifiedOverviewSections } from "@/lib/machine-card/presentation";

export function generateStaticParams() { return machines.map((machine) => ({ id: machine.id })); }

export default async function MachinePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ai?:string;confidence?:string;timestamp?:string }> }) {
  const [{ id },query] = await Promise.all([params,searchParams]); const machine = await getEffectiveMachineServer(id); if (!machine) notFound();const storedDraft=machine.profileStatus==="verified"?await profileDraftRepository.get(machine.catalogId??machine.id):null,draft=isPublishedDraftMatch(machine,storedDraft)?storedDraft:undefined,verifiedMetrics=buildMachineCardMetrics(machine,draft);
  const placeholderSections = [
    ["遊戲流程", machine.journey], ["3 個觀察重點", machine.watchPoints], ["重要節點", machine.milestones],
    ["爽點", machine.funPoints], ["易誤會處", machine.pitfalls],
  ] as const;
  return <><PageHeader title={machine.nameZh} eyebrow="Machine Card" /><main className="page pt-5!">
    <section className="machine-hero card" style={{"--machine-accent":machine.accent} as React.CSSProperties}>
      <span className="machine-orb">🎰</span><div><span className="badge">{machine.profileStatus.toUpperCase()}</span><h1>{machine.nameZh}</h1><p>{machine.nameJa}</p><small>{machine.manufacturer} · {machine.category}</small></div>
    </section>
    {machine.profileStatus==="placeholder"?<div className="notice mt-3">此卡片僅示範資訊架構。請勿據此判斷設定、天井、Zone、期待值或是否續打。</div>:<div className="notice mt-3">Verified Profile v{machine.profileVersion} · Published {machine.publishedAt?new Date(machine.publishedAt).toLocaleDateString("zh-TW"):"—"}</div>}
    {machine.profileStatus==="verified"?verifiedOverviewSections.map(title=><section className="section card machine-section" key={title}><h2>{title}</h2><p className="verified-empty">此項目前尚無已驗證資料</p></section>):placeholderSections.map(([title,items])=><section className="section card machine-section" key={title}><h2>{title}</h2><ol>{items.map((item,i)=><li key={item}><span>{i+1}</span>{item}</li>)}</ol></section>)}
    <section className="section card machine-section"><h2>Smart Counter 項目</h2>{machine.profile.smartCounters.map(counter=><div className="counter-preview" key={counter.key}><span>{counter.icon}</span><div><strong>{counter.labelZh}</strong><small>{counter.labelJa}</small></div></div>)}</section>
    {verifiedMetrics.length?<section className="section card machine-section"><h2>Verified Data</h2>{verifiedMetrics.map(metric=><article className="verified-metric-card" key={metric.metricKey}><header><strong>{metric.label}</strong><small>{metric.statusLabel}</small></header><div className="verified-table"><table><thead><tr>{metric.headers.map((header,index)=><th key={`${header}-${index}`}>{header}</th>)}</tr></thead><tbody>{metric.rows.map((row,rowIndex)=><tr key={rowIndex}>{row.map((cell,cellIndex)=><td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>{metric.note&&<p>{metric.note}</p>}</article>)}</section>:null}
    <section className="section card machine-section"><h2>簡短打ち方</h2><p className="muted text-sm leading-6">{machine.profileStatus==="verified"?"此項目前尚無已驗證資料":machine.playGuide}</p></section>
    <StartSession machine={machine} identification={query.ai==="1"?{identifiedByAI:true,confidence:Math.min(1,Math.max(0,Number(query.confidence)||0)),timestamp:query.timestamp||new Date().toISOString()}:undefined} />
  </main></>;
}
