"use client";
import { useEffect,useState } from "react";
import type { MachineCatalogRecord } from "@/types/catalog";
import { createGuideBatchProgress,loadGuideBatchProgress,remainingGuideBatchIds,runGuideRefreshBatch,saveGuideBatchProgress,type GuideBatchProgress,type GuideBatchTarget } from "@/lib/machine-guide/batch";
import { refreshCachedMachineGuide } from "@/lib/machine-guide/refresh";
import { loadCachedGuidesAsync } from "@/lib/machine-guide/storage";
import { prepareOfflinePack,type OfflinePackManifest } from "@/lib/machine-guide/offlinePack";

export function CatalogGuideTools({records,favoriteIds,recentIds,onGuidesChanged}:{records:MachineCatalogRecord[];favoriteIds:string[];recentIds:string[];onGuidesChanged:()=>void}){
  const[target,setTarget]=useState<GuideBatchTarget>("favorites"),[progress,setProgress]=useState<GuideBatchProgress|null>(null),[offlineProgress,setOfflineProgress]=useState<{completed:number;total:number}|null>(null),[manifest,setManifest]=useState<OfflinePackManifest|null>(null),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
  useEffect(()=>{setProgress(loadGuideBatchProgress())},[]);
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
    setBusy(true);setMessage("");setManifest(null);
    try{
      const initial=createGuideBatchProgress(target,ids),result=await runGuideRefreshBatch(initial,refreshCachedMachineGuide,next=>{setProgress(next);saveGuideBatchProgress(next)}),cached=await loadCachedGuidesAsync(ids),guides=ids.map(id=>cached[id]?.guide).filter((guide):guide is NonNullable<typeof guide>=>Boolean(guide));
      if(!guides.length)throw new Error("目前沒有可保存的有效指南。");
      const next=await prepareOfflinePack(guides,(completed,total)=>setOfflineProgress({completed,total}));setManifest(next);onGuidesChanged();
      setMessage(`${guides.length} 台指南已準備離線使用${result.failed.length?`；${result.failed.length} 台更新失敗，已保留並使用原快取`:""}。`);
    }catch(error){setMessage(error instanceof Error?error.message:"離線包準備失敗。")}finally{setBusy(false);setOfflineProgress(null)}
  }
  return <section className="catalog-guide-tools card"><div><span>TRIP READY</span><strong>指南更新與旅行離線包</strong><small>只處理收藏或最近機台；Guide JSON、頁面與指南圖片會保存在這台裝置。</small></div><div className="catalog-guide-target"><button className={target==="favorites"?"active":""} onClick={()=>setTarget("favorites")}>收藏 {favoriteIds.length}</button><button className={target==="recent"?"active":""} onClick={()=>setTarget("recent")}>最近 {recentIds.length}</button></div><div className="catalog-guide-actions"><button className="secondary-button" disabled={busy||!ids.length} onClick={()=>updateGuides()}>{busy?"處理中…":`更新 ${ids.length} 台指南`}</button><button className="primary-button" disabled={busy||!ids.length} onClick={prepareTrip}>準備旅行離線包</button></div>{unfinished?<button className="catalog-guide-resume" disabled={busy} onClick={()=>updateGuides(progress!)}>繼續上次更新 · 尚餘 {unfinished} 台</button>:null}{progress&&busy?<p className="catalog-guide-progress">指南：{progress.completedIds.length+progress.failed.length} / {progress.catalogIds.length} · 成功 {progress.completedIds.length} · 失敗 {progress.failed.length}</p>:null}{offlineProgress?<p className="catalog-guide-progress">離線內容：{offlineProgress.completed} / {offlineProgress.total}</p>:null}{message?<p className="catalog-guide-message" role="status">{message}</p>:null}{manifest?<small className="catalog-guide-updated">完成於 {new Date(manifest.preparedAt).toLocaleString("zh-TW")} · {manifest.failedUrls.length?`${manifest.failedUrls.length} 個素材未能離線保存`:"所有選定內容已保存"}</small>:null}</section>;
}
