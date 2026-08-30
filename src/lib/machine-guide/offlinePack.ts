import type { MachineGuide } from "@/types/machineGuide";

export const OFFLINE_PACK_CACHE="slot-companion-trip-pack-v1";
export const OFFLINE_PACK_MANIFEST_KEY="slot-companion-trip-pack-manifest-v1";
export type OfflinePackManifest={catalogIds:string[];preparedAt:string;guideRetrievedAt:Record<string,string>;urlCount:number;failedUrls:string[]};

function offlineImageUrl(catalogId:string,displayUrl:string,sourceImageUrl:string){return displayUrl.startsWith("/")?displayUrl:`/api/machine-guide-assets/${encodeURIComponent(catalogId)}?source=${encodeURIComponent(sourceImageUrl)}`}
export function guideOfflineUrls(guide:MachineGuide){return[...new Set([`/catalog/${encodeURIComponent(guide.catalogId)}`,`/guides/${encodeURIComponent(guide.catalogId)}`,...(guide.images??[]).map(image=>offlineImageUrl(guide.catalogId,image.displayUrl,image.sourceImageUrl)).filter(Boolean)])]}
export function offlinePackUrls(guides:MachineGuide[]){return[...new Set(["/","/catalog","/records","/identify","/hunter","/glossary",...guides.flatMap(guideOfflineUrls)])]}

async function cacheResponseWithAssets(cache:Cache,url:string){
  const response=await fetch(url,{credentials:"same-origin"});if(!response.ok)throw new Error(`${response.status}`);await cache.put(url,response.clone());
  if(!response.headers.get("content-type")?.includes("text/html"))return;
  const html=await response.text(),document=new DOMParser().parseFromString(html,"text/html"),assets=[...document.querySelectorAll<HTMLScriptElement>("script[src]")].map(node=>node.src).concat([...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href],link[rel="preload"][href],link[rel="modulepreload"][href]')].map(node=>node.href)).filter(asset=>new URL(asset,location.href).origin===location.origin);
  await Promise.allSettled([...new Set(assets)].map(async asset=>{const result=await fetch(asset,{credentials:"same-origin"});if(result.ok)await cache.put(asset,result)}));
}

export async function prepareOfflinePack(guides:MachineGuide[],onProgress?:(completed:number,total:number)=>void){
  if(typeof window==="undefined"||!("caches" in window))throw new Error("此瀏覽器不支援離線快取。");
  const urls=offlinePackUrls(guides),cache=await caches.open(OFFLINE_PACK_CACHE),failedUrls:string[]=[];let completed=0;
  for(const url of urls){try{await cacheResponseWithAssets(cache,url)}catch{failedUrls.push(url)}finally{completed++;onProgress?.(completed,urls.length)}}
  const manifest:OfflinePackManifest={catalogIds:guides.map(guide=>guide.catalogId),preparedAt:new Date().toISOString(),guideRetrievedAt:Object.fromEntries(guides.map(guide=>[guide.catalogId,guide.retrievedAt])),urlCount:urls.length,failedUrls};
  window.localStorage.setItem(OFFLINE_PACK_MANIFEST_KEY,JSON.stringify(manifest));return manifest;
}
