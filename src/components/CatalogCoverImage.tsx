"use client";

import Image from "next/image";
import { useState } from "react";
import type { MachineCatalogRecord } from "@/types/catalog";

function shortType(record:MachineCatalogRecord){
  if(/スマスロ|L/.test(record.machineType)||/^L/.test(record.officialNameJa))return"SMART SLOT";
  return"PACHISLOT";
}

export function CatalogCoverImage({record}:{record:MachineCatalogRecord}){
  const[failed,setFailed]=useState(false),source=record.sourceImageUrl;
  if(!source||failed)return<div className="catalog-card-art catalog-card-art-fallback"><span>{shortType(record)}</span><b>🎰</b><small>{record.introducedAt?.slice(0,7).replace("-"," / ")??"DATE TBD"}</small></div>;
  const src=`/api/catalog-covers/${encodeURIComponent(record.id)}?source=${encodeURIComponent(source)}`;
  return <div className="catalog-card-art catalog-card-photo"><Image src={src} alt={`${record.officialNameJa} 機台外觀`} fill sizes="(max-width: 640px) 46vw, 220px" loading="lazy" unoptimized onError={()=>setFailed(true)}/><div className="catalog-card-photo-shade"/><span>{shortType(record)}</span><small>{record.introducedAt?.slice(0,7).replace("-"," / ")??"DATE TBD"}</small></div>;
}
