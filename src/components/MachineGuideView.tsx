"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import type { MachineCatalogRecord } from "@/types/catalog";
import type { MachineGuide } from "@/types/machineGuide";
import { loadCachedGuide } from "@/lib/machine-guide/storage";
import { machineFromGuide } from "@/lib/machine-guide/session";
import { StartSession } from "./StartSession";

const statusLabel={usable:"可使用",partial:"部分資料",no_data:"尚無資料"} as const;
export function MachineGuideView({record}:{record:MachineCatalogRecord}){
  const[guide,setGuide]=useState<MachineGuide|null>(null),[ready,setReady]=useState(false);
  useEffect(()=>{setGuide(loadCachedGuide(record.id)?.guide??null);setReady(true)},[record.id]);
  if(!ready)return <main className="page"><div className="empty">正在讀取此裝置的機台指南…</div></main>;
  if(!guide)return <main className="page"><div className="empty card"><strong>此裝置尚無 v2 機台指南</strong><p>舊版快取不會冒充新版資料，請回機種詳細頁重新建立。</p><Link href={`/catalog/${encodeURIComponent(record.id)}`} className="primary-button mt-5">回機種詳細頁</Link></div></main>;
  const machine=machineFromGuide(guide);
  return <main className="page guide-page">
    <section className="catalog-detail-hero card"><span className="badge">{statusLabel[guide.status]}</span><h1>{guide.displayNameZh||guide.officialNameJa}</h1><p>{guide.officialNameJa}</p><small>{guide.manufacturer} · {guide.machineType}</small></section>
    <div className="notice mt-3">本指南整理 P-WORLD 公開參考資料，可能不完整或隨來源更新；不是權威攻略、準確設定判定或獲利保證。</div>
    <section className="section card guide-section"><header><div><h2>新手快速指南</h2><small>BEGINNER GUIDE</small></div><span>{guide.availability.sessionTemplate==="available"?"可開始記錄":"部分資料"}</span></header><p className="guide-summary">{guide.beginnerGuide.corePlay??"尚無資料"}</p>{guide.beginnerGuide.keyThings.length?guide.beginnerGuide.keyThings.map(item=><article key={item.id} className="guide-paragraph"><strong>{item.labelZh}</strong><small> {item.labelJa}</small><p>{item.meaning}。{item.recordWhen}</p></article>):<p>尚無資料</p>}</section>
    <section className="section card guide-section"><header><div><h2>本機可記錄項目</h2><small>SESSION TEMPLATE</small></div><span>{guide.sessionModules.length} 項</span></header>{guide.sessionModules.map(module=><p className="guide-paragraph" key={module.id}>{module.labelZh}<small> {module.labelJa}</small></p>)}</section>
    {guide.sections.map(section=><section className="section card guide-section" key={section.key}><header><div><h2>{section.titleZh}</h2><small>{section.titleJa}</small></div><span>{section.tables.length?`${section.tables.length} 表格`:section.paragraphsJa.length?"公開說明":"尚無資料"}</span></header>{section.summaryZh&&<p className="guide-summary">{section.summaryZh}</p>}{section.paragraphsJa.slice(0,4).map((paragraph,index)=><p className="guide-paragraph" key={index}>{paragraph}</p>)}{section.tables.map(table=><article className="guide-table" key={table.id}><strong>{table.title}</strong><div><table><thead><tr>{table.headers.map((header,index)=><th key={index}>{header}</th>)}</tr></thead><tbody>{table.rows.map((row,rowIndex)=><tr key={rowIndex}>{table.headers.map((_,cellIndex)=><td key={cellIndex}>{row[cellIndex]||"尚無資料"}</td>)}</tr>)}</tbody></table></div></article>)}</section>)}
    <section className="section card guide-missing"><h2>尚未取得的資料</h2>{guide.missingSections.length?<p>{guide.missingSections.join("、")}</p>:<p>本指南主要欄位均有可顯示內容。</p>}</section>
    <section className="section card guide-source"><h2>來源與快取</h2><dl><dt>來源</dt><dd><a href={guide.sourceUrl} target="_blank" rel="noreferrer">P-WORLD ↗</a></dd><dt>擷取時間</dt><dd>{new Date(guide.retrievedAt).toLocaleString("zh-TW")}</dd><dt>保存位置</dt><dd>此瀏覽器 localStorage（不跨裝置同步）</dd></dl></section>
    <div className="notice mt-3">{guide.availability.settingEstimator==="unavailable"?"目前沒有可安全參與設定推測的資料。":"設定可能性只使用具完整設定值、明確分母且能由 Session 實際觀測的資料；結果一律為參考推測。"}</div>
    <StartSession machine={machine}/>
  </main>;
}
