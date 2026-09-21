import type {PachinkoCatalogRecord,PachinkoFullGuide,PachinkoFullGuideSection,PachinkoGuide,PachinkoGuideFact} from "../../types/pachinko.ts";
import type {MachineGuideImage,MachineGuideSectionKey,MachineGuideTable} from "../../types/machineGuide.ts";
import {canonicalPWorldImageUrl,visualGuideAssetId,visualGuideAssetUrl} from "../machine-guide/visualGuide.ts";
import {classifyPachinkoType} from "./catalog.ts";

const entities:Record<string,string>={amp:"&",quot:'"',apos:"'",lt:"<",gt:">",nbsp:" "};
function decode(value:string){return value.replace(/&#(\d+);/g,(_,code)=>String.fromCodePoint(Number(code))).replace(/&#x([0-9a-f]+);/gi,(_,code)=>String.fromCodePoint(Number.parseInt(code,16))).replace(/&([a-z]+);/gi,(match,key)=>entities[key]??match)}
function text(value:string){return decode(value.replace(/<br\s*\/?\s*>/gi," ").replace(/<[^>]+>/g," ")).replace(/\s+/g," ").trim()}
function field(body:string,className:string){return text(body.match(new RegExp(`<[^>]+class=["'][^"']*${className}[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`))?.[1]??"")}

export function parsePWorldPachinkoCalendar(html:string,sourceUrl:string,retrievedAt:string):PachinkoCatalogRecord[]{
  const records:PachinkoCatalogRecord[]=[];
  const blocks=[...html.matchAll(/<div class="machineList js-machineList"[^>]*data-yyyymmdd="(\d{8})"[^>]*>([\s\S]*?)(?=<div class="machineList js-machineList"|<h2 class="pageTitle">|$)/g)];
  for(const block of blocks){
    const date=block[1],list=block[2].match(/<ul class="machineList-grid machineList-grid--pachi">([\s\S]*?)<\/ul>/)?.[1]??"";
    for(const item of list.matchAll(/<li class="machineList-item">([\s\S]*?)<\/li>/g)){
      const body=item[1],officialNameJa=field(body,"machineList-item-title"),manufacturer=field(body,"machineList-item-maker"),href=body.match(/machineList-item-title[^>]*>[\s\S]*?<a href="([^"]+)"/)?.[1]??"",image=body.match(/machineList-item-thumb[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["']/)?.[1],source=new URL(href||sourceUrl,sourceUrl).toString(),id=href.match(/\/machine\/database\/(\d+)/)?.[1];
      if(!officialNameJa||!id)continue;
      records.push({id:`pachi-${id}`,officialNameJa,displayNameZh:"",manufacturer:manufacturer||"不明",seriesName:"",aliases:[],machineType:classifyPachinkoType(officialNameJa),tags:[],introducedAt:`${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`,sourceName:"P-WORLD",sourceUrl:source,sourceImageUrl:image?new URL(image,sourceUrl).toString():undefined,retrievedAt,catalogStatus:"imported"});
    }
  }
  return records;
}

const factLabels:Array<[RegExp,string,string]>=[
  [/大当り確率/,"大當機率","大当り確率"],[/RUSH.*突入|突入率/,"RUSH 突入","RUSH突入率"],[/RUSH.*継続|継続率/,"RUSH 延續","RUSH継続率"],[/ST回数/,"ST 回數","ST回数"],[/時短回数|電サポ回数/,"時短回數","時短回数"],[/賞球数/,"賞球數","賞球数"],[/大当り出玉/,"大當出玉","大当り出玉"]
];
export function parsePWorldPachinkoGuide(html:string,record:PachinkoCatalogRecord,retrievedAt:string):PachinkoGuide{
  const rows=[...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(match=>[...match[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(cell=>text(cell[1])).filter(Boolean)).filter(row=>row.length>1);
  const facts:PachinkoGuideFact[]=[];
  for(const[labelPattern,labelZh,labelJa]of factLabels){const row=rows.find(candidate=>labelPattern.test(candidate.join(" ")));if(row){const value=row.join(" · ").replace(labelPattern,"").replace(/^\s*[·:：]?\s*/,"").trim();if(value&&!facts.some(item=>item.labelZh===labelZh))facts.push({labelZh,labelJa,value:value.slice(0,180)})}}
  const bottomProbability=text(html.match(/<table class="typeName">[\s\S]*?大当り確率：[\s\S]*?<td>([\s\S]*?)<\/td>/i)?.[1]??"");
  if(bottomProbability&&!facts.some(item=>item.labelZh==="大當機率"))facts.unshift({labelZh:"大當機率",labelJa:"大当り確率",value:bottomProbability});
  const tags=[...html.matchAll(/class="kisyuTag-pachiType"[^>]*>([\s\S]*?)<\/span>/g)].map(match=>text(match[1]));
  const flow:string[]=[];if(tags.includes("LT"))flow.push("本機搭載 Lucky Trigger；進入條件與狀態請以來源頁規格為準。");if(/RUSH/.test(html))flow.push("通常遊技中大當後，依機台規格判定是否進入 RUSH。");if(/右打/.test(html))flow.push("進入右打狀態時依機台畫面指示操作，結束後回到通常遊技。");
  return{catalogId:record.id,status:facts.length>=2?"usable":"partial",facts,gameFlow:flow,playNotes:["機率與出玉為公開規格摘要，不代表本次遊玩結果。","實際操作請優先遵照機台畫面的左打／右打指示。"],sourceName:"P-WORLD",sourceUrl:record.sourceUrl,retrievedAt};
}

const pachinkoSectionOrder:MachineGuideSectionKey[]=["features","flow","bonus","at_art","play","special_events","payout"];
function pachinkoSectionKey(title:string):MachineGuideSectionKey|null{
  if(/基本スペック|情報ワンポイント|台紹介/.test(title))return"features";
  if(/ゲームフロー|解説動画/.test(title))return"flow";
  if(/大当り割合|大当り中/.test(title))return"bonus";
  if(/RUSH|ST|時短|右打ち中/.test(title))return"at_art";
  if(/打ち方|遊技方法/.test(title))return"play";
  if(/ボーダーライン|試行回数/.test(title))return"payout";
  if(/演出|予告|リーチ|モード概要/.test(title))return"special_events";
  return null;
}
const pachinkoSectionTitles:Record<string,string>={features:"基本規格",flow:"遊戲流程",bonus:"大當分配",at_art:"RUSH／ST／LT",play:"基本打法",special_events:"演出參考",payout:"交換率與回轉參考"};
function parseGuideTable(value:string,title:string,index:number,sourceUrl:string):MachineGuideTable|null{
  const rows=[...value.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(row=>[...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(cell=>text(cell[1])).filter(Boolean)).filter(row=>row.length);
  if(rows.length<2)return null;
  const width=Math.max(...rows.map(row=>row.length)),headers=rows[0].length===width?rows[0]:Array.from({length:width},(_,at)=>at===0?"項目":`資料 ${at}`),body=rows[0]===headers?rows.slice(1):rows;
  return{id:`pachi-table-${index}`,title,headers,rows:body.map(row=>Array.from({length:width},(_,at)=>row[at]??"")),note:null,sourceUrl,sourceName:"P-WORLD"};
}
function imageCaption(key:MachineGuideSectionKey,altJa:string){const fallback:Record<string,string>={features:"機台基本特色",flow:"遊戲流程圖解",bonus:"大當分配圖解",at_art:"RUSH／ST／LT 圖解",play:"基本打法圖解",special_events:"演出畫面參考",payout:"交換率與回轉參考"};return text(altJa).replace(/^e?\s*甲鉄城[^ ]*\s*/i,"").slice(0,80)||fallback[key]||"機台畫面參考"}
function guideImages(chunk:string,key:MachineGuideSectionKey,record:PachinkoCatalogRecord):MachineGuideImage[]{const results:MachineGuideImage[]=[];for(const match of chunk.matchAll(/<img\b([^>]+)>/gi)){const attrs=match[1],raw=attrs.match(/(?:data-original|data-src|src)=["']([^"']+)["']/i)?.[1],sourceImageUrl=raw?canonicalPWorldImageUrl(raw,record.sourceUrl):null;if(!sourceImageUrl)continue;const altJa=decode(attrs.match(/alt=["']([^"']*)["']/i)?.[1]??""),width=Number(attrs.match(/width=["']?(\d+)/i)?.[1])||null,height=Number(attrs.match(/height=["']?(\d+)/i)?.[1])||null;if(width&&width<240||height&&height<120)continue;const id=visualGuideAssetId(sourceImageUrl);results.push({id,sectionKey:key,altJa,captionZh:imageCaption(key,altJa),sourcePageUrl:record.sourceUrl,sourceImageUrl,displayUrl:visualGuideAssetUrl(record.id,sourceImageUrl),width,height,byteSize:null,contentType:null,storageStatus:"source"})}return results}
export function parsePWorldPachinkoFullGuide(html:string,record:PachinkoCatalogRecord,retrievedAt=new Date().toISOString()):PachinkoFullGuide{
  const cutoff=html.search(/<h2[^>]*>\s*(?:<[^>]+>)*\s*掲示板/i),body=cutoff>0?html.slice(0,cutoff):html,headings=[...body.matchAll(/<h([3-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi)],grouped=new Map<MachineGuideSectionKey,{titles:string[];paragraphs:string[];tables:MachineGuideTable[];images:MachineGuideImage[]}>();
  for(let index=0;index<headings.length;index++){const title=text(headings[index][2]),key=pachinkoSectionKey(title);if(!key)continue;const start=(headings[index].index??0)+headings[index][0].length,end=headings[index+1]?.index??body.length,chunk=body.slice(start,end),paragraphs=[...chunk.matchAll(/<(?:p|div)\b[^>]*(?:class=["'][^"']*articleBox-content[^"']*["'])?[^>]*>([\s\S]*?)<\/(?:p|div)>/gi)].map(item=>text(item[1])).filter(value=>value.length>10&&!/閉じる|設置店|関連記事|ランキング/.test(value)).slice(0,8),tables=[...chunk.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)].map((item,at)=>parseGuideTable(item[0],title,index*20+at,record.sourceUrl)).filter((item):item is MachineGuideTable=>Boolean(item)),current=grouped.get(key)??{titles:[],paragraphs:[],tables:[],images:[]};current.titles.push(title);current.paragraphs.push(...paragraphs);current.tables.push(...tables);current.images.push(...guideImages(chunk,key,record));grouped.set(key,current)}
  const sections:PachinkoFullGuideSection[]=pachinkoSectionOrder.flatMap(key=>{const item=grouped.get(key);if(!item||!item.paragraphs.length&&!item.tables.length&&!item.images.length)return[];return[{key,titleZh:pachinkoSectionTitles[key],titleJa:[...new Set(item.titles)].join("／"),summaryZh:"",paragraphsJa:[...new Set(item.paragraphs)].slice(0,10),tables:item.tables.slice(0,6)}]});
  const images=[...new Map(sections.flatMap(section=>grouped.get(section.key)?.images??[]).map(image=>[image.sourceImageUrl,image])).values()].slice(0,18),missingSections=pachinkoSectionOrder.filter(key=>!sections.some(section=>section.key===key));
  return{schemaVersion:1,catalogId:record.id,officialNameJa:record.officialNameJa,displayNameZh:record.displayNameZh,manufacturer:record.manufacturer,status:sections.length>=3?"usable":"partial",sections,images,playerGuideZh:{generator:"rules",overview:"已取得公開規格，正在整理繁體中文玩家指南。",goals:[],sections:[],generatedAt:retrievedAt},sourceName:"P-WORLD",sourceUrl:record.sourceUrl,retrievedAt,missingSections,sourceWarnings:[]};
}
