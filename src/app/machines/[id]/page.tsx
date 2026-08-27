import { notFound } from "next/navigation";
import { getMachine, machines } from "@/data/machines";
import { PageHeader } from "@/components/PageHeader";
import { StartSession } from "@/components/StartSession";

export function generateStaticParams() { return machines.map((machine) => ({ id: machine.id })); }

export default async function MachinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const machine = getMachine(id); if (!machine) notFound();
  const sections = [
    ["遊戲流程", machine.journey], ["3 個觀察重點", machine.watchPoints], ["重要節點", machine.milestones],
    ["爽點", machine.funPoints], ["易誤會處", machine.pitfalls],
  ] as const;
  return <><PageHeader title={machine.nameZh} eyebrow="Machine Card" /><main className="page pt-5!">
    <section className="machine-hero card" style={{"--machine-accent":machine.accent} as React.CSSProperties}>
      <span className="machine-orb">🎰</span><div><span className="badge">PLACEHOLDER</span><h1>{machine.nameZh}</h1><p>{machine.nameJa}</p><small>{machine.manufacturer} · {machine.category}</small></div>
    </section>
    <div className="notice mt-3">此卡片僅示範資訊架構。請勿據此判斷設定、天井、Zone、期待值或是否續打。</div>
    {sections.map(([title, items]) => <section className="section card machine-section" key={title}><h2>{title}</h2><ol>{items.map((item,i)=><li key={item}><span>{i+1}</span>{item}</li>)}</ol></section>)}
    <section className="section card machine-section"><h2>值得記錄的小役</h2>{machine.counters.map(counter=><div className="counter-preview" key={counter.key}><span>{counter.icon}</span><div><strong>{counter.labelZh}</strong><small>{counter.labelJa}</small></div></div>)}</section>
    <section className="section card machine-section"><h2>簡短打ち方</h2><p className="muted text-sm leading-6">{machine.playGuide}</p></section>
    <StartSession machineId={machine.id} />
  </main></>;
}
