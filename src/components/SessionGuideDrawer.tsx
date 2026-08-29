import type { GameState, Machine } from "@/types";
import type { SessionQuickGuide } from "@/types/machineGuide";
import type { SessionRecordControl } from "@/lib/sessionUi";
import { GUIDE_EMPTY_PLAY, GUIDE_EMPTY_RECOGNITION, buildPlayerGuideHighlights, eventRecognition, selectCurrentEvents, selectPlaySummary } from "@/lib/sessionGuidePresentation";

type Props={guide:SessionQuickGuide|undefined;machine:Machine;state:GameState;recordControls:SessionRecordControl[];onClose:()=>void};
const formatTime=(value:string)=>new Intl.DateTimeFormat("zh-TW",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value));

export function SessionGuideDrawer({guide,machine,state,recordControls,onClose}:Props){
  const currentEvents=selectCurrentEvents(guide,state),play=selectPlaySummary(guide),highlights=buildPlayerGuideHighlights(guide,recordControls,3),currentIds=new Set(currentEvents.map(item=>item.id)),mainHighlights=highlights.primary.filter(item=>!currentIds.has(item.id)),moreHighlights=highlights.more.filter(item=>!currentIds.has(item.id)),sourceUrl=guide?.sourceUrl??machine.guideSourceUrl;
  return <div className="drawer-backdrop" onClick={onClose}><aside className="drawer session-guide-drawer" onClick={event=>event.stopPropagation()}><div className="drawer-handle"/><div className="drawer-head"><div><span>MACHINE GUIDE</span><h2>機台指南</h2></div><button onClick={onClose}>×</button></div><div className="session-guide-content">
    <section className="guide-now"><h3>現在看什麼</h3>{currentEvents.length?currentEvents.map(item=><article key={item.id}><strong>{item.labelZh}<small>{item.labelJa}</small></strong><p>{eventRecognition(item)}</p></article>):<p>{state==="normal"?(play[0]??GUIDE_EMPTY_PLAY):GUIDE_EMPTY_RECOGNITION}</p>}</section>
    <section><h3>基本遊戲流程</h3>{play.length?<ul>{play.map((item,index)=><li key={`${index}-${item}`}>{item}</li>)}</ul>:<p>{GUIDE_EMPTY_PLAY}</p>}</section>
    <section><h3>今天先記住這些</h3>{mainHighlights.length?<ul>{mainHighlights.map(item=><li key={item.id}><strong>{item.labelZh}</strong>{item.labelJa.normalize("NFKC")!==item.labelZh.normalize("NFKC")&&<small>{item.labelJa}</small>}<p>{item.meaning}</p><p>記錄：{item.instruction}</p></li>)}</ul>:currentEvents.length?<p>目前狀態的重點已顯示在上方。</p>:<p>{GUIDE_EMPTY_RECOGNITION}</p>}</section>
    {(moreHighlights.length>0||guide?.glossary.length)&&<details><summary>更多名詞與事件</summary><div>{moreHighlights.length>0&&<ul>{moreHighlights.map(item=><li key={item.id}><strong>{item.labelZh}</strong>{item.labelJa.normalize("NFKC")!==item.labelZh.normalize("NFKC")&&<small>{item.labelJa}</small>}<p>{item.instruction}</p></li>)}</ul>}{guide?.glossary.length?<dl>{guide.glossary.map(item=><div key={item.termJa}><dt>{item.termJa}</dt><dd>{item.termZh}</dd></div>)}</dl>:null}</div></details>}
    <footer className="session-guide-source"><span>來源：{guide?.sourceName??(machine.guideSourceUrl?"P-WORLD":"尚無資料")}</span><small>{guide?.retrievedAt?`更新時間：${formatTime(guide.retrievedAt)}`:"更新時間：尚無資料"}</small><details><summary>來源與資料狀態</summary><div>{guide?.missingSections?.length?<p>尚未取得：{guide.missingSections.join(" › ")}</p>:<p>未記錄缺失欄位</p>}{guide?.evidence&&<p>可追溯欄位：{guide.evidence.length} 筆</p>}{sourceUrl&&<a href={sourceUrl} target="_blank" rel="noreferrer">開啟 P-WORLD 來源</a>}</div></details></footer>
  </div></aside></div>;
}
