"use client";
import Link from "next/link";
import {useMemo,useState} from "react";
import type {PachinkoCatalogRecord} from "@/types/pachinko";
import {searchPachinkoCatalog} from "@/lib/pachinko/catalog";
import {PachinkoCoverImage} from "@/components/PachinkoCoverImage";

const PAGE_SIZE=24;
const typeLabels:Record<PachinkoCatalogRecord["machineType"],string>={smart_pachinko:"智慧柏青哥",digital:"數位柏青哥",hanemono:"羽根物",other:"其他"};

export function PachinkoLibraryClient({records}:{records:PachinkoCatalogRecord[]}){
  const[query,setQuery]=useState(""),[machineType,setMachineType]=useState(""),[limit,setLimit]=useState(PAGE_SIZE);
  const result=useMemo(()=>searchPachinkoCatalog(records,query).filter(item=>!machineType||item.machineType===machineType),[records,query,machineType]),visible=result.slice(0,limit);
  return <main className="page catalog-library pachinko-library">
    <section className="catalog-management card pachinko-management"><div><span>PACHINKO LIBRARY</span><strong>{records.length} 台柏青哥機種資料</strong><small>資料庫、機台說明與遊玩紀錄均與柏青嫂分開。</small></div><Link className="secondary-button" href="/catalog">切換柏青嫂</Link></section>
    <Link className="primary-button pachinko-primary catalog-identify-entry" href="/identify/pachinko">📷 拍照找柏青哥</Link>
    <section className="catalog-search-panel"><div className="catalog-search-row"><input className="input" aria-label="搜尋柏青哥機種" placeholder="搜尋柏青哥名稱、中文名或メーカー" value={query} onChange={event=>{setQuery(event.target.value);setLimit(PAGE_SIZE)}}/></div><select className="select mt-3" aria-label="柏青哥類型" value={machineType} onChange={event=>{setMachineType(event.target.value);setLimit(PAGE_SIZE)}}><option value="">所有類型</option>{Object.entries(typeLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></section>
    <div className="section-title catalog-result-title"><h2>柏青哥機種</h2><span>{result.length} 台</span></div>
    {result.length?<><div className="catalog-card-grid">{visible.map(record=><article className="catalog-visual-card pachinko-card" key={record.id}><Link href={`/pachinko/${record.id}`}><PachinkoCoverImage record={record}/><div className="catalog-card-body"><h2>{record.displayNameZh||record.officialNameJa}</h2>{record.displayNameZh&&<p>{record.officialNameJa}</p>}<span>{record.manufacturer}</span><div className="catalog-estimator-badge record-only">{typeLabels[record.machineType]}</div><div className="catalog-card-status">機台說明 · 簡易紀錄</div></div></Link></article>)}</div>{visible.length<result.length&&<button className="secondary-button mt-4" onClick={()=>setLimit(value=>value+PAGE_SIZE)}>載入更多（已顯示 {visible.length} / {result.length}）</button>}</>:<div className="catalog-empty card"><strong>找不到符合條件的柏青哥</strong><p>請更換名稱或清除類型篩選。</p></div>}
    <div className="notice mt-4">收錄 P-WORLD 2025 年至今的公開新台資料；機率與出玉只作規格說明，不預測中獎。中文名會依可靠譯名逐步補充。</div>
  </main>
}
