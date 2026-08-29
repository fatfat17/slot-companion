import type { FirstTimeTutorialData } from "@/lib/sessionModes";
import styles from "./SessionModes.module.css";

const EMPTY_FLOW="目前沒有完整流程說明，可先依下方三個重點遊玩。";
function TutorialList({items}:{items:FirstTimeTutorialData["highlights"]}){return items.length?<ol className={styles.tutorialList}>{items.map(item=><li key={item.id}><strong>{item.labelZh}{item.labelJa.normalize("NFKC")!==item.labelZh.normalize("NFKC")&&<small>{item.labelJa}</small>}</strong><p>{item.meaning}</p><b>{item.instruction}</b></li>)}</ol>:<p className={styles.empty}>目前沒有這項說明</p>}

export function FirstTimeTutorial({tutorial,onContinue,onSkip}:{tutorial:FirstTimeTutorialData;onContinue:()=>void;onSkip:()=>void}){
  return <div className={styles.tutorial}><div className={styles.tutorialHead}><span>60-SECOND GUIDE</span><h2>第一次玩這台</h2><p>先記住三個重點，遊玩中仍可隨時打開機台指南。</p></div><section><h3>今天先記住這三件事</h3><TutorialList items={tutorial.highlights}/></section><section><h3>基本遊戲流程</h3>{tutorial.play.length?<ul className={styles.playList}>{tutorial.play.map((item,index)=><li key={`${index}-${item}`}>{item}</li>)}</ul>:<p className={styles.empty}>{EMPTY_FLOW}</p>}</section>{(tutorial.more.length>0||tutorial.glossary.length>0)&&<details><summary>更多名詞與事件</summary><div>{tutorial.more.length>0&&<TutorialList items={tutorial.more}/>} {tutorial.glossary.length>0&&<dl>{tutorial.glossary.map(item=><div key={item.termJa}><dt>{item.termJa}</dt><dd>{item.termZh}</dd></div>)}</dl>}</div></details>}<button className="primary-button mt-3" onClick={onContinue}>看完了，開始記錄</button><button className="secondary-button mt-2" onClick={onSkip}>略過教學</button></div>;
}
