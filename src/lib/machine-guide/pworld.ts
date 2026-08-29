import type { MachineCatalogRecord } from "@/types/catalog";
import type { MachineGuide, MachineGuideImage, MachineGuideSectionKey, MachineGuideTable, ParsedMachineGuideFacts } from "@/types/machineGuide";
import { classifyMachineFamily, compileMachineGuide } from "./compiler.ts";
import { buildControlManifest } from "./controlManifest.ts";
import { canonicalPWorldImageUrl,isVisualGuidePilotCatalog,VISUAL_GUIDE_MAX_IMAGES,visualGuideAssetId,visualGuideCaption } from "./visualGuide.ts";

const SECTION_META:Record<MachineGuideSectionKey,{zh:string;ja:string;patterns:RegExp[]}>={
  features:{zh:"基本機種特色",ja:"基本情報",patterns:[/基本情報|基本仕様|情報$/]},
  play:{zh:"基本玩法",ja:"打ち方",patterns:[/打ち方|初打講座/]},
  flow:{zh:"通常時遊戲流程",ja:"ゲームフロー",patterns:[/ゲームフロー|通常時のゲーム性/]},
  cz:{zh:"CZ 資訊",ja:"CZ",patterns:[/(?:上位)?CZ(?:\)|）)?について|チャンスゾーン|(?:\(|（)(?:上位)?CZ(?:\)|）)(?:関連)?/]},
  at_art:{zh:"AT／ART 資訊",ja:"AT・ART",patterns:[/AT・ART|(?:上位)?AT(?:\)|）)?について|ART.*について|(?:AT|ART)関連|(?:\(|（)(?:上位)?(?:AT|ART)(?:\)|）)(?:関連)?/]},
  bonus:{zh:"Bonus 資訊",ja:"ボーナス",patterns:[/ボーナスについて|BONUS/]},
  ceiling:{zh:"天井及公開參考",ja:"天井",patterns:[/天井/]},
  setting_rates:{zh:"設定 1～6 公開機率",ja:"設定別機率",patterns:[/確率|設定推測/]},
  payout:{zh:"出玉率／機械割",ja:"出玉率",patterns:[/出玉率|機械割/]},
  small_roles:{zh:"小役機率",ja:"小役確率",patterns:[/小役確率/]},
  special_events:{zh:"特殊演出與設定示唆",ja:"演出情報",patterns:[/終了画面|設定示唆|演出情報/]},
};
const KEYS=Object.keys(SECTION_META) as MachineGuideSectionKey[];
const SECTION_PRIORITY:MachineGuideSectionKey[]=["small_roles","payout","special_events","ceiling","cz","at_art","bonus","play","flow","features","setting_rates"];
const entities:Record<string,string>={amp:"&",nbsp:" ",lt:"<",gt:">",quot:'"',apos:"'"};
function decode(value:string){return value.replace(/&#x([\da-f]+);|&#(\d+);|&([a-z]+);/gi,(_,h,d,n)=>h?String.fromCodePoint(parseInt(h,16)):d?String.fromCodePoint(Number(d)):entities[String(n).toLowerCase()]??" ")}
function text(value:string){return decode(value.replace(/<br\s*\/?>/gi,"\n").replace(/<img\b[^>]*>/gi," ").replace(/<[^>]+>/g," ")).replace(/[ \t]+/g," ").replace(/\n\s*/g,"\n").trim()}
function officialScope(html:string){const start=html.search(/<div\b[^>]*id=["']spec["']/i),end=html.search(/<div\b[^>]*id=["']bbs["']/i);if(start>=0)return html.slice(start,end>start?end:html.length);return end>=0?html.slice(0,end):html}
function clean(html:string){return officialScope(html).replace(/<(script|style|template|noscript|header|nav|footer|aside)\b[\s\S]*?<\/\1\s*>/gi," ").replace(/<(div|section|ul)\b[^>]*(?:class|id)=["'][^"']*(?:shop|store|related|ranking|recommend|breadcrumb|advert|sponsor|sns|share|bbs|comment|review|post|machineUpdate)[^"']*["'][^>]*>[\s\S]*?<\/\1\s*>/gi," ")}
function normalizedRow(row:string[]){const trimmed=row.map(cell=>cell.trim());while(trimmed.length&& !trimmed.at(-1))trimmed.pop();return trimmed}
function parseTable(html:string,title:string,index:number,sourceUrl:string):MachineGuideTable|null{const rawRows=[...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr\s*>/gi)].map(match=>normalizedRow([...match[1].matchAll(/<(th|td)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi)].map(cell=>text(cell[2])))).filter(row=>row.some(Boolean)),headerIndex=rawRows.findIndex(row=>row.length>1&&new Set(row.filter(Boolean)).size>1),headers=rawRows[headerIndex]??[];if(headers.length<2||new Set(headers.filter(Boolean)).size<2)return null;const headerSignature=headers.join("\u0001"),seen=new Set<string>(),rows=rawRows.slice(headerIndex+1).filter(row=>{if(row.length<2||row.join("\u0001")===headerSignature)return false;const populated=row.filter(Boolean),unique=new Set(populated);if(!populated.length||unique.size===1&&populated[0]===title)return false;const signature=row.join("\u0001");if(seen.has(signature))return false;seen.add(signature);return true});if(!rows.length)return null;return{id:`pworld-table-${index}`,title,headers,rows,note:null,sourceUrl,sourceName:"P-WORLD",sourceUrls:[sourceUrl],sourceNames:["P-WORLD"]}}
function sectionKey(title:string):MachineGuideSectionKey|null{for(const key of SECTION_PRIORITY)if(SECTION_META[key].patterns.some(pattern=>pattern.test(title)))return key;return null}
function isMissing(value:string){return !value||/^(調査中|未公開|不明|—|-)$/.test(value.trim())}
function summaryFor(key:MachineGuideSectionKey,paragraphs:string[],tables:MachineGuideTable[]){if(!paragraphs.length&&!tables.length)return null;const detail=[paragraphs.length?`${paragraphs.length} 段公開說明`:"",tables.length?`${tables.length} 個結構化表格`:""].filter(Boolean).join("、");return`P-WORLD 在「${SECTION_META[key].ja}」提供${detail}。下方保留可追溯的日文內容與數值；未公開或調查中的值不會補猜。`}

function attribute(tag:string,name:string){const match=tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`,"i"));return match?.[2]?.trim()??""}
function dimension(tag:string,name:"width"|"height"){const value=Number(attribute(tag,name));return Number.isFinite(value)&&value>0?value:null}
function imageCandidates(chunk:string,key:MachineGuideSectionKey,record:MachineCatalogRecord){
  const images:MachineGuideImage[]=[];
  for(const match of chunk.matchAll(/<img\b[^>]*>/gi)){
    const tag=match[0],raw=attribute(tag,"data-original")||attribute(tag,"src"),sourceImageUrl=canonicalPWorldImageUrl(raw,record.sourceUrl);
    if(!sourceImageUrl)continue;
    const width=dimension(tag,"width"),height=dimension(tag,"height");
    if(width!==null&&width<260||height!==null&&height<120)continue;
    if(width&&height&&(width/height>5||height/width>4))continue;
    const altJa=text(attribute(tag,"alt"));
    if(!altJa||/シェア|ロゴ|店舗|ホール|広告/.test(altJa))continue;
    const id=visualGuideAssetId(sourceImageUrl);
    images.push({id,sectionKey:key,altJa,captionZh:visualGuideCaption(key,altJa,record.officialNameJa),sourcePageUrl:record.sourceUrl,sourceImageUrl,displayUrl:sourceImageUrl,width,height,byteSize:null,contentType:null,storageStatus:"source"});
  }
  return images;
}

function selectGuideImages(images:MachineGuideImage[]){
  const unique=[...new Map(images.map(image=>[image.sourceImageUrl,image])).values()],selected:MachineGuideImage[]=[],perSection=new Map<MachineGuideSectionKey,number>();
  for(const image of unique){
    const count=perSection.get(image.sectionKey)??0;
    if(count>=4)continue;
    selected.push(image);perSection.set(image.sectionKey,count+1);
    if(selected.length===VISUAL_GUIDE_MAX_IMAGES)break;
  }
  return selected;
}

export function parsePWorldMachineFacts(html:string,record:MachineCatalogRecord,retrievedAt=new Date().toISOString()):ParsedMachineGuideFacts{
  const sourceUrl=record.sourceUrl,body=clean(html),headings=[...body.matchAll(/<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1\s*>/gi)],grouped=new Map<MachineGuideSectionKey,{paragraphs:string[];tables:MachineGuideTable[]}>(),images:MachineGuideImage[]=[];
  for(let index=0;index<headings.length;index++){const heading=headings[index],title=text(heading[2]),key=sectionKey(title);if(!key)continue;const start=(heading.index??0)+heading[0].length,end=headings[index+1]?.index??body.length,chunk=body.slice(start,end),paragraphNodes=[...chunk.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p\s*>/gi)].map(item=>item[1]),articleNodes=[...chunk.matchAll(/<div\b[^>]*class=["'][^"']*\barticleBox-content\b[^"']*["'][^>]*>([\s\S]*?)<\/div\s*>/gi)].flatMap(item=>item[1].split(/(?:<br\s*\/?>\s*){2,}/gi)),paragraphs=[...paragraphNodes,...articleNodes].map(value=>text(value)).filter(value=>value&&!isMissing(value)&&value.length>8&&!/設置店|関連記事|ランキング/.test(value)).slice(0,8),tables=[...chunk.matchAll(/<table\b[^>]*>[\s\S]*?<\/table\s*>/gi)].map((item,tableIndex)=>parseTable(item[0],title,index*10+tableIndex,sourceUrl)).filter((item):item is MachineGuideTable=>Boolean(item));const current=grouped.get(key)??{paragraphs:[],tables:[]};current.paragraphs.push(...paragraphs);current.tables.push(...tables);grouped.set(key,current);if(isVisualGuidePilotCatalog(record.id))images.push(...imageCandidates(chunk,key,record))}
  const sections=KEYS.flatMap(key=>{const value=grouped.get(key);if(!value||(!value.paragraphs.length&&!value.tables.length))return[];const seenTables=new Set<string>(),tables=value.tables.filter(table=>{const signature=JSON.stringify([table.title,table.headers,table.rows]);if(seenTables.has(signature))return false;seenTables.add(signature);return true}),paragraphs=[...new Set(value.paragraphs)];if(!paragraphs.length&&!tables.length)return[];const meta=SECTION_META[key];return[{key,titleZh:meta.zh,titleJa:meta.ja,summaryZh:summaryFor(key,paragraphs,tables),paragraphsJa:paragraphs,tables}]});
  const reliableText=sections.flatMap(section=>section.tables.flatMap(table=>[table.title,...table.headers,...table.rows.flat()])).join("\n"),available=new Set(sections.map(section=>section.key));if(/(?:AT|ART)(?:確率|初当り)|GOD GAME\(AT\)|喰霊CHANCE\(ART\)/i.test(reliableText))available.add("at_art");if(/小役確率|小役.*確率/.test(reliableText))available.add("small_roles");if(/終了画面|設定示唆/.test(reliableText)||/プレート/.test(reliableText)&&/示唆内容|設定[2-6]以上濃厚/.test(reliableText))available.add("special_events");if(/CZ(?:確率|初当り|出現)|チャンスゾーン/.test(reliableText))available.add("cz");if(/ボーナス(?:初当り|確率)|BIG(?: BONUS)?|REG(?: BONUS)?/i.test(reliableText))available.add("bonus");
  const missingSections=KEYS.filter(key=>!available.has(key));
  const evidence=sections.flatMap(section=>[...(section.paragraphsJa.length?[{sectionKey:section.key,rawLabel:section.titleJa,extractedFrom:"paragraph" as const,sourceUrl}]:[]),...section.tables.map(table=>({sectionKey:section.key,rawLabel:table.title,extractedFrom:"table" as const,sourceUrl}))]);
  const facts:ParsedMachineGuideFacts={catalogId:record.id,officialNameJa:record.officialNameJa,displayNameZh:record.displayNameZh,manufacturer:record.manufacturer,catalogMachineType:record.machineType,introducedAt:record.introducedAt,sections,images:selectGuideImages(images),evidence,missingSections,sourceName:"P-WORLD",sourceUrl,retrievedAt,sources:[{name:"P-WORLD",url:sourceUrl,retrievedAt,role:"primary",status:"available"}]};facts.familyClassificationHint=classifyMachineFamily(facts);return facts;
}
export function parsePWorldMachineGuide(html:string,record:MachineCatalogRecord,retrievedAt=new Date().toISOString()):MachineGuide{const facts=parsePWorldMachineFacts(html,record,retrievedAt),guide=compileMachineGuide(facts);guide.familyClassification=classifyMachineFamily(facts);guide.controlManifest=buildControlManifest(guide.sessionCapabilities,guide.smartCounters,guide.recordableEvents,guide.states);return guide}

export class PWorldMachineGuideProvider{
  private request:typeof fetch;
  constructor(request:typeof fetch=fetch){this.request=request}
  supports(sourceUrl:string){try{const url=new URL(sourceUrl);return (url.hostname==="www.p-world.co.jp"||url.hostname==="p-world.co.jp")&&/^\/machine\/database\/\d+\/?$/.test(url.pathname)}catch{return false}}
  async fetchFacts(record:MachineCatalogRecord){if(!this.supports(record.sourceUrl))throw new Error("Catalog 沒有可使用的 P-WORLD 機台詳細頁來源。");const response=await this.request(record.sourceUrl,{headers:{Accept:"text/html,application/xhtml+xml","User-Agent":"Slot Companion/0.2.6 (+personal machine guide)"},cache:"no-store",signal:AbortSignal.timeout(12000)});if(!response.ok)throw new Error(`P-WORLD 來源回應 ${response.status}，目前無法建立機台指南。`);const html=await response.text();if(html.length<500)throw new Error("P-WORLD 回傳內容不完整，目前無法建立機台指南。");return parsePWorldMachineFacts(html,record)}
  async fetch(record:MachineCatalogRecord){return compileMachineGuide(await this.fetchFacts(record))}
}
