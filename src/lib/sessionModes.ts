import type { IdentificationContext, Machine, Session, SessionMode } from "@/types";
import type { SessionUiModel } from "./sessionUi.ts";
import { eventRecognition, recordInstruction, selectAttentionItems, selectPlaySummary } from "./sessionGuidePresentation.ts";

export const SESSION_MODE_PREFERENCE_KEY="slot-companion-session-mode-preferences-v1";
export const SESSION_MODE_OPTIONS:Array<{value:SessionMode;label:string;description:string}>=[
  {value:"first_time",label:"第一次玩這台",description:"先看重點教學，再開始記錄"},
  {value:"quick",label:"快速開始",description:"只顯示最常用的記錄按鈕"},
  {value:"full",label:"完整記錄",description:"顯示全部可用記錄與分析"},
];
export type FirstTimeTutorialData={play:string[];cz:Array<{label:string;detail:string}>;output:Array<{label:string;detail:string}>;attention:Array<{label:string;detail:string}>;records:Array<{label:string;detail:string}>};

export function normalizeSessionMode(mode:SessionMode|undefined):SessionMode{return mode??"quick"}

export function controlsForSessionMode(model:SessionUiModel,mode:SessionMode|undefined){
  const normalized=normalizeSessionMode(mode);
  return normalized==="full"?{primary:model.recordControls,overflow:[]}:{primary:model.primaryRecordControls,overflow:model.overflowRecordControls};
}

export function changeSessionMode(session:Session,mode:SessionMode):Session{return{...session,mode}}

export function loadLastSessionMode(machineId:string):SessionMode|undefined{
  if(typeof window==="undefined")return undefined;
  try{const values=JSON.parse(window.localStorage.getItem(SESSION_MODE_PREFERENCE_KEY)??"{}") as Record<string,SessionMode>;const value=values[machineId];return SESSION_MODE_OPTIONS.some(option=>option.value===value)?value:undefined}catch{return undefined}
}

export function saveLastSessionMode(machineId:string,mode:SessionMode){
  if(typeof window==="undefined")return false;
  try{const raw=window.localStorage.getItem(SESSION_MODE_PREFERENCE_KEY),values=raw?JSON.parse(raw) as Record<string,SessionMode>:{};window.localStorage.setItem(SESSION_MODE_PREFERENCE_KEY,JSON.stringify({...values,[machineId]:mode}));return true}catch{return false}
}

export function createSessionSnapshot(machine:Machine,mode:SessionMode,machineNumber:string,identification?:IdentificationContext,ids?:{sessionId:string;eventId:string;now:string}):Session{
  const id=ids?.sessionId??crypto.randomUUID(),now=ids?.now??new Date().toISOString(),eventId=ids?.eventId??crypto.randomUUID();
  const trackers=Object.fromEntries(machine.profile.gameTrackers.map(item=>[item.key,0]));
  return{id,machineId:machine.id,profileSnapshot:structuredClone(machine),machineNumber:machineNumber.trim()||"未填",startedAt:now,startG:0,actualG:0,displayG:0,investmentYen:0,medals:0,czCount:0,atCount:0,gameState:"normal",trackers,trackerBaselines:{},metrics:{observedTotalGame:0,observedNormalGame:0},trials:{},status:"active",counters:{},events:[{id:eventId,sessionId:id,createdAt:now,type:"start",label:"開始 Session"}],mode,...(identification?{identifiedByAI:true,identificationConfidence:identification.confidence,identificationTimestamp:identification.timestamp}:{})};
}

export function buildFirstTimeTutorial(machine:Machine,model:SessionUiModel):FirstTimeTutorialData{
  const guide=machine.sessionGuide,recognition=guide?.events??[];
  return{
    play:selectPlaySummary(guide),
    cz:recognition.filter(item=>item.category==="cz").map(item=>({label:item.labelZh,detail:eventRecognition(item)})),
    output:recognition.filter(item=>["at","art","bonus"].includes(item.category)).map(item=>({label:item.labelZh,detail:eventRecognition(item)})),
    attention:selectAttentionItems(guide).slice(0,3).map(item=>({label:item.labelZh,detail:item.detail})),
    records:model.recordControls.map(control=>({label:control.counter?.labelZh??control.capability.labelZh,detail:recordInstruction(control,guide)})),
  };
}
