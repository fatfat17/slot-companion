import type { CounterDefinition } from "@/types";

export function CounterCard({ definition, count, games, onChange, onHelp }: { definition: CounterDefinition; count: number; games: number; onChange: (delta: number) => void; onHelp: () => void }) {
  const ratio = count > 0 && games > 0 ? `1 / ${(games / count).toFixed(1)} G` : "尚無比率";
  return <div className="counter-card">
    <button className="counter-main" onClick={()=>onChange(1)} aria-label={`${definition.labelZh}加一`}>
      <span className="counter-emoji">{definition.icon}</span><span className="counter-name"><strong>{definition.labelZh}</strong><small>{definition.labelJa}</small></span><span className="counter-value"><b>{count}</b><small>{ratio}</small></span><em>＋1</em>
    </button>
    <div className="counter-tools"><button onClick={()=>onChange(-1)} disabled={count<=0}>−1 修正</button><button onClick={onHelp}>？怎麼看</button></div>
  </div>;
}
