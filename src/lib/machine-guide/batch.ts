export const GUIDE_BATCH_PROGRESS_KEY="slot-companion-guide-batch-v1";
export type GuideBatchTarget="favorites"|"recent";
export type GuideBatchProgress={target:GuideBatchTarget;catalogIds:string[];completedIds:string[];failed:Array<{catalogId:string;message:string}>;status:"running"|"paused"|"complete";updatedAt:string};

export function createGuideBatchProgress(target:GuideBatchTarget,catalogIds:string[],now=new Date().toISOString()):GuideBatchProgress{return{target,catalogIds:[...new Set(catalogIds)],completedIds:[],failed:[],status:"paused",updatedAt:now}}
export function remainingGuideBatchIds(progress:GuideBatchProgress){const done=new Set(progress.completedIds);return progress.catalogIds.filter(id=>!done.has(id))}
export function loadGuideBatchProgress():GuideBatchProgress|null{if(typeof window==="undefined")return null;try{const value=JSON.parse(window.localStorage.getItem(GUIDE_BATCH_PROGRESS_KEY)??"null") as GuideBatchProgress|null;return value?.catalogIds&&Array.isArray(value.completedIds)&&Array.isArray(value.failed)?value:null}catch{return null}}
export function saveGuideBatchProgress(progress:GuideBatchProgress){if(typeof window==="undefined")return false;try{window.localStorage.setItem(GUIDE_BATCH_PROGRESS_KEY,JSON.stringify(progress));return true}catch{return false}}

export async function runGuideRefreshBatch(progress:GuideBatchProgress,refresh:(catalogId:string)=>Promise<unknown>,onProgress?:(progress:GuideBatchProgress)=>void,now=()=>new Date().toISOString()){
  let current:GuideBatchProgress={...progress,status:"running",updatedAt:now()};onProgress?.(current);
  for(const catalogId of remainingGuideBatchIds(current)){
    current={...current,failed:current.failed.filter(item=>item.catalogId!==catalogId)};
    try{await refresh(catalogId);current={...current,completedIds:[...current.completedIds,catalogId],updatedAt:now()}}
    catch(error){current={...current,failed:[...current.failed,{catalogId,message:error instanceof Error?error.message:"指南更新失敗"}],updatedAt:now()}}
    onProgress?.(current);
  }
  current={...current,status:current.failed.length?"paused":"complete",updatedAt:now()};onProgress?.(current);return current;
}
