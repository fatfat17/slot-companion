import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { CatalogImportDecision,MachineCatalogRecord } from "@/types/catalog";
import { applyCatalogDecisions,searchCatalogRecords } from "./core";

export interface MachineCatalogRepository{list():Promise<MachineCatalogRecord[]>;search(terms:string[],manufacturers?:string[],limit?:number):Promise<MachineCatalogRecord[]>;approve(decisions:CatalogImportDecision[]):Promise<{processed:number;imported:number;merged:number;skipped:number;total:number}>}
export class JsonMachineCatalogRepository implements MachineCatalogRepository{
  constructor(private filePath=path.join(process.cwd(),"data","machine-catalog.json")){}
  async list(){try{return JSON.parse(await fs.readFile(this.filePath,"utf8")) as MachineCatalogRecord[]}catch{return[]}}
  async search(terms:string[],manufacturers:string[]=[],limit=20){return searchCatalogRecords(await this.list(),terms,manufacturers,limit)}
  async approve(decisions:CatalogImportDecision[]){const result=applyCatalogDecisions(await this.list(),decisions);const temp=`${this.filePath}.tmp`;await fs.writeFile(temp,`${JSON.stringify(result.records,null,2)}\n`,"utf8");await fs.rename(temp,this.filePath);return{processed:decisions.length,imported:result.imported,merged:result.merged,skipped:result.skipped,total:result.total}}
}
export class SupabaseMachineCatalogRepository implements MachineCatalogRepository{
  constructor(private url:string,private serviceRoleKey:string,private request:typeof fetch=fetch){}
  private headers(extra:HeadersInit={}):HeadersInit{return{apikey:this.serviceRoleKey,Authorization:`Bearer ${this.serviceRoleKey}`,...extra}}
  async list(){const response=await this.request(`${this.url.replace(/\/$/,"")}/rest/v1/machine_catalog_records?select=record&order=id.asc`,{headers:this.headers()});if(!response.ok)throw new Error(`Supabase Catalog 讀取失敗（${response.status}）`);const rows=await response.json() as Array<{record:MachineCatalogRecord}>;return rows.map(row=>row.record)}
  async search(terms:string[],manufacturers:string[]=[],limit=20){return searchCatalogRecords(await this.list(),terms,manufacturers,limit)}
  async approve(decisions:CatalogImportDecision[]){const result=applyCatalogDecisions(await this.list(),decisions),rows=result.records.map(record=>({id:record.id,record,updated_at:new Date().toISOString()}));const response=await this.request(`${this.url.replace(/\/$/,"")}/rest/v1/machine_catalog_records?on_conflict=id`,{method:"POST",headers:this.headers({"Content-Type":"application/json",Prefer:"resolution=merge-duplicates,return=minimal"}),body:JSON.stringify(rows)});if(!response.ok)throw new Error(`Supabase Catalog 寫入失敗（${response.status}）`);return{processed:decisions.length,imported:result.imported,merged:result.merged,skipped:result.skipped,total:result.total}}
}
export function createCatalogRepository(environment:NodeJS.ProcessEnv=process.env):MachineCatalogRepository{const url=environment.SUPABASE_URL,key=environment.SUPABASE_SERVICE_ROLE_KEY;return url&&key?new SupabaseMachineCatalogRepository(url,key):new JsonMachineCatalogRepository()}
export const catalogRepository=createCatalogRepository();
