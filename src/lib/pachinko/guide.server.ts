import "server-only";
import type {PachinkoCatalogRecord,PachinkoGuide} from "@/types/pachinko";
import {parsePWorldPachinkoGuide} from "./pworld";

export async function loadPachinkoGuide(record:PachinkoCatalogRecord):Promise<PachinkoGuide>{
  try{const response=await fetch(record.sourceUrl,{headers:{"User-Agent":"Slot Companion guide reader"},next:{revalidate:86400},signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error(`P-WORLD ${response.status}`);return parsePWorldPachinkoGuide(await response.text(),record,new Date().toISOString())}
  catch{return{catalogId:record.id,status:"partial",facts:[],gameFlow:[],playNotes:["目前無法取得機台規格；Catalog 身分與來源連結仍可使用。"],sourceName:record.sourceName,sourceUrl:record.sourceUrl,retrievedAt:new Date().toISOString()}}
}
