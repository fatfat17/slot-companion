"use client";
import { useEffect,useState } from "react";
import type { MachineCatalogRecord } from "@/types/catalog";
import { createGuideBatchProgress,loadGuideBatchProgress,remainingGuideBatchIds,runGuideRefreshBatch,saveGuideBatchProgress,type GuideBatchProgress,type GuideBatchTarget } from "@/lib/machine-guide/batch";
import { refreshCachedMachineGuide } from "@/lib/machine-guide/refresh";
import { loadCachedGuidesAsync } from "@/lib/machine-guide/storage";
import { deleteOfflinePack,getOfflinePackStatus,loadOfflinePackManifest,prepareOfflinePack,type OfflinePackManifest,type OfflinePackStatus } from "@/lib/machine-guide/offlinePack";

export function CatalogGuideTools({records,favoriteIds,recentIds,onGuidesChanged}:{records:MachineCatalogRecord[];favoriteIds:string[];recentIds:string[];onGuidesChanged:()=>void}){
  const[target,setTarget]=useState<GuideBatchTarget>("favorites"),[progress,setProgress]=useState<GuideBatchProgress|null>(null),[offlineProgress,setOfflineProgress]=useState<{completed:number;total:number}|null>(null),[manifest,setManifest]=useState<OfflinePackManifest|null>(null),[offlineStatus,setOfflineStatus]=useState<OfflinePackStatus|null>(null),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
  useEffect(()=>{setProgress(loadGuideBatchProgress());setManifest(loadOfflinePackManifest());getOfflinePackStatus().then(setOfflineStatus)},[]);
  const recordIds=new Set(records.map(record=>record.id)),ids=[...new Set((target==="favorites"?favoriteIds:recentIds).filter(id=>recordIds.has(id)))],unfinished=progress&&progress.status!=="complete"?remainingGuideBatchIds(progress).length:0;
  async function updateGuides(base?:GuideBatchProgress){
    const selectedIds=base?.catalogIds??ids,selectedTarget=base?.target??target;
    if(!selectedIds.length){setMessage(selectedTarget==="favorites"?"請先收藏至少一台機種。":"目前沒有最近查看或遊玩的機種。");return null}
    setBusy(true);setMessage("");const initial=base??createGuideBatchProgress(selectedTarget,selectedIds);
    const result=await runGuideRefreshBatch(initial,refreshCachedMachineGuide,next=>{setProgress(next);saveGuideBatchProgress(next)});onGuidesChanged();setBusy(false);
    setMessage(result.failed.length?`已更新 ${result.completedIds.length} 台，${result.failed.length} 台來源暫時失敗；原有指南仍保留。`:`已更新 ${result.completedIds.length} 台機台指南。`);return result;
  }
  async function prepareTrip(){
    if(!ids.length){setMessage("請先收藏或最近查看至少一台機種。");return}
    setBusy(true);setMessage("");
    try{
      const initial=createGuideBatchProgress(target,ids),result=await runGuideRefreshBatch(initial,refreshCachedMachineGuide,next=>{setProgress(next);saveGuideBatchProgress(next)}),cached=await loadCachedGuidesAsync(ids),guides=ids.map(id=>cached[id]?.guide).filter((guide):guide is NonNullable<typeof guide>=>Boolean(guide));
      if(!guides.length)throw new Error("目前沒有可保存的有效指南。");
      const covers=records.filter(record=>ids.includes(record.id)&&record.sourceImageUrl).map(record=>({catalogId:record.id,name:record.displayNameZh||record.officialNameJa,sourceImageUrl:record.sourceImageUrl!}));
      const next=await prepareOfflinePack(guides,(completed,total)=>setOfflineProgress({completed,total}),covers);setManifest(next);setOfflineStatus(await getOfflinePackStatus());onGuidesChanged();
      setMessage(`${guides.length} 台指南已準備離線使用${result.failed.length?`；${result.failed.length} 台更新失敗，已保留並使用原快取`:""}。`);
    }catch(error){setMessage(error instanceof Error?error.message:"離線包準備失敗。")}finally{setBusy(false);setOfflineProgress(null)}
  }
  async function removeTrip(){
    if(!window.confirm("只刪除這台裝置的旅行離線包？Session、收藏與已建立指南都會保留。"))return;
    await deleteOfflinePack();setManifest(null);setOfflineStatus(await getOfflinePackStatus());setMessage("旅行離線包已刪除；Session、收藏與指南未受影響。");
  }
  const usage=offlineStatus?.storageUsageBytes!=null?formatBytes(offlineStatus.storageUsageBytes):"無法估算",quota=offlineStatus?.storageQuotaBytes!=null?formatBytes(offlineStatus.storageQuotaBytes):null;
  return <section className="catalog-guide-tools card"><div><span>TRIP READY</span><strong>指南更新與旅行離線包</strong><small>只處理收藏或最近機台；Guide、封面、頁面與指南圖片會保存在這台裝置。</small></div><div className="catalog-guide-target"><button className={target==="favorites"?"active":""} onClick={()=>setTarget("favorites")}>收藏 {favoriteIds.length}</button><button className={target==="recent"?"active":""} onClick={()=>setTarget("recent")}>最近 {recentIds.length}</button></div><div className="catalog-guide-actions"><button className="secondary-button" disabled={busy||!ids.length} onClick={()=>updateGuides()}>{busy?"處理中…":`更新 ${ids.length} 台指南`}</button><button className="primary-button" disabled={busy||!ids.length} onClick={prepareTrip}>{manifest?"更新旅行離線包":"準備旅行離線包"}</button></div>{unfinished?<button className="catalog-guide-resume" disabled={busy} onClick={()=>updateGuides(progress!)}>繼續上次更新 · 尚餘 {unfinished} 台</button>:null}{progress&&busy?<p className="catalog-guide-progress">指南：{progress.completedIds.length+progress.failed.length} / {progress.catalogIds.length} · 成功 {progress.completedIds.length} · 失敗 {progress.failed.length}</p>:null}{offlineProgress?<p className="catalog-guide-progress">離線內容：{offlineProgress.completed} / {offlineProgress.total}</p>:null}{message?<p className="catalog-guide-message" role="status">{message}</p>:null}{manifest?<details className="offline-pack-manager"><summary>已保存 {manifest.catalogIds.length} 台 · 管理離線包</summary><div className="offline-pack-summary"><div><b>{manifest.catalogIds.length}</b><small>機台</small></div><div><b>{offlineStatus?.cachedUrlCount??manifest.urlCount}</b><small>離線項目</small></div><div><b>{usage}</b><small>{quota?`網站資料／上限 ${quota}`:"目前網站資料"}</small></div></div>{manifest.catalogNames?<p>{manifest.catalogIds.map(id=>manifest.catalogNames?.[id]??id).join("、")}</p>:null}<small className="catalog-guide-updated">更新於 {new Date(manifest.preparedAt).toLocaleString("zh-TW")} · {manifest.failedUrls.length?`${manifest.failedUrls.length} 個素材未能更新，已盡量保留舊快取`:"所有選定內容已保存"}</small><button className="offline-pack-delete" disabled={busy} onClick={removeTrip}>刪除這台裝置的離線包</button></details>:null}</section>;
}

function formatBytes(value:number){if(value<1024)return`${value} B`;if(value<1024*1024)return`${(value/1024).toFixed(1)} KB`;return`${(value/1024/1024).toFixed(1)} MB`}
