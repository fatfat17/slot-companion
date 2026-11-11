import "server-only";
import {supabaseServerHeaders} from "./supabaseAuth";

type CloudConfig={url:string;key:string};

function cloudConfig(environment:NodeJS.ProcessEnv=process.env):CloudConfig{
  const url=environment.SUPABASE_URL,key=environment.SUPABASE_SECRET_KEY??environment.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)throw new Error("Supabase Catalog 環境尚未設定。");
  return{url:url.replace(/\/$/,""),key};
}

async function cloudCount(config:CloudConfig,table:string,request:typeof fetch=fetch){
  const response=await request(`${config.url}/rest/v1/${table}?select=id&limit=1`,{headers:supabaseServerHeaders(config.key,{Prefer:"count=exact",Range:"0-0"}),cache:"no-store"});
  if(!response.ok)throw new Error(`${table} 健康查詢失敗（${response.status}）。`);
  const total=Number(response.headers.get("content-range")?.split("/").at(-1));
  if(!Number.isFinite(total))throw new Error(`${table} 未回傳有效筆數。`);
  return total;
}

export async function runCatalogHealthCheck(request:typeof fetch=fetch,environment:NodeJS.ProcessEnv=process.env){
  const config=cloudConfig(environment),slot=await cloudCount(config,"machine_catalog_records",request);
  return{ok:true,checkedAt:new Date().toISOString(),slot};
}
