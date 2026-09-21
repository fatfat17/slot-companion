import type {PachinkoCatalogRecord,PachinkoGuide,PachinkoGuideFact} from "@/types/pachinko";
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
