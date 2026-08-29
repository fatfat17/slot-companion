"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import type { MachineCatalogRecord } from "@/types/catalog";
import type { MachineGuide } from "@/types/machineGuide";
import { getGuideCacheState,loadCachedGuide,type GuideCacheState } from "@/lib/machine-guide/storage";
import { refreshCachedMachineGuide } from "@/lib/machine-guide/refresh";
import { machineFromGuide } from "@/lib/machine-guide/session";
import { StartSession } from "./StartSession";

const statusLabel={usable:"可使用",partial:"部分資料",no_data:"尚無資料"} as const;
export function MachineGuideView({record}:{record:MachineCatalogRecord}){
  const[guide,setGuide]=useState<MachineGuide|null>(null),[cacheState,setCacheState]=useState<GuideCacheState>("missing"),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState("");
  useEffect(()=>{setGuide(loadCachedGuide(record.id)?.guide??null);setCacheState(getGuideCacheState(record.id));setReady(true)},[record.id]);
  async function refresh(){setBusy(true);setError("");try{const next=await refreshCachedMachineGuide(record.id);setGuide(next);setCacheState("current")}catch(reason){setError(reason instanceof Error?reason.message:"機台指南建立失敗。")}finally{setBusy(false)}}
  if(!ready)return <main className="page"><div className="empty">正在讀取此裝置的機台指南…</div></main>;
  if(!guide)return <main className="page"><div className="empty card"><strong>{cacheState==="stale"?"此裝置的舊版指南已失效":"此裝置尚無機台指南"}</strong><p>{cacheState==="stale"?"舊版 schema v2 快取不會冒充最新整理結果。重新建立只會更新本機指南，不影響既有 Session。":"可以從 P-WORLD 公開資料建立本機指南。"}</p><button className="primary-button mt-5" disabled={busy} onClick={refresh}>{busy?"正在重新建立…":cacheState==="stale"?"重新建立 P-WORLD 機台指南":"從 P-WORLD 建立機台指南"}</button>{error&&<div className="guide-error mt-3" role="alert">{error}<p>既有 Session 與遊玩紀錄不受影響。</p></div>}<Link href={`/catalog/${encodeURIComponent(record.id)}`} className="secondary-button mt-3">回機種詳細頁</Link></div></main>;
  const machine=machineFromGuide(guide),player=guide.playerGuideZh;
  return <main className="page guide-page">
    <section className="catalog-detail-hero card"><span className="badge">{statusLabel[guide.status]}</span><h1>{guide.displayNameZh||guide.officialNameJa}</h1><p>{guide.officialNameJa}</p><small>{guide.manufacturer} · {guide.machineType}</small></section>
    <div className="notice mt-3">本指南整理 P-WORLD 公開參考資料，可能不完整或隨來源更新；不是權威攻略、準確設定判定或獲利保證。</div>
    <section className="section card guide-section"><header><div><h2>60 秒看懂這台</h2><small>繁體中文玩家版</small></div><span>{guide.availability.sessionTemplate==="available"?"可開始記錄":"部分資料"}</span></header><p className="guide-summary">{player?.overview??"目前尚無簡化說明。"}</p>{player?.goals.length?<ul>{player.goals.map((goal,index)=><li key={index}>{goal}</li>)}</ul>:<p>目前尚無遊玩重點。</p>}</section>
    <section className="section card guide-section"><header><div><h2>今天先記住這三件事</h2><small>看到什麼 → 按哪個記錄</small></div></header>{player?.highlights.length?player.highlights.map(item=><article key={item.id} className="guide-paragraph"><strong>{item.label}</strong><p>{item.meaning}</p><p>{item.recordWhen}</p></article>):<p>目前沒有可靠的具名事件，先記錄總遊玩 G；需要時可新增自訂記錄。</p>}</section>
    <section className="section card guide-section"><header><div><h2>本機可記錄項目</h2><small>SESSION TEMPLATE</small></div><span>{guide.sessionModules.length} 項</span></header>{guide.sessionModules.map(module=><p className="guide-paragraph" key={module.id}>{module.labelZh}<small> {module.labelJa}</small></p>)}</section>
    {player?.sections.map(section=><section className="section card guide-section" key={section.key}><header><div><h2>{section.title}</h2><small>中文重點</small></div></header><p className="guide-summary">{section.summary||"目前尚無可靠說明。"}</p>{section.points.length>0&&<ul>{section.points.map((point,index)=><li key={index}>{point}</li>)}</ul>}</section>)}
    <details className="section card guide-section"><summary><strong>查看原始日文與表格</strong><small> 查證用・預設收合</small></summary>{guide.sections.map(section=><section className="mt-5" key={section.key}><header><div><h2>{section.titleZh}</h2><small>{section.titleJa}</small></div><span>{section.tables.length?`${section.tables.length} 表格`:section.paragraphsJa.length?"公開說明":"尚無資料"}</span></header>{section.paragraphsJa.slice(0,4).map((paragraph,index)=><p className="guide-paragraph" key={index}>{paragraph}</p>)}{section.tables.map(table=><article className="guide-table" key={table.id}><strong>{table.title}</strong><div><table><thead><tr>{table.headers.map((header,index)=><th key={index}>{header}</th>)}</tr></thead><tbody>{table.rows.map((row,rowIndex)=><tr key={rowIndex}>{table.headers.map((_,cellIndex)=><td key={cellIndex}>{row[cellIndex]||"尚無資料"}</td>)}</tr>)}</tbody></table></div></article>)}</section>)}</details>
    <section className="section card guide-missing"><h2>尚未取得的資料</h2>{guide.missingSections.length?<p>{guide.missingSections.join("、")}</p>:<p>本指南主要欄位均有可顯示內容。</p>}</section>
    <section className="section card guide-source"><h2>來源與快取</h2><dl><dt>來源</dt><dd><a href={guide.sourceUrl} target="_blank" rel="noreferrer">P-WORLD ↗</a></dd><dt>擷取時間</dt><dd>{new Date(guide.retrievedAt).toLocaleString("zh-TW")}</dd><dt>保存位置</dt><dd>此瀏覽器 localStorage（不跨裝置同步）</dd></dl><button className="secondary-button mt-3" disabled={busy} onClick={refresh}>{busy?"正在重新整理…":"重新整理 P-WORLD 機台指南"}</button>{error&&<div className="guide-error mt-3" role="alert"><strong>重新整理失敗</strong><p>{error}</p><p>目前這份有效指南及所有既有 Session 均已保留。</p></div>}</section>
    <div className="notice mt-3">{guide.availability.settingEstimator==="unavailable"?"目前沒有可安全參與設定推測的資料。":"設定可能性只使用具完整設定值、明確分母且能由 Session 實際觀測的資料；結果一律為參考推測。"}</div>
    <StartSession machine={machine}/>
  </main>;
}
