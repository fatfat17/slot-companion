"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { identifyMachine, IdentificationRequestError } from "@/lib/ai/client";
import type { MachineIdentificationCandidate, MachineIdentificationResult } from "@/types";
import { catalogProfileStatus } from "@/lib/ai/matching";
import { compressIdentificationImage, type CompressedImage } from "@/lib/ai/imageCompression";
import { formatImageBytes } from "@/lib/ai/imageLimits";
import { getIdentificationFollowUp } from "@/lib/ai/identificationFollowUp";

const confidenceLabel=(value:number)=>value>=.8?"高":value>=.5?"中":"低";
const identityBasisLabel:Record<MachineIdentificationCandidate["identityBasis"],string>={catalog_match:"已匹配 Machine Catalog",official_title_visible:"看見正式機種名稱",multi_visual_evidence:"多項視覺證據",visual_text:"僅依畫面文字推測",inferred:"依有限線索推測",unknown:"無法辨識"};

export default function IdentifyPage(){
  const [file,setFile]=useState<File>();const [preview,setPreview]=useState<string>();const [compression,setCompression]=useState<CompressedImage>();const [compressing,setCompressing]=useState(false);const [result,setResult]=useState<MachineIdentificationResult>();const [selected,setSelected]=useState(0);const [loading,setLoading]=useState(false);const [error,setError]=useState("");const controller=useRef<AbortController>(null),selectionId=useRef(0);
  useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);controller.current?.abort()},[preview]);
  async function pickImage(event:ChangeEvent<HTMLInputElement>){const next=event.target.files?.[0];event.target.value="";if(!next)return;const current=++selectionId.current;controller.current?.abort();setFile(undefined);setCompression(undefined);setResult(undefined);setSelected(0);setError("");setCompressing(true);try{const compressed=await compressIdentificationImage(next);if(current!==selectionId.current)return;if(preview)URL.revokeObjectURL(preview);setFile(compressed.file);setCompression(compressed);setPreview(URL.createObjectURL(compressed.file))}catch(reason){if(current!==selectionId.current)return;const code=reason instanceof Error?reason.message:"encode_failed";setError(code==="unsupported_image"?"只能使用圖片檔案。":code==="heic_decode_failed"?"此瀏覽器無法解碼這張 HEIC／HEIF，請改用 JPEG、PNG，或先在相簿轉存。":code==="compressed_too_large"?"壓縮後圖片仍超過 4MB 上限，請重新拍攝或選擇較小照片。":"圖片無法讀取或壓縮，請重新選擇。") }finally{if(current===selectionId.current)setCompressing(false)}}
  function reset(){selectionId.current+=1;controller.current?.abort();if(preview)URL.revokeObjectURL(preview);setFile(undefined);setPreview(undefined);setCompression(undefined);setCompressing(false);setResult(undefined);setSelected(0);setLoading(false);setError("")}
  async function submit(){if(!file)return;controller.current=new AbortController();setLoading(true);setError("");try{const next=await identifyMachine(file,controller.current.signal);setResult(next);setSelected(0)}catch(reason){if(reason instanceof DOMException&&reason.name==="AbortError")setError("已取消辨識。");else setError(reason instanceof IdentificationRequestError?reason.message:"辨識服務發生錯誤，請稍後再試。")}finally{setLoading(false)}}
  function cancel(){controller.current?.abort()}
  const candidate=result?.candidates[selected];
  return <><PageHeader title="拍機台" eyebrow="AI Machine Identification"/><main className="page pt-5!">
    <div className="notice mb-4">照片只在本次辨識期間使用，不會存入 localStorage 或建立圖片庫。AI 結果必須由你確認。</div>
    <div className={`photo-picker ${preview?"has-photo":""}`}>{preview?<div className="photo-preview" style={{backgroundImage:`url(${preview})`}}/>:compressing?<><span>◌</span><strong>正在壓縮照片…</strong><small>完成後才會送出辨識</small></>:<><span>📷</span><strong>拍攝或選擇機台照片</strong><small>建議包含整台、機種名稱與筐體上方</small></>}</div>
    <div className="photo-source-grid"><label>📷 直接拍照<input type="file" accept="image/*,.heic,.heif" capture="environment" onChange={pickImage}/></label><label>▣ 選擇舊照片<input type="file" accept="image/*,.heic,.heif" onChange={pickImage}/></label></div>
    {compression&&<div className="compression-summary" aria-live="polite"><div><span>原始大小</span><strong>{formatImageBytes(compression.originalBytes)}</strong><small>{compression.originalWidth} × {compression.originalHeight}</small></div><b>→</b><div><span>壓縮後</span><strong>{formatImageBytes(compression.compressedBytes)}</strong><small>{compression.width} × {compression.height} · JPEG</small></div></div>}
    {file&&<div className="identify-actions"><button className="primary-button" disabled={loading} onClick={submit}>{loading?"AI 辨識中…":"開始 AI 辨識"}</button><button className="secondary-button" onClick={reset}>重新選擇</button></div>}
    {loading&&<button className="cancel-identify" onClick={cancel}>取消辨識</button>}
    {error&&<div className="identify-error" role="alert">{error}</div>}
    {result&&<IdentificationResult result={result} candidate={candidate} selected={selected} onSelect={setSelected} onReset={reset}/>} 
  </main></>;
}

