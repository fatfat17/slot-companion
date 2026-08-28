import type { GameState, Machine } from "@/types";
import type { SessionQuickGuide } from "@/types/machineGuide";
import type { SessionRecordControl } from "@/lib/sessionUi";
import { GUIDE_EMPTY_PLAY, GUIDE_EMPTY_RECOGNITION, eventRecognition, recordInstruction, selectAttentionItems, selectCurrentEvents, selectPlaySummary, selectRecognitionEvents } from "@/lib/sessionGuidePresentation";

type Props={guide:SessionQuickGuide|undefined;machine:Machine;state:GameState;recordControls:SessionRecordControl[];onClose:()=>void};
const formatTime=(value:string)=>new Intl.DateTimeFormat("zh-TW",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value));

export function SessionGuideDrawer({guide,machine,state,recordControls,onClose}:Props){
  const currentEvents=selectCurrentEvents(guide,state),play=selectPlaySummary(guide),recognition=selectRecognitionEvents(guide),attention=selectAttentionItems(guide),sourceUrl=guide?.sourceUrl??machine.guideSourceUrl;
  return <div className="drawer-backdrop" onClick={onClose}><aside className="drawer session-guide-drawer" onClick={event=>event.stopPropagation()}><div className="drawer-handle"/><div className="drawer-head"><div><span>MACHINE GUIDE</span><h2>機台指南</h2></div><button onClick={onClose}>×</button></div><div className="session-guide-content">
    <section className="guide-now"><h3>現在看什麼</h3>{currentEvents.length?currentEvents.map(item=><article key={item.id}><strong>{item.labelZh}<small>{item.labelJa}</small></strong><p>{eventRecognition(item)}</p></article>):<p>{state==="normal"?(play[0]??GUIDE_EMPTY_PLAY):GUIDE_EMPTY_RECOGNITION}</p>}</section>
    <section><h3>基本遊戲流程</h3>{play.length?<ul>{play.map((item,index)=><li key={`${index}-${item}`}>{item}</li>)}</ul>:<p>{GUIDE_EMPTY_PLAY}</p>}</section>
    <section><h3>CZ／AT／ART／Bonus 怎麼辨認</h3>{recognition.length?<ul>{recognition.map(item=><li key={item.id}><strong>{item.labelZh}</strong><small>{item.labelJa}</small><p>{eventRecognition(item)}</p></li>)}</ul>:<p>{GUIDE_EMPTY_RECOGNITION}</p>}</section>
    <section><h3>今天最值得注意</h3>{attention.length?<ul>{attention.map(item=><li key={item.id}><strong>{item.labelZh}</strong><small>{item.labelJa}</small><p>{item.detail}</p></li>)}</ul>:<p>{GUIDE_EMPTY_RECOGNITION}</p>}</section>
    <section><h3>什麼時候按記錄</h3>{recordControls.length?<ul>{recordControls.map(control=><li key={control.id}><strong>{control.counter?.labelZh??control.capability.labelZh}</strong><small>{control.counter?.labelJa??control.capability.labelJa}</small><p>{recordInstruction(control,guide)}</p></li>)}</ul>:<p>{GUIDE_EMPTY_RECOGNITION}</p>}</section>
    <section><h3>名詞說明</h3>{guide?.glossary.length?<dl>{guide.glossary.map(item=><div key={item.termJa}><dt>{item.termJa}</dt><dd>{item.termZh}</dd></div>)}</dl>:<p>{GUIDE_EMPTY_RECOGNITION}</p>}</section>
    <footer className="session-guide-source"><span>來源：{guide?.sourceName??(machine.guideSourceUrl?"P-WORLD":"尚無資料")}</span><small>{guide?.retrievedAt?`更新時間：${formatTime(guide.retrievedAt)}`:"更新時間：尚無資料"}</small><details><summary>來源與資料狀態</summary><div>{guide?.missingSections?.length?<p>尚未取得：{guide.missingSections.join(" › ")}</p>:<p>未記錄缺失欄位</p>}{guide?.evidence&&<p>可追溯欄位：{guide.evidence.length} 筆</p>}{sourceUrl&&<a href={sourceUrl} target="_blank" rel="noreferrer">開啟 P-WORLD 來源</a>}</div></details></footer>
  </div></aside></div>;
}
