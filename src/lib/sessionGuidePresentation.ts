import type { GameState } from "@/types";
import type { MachineGuideEvent, SessionQuickGuide } from "@/types/machineGuide";
import type { SessionRecordControl } from "@/lib/sessionUi";

const TECHNICAL_COPY = [
  /公開資料中的.+事件/i,
  /P-WORLD.+提供.+(?:段公開說明|個結構化表格)/i,
  /下方保留可追溯的日文內容與數值/i,
  /(?:parser|compiler|結構化資料)/i,
  /^[a-z_]+(?:\s*[›>/]\s*[a-z_]+)+$/i,
];

export const GUIDE_EMPTY_PLAY = "目前尚無玩法說明";
export const GUIDE_EMPTY_RECOGNITION = "目前尚無辨認說明";

export function isPlayerGuideCopy(value:string|null|undefined){
  const text=value?.trim();
  return Boolean(text)&&!TECHNICAL_COPY.some(pattern=>pattern.test(text!));
}

function unique(values:string[]){return values.filter((value,index)=>values.indexOf(value)===index)}

export function selectPlaySummary(guide:SessionQuickGuide|undefined){
  const flow=unique((guide?.flow??[]).filter(isPlayerGuideCopy));
  if(flow.length)return flow;
  return isPlayerGuideCopy(guide?.corePlay)?[guide!.corePlay!.trim()]:[];
}

export function selectRecognitionEvents(guide:SessionQuickGuide|undefined){
  return guide?.events.filter(item=>["cz","at","art","bonus"].includes(item.category))??[];
}

export function selectCurrentEvents(guide:SessionQuickGuide|undefined,state:GameState){
  const categories=state==="cz"?["cz"]:state==="at"?["at"]:state==="art"?["art"]:state==="bonus"?["bonus"]:state==="special"?["indication","special"]:[];
  return guide?.events.filter(item=>categories.includes(item.category))??[];
}

export function eventRecognition(item:MachineGuideEvent){
  return isPlayerGuideCopy(item.whatToSee)?item.whatToSee:GUIDE_EMPTY_RECOGNITION;
}

export function selectAttentionItems(guide:SessionQuickGuide|undefined){
  return (guide?.keyThings??[]).map(item=>{
    const event=guide?.events.find(candidate=>candidate.id===item.id);
    const detail=isPlayerGuideCopy(item.meaning)?item.meaning:event?eventRecognition(event):GUIDE_EMPTY_RECOGNITION;
    return{...item,detail};
  });
}

export function recordInstruction(control:SessionRecordControl,guide:SessionQuickGuide|undefined){
  const label=control.counter?.labelZh??control.capability.labelZh;
  const event=guide?.events.find(item=>item.id===control.capability.eventId);
  if(control.counter?.type==="choice")return`機台明確顯示「${label}」時，選擇對應項目`;
  if(event)return`機台明確顯示「${event.labelZh}」時記錄 1 次`;
  const recognition=control.counter?.recognition;
  return isPlayerGuideCopy(recognition)?recognition!:GUIDE_EMPTY_RECOGNITION;
}
