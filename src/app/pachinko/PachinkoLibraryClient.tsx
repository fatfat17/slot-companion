"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import type {PachinkoCatalogRecord} from "@/types/pachinko";
import {searchPachinkoCatalog} from "@/lib/pachinko/catalog";
import {loadPachinkoSessions} from "@/lib/pachinko/storage";
import {loadPachinkoPlayerLibrary,recentPlayedPachinkoCatalogIds,setPachinkoCatalogFavorite} from "@/lib/pachinko/playerLibrary";
import {PachinkoCoverImage} from "@/components/PachinkoCoverImage";

const PAGE_SIZE=24;
type LibraryMode="browse"|"favorites"|"recent";
const modeLabels:{value:LibraryMode;label:string}[]=[{value:"browse",label:"全部機種"},{value:"favorites",label:"我的收藏"},{value:"recent",label:"最近打過"}];
const typeLabels:Record<PachinkoCatalogRecord["machineType"],string>={smart_pachinko:"智慧柏青哥",digital:"數位柏青哥",hanemono:"羽根物",other:"其他"};

export function PachinkoLibraryClient({records,initialMode="browse"}:{records:PachinkoCatalogRecord[];initialMode?:LibraryMode}){
  const[query,setQuery]=useState(""),[machineType,setMachineType]=useState(""),[limit,setLimit]=useState(PAGE_SIZE),[mode,setMode]=useState<LibraryMode>(initialMode),[favorites,setFavorites]=useState<string[]>([]),[recentIds,setRecentIds]=useState<string[]>([]),[playCount,setPlayCount]=useState(0);
  useEffect(()=>{const player=loadPachinkoPlayerLibrary(),sessions=loadPachinkoSessions(),played=recentPlayedPachinkoCatalogIds(sessions),viewed=player.recentViews.map(item=>item.catalogId);setFavorites(player.favoriteCatalogIds);setRecentIds([...new Set([...played,...viewed])]);setPlayCount(sessions.length)},[]);
  const scopedRecords=useMemo(()=>mode==="favorites"?records.filter(record=>favorites.includes(record.id)):mode==="recent"?records.filter(record=>recentIds.includes(record.id)):records,[records,mode,favorites,recentIds]);
  const result=useMemo(()=>{const matches=searchPachinkoCatalog(scopedRecords,query).filter(item=>!machineType||item.machineType===machineType);return mode==="recent"?[...matches].sort((a,b)=>recentIds.indexOf(a.id)-recentIds.indexOf(b.id)):matches},[scopedRecords,query,machineType,mode,recentIds]);
  const visible=result.slice(0,limit);
  function chooseMode(next:LibraryMode){setMode(next);setLimit(PAGE_SIZE)}
  function toggleFavorite(id:string){const next=setPachinkoCatalogFavorite(id,!favorites.includes(id));setFavorites(next.favoriteCatalogIds)}
  return <main className="page catalog-library pachinko-library">
    <section className="catalog-management card pachinko-management"><div><span>PACHINKO LIBRARY</span><strong>{records.length} 台柏青哥機種資料</strong><small>收藏、最近打過與遊玩紀錄均與柏青嫂分開。</small></div><Link className="secondary-button" href="/catalog">切換柏青嫂</Link></section>
    <Link className="primary-button pachinko-primary catalog-identify-entry" href="/identify/pachinko">📷 拍照找柏青哥</Link>
    <section className="catalog-player-overview"><div><b>{favorites.length}</b><span>已收藏</span></div><div><b>{recentIds.length}</b><span>最近看過／玩過</span></div><div><b>{playCount}</b><span>本機遊玩紀錄</span></div></section>
    <nav className="catalog-view-tabs" aria-label="柏青哥資料庫顯示方式">{modeLabels.map(item=><button key={item.value} className={mode===item.value?"active":""} onClick={()=>chooseMode(item.value)}>{item.label}{item.value==="favorites"&&favorites.length>0?<small>{favorites.length}</small>:null}</button>)}</nav>
    <section className="catalog-search-panel"><div className="catalog-search-row"><input className="input" aria-label="搜尋柏青哥機種" placeholder="搜尋柏青哥名稱、中文名或メーカー" value={query} onChange={event=>{setQuery(event.target.value);setLimit(PAGE_SIZE)}}/></div><select className="select mt-3" aria-label="柏青哥類型" value={machineType} onChange={event=>{setMachineType(event.target.value);setLimit(PAGE_SIZE)}}><option value="">所有類型</option>{Object.entries(typeLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></section>
    <div className="section-title catalog-result-title"><h2>{mode==="favorites"?"我的收藏":mode==="recent"?"最近打過":"柏青哥機種"}</h2><span>{result.length} 台</span></div>
    {result.length?<><div className="catalog-card-grid">{visible.map(record=>{const favorite=favorites.includes(record.id);return <article className="catalog-visual-card pachinko-card" key={record.id}><button className={`catalog-card-favorite ${favorite?"active":""}`} aria-label={favorite?`取消收藏 ${record.officialNameJa}`:`收藏 ${record.officialNameJa}`} aria-pressed={favorite} onClick={()=>toggleFavorite(record.id)}>{favorite?"★":"☆"}</button><Link href={`/pachinko/${record.id}`}><PachinkoCoverImage record={record}/><div className="catalog-card-body"><h2>{record.displayNameZh||record.officialNameJa}</h2>{record.displayNameZh&&<p>{record.officialNameJa}</p>}<span>{record.manufacturer}</span><div className="catalog-estimator-badge record-only">{typeLabels[record.machineType]}</div><div className="catalog-card-status">機台說明 · 簡易紀錄</div></div></Link></article>})}</div>{visible.length<result.length&&<button className="secondary-button mt-4" onClick={()=>setLimit(value=>value+PAGE_SIZE)}>載入更多（已顯示 {visible.length} / {result.length}）</button>}</>:<div className="catalog-empty card"><strong>{mode==="favorites"?"還沒有收藏機台":mode==="recent"?"還沒有最近遊玩紀錄":"找不到符合條件的柏青哥"}</strong><p>{mode==="favorites"?"點卡片右上角的星號，就能收藏常玩的機台。":mode==="recent"?"查看機台或建立柏青哥紀錄後，就會出現在這裡。":"請更換名稱或清除類型篩選。"}</p>{mode!=="browse"&&<button className="secondary-button" onClick={()=>chooseMode("browse")}>查看全部機種</button>}</div>}
    <div className="notice mt-4">收錄 P-WORLD 2025 年至今的公開新台資料；機率與出玉只作規格說明，不預測中獎。中文名會依可靠譯名逐步補充。</div>
  </main>
}
