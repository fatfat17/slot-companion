import { PageHeader } from "@/components/PageHeader";
import { machines } from "@/data/machines";
import Link from "next/link";

export default function MachinesPage() {
  return <><PageHeader title="選擇機種" eyebrow="Machine Library" /><main className="page pt-5!">
    <div className="notice mb-4">三張 Machine Card 目前皆為 placeholder，不含未驗證的機率、天井、Zone 或期待值。</div>
    <div className="machine-list">{machines.map((machine) => <Link href={`/machines/${machine.id}`} key={machine.id} className="machine-choice" style={{"--machine-accent":machine.accent} as React.CSSProperties}>
      <span className="machine-choice-art">🎰</span><div><h2>{machine.nameZh}</h2><p>{machine.nameJa}</p><small>{machine.category}</small></div><b>›</b>
    </Link>)}</div>
  </main></>;
}
