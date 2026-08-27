import type { CounterDefinition, SettingBenchmark, SettingValues } from "@/types";
import type { MachineCatalogRecord } from "@/types/catalog";
import type { MachineGuide, MachineGuideSection, MachineGuideSectionKey, MachineGuideTable } from "@/types/machineGuide";

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
function normalizeSetting(value:string){const match=value.match(/設定\s*([1-6])/);return match?Number(match[1]):null}
function numberValue(value:string){if(isMissing(value))return null;const oneIn=value.replace(/／/g,"/").match(/1\s*\/\s*([\d.]+)/);if(oneIn)return{mode:"oneIn" as const,value:Number(oneIn[1])};const percent=value.replace(/％/g,"%").match(/([\d.]+)\s*%/);if(percent)return{mode:"probability" as const,value:Number(percent[1])/100};return null}
function slug(value:string){return value.normalize("NFKC").toLowerCase().replace(/[^a-z0-9\p{L}\p{N}]+/gu,"-").replace(/^-|-$/g,"").slice(0,48)||"metric"}
function settingData(table:MachineGuideTable,column:number){const values:Partial<SettingValues>={};let mode:"oneIn"|"probability"|null=null;for(const row of table.rows){const setting=normalizeSetting(row[0]??"");if(!setting){if(Object.keys(values).length)break;continue}if(values[setting as 1|2|3|4|5|6]!==undefined)break;const parsed=numberValue(row[column]??"");if(!parsed)return null;if(mode&&mode!==parsed.mode)return null;mode=parsed.mode;values[setting as 1|2|3|4|5|6]=parsed.value;if(Object.keys(values).length===6)break}if(Object.keys(values).length!==6||!mode)return null;return{values:values as SettingValues,mode}}
function counter(machineId:string,key:string,label:string,ja:string,type:CounterDefinition["type"]="count"):CounterDefinition{return{id:`${machineId}-${key}`,machineId,key,labelZh:label,labelJa:ja,icon:type==="event"?"✦":"🎯",description:"依 P-WORLD 公開資料建立的實戰記錄項目。",recognition:"請只在實際發生時記錄。",reason:"供本 Session 實測統計使用。",type,denominatorMetricKey:type==="count"?"observedTotalGame":undefined}}
function deriveStatistics(catalogId:string,sections:MachineGuideSection[],sourceUrl:string,retrievedAt:string){const counters=new Map<string,CounterDefinition>(),seen=new Set<string>();counters.set("bonus",counter(catalogId,"bonus","Bonus 次數","ボーナス","event"));counters.set("specialEvent",counter(catalogId,"specialEvent","特殊演出／示唆","特殊演出","event"));const benchmarks:SettingBenchmark[]=[];for(const section of sections)for(const table of section.tables){if(!table.headers[0]?.includes("設定"))continue;for(let column=1;column<table.headers.length;column++){const label=table.headers[column],data=settingData(table,column);if(!data)continue;let numeratorKey:string|undefined;if(/CZ|チャンスゾーン/i.test(label))numeratorKey="cz";else if(/AT|ART/i.test(label))numeratorKey="at";else if(/BONUS|ボーナス|BIG|REG/i.test(label))numeratorKey=`guide-${slug(label)}`;else if(section.key==="small_roles")numeratorKey=`guide-${slug(label)}`;if(!numeratorKey)continue;const signature=`${numeratorKey}:${data.mode}:${JSON.stringify(data.values)}`;if(seen.has(signature))continue;seen.add(signature);if(!["cz","at"].includes(numeratorKey)&&!counters.has(numeratorKey))counters.set(numeratorKey,counter(catalogId,numeratorKey,label,label,section.key==="small_roles"?"count":"event"));benchmarks.push({id:`${catalogId}-${slug(table.title)}-${slug(label)}`,labelZh:label,labelJa:label,metricKey:numeratorKey,kind:"rate",observation:{type:"rate",numeratorKey,denominatorMetricKey:"observedTotalGame",valueMode:data.mode},settingValues:data.values,minimumSample:600,source:`P-WORLD · ${sourceUrl}`,updatedAt:retrievedAt,verified:true,testData:false,evidenceIds:[table.id]})}}
  return{benchmarks,smartCounters:[...counters.values()]};
}
function summaryFor(key:MachineGuideSectionKey,paragraphs:string[],tables:MachineGuideTable[]){if(!paragraphs.length&&!tables.length)return null;const detail=[paragraphs.length?`${paragraphs.length} 段公開說明`:"",tables.length?`${tables.length} 個結構化表格`:""].filter(Boolean).join("、");return`P-WORLD 在「${SECTION_META[key].ja}」提供${detail}。下方保留可追溯的日文內容與數值；未公開或調查中的值不會補猜。`}

