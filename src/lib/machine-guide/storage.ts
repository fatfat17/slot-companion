import type { CachedMachineGuide, MachineGuide } from "@/types/machineGuide";
const PREFIX="slot-companion-machine-guide-v2:";
const LEGACY_PREFIX="slot-companion-machine-guide-v1:";
export const MACHINE_GUIDE_COMPILER_REVISION="2026-08-29-chinese-player-guide-8";
export type GuideCacheState="current"|"stale"|"missing";
export function guideCacheKey(catalogId:string){return`${PREFIX}${catalogId}`}
export function legacyGuideCacheKey(catalogId:string){return`${LEGACY_PREFIX}${catalogId}`}
function parseCurrentGuide(raw:string,catalogId:string):CachedMachineGuide|null{try{const parsed=JSON.parse(raw) as CachedMachineGuide;if(parsed.guide?.schemaVersion!==2||parsed.guide.catalogId!==catalogId||parsed.compilerRevision!==MACHINE_GUIDE_COMPILER_REVISION)return null;return parsed}catch{return null}}
export function getGuideCacheState(catalogId:string):GuideCacheState{if(typeof window==="undefined")return"missing";const raw=window.localStorage.getItem(guideCacheKey(catalogId));if(raw)return parseCurrentGuide(raw,catalogId)?"current":"stale";return window.localStorage.getItem(legacyGuideCacheKey(catalogId))!==null?"stale":"missing"}
export function loadCachedGuide(catalogId:string):CachedMachineGuide|null{if(typeof window==="undefined")return null;const raw=window.localStorage.getItem(guideCacheKey(catalogId));return raw?parseCurrentGuide(raw,catalogId):null}
export function hasLegacyGuideCache(catalogId:string){if(typeof window==="undefined")return false;return window.localStorage.getItem(legacyGuideCacheKey(catalogId))!==null}
export function saveCachedGuide(guide:MachineGuide,now=new Date().toISOString()){if(typeof window==="undefined")return false;try{window.localStorage.setItem(guideCacheKey(guide.catalogId),JSON.stringify({guide,cachedAt:now,compilerRevision:MACHINE_GUIDE_COMPILER_REVISION} satisfies CachedMachineGuide));return true}catch{return false}}
