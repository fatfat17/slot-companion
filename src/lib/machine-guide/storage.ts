import type { CachedMachineGuide, MachineGuide } from "@/types/machineGuide";
const PREFIX="slot-companion-machine-guide-v2:";
const LEGACY_PREFIX="slot-companion-machine-guide-v1:";
export function guideCacheKey(catalogId:string){return`${PREFIX}${catalogId}`}
export function legacyGuideCacheKey(catalogId:string){return`${LEGACY_PREFIX}${catalogId}`}
export function loadCachedGuide(catalogId:string):CachedMachineGuide|null{if(typeof window==="undefined")return null;try{const raw=window.localStorage.getItem(guideCacheKey(catalogId));if(!raw)return null;const parsed=JSON.parse(raw) as CachedMachineGuide;if(parsed.guide?.schemaVersion!==2||parsed.guide.catalogId!==catalogId)return null;return parsed}catch{return null}}
export function hasLegacyGuideCache(catalogId:string){if(typeof window==="undefined")return false;return window.localStorage.getItem(legacyGuideCacheKey(catalogId))!==null}
export function saveCachedGuide(guide:MachineGuide,now=new Date().toISOString()){if(typeof window==="undefined")return false;try{window.localStorage.setItem(guideCacheKey(guide.catalogId),JSON.stringify({guide,cachedAt:now} satisfies CachedMachineGuide));return true}catch{return false}}
