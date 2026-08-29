import type { GameState } from "@/types";
import type { MachineGuideEvent, MachineGuideSectionKey, SessionQuickGuide } from "@/types/machineGuide";
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

export function guideSectionKeysForState(state:GameState):MachineGuideSectionKey[]{
  if(state==="cz")return["cz"];
  if(state==="at"||state==="art")return["at_art"];
  if(state==="bonus")return["bonus"];
  if(state==="special")return["special_events"];
  return["flow","play"];
}

export type PlayerGuideHighlight={id:string;labelZh:string;labelJa:string;meaning:string;instruction:string};

export function isPlayerGuideCopy(value:string|null|undefined){
  const text=value?.trim();
  return Boolean(text)&&!TECHNICAL_COPY.some(pattern=>pattern.test(text!));
}

function unique(values:string[]){return values.filter((value,index)=>values.indexOf(value)===index)}

export function selectPlaySummary(guide:SessionQuickGuide|undefined){
  if(isPlayerGuideCopy(guide?.corePlay))return[guide!.corePlay!.trim()];
  const flow=unique((guide?.flow??[]).filter(isPlayerGuideCopy));
  if(flow.length)return flow;
  return[];
}

export function selectRecognitionEvents(guide:SessionQuickGuide|undefined){
  return guide?.events.filter(item=>["cz","at","art","bonus"].includes(item.category))??[];
}

export function selectCurrentEvents(guide:SessionQuickGuide|undefined,state:GameState){
  const categories=state==="cz"?["cz"]:state==="at"?["at"]:state==="art"?["art"]:state==="bonus"?["bonus"]:state==="special"?["indication","special"]:[];
  return guide?.events.filter(item=>categories.includes(item.category))??[];
}

export function eventRecognition(item:MachineGuideEvent){
  const hiragana=(item.whatToSee.match(/[\u3040-\u309f]/g)??[]).length;
  if(isPlayerGuideCopy(item.whatToSee)&&hiragana<3)return item.whatToSee;
  const meanings:Record<MachineGuideEvent["category"],string>={cz:"CZ（機會區間）",at:"AT 出玉狀態",art:"ART 出玉狀態",bonus:"Bonus 獎勵",role:"小役事件",indication:"設定示唆",special:"特殊事件"};
  return`機台明確顯示「${item.labelZh}」時，代表${meanings[item.category]}。`;
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

function eventMeaning(event:MachineGuideEvent,guide:SessionQuickGuide|undefined){
  const keyThing=guide?.keyThings.find(item=>item.id===event.id);
  if(isPlayerGuideCopy(keyThing?.meaning))return keyThing!.meaning.trim();
  const labels:Record<MachineGuideEvent["category"],string>={cz:"CZ（機會區間）",at:"AT 出玉狀態",art:"ART 出玉狀態",bonus:"Bonus",role:"小役事件",indication:"設定示唆",special:"特殊事件"};
  return `這是本機台可記錄的${labels[event.category]}`;
}

export function buildPlayerGuideHighlights(guide:SessionQuickGuide|undefined,recordControls:SessionRecordControl[],limit=3){
  const seen=new Set<string>(),items:PlayerGuideHighlight[]=[];
  for(const control of recordControls){
    const event=guide?.events.find(item=>item.id===control.capability.eventId),id=event?.id??control.id,normalized=id.normalize("NFKC").trim().toLocaleLowerCase();
    if(seen.has(normalized))continue;
    seen.add(normalized);
    items.push({id,labelZh:event?.labelZh??control.counter?.labelZh??control.capability.labelZh,labelJa:event?.labelJa??control.counter?.labelJa??control.capability.labelJa,meaning:event?eventMeaning(event,guide):"這是本次遊玩可記錄的項目",instruction:recordInstruction(control,guide)});
  }
  return{primary:items.slice(0,limit),more:items.slice(limit)};
}
