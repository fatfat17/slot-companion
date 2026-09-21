import "server-only";
import {promises as fs} from "node:fs";
import path from "node:path";
import type {PachinkoCatalogRecord} from "@/types/pachinko";
import {supabaseServerHeaders} from "@/lib/catalog/supabaseAuth";
import {readWithFallback} from "@/lib/catalog/readFallback";

interface PachinkoCatalogRepository{list():Promise<PachinkoCatalogRecord[]>}
class JsonPachinkoCatalogRepository implements PachinkoCatalogRepository{constructor(private filePath=path.join(process.cwd(),"data","pachinko-catalog.json")){}async list(){try{return JSON.parse(await fs.readFile(this.filePath,"utf8"))as PachinkoCatalogRecord[]}catch{return[]}}}
class SupabasePachinkoCatalogRepository implements PachinkoCatalogRepository{constructor(private url:string,private key:string,private request:typeof fetch=fetch){}async list(){const response=await this.request(`${this.url.replace(/\/$/,"")}/rest/v1/pachinko_catalog_records?select=record&order=id.asc`,{headers:supabaseServerHeaders(this.key)});if(!response.ok)throw new Error(`Supabase Pachinko Catalog 讀取失敗（${response.status}）`);const rows=await response.json()as Array<{record:PachinkoCatalogRecord}>;return rows.map(row=>row.record)}}
class ReadFallbackPachinkoCatalogRepository implements PachinkoCatalogRepository{constructor(private primary:PachinkoCatalogRepository,private fallback:PachinkoCatalogRepository){}async list(){return readWithFallback(()=>this.primary.list(),()=>this.fallback.list(),error=>console.error("Supabase Pachinko Catalog 讀取失敗，已使用 repo JSON fallback。",error instanceof Error?error.message:"unknown error"))}}
export function createPachinkoCatalogRepository(environment:NodeJS.ProcessEnv=process.env):PachinkoCatalogRepository{const fallback=new JsonPachinkoCatalogRepository(),url=environment.SUPABASE_URL,key=environment.SUPABASE_SECRET_KEY??environment.SUPABASE_SERVICE_ROLE_KEY;return url&&key?new ReadFallbackPachinkoCatalogRepository(new SupabasePachinkoCatalogRepository(url,key),fallback):fallback}
export const pachinkoCatalogRepository=createPachinkoCatalogRepository();
