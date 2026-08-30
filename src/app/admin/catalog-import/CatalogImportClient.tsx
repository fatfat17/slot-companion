"use client";

import { useState } from "react";
import type { CatalogImportAction, MachineCatalogCandidate, MachineCatalogRecord } from "@/types/catalog";
import { ApprovalBatchError, runApprovalBatches, type ApprovalProgress } from "@/lib/catalog/approval";

type Preview={candidate:MachineCatalogCandidate;duplicate:MachineCatalogRecord|null};
type PreviewItem=Preview&{selected:boolean;action:CatalogImportAction};
type BatchSummary={scannedMonths:number;successfulMonths:number;failedMonths:number;rawSlotCandidates:number;normalizedCandidates:number;deduplicatedCandidates:number;existingCatalogCount:number;newCandidateCount:number;mergeCandidateCount:number};
type CatalogHealthSummary={catalogTotal:number;cloudBacked:boolean;auditVersion:string|null;operationalMachines:number|null;basicRecordModeMachines:number|null;estimatorEligibleMachines:number|null;blockedControlCount:number|null};
const summaryLabels:Array<[keyof BatchSummary,string]>=[["scannedMonths","掃描月份"],["successfulMonths","成功月份"],["failedMonths","失敗月份"],["rawSlotCandidates","原始 Slot"],["normalizedCandidates","Normalization 後"],["deduplicatedCandidates","去重後"],["existingCatalogCount","已存在 Catalog"],["newCandidateCount","新增候選"],["mergeCandidateCount","Merge candidates"]];

