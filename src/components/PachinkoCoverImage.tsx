"use client";
import Image from "next/image";
import {useState} from "react";
import type {PachinkoCatalogRecord} from "@/types/pachinko";
const labels:Record<PachinkoCatalogRecord["machineType"],string>={smart_pachinko:"SMART PACHINKO",digital:"PACHINKO",hanemono:"HANEMONO",other:"PACHINKO"};
export function PachinkoCoverImage({record}:{record:PachinkoCatalogRecord}){const[failed,setFailed]=useState(false),source=record.sourceImageUrl;if(!source||failed)return<div className="catalog-card-art catalog-card-art-fallback pachinko-art"><span>{labels[record.machineType]}</span><b>🔴</b><small>{record.introducedAt?.slice(0,7).replace("-"," / ")??"DATE TBD"}</small></div>;return<div className="catalog-card-art catalog-card-photo"><Image src={`/api/pachinko-covers/${encodeURIComponent(record.id)}?source=${encodeURIComponent(source)}`} alt={`${record.officialNameJa} 機台外觀`} fill sizes="(max-width: 640px) 46vw, 220px" loading="lazy" unoptimized onError={()=>setFailed(true)}/><div className="catalog-card-photo-shade"/><span>{labels[record.machineType]}</span><small>{record.introducedAt?.slice(0,7).replace("-"," / ")??"DATE TBD"}</small></div>}
