import type { CachedMachineGuide, MachineGuide } from "@/types/machineGuide";

const PREFIX="slot-companion-machine-guide-v2:";
const LEGACY_PREFIX="slot-companion-machine-guide-v1:";
const MARKER_PREFIX="slot-companion-machine-guide-index-v1:";
const DB_NAME="slot-companion-machine-guides";
const STORE_NAME="guides";
export const MACHINE_GUIDE_COMPILER_REVISION="2026-08-30-estimator-observation-coverage-16";
export type GuideCacheState="current"|"stale"|"missing";

export function guideCacheKey(catalogId:string){return`${PREFIX}${catalogId}`}
export function legacyGuideCacheKey(catalogId:string){return`${LEGACY_PREFIX}${catalogId}`}
function markerKey(catalogId:string){return`${MARKER_PREFIX}${catalogId}`}
function parseCurrentGuide(raw:string,catalogId:string):CachedMachineGuide|null{try{const parsed=JSON.parse(raw) as CachedMachineGuide;if(parsed.guide?.schemaVersion!==2||parsed.guide.catalogId!==catalogId||parsed.compilerRevision!==MACHINE_GUIDE_COMPILER_REVISION)return null;return parsed}catch{return null}}
function markerState(catalogId:string):GuideCacheState{try{const raw=window.localStorage.getItem(markerKey(catalogId));if(!raw)return"missing";const marker=JSON.parse(raw) as{compilerRevision?:unknown};return marker.compilerRevision===MACHINE_GUIDE_COMPILER_REVISION?"current":"stale"}catch{return"stale"}}
function writeMarker(catalogId:string,raw:string){try{const parsed=JSON.parse(raw) as CachedMachineGuide;window.localStorage.setItem(markerKey(catalogId),JSON.stringify({compilerRevision:parsed.compilerRevision,cachedAt:parsed.cachedAt}))}catch{/* Invalid archived caches remain preserved in IndexedDB. */}}

function openGuideDatabase():Promise<IDBDatabase|null>{
  if(typeof window==="undefined"||!window.indexedDB)return Promise.resolve(null);
  return new Promise(resolve=>{
    const request=window.indexedDB.open(DB_NAME,1);
    request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE_NAME))db.createObjectStore(STORE_NAME)};
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>resolve(null);
    request.onblocked=()=>resolve(null);
  });
}
function putRaw(db:IDBDatabase,catalogId:string,raw:string):Promise<boolean>{return new Promise(resolve=>{try{const transaction=db.transaction(STORE_NAME,"readwrite"),request=transaction.objectStore(STORE_NAME).put(raw,catalogId);request.onerror=()=>resolve(false);transaction.oncomplete=()=>resolve(true);transaction.onerror=()=>resolve(false);transaction.onabort=()=>resolve(false)}catch{resolve(false)}})}
function getRaw(db:IDBDatabase,catalogId:string):Promise<string|null>{return new Promise(resolve=>{try{const request=db.transaction(STORE_NAME,"readonly").objectStore(STORE_NAME).get(catalogId);request.onsuccess=()=>resolve(typeof request.result==="string"?request.result:null);request.onerror=()=>resolve(null)}catch{resolve(null)}})}
async function migrateLocalGuideCaches(db:IDBDatabase){
  const keys:string[]=[];
  for(let index=0;index<window.localStorage.length;index++){const key=window.localStorage.key(index);if(key?.startsWith(PREFIX))keys.push(key)}
  for(const key of keys){const raw=window.localStorage.getItem(key);if(!raw)continue;const catalogId=key.slice(PREFIX.length);if(catalogId&&await putRaw(db,catalogId,raw)){window.localStorage.removeItem(key);writeMarker(catalogId,raw)}}
}

export function getGuideCacheState(catalogId:string):GuideCacheState{if(typeof window==="undefined")return"missing";const raw=window.localStorage.getItem(guideCacheKey(catalogId));if(raw)return parseCurrentGuide(raw,catalogId)?"current":"stale";const indexed=markerState(catalogId);if(indexed!=="missing")return indexed;return window.localStorage.getItem(legacyGuideCacheKey(catalogId))!==null?"stale":"missing"}
export function loadCachedGuide(catalogId:string):CachedMachineGuide|null{if(typeof window==="undefined")return null;const raw=window.localStorage.getItem(guideCacheKey(catalogId));return raw?parseCurrentGuide(raw,catalogId):null}
export async function loadCachedGuideAsync(catalogId:string):Promise<CachedMachineGuide|null>{const local=loadCachedGuide(catalogId);if(local)return local;const db=await openGuideDatabase();if(!db)return null;try{await migrateLocalGuideCaches(db);const raw=await getRaw(db,catalogId);return raw?parseCurrentGuide(raw,catalogId):null}finally{db.close()}}
export async function getGuideCacheStateAsync(catalogId:string):Promise<GuideCacheState>{
  const localState=getGuideCacheState(catalogId);if(localState!=="missing")return localState;
  const db=await openGuideDatabase();if(!db)return"missing";
  try{await migrateLocalGuideCaches(db);const raw=await getRaw(db,catalogId);return raw?(parseCurrentGuide(raw,catalogId)?"current":"stale"):"missing"}finally{db.close()}
}
export async function getGuideCacheStatesAsync(catalogIds:string[]):Promise<Record<string,GuideCacheState>>{
  if(typeof window==="undefined")return Object.fromEntries(catalogIds.map(id=>[id,"missing"]));
  const db=await openGuideDatabase();if(!db)return Object.fromEntries(catalogIds.map(id=>[id,getGuideCacheState(id)]));
  try{await migrateLocalGuideCaches(db);const entries:ReadonlyArray<readonly[string,GuideCacheState]>=await Promise.all(catalogIds.map(async id=>{const raw=await getRaw(db,id);return[id,raw?(parseCurrentGuide(raw,id)?"current":"stale"):getGuideCacheState(id)] as const}));return Object.fromEntries(entries)}finally{db.close()}
}
export function hasLegacyGuideCache(catalogId:string){if(typeof window==="undefined")return false;return window.localStorage.getItem(legacyGuideCacheKey(catalogId))!==null}
export function saveCachedGuide(guide:MachineGuide,now=new Date().toISOString()){if(typeof window==="undefined")return false;try{window.localStorage.setItem(guideCacheKey(guide.catalogId),JSON.stringify({guide,cachedAt:now,compilerRevision:MACHINE_GUIDE_COMPILER_REVISION} satisfies CachedMachineGuide));return true}catch{return false}}
export async function saveCachedGuideAsync(guide:MachineGuide,now=new Date().toISOString()){
  if(typeof window==="undefined")return false;
  const raw=JSON.stringify({guide,cachedAt:now,compilerRevision:MACHINE_GUIDE_COMPILER_REVISION} satisfies CachedMachineGuide),db=await openGuideDatabase();
  if(db)try{await migrateLocalGuideCaches(db);if(await putRaw(db,guide.catalogId,raw)){window.localStorage.removeItem(guideCacheKey(guide.catalogId));writeMarker(guide.catalogId,raw);return true}}finally{db.close()}
  return saveCachedGuide(guide,now);
}
