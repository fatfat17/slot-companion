import type { MachineGuide } from "@/types/machineGuide";

export const OFFLINE_PACK_CACHE="slot-companion-trip-pack-v1";
export const OFFLINE_PACK_MANIFEST_KEY="slot-companion-trip-pack-manifest-v1";
export type OfflinePackCover={catalogId:string;name:string;sourceImageUrl:string};
export type OfflinePackManifest={version?:2;catalogIds:string[];catalogNames?:Record<string,string>;preparedAt:string;guideRetrievedAt:Record<string,string>;urlCount:number;failedUrls:string[]};
export type OfflinePackStatus={manifest:OfflinePackManifest|null;cachedUrlCount:number;storageUsageBytes:number|null;storageQuotaBytes:number|null};

function offlineImageUrl(catalogId:string,displayUrl:string,sourceImageUrl:string){return displayUrl.startsWith("/")?displayUrl:`/api/machine-guide-assets/${encodeURIComponent(catalogId)}?source=${encodeURIComponent(sourceImageUrl)}`}
function coverOfflineUrl(cover:OfflinePackCover){return`/api/catalog-covers/${encodeURIComponent(cover.catalogId)}?source=${encodeURIComponent(cover.sourceImageUrl)}`}
export function guideOfflineUrls(guide:MachineGuide){return[...new Set([`/catalog/${encodeURIComponent(guide.catalogId)}`,`/guides/${encodeURIComponent(guide.catalogId)}`,...(guide.images??[]).map(image=>offlineImageUrl(guide.catalogId,image.displayUrl,image.sourceImageUrl)).filter(Boolean)])]}
export function offlinePackUrls(guides:MachineGuide[],covers:OfflinePackCover[]=[]){return[...new Set(["/","/catalog","/records","/identify","/halls","/glossary",...guides.flatMap(guideOfflineUrls),...covers.map(coverOfflineUrl)])]}

async function cacheResponseWithAssets(cache:Cache,url:string){
  const response=await fetch(url,{credentials:"same-origin"});if(!response.ok)throw new Error(`${response.status}`);await cache.put(url,response.clone());
  if(!response.headers.get("content-type")?.includes("text/html"))return[url];
  const html=await response.text(),document=new DOMParser().parseFromString(html,"text/html"),assets=[...document.querySelectorAll<HTMLScriptElement>("script[src]")].map(node=>node.src).concat([...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href],link[rel="preload"][href],link[rel="modulepreload"][href]')].map(node=>node.href)).filter(asset=>new URL(asset,location.href).origin===location.origin);
  await Promise.allSettled([...new Set(assets)].map(async asset=>{const result=await fetch(asset,{credentials:"same-origin"});if(result.ok)await cache.put(asset,result)}));
  return[url,...assets];
}

export function loadOfflinePackManifest(){
  if(typeof window==="undefined")return null;
  try{const parsed=JSON.parse(window.localStorage.getItem(OFFLINE_PACK_MANIFEST_KEY)??"null") as OfflinePackManifest|null;return parsed&&Array.isArray(parsed.catalogIds)&&typeof parsed.preparedAt==="string"?parsed:null}catch{return null}
}

export async function getOfflinePackStatus():Promise<OfflinePackStatus>{
  const manifest=loadOfflinePackManifest();
  if(typeof window==="undefined"||!("caches" in window))return{manifest,cachedUrlCount:0,storageUsageBytes:null,storageQuotaBytes:null};
  const cache=await caches.open(OFFLINE_PACK_CACHE),requests=await cache.keys(),estimate=await navigator.storage?.estimate?.();
  return{manifest,cachedUrlCount:requests.length,storageUsageBytes:estimate?.usage??null,storageQuotaBytes:estimate?.quota??null};
}

export async function deleteOfflinePack(){
  if(typeof window==="undefined")return;
  if("caches" in window)await caches.delete(OFFLINE_PACK_CACHE);
  window.localStorage.removeItem(OFFLINE_PACK_MANIFEST_KEY);
}

export async function prepareOfflinePack(guides:MachineGuide[],onProgress?:(completed:number,total:number)=>void,covers:OfflinePackCover[]=[]){
  if(typeof window==="undefined"||!("caches" in window))throw new Error("此瀏覽器不支援離線快取。");
  const relevantCovers=covers.filter(cover=>guides.some(guide=>guide.catalogId===cover.catalogId)),urls=offlinePackUrls(guides,relevantCovers),cache=await caches.open(OFFLINE_PACK_CACHE),failedUrls:string[]=[],retained=new Set<string>();let completed=0;
  for(const url of urls){try{(await cacheResponseWithAssets(cache,url)).forEach(item=>retained.add(new URL(item,location.href).toString()))}catch{failedUrls.push(url);const existing=await cache.match(url);if(existing)retained.add(new URL(url,location.href).toString())}finally{completed++;onProgress?.(completed,urls.length)}}
  for(const request of await cache.keys())if(!retained.has(new URL(request.url,location.href).toString()))await cache.delete(request);
  const manifest:OfflinePackManifest={version:2,catalogIds:guides.map(guide=>guide.catalogId),catalogNames:Object.fromEntries(relevantCovers.map(cover=>[cover.catalogId,cover.name])),preparedAt:new Date().toISOString(),guideRetrievedAt:Object.fromEntries(guides.map(guide=>[guide.catalogId,guide.retrievedAt])),urlCount:retained.size,failedUrls};
  window.localStorage.setItem(OFFLINE_PACK_MANIFEST_KEY,JSON.stringify(manifest));return manifest;
}
