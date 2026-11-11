import "server-only";
import machineCatalogJson from "../../../data/machine-catalog.json";
import pachinkoCatalogJson from "../../../data/pachinko-catalog.json";
import {PWorldCatalogProvider} from "./providers/pworld";
import {parsePWorldPachinkoCalendar} from "@/lib/pachinko/pworld";
import {catalogMonth,newPachinkoCatalogRecords,newSlotCatalogRecords,validateMonthlyCatalogSource} from "./automation";
import {supabaseServerHeaders} from "./supabaseAuth";
import type {MachineCatalogRecord} from "@/types/catalog";
import type {PachinkoCatalogRecord} from "@/types/pachinko";

type CloudConfig={url:string;key:string};
const machineBaseline=machineCatalogJson as MachineCatalogRecord[];
const pachinkoBaseline=pachinkoCatalogJson as PachinkoCatalogRecord[];

function cloudConfig(environment:NodeJS.ProcessEnv=process.env):CloudConfig{
  const url=environment.SUPABASE_URL,key=environment.SUPABASE_SECRET_KEY??environment.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)throw new Error("Supabase Catalog 環境尚未設定。");
  return{url:url.replace(/\/$/,""),key};
}

async function cloudRecords<T>(config:CloudConfig,table:string,request:typeof fetch=fetch){
  const response=await request(`${config.url}/rest/v1/${table}?select=record&order=id.asc`,{headers:supabaseServerHeaders(config.key),cache:"no-store"});
  if(!response.ok)throw new Error(`${table} 讀取失敗（${response.status}）。`);
  return(await response.json()as Array<{record:T}>).map(row=>row.record);
}

async function cloudCount(config:CloudConfig,table:string,request:typeof fetch=fetch){
  const response=await request(`${config.url}/rest/v1/${table}?select=id&limit=1`,{headers:supabaseServerHeaders(config.key,{Prefer:"count=exact",Range:"0-0"}),cache:"no-store"});
  if(!response.ok)throw new Error(`${table} 健康查詢失敗（${response.status}）。`);
  const total=Number(response.headers.get("content-range")?.split("/").at(-1));
  if(!Number.isFinite(total))throw new Error(`${table} 未回傳有效筆數。`);
  return total;
}

async function upsertRows<T extends{id:string}>(config:CloudConfig,table:string,records:T[],request:typeof fetch=fetch){
  if(records.length===0)return;
  const rows=records.map(record=>({id:record.id,record,updated_at:new Date().toISOString()})),response=await request(`${config.url}/rest/v1/${table}?on_conflict=id`,{method:"POST",headers:supabaseServerHeaders(config.key,{"Content-Type":"application/json",Prefer:"resolution=merge-duplicates,return=minimal"}),body:JSON.stringify(rows),cache:"no-store"});
  if(!response.ok)throw new Error(`${table} 增量寫入失敗（${response.status}）。`);
}

async function pachinkoCandidates(month:string,retrievedAt:string,request:typeof fetch=fetch){
  const sourceUrl=`https://www.p-world.co.jp/database/machine/introduce_calendar.cgi?year_month=${month}`,response=await request(sourceUrl,{headers:{"User-Agent":"Pachi Companion scheduled catalog updater"},signal:AbortSignal.timeout(15000),cache:"no-store"});
  if(!response.ok)throw new Error(`P-WORLD Pachinko 月曆讀取失敗（${response.status}）。`);
  return parsePWorldPachinkoCalendar(await response.text(),sourceUrl,retrievedAt);
}

export async function runCatalogHealthCheck(request:typeof fetch=fetch,environment:NodeJS.ProcessEnv=process.env){
  const config=cloudConfig(environment),[slot,pachinko]=await Promise.all([cloudCount(config,"machine_catalog_records",request),cloudCount(config,"pachinko_catalog_records",request)]);
  return{ok:true,checkedAt:new Date().toISOString(),slot,pachinko};
}

export async function runScheduledCatalogUpdate(request:typeof fetch=fetch,environment:NodeJS.ProcessEnv=process.env,now=new Date()){
  const config=cloudConfig(environment),month=catalogMonth(now),retrievedAt=now.toISOString(),sourceUrl=`https://www.p-world.co.jp/database/machine/introduce_calendar.cgi?year_month=${month}`,provider=new PWorldCatalogProvider(request);
  const[slotCandidates,pachinkoCandidatesResult,slotCloud,pachinkoCloud]=await Promise.all([provider.fetchCandidates(sourceUrl),pachinkoCandidates(month,retrievedAt,request),cloudRecords<MachineCatalogRecord>(config,"machine_catalog_records",request),cloudRecords<PachinkoCatalogRecord>(config,"pachinko_catalog_records",request)]);
  validateMonthlyCatalogSource(month,slotCandidates,pachinkoCandidatesResult);
  const slotRows=newSlotCatalogRecords(slotCandidates,slotCloud,machineBaseline),pachinkoRows=newPachinkoCatalogRecords(pachinkoCandidatesResult,pachinkoCloud,pachinkoBaseline);
  if(slotRows.length>50||pachinkoRows.length>80)throw new Error("增量筆數超過安全上限。");
  await upsertRows(config,"machine_catalog_records",slotRows,request);
  await upsertRows(config,"pachinko_catalog_records",pachinkoRows,request);
  return{ok:true,month,updatedAt:new Date().toISOString(),slot:{source:slotCandidates.length,added:slotRows.length,total:slotCloud.length+slotRows.length},pachinko:{source:pachinkoCandidatesResult.length,added:pachinkoRows.length,total:pachinkoCloud.length+pachinkoRows.length}};
}
