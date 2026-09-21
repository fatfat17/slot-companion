import type { MachineGuide,MachineGuideSectionKey } from "@/types/machineGuide";

export type SlotSelectionMode="morning"|"evening";
export type SlotSelectionCandidateInput={catalogId:string;currentGame:number|null;note:string};
export type SlotSelectionCatalogContext={catalogId:string;officialNameJa:string;displayNameZh:string;manufacturer:string;machineType:string;introducedAt:string|null;sourceName:string;sourceUrl:string};
export type SlotSelectionGuideFact={sectionKey:MachineGuideSectionKey;title:string;summary:string;details:string[]};
export type SlotSelectionGuideContext={catalogId:string;status:"current"|"missing";sourceName:string;sourceUrl:string;retrievedAt:string;facts:SlotSelectionGuideFact[]};
export type SlotSelectionResolvedCandidate={catalog:SlotSelectionCatalogContext;currentGame:number|null;note:string;guide:SlotSelectionGuideContext|null;photoIndex:number|null};

const modes=new Set<SlotSelectionMode>(["morning","evening"]);
const allowedSections=new Set<MachineGuideSectionKey>(["features","play","flow","ceiling","cz","at_art","bonus"]);
const cleanText=(value:unknown,max:number)=>typeof value==="string"?value.trim().slice(0,max):"";
const cleanGame=(value:unknown)=>value===null||value===""||value===undefined?null:Number.isFinite(Number(value))?Math.min(99999,Math.max(0,Math.round(Number(value)))):null;

export function japanSelectionMode(now=new Date()):SlotSelectionMode{
  const hour=Number(new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Tokyo",hour:"2-digit",hour12:false}).format(now));
  return hour>=15?"evening":"morning";
}

export function sanitizeSlotSelectionMode(value:unknown):SlotSelectionMode{return typeof value==="string"&&modes.has(value as SlotSelectionMode)?value as SlotSelectionMode:"morning"}

export function sanitizeSlotSelectionCandidates(value:unknown,mode:SlotSelectionMode):SlotSelectionCandidateInput[]{
  if(!Array.isArray(value))return[];
  const limit=mode==="morning"?1:5,seen=new Set<string>();
  return value.slice(0,limit).flatMap(item=>{if(!item||typeof item!=="object")return[];const raw=item as Record<string,unknown>,catalogId=cleanText(raw.catalogId,100);if(!catalogId||seen.has(catalogId))return[];seen.add(catalogId);return[{catalogId,currentGame:cleanGame(raw.currentGame),note:cleanText(raw.note,600)}]});
}

export function guideContextFromMachineGuide(guide:MachineGuide):SlotSelectionGuideContext{
  const facts:SlotSelectionGuideFact[]=guide.sections.filter(section=>allowedSections.has(section.key)).slice(0,7).map(section=>({
    sectionKey:section.key,
    title:cleanText(section.titleZh||section.titleJa,80),
    summary:cleanText(section.summaryZh,500),
    details:[...section.paragraphsJa.slice(0,5),...section.tables.slice(0,2).flatMap(table=>[table.title,...table.headers,...table.rows.slice(0,8).flat()])].map(value=>cleanText(value,180)).filter(Boolean).slice(0,30),
  })).filter(fact=>fact.summary||fact.details.length);
  return{catalogId:guide.catalogId,status:"current",sourceName:cleanText(guide.sourceName,80),sourceUrl:cleanText(guide.sourceUrl,500),retrievedAt:cleanText(guide.retrievedAt,60),facts};
}

export function sanitizeSlotSelectionGuides(value:unknown,candidateIds:Set<string>):SlotSelectionGuideContext[]{
  if(!Array.isArray(value))return[];
  return value.slice(0,5).flatMap(item=>{if(!item||typeof item!=="object")return[];const raw=item as Record<string,unknown>,catalogId=cleanText(raw.catalogId,100);if(!catalogId||!candidateIds.has(catalogId))return[];const facts=Array.isArray(raw.facts)?raw.facts.slice(0,7).flatMap(fact=>{if(!fact||typeof fact!=="object")return[];const source=fact as Record<string,unknown>,sectionKey=cleanText(source.sectionKey,30) as MachineGuideSectionKey;if(!allowedSections.has(sectionKey))return[];return[{sectionKey,title:cleanText(source.title,80),summary:cleanText(source.summary,500),details:Array.isArray(source.details)?source.details.slice(0,30).map(value=>cleanText(value,180)).filter(Boolean):[]}]}):[];return[{catalogId,status:"current" as const,sourceName:cleanText(raw.sourceName,80),sourceUrl:cleanText(raw.sourceUrl,500),retrievedAt:cleanText(raw.retrievedAt,60),facts}]});
}

export function slotSelectionPrompt(mode:SlotSelectionMode){
  const common=`你是 Slot Companion 的日本 Pachislot／Smart Slot 選台助手。只可使用本次提供的 Catalog identity、browser-local Machine Guide 摘要、玩家輸入與照片回答。不可用模型記憶補猜 Reset 恩惠、天井、Zone、期待值、設定差或店家狀況。Guide 沒有 ceiling／Reset 證據時必須明說「目前指南沒有可靠資料」，不可把常見機制套到這台。照片中的數字或文字不清楚時標成待確認，不要假裝已讀到。演出熱度不能當成續打或選台理由。
用繁體中文與台灣口吻，先給結論，再說依據與缺口。娛樂判讀可以熱情，投注判斷必須冷靜；不保證獲利、不預測即將中獎。不要使用 Markdown 表格或標題符號。照片與分析不會自動建立 Session 或修改紀錄。`;
  if(mode==="morning")return`${common}\n目前是朝一模式，最多只有一台候選。依序回答：這台朝一是否有「已驗證、來源內存在」的 Reset／開店條件；今天最值得先確認的畫面或數字；若資料不足，提供不依賴未驗證攻略的保守檢查方式。沒有來源時絕對不能說有 Reset 優惠。`;
  return`${common}\n目前是晚間撿台模式，最多五台候選。請依玩家明確提供的目前 G、履歷照片、離店限制與 Guide 資料排序；輸出首選、次選與不建議／資料不足候選，每台用一句理由。沉沒成本、熱鬧演出與「怕被別人撿」不是理由。資料不足以排序時要並列或直接說無法可靠排序，不可硬選。`;
}
