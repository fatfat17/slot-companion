"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import type { MachineCatalogRecord } from "@/types/catalog";
import type { MachineGuide } from "@/types/machineGuide";
import { getGuideCacheState,loadCachedGuide,type GuideCacheState } from "@/lib/machine-guide/storage";
import { refreshCachedMachineGuide } from "@/lib/machine-guide/refresh";

export function MachineGuideActions({record}:{record:MachineCatalogRecord}){
  const[cached,setCached]=useState<MachineGuide|null>(null),[cacheState,setCacheState]=useState<GuideCacheState>("missing"),[busy,setBusy]=useState(false),[error,setError]=useState(""),[checked,setChecked]=useState(false),router=useRouter();
  useEffect(()=>{setCached(loadCachedGuide(record.id)?.guide??null);setCacheState(getGuideCacheState(record.id));setChecked(true)},[record.id]);
  async function rebuild(navigate:boolean){setBusy(true);setError("");try{const guide=await refreshCachedMachineGuide(record.id);setCached(guide);setCacheState("current");if(navigate)router.push(`/guides/${encodeURIComponent(record.id)}`)}catch(reason){setError(reason instanceof Error?reason.message:"機台指南建立失敗。")}finally{setBusy(false)}}
  const pworld=/^https:\/\/(www\.)?p-world\.co\.jp\/machine\/database\/\d+\/?$/.test(record.sourceUrl);
  if(!checked)return<div className="notice mt-3">正在檢查此裝置的機台指南快取…</div>;
  return <section className="guide-actions section">
    <div className="section-title"><h2>機台指南</h2><span>{cached?cached.status==="usable"?"可使用":"部分資料":"尚無資料"}</span></div>
    {cacheState==="stale"&&<div className="notice mb-3">此裝置的指南由舊版整理器建立，已停止載入。請重新從 P-WORLD 建立；既有 Session 與遊玩紀錄不受影響。</div>}
    {cached?<>
      <Link className="primary-button" href={`/guides/${encodeURIComponent(record.id)}`}>查看機台指南</Link>
      {pworld&&<button className="secondary-button mt-3" disabled={busy} onClick={()=>rebuild(false)}>{busy?"正在重新整理…":"重新整理 P-WORLD 機台指南"}</button>}
      <p className="guide-cache-note">已保存在此瀏覽器 · 最後擷取 {new Date(cached.retrievedAt).toLocaleString("zh-TW")}</p>
    </>:pworld?<button className="primary-button" disabled={busy} onClick={()=>rebuild(true)}>{busy?"正在整理 P-WORLD 公開資料…":cacheState==="stale"?"重新建立 P-WORLD 機台指南":"從 P-WORLD 建立機台指南"}</button>:<div className="notice">此 Catalog record 沒有可使用的 P-WORLD 機台詳細頁來源。</div>}
    {error&&<div className="guide-error" role="alert"><strong>目前無法取得來源</strong><p>{error}</p><p>{cached?"上一份有效指南仍保留。":"Catalog 資料不受影響。"}既有 Session 與遊玩紀錄不受影響。</p></div>}
    <a className="secondary-button mt-3" href={record.sourceUrl} target="_blank" rel="noreferrer">開啟 P-WORLD 來源 ↗</a>
    <p className="guide-cache-note">本版為即時取得＋本機瀏覽器快取，不是跨裝置雲端同步。</p>
  </section>
}
