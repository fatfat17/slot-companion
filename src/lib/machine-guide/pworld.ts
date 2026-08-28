import type { MachineCatalogRecord } from "@/types/catalog";
import type { MachineGuide, MachineGuideSectionKey, MachineGuideTable, ParsedMachineGuideFacts } from "@/types/machineGuide";
import { compileMachineGuide } from "./compiler.ts";

const SECTION_META:Record<MachineGuideSectionKey,{zh:string;ja:string;patterns:RegExp[]}>={
  features:{zh:"基本機種特色",ja:"基本情報",patterns:[/基本情報|基本仕様|情報$/]},
  play:{zh:"基本玩法",ja:"打ち方",patterns:[/打ち方|初打講座/]},
  flow:{zh:"通常時遊戲流程",ja:"ゲームフロー",patterns:[/ゲームフロー|通常時のゲーム性/]},
  cz:{zh:"CZ 資訊",ja:"CZ",patterns:[/CZについて|チャンスゾーン/]},
  at_art:{zh:"AT／ART 資訊",ja:"AT・ART",patterns:[/AT・ART|ATについて|ART.*について|AT関連|ART関連/]},
  bonus:{zh:"Bonus 資訊",ja:"ボーナス",patterns:[/ボーナスについて|BONUS/]},
  ceiling:{zh:"天井及公開參考",ja:"天井",patterns:[/天井/]},
  setting_rates:{zh:"設定 1～6 公開機率",ja:"設定別機率",patterns:[/確率|設定推測/]},
  payout:{zh:"出玉率／機械割",ja:"出玉率",patterns:[/出玉率|機械割/]},
  small_roles:{zh:"小役機率",ja:"小役確率",patterns:[/小役確率/]},
  special_events:{zh:"特殊演出與設定示唆",ja:"演出情報",patterns:[/終了画面|設定示唆|演出情報/]},
};
const KEYS=Object.keys(SECTION_META) as MachineGuideSectionKey[];
const entities:Record<string,string>={amp:"&",nbsp:" ",lt:"<",gt:">",quot:'"',apos:"'"};
function decode(value:string){return value.replace(/&#x([\da-f]+);|&#(\d+);|&([a-z]+);/gi,(_,h,d,n)=>h?String.fromCodePoint(parseInt(h,16)):d?String.fromCodePoint(Number(d)):entities[String(n).toLowerCase()]??" ")}
function text(value:string){return decode(value.replace(/<br\s*\/?>/gi,"\n").replace(/<img\b[^>]*alt=["']([^"']*)["'][^>]*>/gi," $1 ").replace(/<[^>]+>/g," ")).replace(/[ \t]+/g," ").replace(/\n\s*/g,"\n").trim()}
function clean(html:string){return html.replace(/<(script|style|template|noscript|header|nav|footer|aside)\b[\s\S]*?<\/\1\s*>/gi," ").replace(/<(div|section|ul)\b[^>]*(?:class|id)=["'][^"']*(?:shop|store|related|ranking|recommend|breadcrumb|advert|sponsor|sns|share)[^"']*["'][^>]*>[\s\S]*?<\/\1\s*>/gi," ")}
function parseTable(html:string,title:string,index:number,sourceUrl:string):MachineGuideTable|null{const rawRows=[...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr\s*>/gi)].map(match=>[...match[1].matchAll(/<(th|td)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi)].map(cell=>text(cell[2]))).filter(row=>row.some(Boolean));if(rawRows.length<2)return null;const headerIndex=rawRows.findIndex(row=>row.length>1),headers=rawRows[headerIndex]??[];if(headers.length<2)return null;return{id:`pworld-table-${index}`,title,headers,rows:rawRows.slice(headerIndex+1).filter(row=>row.some(Boolean)),note:null,sourceUrl}}
function sectionKey(title:string):MachineGuideSectionKey|null{for(const key of KEYS)if(SECTION_META[key].patterns.some(pattern=>pattern.test(title)))return key;return null}
function isMissing(value:string){return !value||/^(調査中|未公開|不明|—|-)$/.test(value.trim())}
function summaryFor(key:MachineGuideSectionKey,paragraphs:string[],tables:MachineGuideTable[]){if(!paragraphs.length&&!tables.length)return null;const detail=[paragraphs.length?`${paragraphs.length} 段公開說明`:"",tables.length?`${tables.length} 個結構化表格`:""].filter(Boolean).join("、");return`P-WORLD 在「${SECTION_META[key].ja}」提供${detail}。下方保留可追溯的日文內容與數值；未公開或調查中的值不會補猜。`}

export function parsePWorldMachineFacts(html:string,record:MachineCatalogRecord,retrievedAt=new Date().toISOString()):ParsedMachineGuideFacts{
  const sourceUrl=record.sourceUrl,body=clean(html),headings=[...body.matchAll(/<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1\s*>/gi)],grouped=new Map<MachineGuideSectionKey,{paragraphs:string[];tables:MachineGuideTable[]}>();
  for(let index=0;index<headings.length;index++){const heading=headings[index],title=text(heading[2]),key=sectionKey(title);if(!key)continue;const start=(heading.index??0)+heading[0].length,end=headings[index+1]?.index??body.length,chunk=body.slice(start,end),paragraphs=[...chunk.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p\s*>/gi)].map(item=>text(item[1])).filter(value=>value&&!isMissing(value)&&value.length>8&&!/設置店|関連記事|ランキング/.test(value)).slice(0,8),tables=[...chunk.matchAll(/<table\b[^>]*>[\s\S]*?<\/table\s*>/gi)].map((item,tableIndex)=>parseTable(item[0],title,index*10+tableIndex,sourceUrl)).filter((item):item is MachineGuideTable=>Boolean(item));const current=grouped.get(key)??{paragraphs:[],tables:[]};current.paragraphs.push(...paragraphs);current.tables.push(...tables);grouped.set(key,current)}
  const sections=KEYS.flatMap(key=>{const value=grouped.get(key);if(!value||(!value.paragraphs.length&&!value.tables.length))return[];const meta=SECTION_META[key];return[{key,titleZh:meta.zh,titleJa:meta.ja,summaryZh:summaryFor(key,value.paragraphs,value.tables),paragraphsJa:value.paragraphs,tables:value.tables}]});
  const missingSections=KEYS.filter(key=>!sections.some(section=>section.key===key));
  const evidence=sections.flatMap(section=>[...(section.paragraphsJa.length?[{sectionKey:section.key,rawLabel:section.titleJa,extractedFrom:"paragraph" as const,sourceUrl}]:[]),...section.tables.map(table=>({sectionKey:section.key,rawLabel:table.title,extractedFrom:"table" as const,sourceUrl}))]);
  return{catalogId:record.id,officialNameJa:record.officialNameJa,displayNameZh:record.displayNameZh,manufacturer:record.manufacturer,catalogMachineType:record.machineType,introducedAt:record.introducedAt,sections,evidence,missingSections,sourceName:"P-WORLD",sourceUrl,retrievedAt};
}
export function parsePWorldMachineGuide(html:string,record:MachineCatalogRecord,retrievedAt=new Date().toISOString()):MachineGuide{return compileMachineGuide(parsePWorldMachineFacts(html,record,retrievedAt))}

export class PWorldMachineGuideProvider{
  private request:typeof fetch;
  constructor(request:typeof fetch=fetch){this.request=request}
  supports(sourceUrl:string){try{const url=new URL(sourceUrl);return (url.hostname==="www.p-world.co.jp"||url.hostname==="p-world.co.jp")&&/^\/machine\/database\/\d+\/?$/.test(url.pathname)}catch{return false}}
  async fetch(record:MachineCatalogRecord){if(!this.supports(record.sourceUrl))throw new Error("Catalog 沒有可使用的 P-WORLD 機台詳細頁來源。");const response=await this.request(record.sourceUrl,{headers:{Accept:"text/html,application/xhtml+xml","User-Agent":"Slot Companion/0.2.6 (+personal machine guide)"},cache:"no-store",signal:AbortSignal.timeout(12000)});if(!response.ok)throw new Error(`P-WORLD 來源回應 ${response.status}，目前無法建立機台指南。`);const html=await response.text();if(html.length<500)throw new Error("P-WORLD 回傳內容不完整，目前無法建立機台指南。");return parsePWorldMachineGuide(html,record)}
}
