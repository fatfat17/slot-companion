import {findDuplicate,importCatalogCandidate,normalizeCatalogName} from "./core.ts";
import type {MachineCatalogCandidate,MachineCatalogRecord} from "@/types/catalog";
import type {PachinkoCatalogRecord} from "@/types/pachinko";

const MAX_MONTHLY_SLOT_RECORDS=50;
const MAX_MONTHLY_PACHINKO_RECORDS=80;

function isPWorldMachineUrl(value:string){
  try{const url=new URL(value);return url.protocol==="https:"&&(url.hostname==="www.p-world.co.jp"||url.hostname==="p-world.co.jp")&&/^\/machine\/database\/\d+$/.test(url.pathname)}catch{return false}
}

function assertUnique(values:string[],label:string){
  if(new Set(values).size!==values.length)throw new Error(`${label} 含有重複資料。`);
}

export function isAuthorizedCronRequest(authorization:string|null,secret:string|undefined){
  return Boolean(secret&&authorization===`Bearer ${secret}`);
}

export function catalogMonth(date=new Date(),timeZone="Asia/Tokyo"){
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone,year:"numeric",month:"2-digit"}).formatToParts(date),year=parts.find(part=>part.type==="year")?.value,month=parts.find(part=>part.type==="month")?.value;
  if(!year||!month)throw new Error("無法計算排程月份。");
  return`${year}-${month}`;
}

export function validateMonthlyCatalogSource(month:string,slot:MachineCatalogCandidate[],pachinko:PachinkoCatalogRecord[]){
  if(slot.length<1||slot.length>MAX_MONTHLY_SLOT_RECORDS)throw new Error(`SLOT 當月來源數量異常（${slot.length}）。`);
  if(pachinko.length<1||pachinko.length>MAX_MONTHLY_PACHINKO_RECORDS)throw new Error(`Pachinko 當月來源數量異常（${pachinko.length}）。`);
  for(const candidate of slot){
    if(!candidate.officialNameJa||!candidate.manufacturer||!candidate.introducedAt?.startsWith(month)||!candidate.sourceImageUrl||!isPWorldMachineUrl(candidate.sourceUrl))throw new Error("SLOT 當月來源欄位不完整或不屬於 P-WORLD。");
  }
  for(const record of pachinko){
    if(!record.officialNameJa||!record.manufacturer||!record.introducedAt?.startsWith(month)||!record.sourceImageUrl||!isPWorldMachineUrl(record.sourceUrl))throw new Error("Pachinko 當月來源欄位不完整或不屬於 P-WORLD。");
  }
  assertUnique(slot.map(item=>item.sourceUrl),"SLOT 當月來源");
  assertUnique(pachinko.map(item=>item.id),"Pachinko 當月 ID");
  assertUnique(pachinko.map(item=>item.sourceUrl),"Pachinko 當月來源");
}

export function newSlotCatalogRecords(candidates:MachineCatalogCandidate[],cloud:MachineCatalogRecord[],baseline:MachineCatalogRecord[]){
  const known=[...cloud,...baseline],cloudIds=new Set(cloud.map(record=>record.id)),rows:MachineCatalogRecord[]=[];
  for(const candidate of candidates){
    const existing=known.find(record=>record.sourceUrl===candidate.sourceUrl)??findDuplicate(candidate,known),record=existing??importCatalogCandidate(candidate);
    const cloudDuplicate=cloud.find(item=>item.sourceUrl===candidate.sourceUrl)??findDuplicate(candidate,cloud);
    if(cloudDuplicate||cloudIds.has(record.id))continue;
    rows.push(record);cloudIds.add(record.id);known.push(record);
  }
  return rows;
}

export function newPachinkoCatalogRecords(candidates:PachinkoCatalogRecord[],cloud:PachinkoCatalogRecord[],baseline:PachinkoCatalogRecord[]){
  const cloudIds=new Set(cloud.map(record=>record.id)),cloudNames=new Set(cloud.map(record=>normalizeCatalogName(record.officialNameJa))),baselineById=new Map(baseline.map(record=>[record.id,record])),rows:PachinkoCatalogRecord[]=[];
  for(const candidate of candidates){
    const record=baselineById.get(candidate.id)??candidate,name=normalizeCatalogName(record.officialNameJa);
    if(cloudIds.has(record.id)||cloudNames.has(name))continue;
    rows.push(record);cloudIds.add(record.id);cloudNames.add(name);
  }
  return rows;
}
