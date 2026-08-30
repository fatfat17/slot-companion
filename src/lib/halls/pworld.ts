import type { HallMachineResult,HallSearchResult } from "@/types/hall";
function decode(value:string){return value.replace(/<[^>]+>/g," ").replace(/&nbsp;|&#160;/g," ").replace(/&amp;/g,"&").replace(/&quot;|&#34;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/\s+/g," ").trim()}
function absolute(href:string,base:string){try{return new URL(href,base).toString()}catch{return base}}
function hallLink(block:string){const anchor=block.match(/<a[^>]+class=["'][^"']*hallList-item-name-link[^"']*["'][^>]*href=(?:["']([^"']+)["']|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/i)??block.match(/<a[^>]+href=(?:["']([^"']+)["']|([^\s>]+))[^>]*class=["'][^"']*hallList-item-name-link[^"']*["'][^>]*>([\s\S]*?)<\/a>/i);return anchor?{href:anchor[1]??anchor[2],name:anchor[3]}:null}
export function parsePWorldHallList(html:string,sourceUrl:string):HallSearchResult[]{
  const results:HallSearchResult[]=[];
  const itemPattern=/<[^>]+class=["'][^"']*hallList-item(?!-)[^"']*["'][^>]*>([\s\S]*?)(?=<[^>]+class=["'][^"']*hallList-item(?!-)[^"']*["']|<\/main>|$)/gi;
  for(const match of html.matchAll(itemPattern)){
    const block=match[1],link=hallLink(block);
    if(!link)continue;
    const address=decode((block.match(/<p[^>]+class=["'][^"']*hallList-item-address[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)?.[1]??"").replace(/<a[\s\S]*?<\/a>/gi,""));
    const nearby=block.match(/<a[^>]+class=["'][^"']*hallList-item-nearhall[^"']*["'][^>]+href=["']([^"']+)["']/i)?.[1]??null;
    const slotRates=[...block.matchAll(/<[^>]+data-type=["']s["'][^>]*>([\s\S]*?)<\//gi)].map(item=>decode(item[1])).filter(Boolean);
    const updated=decode(block.match(/<p[^>]+class=["'][^"']*hallList-item-header-update[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)?.[1]??"")||null;
    results.push({name:decode(link.name),address,pworldUrl:absolute(link.href,sourceUrl),nearbyUrl:nearby?absolute(nearby,sourceUrl):null,slotRates:[...new Set(slotRates)],updatedLabel:updated});
  }
  return results.filter((item,index,array)=>array.findIndex(other=>other.pworldUrl===item.pworldUrl)===index);
}
export function buildPWorldHallSearchUrl(area:string,query:string,machineName:string){const path=area&&area!=="all"?`/${area}/halls`:"/halls",url=new URL(path,"https://www.p-world.co.jp");if(query.trim())url.searchParams.set("hall_name_address",query.trim());if(machineName.trim())url.searchParams.set("machine_name",machineName.trim());return url}
export function parsePWorldHallMachines(html:string,sourceUrl:string):HallMachineResult[]{const results:HallMachineResult[]=[];for(const match of html.matchAll(/<li[^>]+class=["'][^"']*js-hallKisyuList-item[^"']*["'][^>]+data-machine-type=["']S["'][^>]*>([\s\S]*?)<\/li>/gi)){const opening=match[0].slice(0,match[0].indexOf(">")+1),body=match[1],id=opening.match(/data-machine-id=["'](\d+)["']/i)?.[1]??null,link=body.match(/<p[^>]+class=["'][^"']*_pw-machine-item-machineName[^"']*["'][^>]*>[\s\S]*?<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i),name=decode(link?.[2]??"");if(!name)continue;results.push({name,pworldMachineId:id,pworldUrl:absolute(link?.[1]??(id?`/machine/database/${id}`:""),sourceUrl),catalogId:null,catalogName:null})}return results.filter((item,index,array)=>array.findIndex(other=>(item.pworldMachineId&&other.pworldMachineId===item.pworldMachineId)||other.name===item.name)===index)}
