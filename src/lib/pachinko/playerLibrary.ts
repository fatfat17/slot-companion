import type {PachinkoSession} from "@/types/pachinko";

export const PACHINKO_PLAYER_LIBRARY_KEY="slot-companion-pachinko-player-library-v1";
type RecentPachinkoView={catalogId:string;viewedAt:string};
export type PachinkoPlayerLibraryState={favoriteCatalogIds:string[];recentViews:RecentPachinkoView[]};
const emptyState=():PachinkoPlayerLibraryState=>({favoriteCatalogIds:[],recentViews:[]});

export function loadPachinkoPlayerLibrary():PachinkoPlayerLibraryState{
  if(typeof window==="undefined")return emptyState();
  try{const parsed=JSON.parse(window.localStorage.getItem(PACHINKO_PLAYER_LIBRARY_KEY)??"{}")as Partial<PachinkoPlayerLibraryState>;return{favoriteCatalogIds:[...new Set(parsed.favoriteCatalogIds??[])],recentViews:(parsed.recentViews??[]).filter(item=>item?.catalogId&&item?.viewedAt).slice(0,24)}}catch{return emptyState()}
}
function save(state:PachinkoPlayerLibraryState){if(typeof window==="undefined")return false;try{window.localStorage.setItem(PACHINKO_PLAYER_LIBRARY_KEY,JSON.stringify(state));return true}catch{return false}}
export function setPachinkoCatalogFavorite(catalogId:string,favorite:boolean){const state=loadPachinkoPlayerLibrary(),ids=new Set(state.favoriteCatalogIds);if(favorite)ids.add(catalogId);else ids.delete(catalogId);const next={...state,favoriteCatalogIds:[...ids]};save(next);return next}
export function recordPachinkoCatalogView(catalogId:string,viewedAt=new Date().toISOString()){const state=loadPachinkoPlayerLibrary(),next={...state,recentViews:[{catalogId,viewedAt},...state.recentViews.filter(item=>item.catalogId!==catalogId)].slice(0,24)};save(next);return next}
export function recentPlayedPachinkoCatalogIds(sessions:PachinkoSession[],limit=12){return[...new Set([...sessions].sort((a,b)=>b.startedAt.localeCompare(a.startedAt)).map(item=>item.catalogId))].slice(0,limit)}
