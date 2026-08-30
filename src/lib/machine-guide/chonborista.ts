import type { MachineCatalogRecord } from "@/types/catalog";
import type { MachineGuideSectionKey,MachineGuideTable,ParsedMachineGuideFacts } from "@/types/machineGuide";

const SECTION_META:Record<MachineGuideSectionKey,{zh:string;ja:string}>={
  features:{zh:"基本機種特色",ja:"スペック"},play:{zh:"基本玩法",ja:"打ち方"},flow:{zh:"通常時遊戲流程",ja:"ゲームフロー"},
  cz:{zh:"CZ 資訊",ja:"CZ"},at_art:{zh:"AT／ART 資訊",ja:"AT・ART"},bonus:{zh:"Bonus 資訊",ja:"ボーナス"},
  ceiling:{zh:"天井、重置與停止時機",ja:"天井・リセット・やめどき"},setting_rates:{zh:"設定 1～6 公開機率",ja:"設定判別"},
  payout:{zh:"出玉率／機械割",ja:"出玉率・機械割"},small_roles:{zh:"小役機率",ja:"小役確率"},special_events:{zh:"特殊演出與設定示唆",ja:"設定示唆"},
};
const KEYS=Object.keys(SECTION_META) as MachineGuideSectionKey[];
const entities:Record<string,string>={amp:"&",nbsp:" ",lt:"<",gt:">",quot:'"',apos:"'"};
const excludedHeading=/管理人|感想|評価|コメント|動画|PV|公式サイト|開発インタビュー|狙い目(?:の解説)?|期待値/;
function decode(value:string){return value.replace(/&#x([\da-f]+);|&#(\d+);|&([a-z]+);/gi,(_,h,d,n)=>h?String.fromCodePoint(parseInt(h,16)):d?String.fromCodePoint(Number(d)):entities[String(n).toLowerCase()]??" ")}
function text(value:string){return decode(value.replace(/<br\s*\/?>/gi,"\n").replace(/<img\b[^>]*>/gi," ").replace(/<[^>]+>/g," ")).replace(/[ \t]+/g," ").replace(/\n\s*/g,"\n").trim()}
function articleScope(html:string){const start=html.search(/<(?:div|section)\b[^>]*class=["'][^"']*\bentry-content\b/i);if(start<0)return"";const comments=html.search(/<(?:section|div)\b[^>]*id=["']comments["']/i);return html.slice(start,comments>start?comments:html.length)}
function clean(html:string){return articleScope(html).replace(/<(script|style|template|noscript|header|nav|footer|aside|form)\b[\s\S]*?<\/\1\s*>/gi," ").replace(/<(div|section|ul)\b[^>]*(?:class|id)=["'][^"']*(?:toc|share|sns|related|recommend|ranking|advert|widget|comment|review|author)[^"']*["'][^>]*>[\s\S]*?<\/\1\s*>/gi," ")}
function normalizedRow(row:string[]){const cells=row.map(cell=>cell.trim());while(cells.length&&!cells.at(-1))cells.pop();return cells}
function parseTable(html:string,title:string,index:number,sourceUrl:string):MachineGuideTable|null{
  const raw=[...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr\s*>/gi)].map(match=>normalizedRow([...match[1].matchAll(/<(th|td)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi)].map(cell=>text(cell[2])))).filter(row=>row.some(Boolean));
  if(raw.length<2)return null;
  const headerIndex=raw.findIndex(row=>row.length>1&&new Set(row.filter(Boolean)).size>1),headers=raw[headerIndex]??[];
  if(headers.length<2)return null;
  const signature=headers.join("\u0001"),seen=new Set<string>(),rows=raw.slice(headerIndex+1).filter(row=>{const key=row.join("\u0001");if(row.length<2||key===signature||seen.has(key))return false;const populated=row.filter(Boolean);if(!populated.length||new Set(populated).size===1&&populated[0]===title)return false;seen.add(key);return true});
  if(!rows.length)return null;
  return{id:`chonborista-table-${index}`,title,headers,rows,note:null,sourceUrl,sourceName:"ちょんぼりすた",sourceUrls:[sourceUrl],sourceNames:["ちょんぼりすた"]};
}
function classifyHeading(title:string,parent:string):MachineGuideSectionKey|null{
  const combined=`${parent} ${title}`;
  if(excludedHeading.test(title))return null;
  if(/終了画面|トロフィー|示唆|獲得枚数(?:表示|表記)|プレート/.test(title))return"special_events";
  if(/設定判別|設定差|初当り確率|直撃当選率|移行率|当選率/.test(title)||/設定判別/.test(parent))return"setting_rates";
  if(/小役確率|レア役(?:確率|の停止形)|ベル出現率/.test(title))return"small_roles";
  if(/機械割|出玉率/.test(title))return"payout";
  if(/天井|リセット|朝イチ|有利区間|やめどき/.test(title))return"ceiling";
  if(/打ち方|停止形|リール配列/.test(title)||/打ち方/.test(parent))return"play";
  if(/ゲームフロー|通常時の抽選|通常時のゲーム性/.test(title))return"flow";
  if(/ボーナス|BONUS/.test(title)&&!/(?:CZ|AT|ART).*ボーナス/.test(combined))return"bonus";
  if(/CZ|チャンスゾーン|関所チャレンジ|超自然災害モード/.test(title))return"cz";
  if(/AT解析|ART解析|(?:上位|最上位)?(?:AT|ART)[「『（(]|(?:AT|ART)「/.test(title))return"at_art";
  if(/機種概要|スペック|特徴|基本仕様/.test(title)||parent==="スペック")return"features";
  return null;
}
function missing(value:string){return !value||/^(調査中|未公開|不明|—|-)$/.test(value.trim())}
function summary(key:MachineGuideSectionKey,paragraphs:string[],tables:MachineGuideTable[]){if(!paragraphs.length&&!tables.length)return null;const labels:Partial<Record<MachineGuideSectionKey,string>>={features:"補充來源提供這台的基本規格與特色。",play:"補充來源提供基本操作與打ち方參考。",flow:"補充來源提供通常時的遊戲流程。",cz:"補充來源提供 CZ 的辨認與玩法資料。",at_art:"補充來源提供 AT／ART 的辨認與玩法資料。",bonus:"補充來源提供 Bonus 玩法資料。",ceiling:"補充來源提供天井、重置或停止時機參考。",setting_rates:"補充來源提供設定差相關數值。",payout:"補充來源提供設定別出玉率。",small_roles:"補充來源提供小役機率。",special_events:"補充來源提供終了畫面或設定示唆資料。"};return labels[key]??"補充來源提供可查證的機台資料。"}

export function parseChonboristaMachineFacts(html:string,record:MachineCatalogRecord,sourceUrl:string,retrievedAt=new Date().toISOString()):ParsedMachineGuideFacts{
  const body=clean(html);if(!body)throw new Error("ちょんぼりすた頁面沒有可辨識的正文容器。");
  const headings=[...body.matchAll(/<h([2-5])\b[^>]*>([\s\S]*?)<\/h\1\s*>/gi)],grouped=new Map<MachineGuideSectionKey,{paragraphs:string[];sources:string[];tables:MachineGuideTable[]}>();
  let parent="";
  for(let index=0;index<headings.length;index++){
    const heading=headings[index],level=Number(heading[1]),title=text(heading[2]);if(level===2)parent=title;
    const key=classifyHeading(title,parent);if(!key)continue;
    const start=(heading.index??0)+heading[0].length,end=headings[index+1]?.index??body.length,chunk=body.slice(start,end);
    const paragraphs=[...chunk.matchAll(/<(?:p|li)\b[^>]*>([\s\S]*?)<\/(?:p|li)\s*>/gi)].map(item=>text(item[1])).filter(value=>value&&!missing(value)&&value.length>=8&&!/コメント|関連記事|SHARE|画像$|管理人/.test(value)).slice(0,8);
    const tables=[...chunk.matchAll(/<table\b[^>]*>[\s\S]*?<\/table\s*>/gi)].map((item,tableIndex)=>parseTable(item[0],title,index*10+tableIndex,sourceUrl)).filter((item):item is MachineGuideTable=>Boolean(item));
    const current=grouped.get(key)??{paragraphs:[],sources:[],tables:[]};current.paragraphs.push(...paragraphs);current.sources.push(...paragraphs.map(()=>sourceUrl));current.tables.push(...tables);grouped.set(key,current);
  }
  const sections=KEYS.flatMap(key=>{const value=grouped.get(key);if(!value)return[];const seenP=new Set<string>(),paragraphsJa:string[]=[],paragraphSourceUrls:string[]=[];value.paragraphs.forEach((paragraph,index)=>{const normalized=paragraph.normalize("NFKC");if(seenP.has(normalized))return;seenP.add(normalized);paragraphsJa.push(paragraph);paragraphSourceUrls.push(value.sources[index]??sourceUrl)});const seenT=new Set<string>(),tables=value.tables.filter(table=>{const sig=JSON.stringify([table.title,table.headers,table.rows]);if(seenT.has(sig))return false;seenT.add(sig);return true});if(!paragraphsJa.length&&!tables.length)return[];const meta=SECTION_META[key];return[{key,titleZh:meta.zh,titleJa:meta.ja,summaryZh:summary(key,paragraphsJa,tables),paragraphsJa,paragraphSourceUrls,tables}]});
  const available=new Set(sections.map(section=>section.key)),missingSections=KEYS.filter(key=>!available.has(key));
  const evidence=sections.flatMap(section=>[...section.paragraphsJa.map((_,index)=>({sectionKey:section.key,rawLabel:section.titleJa,extractedFrom:"paragraph" as const,sourceUrl:section.paragraphSourceUrls?.[index]??sourceUrl})),...section.tables.map(table=>({sectionKey:section.key,rawLabel:table.title,extractedFrom:"table" as const,sourceUrl:table.sourceUrl}))]);
  return{catalogId:record.id,officialNameJa:record.officialNameJa,displayNameZh:record.displayNameZh,manufacturer:record.manufacturer,catalogMachineType:record.machineType,introducedAt:record.introducedAt,sections,evidence,missingSections,sourceName:"ちょんぼりすた",sourceUrl,retrievedAt,sources:[{name:"ちょんぼりすた",url:sourceUrl,retrievedAt,role:"supplemental",status:"available"}]};
}

export class ChonboristaMachineGuideProvider{
  private request:typeof fetch;
  constructor(request:typeof fetch=fetch){this.request=request}
  supports(sourceUrl:string){try{const url=new URL(sourceUrl);return url.hostname==="chonborista.com"&&/^\/slot\/[a-z0-9-]+\/\d+\/?$/.test(url.pathname)}catch{return false}}
  async fetchFacts(record:MachineCatalogRecord,sourceUrl:string){if(!this.supports(sourceUrl))throw new Error("補充攻略來源不是可使用的機種文章 URL。");const response=await this.request(sourceUrl,{headers:{Accept:"text/html,application/xhtml+xml","User-Agent":"Slot Companion/0.2 pilot (+personal machine guide)"},cache:"no-store",signal:AbortSignal.timeout(12000)});if(!response.ok)throw new Error(`ちょんぼりすた來源回應 ${response.status}。`);const html=await response.text();if(html.length<500)throw new Error("ちょんぼりすた回傳內容不完整。");return parseChonboristaMachineFacts(html,record,sourceUrl)}
}