export function CatalogImportClient({requiresToken=false,health}:{requiresToken?:boolean;health:CatalogHealthSummary}){
  const [mode,setMode]=useState<"single"|"batch">("single");
  const [url,setUrl]=useState("https://www.p-world.co.jp/database/machine/introduce_calendar.cgi?year_month=2026-06");
  const [startMonth,setStartMonth]=useState("2026-05");
  const [endMonth,setEndMonth]=useState("2026-06");
  const [items,setItems]=useState<PreviewItem[]>([]);
  const [summary,setSummary]=useState<BatchSummary|null>(null);
  const [failures,setFailures]=useState<Array<{month:string;reason:string}>>([]);
  const [approvalProgress,setApprovalProgress]=useState<ApprovalProgress|null>(null);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [adminToken,setAdminToken]=useState("");
  const requestHeaders=()=>({"Content-Type":"application/json",...(requiresToken&&adminToken?{"x-catalog-admin-token":adminToken}:{})});
  const loadPreview=(candidates:Preview[])=>setItems(candidates.map(item=>({...item,selected:true,action:item.duplicate?"merge":"import"})));

  async function preview(){
    setBusy(true);setMessage("");setSummary(null);setFailures([]);
    try{const response=await fetch("/api/admin/catalog-import/preview",{method:"POST",headers:requestHeaders(),body:JSON.stringify({url})});const data=await response.json();if(!response.ok)throw new Error(data.error?.message);loadPreview(data.candidates);setMessage(`已解析 ${data.candidates.length} 筆，只建立預覽，尚未寫入。`)}catch(error){setMessage(error instanceof Error?error.message:"Fetch 失敗")}finally{setBusy(false)}
  }
  async function batchPreview(){
    setBusy(true);setMessage("");setSummary(null);setFailures([]);
    try{const response=await fetch("/api/admin/catalog-import/batch-preview",{method:"POST",headers:requestHeaders(),body:JSON.stringify({startMonth,endMonth})});const data=await response.json();if(!response.ok)throw new Error(data.error?.message);loadPreview(data.candidates);setSummary(data.summary);setFailures(data.failures);setMessage(`批次掃描完成：${data.candidates.length} 筆去重候選，只建立預覽，尚未寫入。`)}catch(error){setItems([]);setMessage(error instanceof Error?error.message:"Batch Fetch 失敗")}finally{setBusy(false)}
  }
  async function approve(){
    const decisions=items.filter(item=>item.selected).map(item=>({candidate:item.candidate,action:item.action,existingId:item.duplicate?.id}));
    setBusy(true);setApprovalProgress(null);
    try{const result=await runApprovalBatches(decisions,async batch=>{const response=await fetch("/api/admin/catalog-import/approve",{method:"POST",headers:requestHeaders(),body:JSON.stringify({decisions:batch})});const data=await response.json();if(!response.ok)throw new Error(data.error?.message??"Approve 失敗");return data},setApprovalProgress);setMessage(`全部匯入完成 ${result.processed}/${decisions.length}：新增 ${result.imported}、合併 ${result.merged}、略過 ${result.skipped}`)}catch(error){if(error instanceof ApprovalBatchError)setMessage(`匯入中止：已完成 ${error.completed} 筆；第 ${error.failedBatch}/${error.totalBatches} 批失敗；尚未處理 ${error.remaining} 筆。${error.message} 請重新建立 Preview 後繼續。`);else setMessage(error instanceof Error?error.message:"Approve 失敗")}finally{setBusy(false)}
  }
  function update(index:number,patch:Partial<PreviewItem>,candidatePatch?:Partial<MachineCatalogCandidate>){setItems(current=>current.map((item,i)=>i===index?{...item,...patch,candidate:{...item.candidate,...candidatePatch}}:item))}

  return <main className="page catalog-admin">
    <div className="notice">只抽取身份型資料。Fetch 後必須人工勾選並 Approve；不保存攻略全文或頁面圖片。</div>
    <section className="catalog-summary card"><h2>資料庫狀態</h2><div><dl><dt>Catalog</dt><dd>{health.catalogTotal}</dd></dl><dl><dt>雲端儲存</dt><dd>{health.cloudBacked?"已連線":"JSON fallback"}</dd></dl><dl><dt>可操作機台</dt><dd>{health.operationalMachines??"—"}</dd></dl><dl><dt>基本記錄模式</dt><dd>{health.basicRecordModeMachines??"—"}</dd></dl><dl><dt>Estimator 可用</dt><dd>{health.estimatorEligibleMachines??"—"}</dd></dl><dl><dt>Evidence 阻擋</dt><dd>{health.blockedControlCount??"—"}</dd></dl></div>{health.auditVersion&&<p className="catalog-help">Coverage audit：{health.auditVersion}</p>}</section>
    {requiresToken&&<section className="section card"><label className="catalog-url-label" htmlFor="catalog-admin-token">管理密碼</label><input id="catalog-admin-token" className="input" type="password" autoComplete="current-password" value={adminToken} onChange={event=>setAdminToken(event.target.value)} placeholder="輸入 Catalog 管理密碼"/><p className="catalog-help">密碼只保留在目前頁面，不會寫入瀏覽器儲存空間。</p></section>}
    <section className="section card">
      <div className="catalog-modes"><button className={mode==="single"?"active":""} onClick={()=>setMode("single")}>單一 URL</button><button className={mode==="batch"?"active":""} onClick={()=>setMode("batch")}>月份範圍</button></div>
      {mode==="single"?<><label className="catalog-url-label">公開機種列表 URL</label><div className="catalog-fetch"><input className="input" value={url} onChange={event=>setUrl(event.target.value)}/><button onClick={preview} disabled={busy}>{busy?"處理中":"Fetch & Parse"}</button></div></>:<><div className="catalog-months"><label>Start Month<input className="input" type="month" value={startMonth} onChange={event=>setStartMonth(event.target.value)}/></label><label>End Month<input className="input" type="month" value={endMonth} onChange={event=>setEndMonth(event.target.value)}/></label></div><button className="catalog-batch-button" onClick={batchPreview} disabled={busy}>{busy?"依序掃描中":"建立 Batch Preview"}</button><p className="catalog-help">最多 36 個月，依序讀取並保留合理間隔。單月失敗不會中止整批。</p></>}
      {approvalProgress&&<div className="approval-progress"><strong>匯入進度 · 第 {approvalProgress.currentBatch}/{approvalProgress.totalBatches} 批</strong><div><span>總選取 {approvalProgress.total}</span><span>已處理 {approvalProgress.processed}</span><span>剩餘 {approvalProgress.remaining}</span></div></div>}
      {message&&<p className="catalog-message">{message}</p>}
    </section>
    {summary&&<section className="catalog-summary card"><h2>Batch Summary</h2><div>{summaryLabels.map(([key,label])=><dl key={key}><dt>{label}</dt><dd>{summary[key]}</dd></dl>)}</div>{failures.length>0&&<div className="catalog-failures"><strong>失敗月份</strong>{failures.map(item=><p key={item.month}>{item.month} · {item.reason}</p>)}</div>}</section>}
    {items.length>0&&<><div className="section-title"><h2>Import Preview</h2><span>{items.length} candidates</span></div><div className="catalog-preview">{items.map((item,index)=><article className="card" key={`${item.candidate.sourceId}-${index}`}><label className="catalog-check"><input type="checkbox" checked={item.selected} onChange={event=>update(index,{selected:event.target.checked})}/><strong>{item.candidate.officialNameJa}</strong></label><div className="catalog-fields"><input className="input" value={item.candidate.officialNameJa} onChange={event=>update(index,{}, {officialNameJa:event.target.value})}/><input className="input" value={item.candidate.manufacturer} onChange={event=>update(index,{}, {manufacturer:event.target.value})}/></div><div className="catalog-meta"><span>{item.candidate.introducedAt}</span><span>{item.candidate.machineType}</span><span>{item.candidate.sourceName}</span></div>{item.duplicate&&<p className="duplicate-note">疑似重複：{item.duplicate.officialNameJa}</p>}<select value={item.action} onChange={event=>update(index,{action:event.target.value as CatalogImportAction})}><option value="import">Import</option><option value="skip">Skip</option><option value="merge">Merge with existing</option></select></article>)}</div><button className="primary-button catalog-approve" onClick={approve} disabled={busy}>Approve Import</button></>}
  </main>
}
