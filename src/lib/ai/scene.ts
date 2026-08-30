import type { GameState } from "@/types";

export type SceneControlType = "count" | "event" | "choice";
export type SessionSceneControl = {
  id: string;
  labelZh: string;
  labelJa: string;
  controlType: SceneControlType;
  recognition: string;
  stateEffect: GameState | null;
  availability: "operational";
};
export type SessionSceneContext = {
  machineName: string;
  currentState: string;
  controls: SessionSceneControl[];
};
export type SessionSceneCandidate = {
  controlId: string;
  confidence: "high" | "medium" | "low";
  reason: string;
};
export type SessionSceneResult = {
  status: "matched" | "uncertain" | "unknown";
  summaryZh: string;
  visibleText: string[];
  candidates: SessionSceneCandidate[];
};

const gameStates = new Set<GameState>(["normal","prelude","cz","at","art","bonus","special","other"]);
function text(value:unknown,max=120){return typeof value==="string"?value.trim().slice(0,max):""}

export function sanitizeSessionSceneContext(value:unknown):SessionSceneContext|null{
  if(!value||typeof value!=="object")return null;
  const input=value as Record<string,unknown>,machineName=text(input.machineName,120),currentState=text(input.currentState,40);
  if(!machineName||!Array.isArray(input.controls))return null;
  const controls=input.controls.slice(0,24).flatMap(item=>{
    if(!item||typeof item!=="object")return[];
    const raw=item as Record<string,unknown>,id=text(raw.id,120),labelZh=text(raw.labelZh,120),labelJa=text(raw.labelJa,120),recognition=text(raw.recognition,240),controlType=raw.controlType,stateEffect=raw.stateEffect;
    if(!id||!labelZh||raw.availability!=="operational"||!(["count","event","choice"] as unknown[]).includes(controlType))return[];
    return[{id,labelZh,labelJa,recognition,controlType:controlType as SceneControlType,stateEffect:typeof stateEffect==="string"&&gameStates.has(stateEffect as GameState)?stateEffect as GameState:null,availability:"operational" as const}];
  });
  if(!controls.length)return null;
  return{machineName,currentState,controls};
}

export function sanitizeSessionSceneResult(value:unknown,context:SessionSceneContext):SessionSceneResult{
  const raw=value&&typeof value==="object"?value as Record<string,unknown>:{},allowed=new Set(context.controls.map(control=>control.id));
  const candidates=Array.isArray(raw.candidates)?raw.candidates.slice(0,3).flatMap(item=>{
    if(!item||typeof item!=="object")return[];
    const candidate=item as Record<string,unknown>,controlId=text(candidate.controlId,120),reason=text(candidate.reason,240),confidence=candidate.confidence;
    if(!allowed.has(controlId)||!(["high","medium","low"] as unknown[]).includes(confidence))return[];
    return[{controlId,reason,confidence:confidence as SessionSceneCandidate["confidence"]}];
  }):[];
  const requestedStatus=raw.status;
  const status:SessionSceneResult["status"]=requestedStatus==="matched"&&candidates.length?"matched":requestedStatus==="unknown"?"unknown":"uncertain";
  return{status,summaryZh:text(raw.summaryZh,300)||"目前無法可靠確認畫面。",visibleText:Array.isArray(raw.visibleText)?raw.visibleText.map(item=>text(item,100)).filter(Boolean).slice(0,8):[],candidates};
}
