import type { SessionMode } from "@/types";
import { SESSION_MODE_OPTIONS } from "@/lib/sessionModes";
import styles from "./SessionModes.module.css";

export function SessionModePicker({lastMode,currentMode,onSelect}:{lastMode?:SessionMode;currentMode?:SessionMode;onSelect:(mode:SessionMode)=>void}){
  return <div className={styles.options}>{SESSION_MODE_OPTIONS.map(option=><button className={`${styles.option} ${currentMode===option.value?styles.active:""}`} key={option.value} onClick={()=>onSelect(option.value)}><span><strong>{option.label}</strong>{lastMode===option.value&&<b>上次使用</b>}{currentMode===option.value&&<b>目前模式</b>}</span><small>{option.description}</small></button>)}</div>;
}