export function parsePWorldMachineGuide(html:string,record:MachineCatalogRecord,retrievedAt=new Date().toISOString()):MachineGuide{
  const sourceUrl=record.sourceUrl,body=clean(html),headings=[...body.matchAll(/<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1\s*>/gi)],grouped=new Map<MachineGuideSectionKey,{paragraphs:string[];tables:MachineGuideTable[]}>();
  for(let index=0;index<headings.length;index++){const heading=headings[index],title=text(heading[2]),key=sectionKey(title);if(!key)continue;const start=(heading.index??0)+heading[0].length,end=headings[index+1]?.index??body.length,chunk=body.slice(start,end),paragraphs=[...chunk.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p\s*>/gi)].map(item=>text(item[1])).filter(value=>value&&!isMissing(value)&&value.length>8&&!/設置店|関連記事|ランキング/.test(value)).slice(0,8),tables=[...chunk.matchAll(/<table\b[^>]*>[\s\S]*?<\/table\s*>/gi)].map((item,tableIndex)=>parseTable(item[0],title,index*10+tableIndex,sourceUrl)).filter((item):item is MachineGuideTable=>Boolean(item));const current=grouped.get(key)??{paragraphs:[],tables:[]};current.paragraphs.push(...paragraphs);current.tables.push(...tables);grouped.set(key,current)}
  const sections=KEYS.flatMap(key=>{const value=grouped.get(key);if(!value||(!value.paragraphs.length&&!value.tables.length))return[];const meta=SECTION_META[key];return[{key,titleZh:meta.zh,titleJa:meta.ja,summaryZh:summaryFor(key,value.paragraphs,value.tables),paragraphsJa:value.paragraphs,tables:value.tables}]});
  const missingSections=KEYS.filter(key=>!sections.some(section=>section.key===key)),useful=sections.reduce((sum,section)=>sum+section.tables.length+(section.paragraphsJa.length?1:0),0),status=useful>=4?"usable":useful>0?"partial":"no_data",derived=deriveStatistics(record.id,sections,sourceUrl,retrievedAt);
  const evidence=sections.flatMap(section=>[...(section.paragraphsJa.length?[{sectionKey:section.key,rawLabel:section.titleJa,extractedFrom:"paragraph" as const,sourceUrl}]:[]),...section.tables.map(table=>({sectionKey:section.key,rawLabel:table.title,extractedFrom:"table" as const,sourceUrl}))]);
  return{schemaVersion:1,catalogId:record.id,officialNameJa:record.officialNameJa,displayNameZh:record.displayNameZh,manufacturer:record.manufacturer,machineType:record.machineType,introducedAt:record.introducedAt,status,sections,evidence,missingSections,benchmarks:derived.benchmarks,smartCounters:derived.smartCounters,sourceName:"P-WORLD",sourceUrl,retrievedAt};
}

export class PWorldMachineGuideProvider{
  private request:typeof fetch;
  constructor(request:typeof fetch=fetch){this.request=request}
  supports(sourceUrl:string){try{const url=new URL(sourceUrl);return (url.hostname==="www.p-world.co.jp"||url.hostname==="p-world.co.jp")&&/^\/machine\/database\/\d+\/?$/.test(url.pathname)}catch{return false}}
  async fetch(record:MachineCatalogRecord){if(!this.supports(record.sourceUrl))throw new Error("Catalog 沒有可使用的 P-WORLD 機台詳細頁來源。");const response=await this.request(record.sourceUrl,{headers:{Accept:"text/html,application/xhtml+xml","User-Agent":"Slot Companion/0.2.6 (+personal machine guide)"},cache:"no-store",signal:AbortSignal.timeout(12000)});if(!response.ok)throw new Error(`P-WORLD 來源回應 ${response.status}，目前無法建立機台指南。`);const html=await response.text();if(html.length<500)throw new Error("P-WORLD 回傳內容不完整，目前無法建立機台指南。");return parsePWorldMachineGuide(html,record)}
}