function IdentificationResult({result,candidate,selected,onSelect,onReset}:{result:MachineIdentificationResult;candidate?:MachineIdentificationCandidate;selected:number;onSelect:(index:number)=>void;onReset:()=>void}){
  const reliable=result.status==="identified"&&candidate;
  const followUp=getIdentificationFollowUp(result.status,candidate,new Date().toISOString());
  return <section className="section result-card ai-identification-result">
    <div className="result-label"><span>{result.provider==="mock"?"MOCK AI":"AI 辨識結果"}</span><b>{result.status.toUpperCase()}</b></div>
    {!reliable&&<div className="uncertain-message"><strong>{result.status==="uncertain"?"目前只能確認系列 / IP，無法可靠確認正式機種。":"目前無法辨識機種"}</strong><p>請再拍整台、正式機種名稱、筐體上方或側面銘板，避免只拍角色、演出文字或資料機。</p></div>}
    {result.researchStatus==="pending_new_machine"&&<div className="profile-missing">待研究新機種：目前 Catalog 沒有足夠候選，不會自動建立 Machine Profile。</div>}
    {candidate&&<><h2>{candidate.machineNameJa||"正式機種名未確認"}</h2><p className="identified-name-zh">{candidate.machineNameZh||"中文顯示名未確認"}</p><div className="result-meta"><span>メーカー：{candidate.manufacturer||"不明"}</span><span>信心：{confidenceLabel(candidate.confidence)}</span></div><div className="identity-basis"><span>辨識方式：</span><strong>{identityBasisLabel[candidate.identityBasis]}</strong></div>{catalogProfileStatus(candidate)&&<div className="catalog-profile-status">{catalogProfileStatus(candidate)}</div>}<p className="identify-reason">{candidate.reason}</p><ul className="visible-evidence">{candidate.visibleEvidence.map(item=><li key={item}>{item}</li>)}</ul></>}
    {result.candidates.length>1&&<div className="candidate-list"><strong>其他候選</strong>{result.candidates.map((item,index)=><button className={selected===index?"active":""} key={`${item.machineNameJa}-${index}`} onClick={()=>onSelect(index)}><span>{item.machineNameZh||item.machineNameJa}</span><small>可信度：{confidenceLabel(item.confidence)}</small></button>)}</div>}
    {followUp?.kind==="existing-profile"&&<Link href={followUp.primaryHref} className="primary-button mt-4">{followUp.primaryLabel}</Link>}
    {followUp?.kind==="catalog-only"&&<><div className="profile-missing">已匹配 Machine Catalog｜尚未建立攻略 Profile</div><Link href={followUp.primaryHref} className="primary-button mt-4">{followUp.primaryLabel}</Link></>}
    {result.debug&&<details className="identity-debug"><summary>Development · Identification Debug</summary><section><h3>Phase 1 Evidence</h3><pre>{JSON.stringify(result.debug.phase1Evidence,null,2)}</pre><h3>Search Query Terms</h3><pre>{JSON.stringify(result.debug.searchQueryTerms,null,2)}</pre><h3>Top 20 Shortlist</h3>{result.debug.shortlist.map(item=><article key={item.id}><strong>{item.officialNameJa}</strong><span>score {item.score}</span><small>{item.matchReasons.join(" · ")}</small></article>)}<h3>Phase 2 Decision</h3><pre>{JSON.stringify(result.debug.phase2,null,2)}</pre></section></details>}
    <Link href="/machines" className="secondary-button mt-2">⌕ 手動選擇</Link><button className="secondary-button mt-2" onClick={onReset}>📷 重拍／重選</button>
  </section>;
}
