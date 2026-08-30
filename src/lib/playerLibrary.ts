import type { Session } from "../types/index.ts";

export const PLAYER_LIBRARY_KEY="slot-companion-player-library-v1";
export type RecentCatalogView={catalogId:string;viewedAt:string};
export type PlayerLibraryState={favoriteCatalogIds:string[];recentViews:RecentCatalogView[]};
const emptyState=():PlayerLibraryState=>({favoriteCatalogIds:[],recentViews:[]});

export function loadPlayerLibrary():PlayerLibraryState{
  if(typeof window==="undefined")return emptyState();
  try{
    const parsed=JSON.parse(window.localStorage.getItem(PLAYER_LIBRARY_KEY)??"{}") as Partial<PlayerLibraryState>;
    return{favoriteCatalogIds:[...new Set(parsed.favoriteCatalogIds??[])],recentViews:(parsed.recentViews??[]).filter(item=>item?.catalogId&&item?.viewedAt).slice(0,24)};
  }catch{return emptyState()}
}

function savePlayerLibrary(state:PlayerLibraryState){
  if(typeof window==="undefined")return false;
  try{window.localStorage.setItem(PLAYER_LIBRARY_KEY,JSON.stringify(state));return true}catch{return false}
}

export function setCatalogFavorite(catalogId:string,favorite:boolean){
  const state=loadPlayerLibrary(),ids=new Set(state.favoriteCatalogIds);
  if(favorite)ids.add(catalogId);else ids.delete(catalogId);
  const next={...state,favoriteCatalogIds:[...ids]};
  savePlayerLibrary(next);
  return next;
}

export function recordCatalogView(catalogId:string,viewedAt=new Date().toISOString()){
  const state=loadPlayerLibrary(),recentViews=[{catalogId,viewedAt},...state.recentViews.filter(item=>item.catalogId!==catalogId)].slice(0,24),next={...state,recentViews};
  savePlayerLibrary(next);
  return next;
}

export function catalogIdFromSession(session:Session){
  return session.profileSnapshot?.catalogId??(session.machineId.startsWith("guide:")?session.machineId.slice(6):session.machineId);
}

export function recentPlayedCatalogIds(sessions:Session[],limit=12){
  return[...new Set([...sessions].sort((a,b)=>b.startedAt.localeCompare(a.startedAt)).map(catalogIdFromSession))].slice(0,limit);
}
