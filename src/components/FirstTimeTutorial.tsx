import type { FirstTimeTutorialData } from "@/lib/sessionModes";
import styles from "./SessionModes.module.css";

const EMPTY="目前沒有這項說明";
function TutorialList({items}:{items:Array<{label:string;detail:string}>}){return items.length?<ul className={styles.tutorialList}>{items.map((item,index)=><li key={`${item.label}-${index}`}><strong>{item.label}</strong><p>{item.detail}</p></li>)}</ul>:<p className={styles.empty}>{EMPTY}</p>}

export function FirstTimeTutorial({tutorial,onContinue,onSkip}:{tutorial:FirstTimeTutorialData;onContinue:()=>void;onSkip:()=>void}){
  return <div className={styles.tutorial}><div className={styles.tutorialHead}><span>FIRST PLAY</span><h2>第一次玩這台</h2><p>先看幾個重點，遊玩中仍可隨時打開機台指南。</p></div><section><h3>基本遊戲流程</h3>{tutorial.play.length?<ul className={styles.playList}>{tutorial.play.map((item,index)=><li key={`${index}-${item}`}>{item}</li>)}</ul>:<p className={styles.empty}>{EMPTY}</p>}</section><section><h3>CZ 如何辨認</h3><TutorialList items={tutorial.cz}/></section><section><h3>AT／ART／Bonus 如何辨認</h3><TutorialList items={tutorial.output}/></section><section><h3>今天最值得注意的三件事</h3><TutorialList items={tutorial.attention}/></section><section><h3>看到什麼時按記錄</h3><TutorialList items={tutorial.records}/></section><button className="primary-button" onClick={onContinue}>看完了，開始記錄</button><button className="secondary-button mt-2" onClick={onSkip}>略過教學</button></div>;
}
