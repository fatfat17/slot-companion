import "server-only";
import { supabaseServerHeaders } from "@/lib/catalog/supabaseAuth";
import { CATALOG_COVER_MAX_BYTES,catalogCoverObjectPath } from "@/lib/catalog/cover";
import { VISUAL_GUIDE_BUCKET } from "@/lib/machine-guide/visualGuide";

type CloudConfig={url:string;key:string};
type Requester=typeof fetch;
type ServerEnvironment=Record<string,string|undefined>;

function cloudConfig(environment:ServerEnvironment):CloudConfig|null{
  const url=environment.SUPABASE_URL,key=environment.SUPABASE_SECRET_KEY??environment.SUPABASE_SERVICE_ROLE_KEY;
  return url&&key?{url:url.replace(/\/$/,""),key}:null;
}

async function ensureBucket(config:CloudConfig,request:Requester){
  const response=await request(`${config.url}/storage/v1/bucket`,{method:"POST",headers:supabaseServerHeaders(config.key,{"Content-Type":"application/json"}),body:JSON.stringify({id:VISUAL_GUIDE_BUCKET,name:VISUAL_GUIDE_BUCKET,public:false,file_size_limit:CATALOG_COVER_MAX_BYTES,allowed_mime_types:["image/jpeg","image/png","image/webp"]})});
  if(response.ok||response.status===409)return;
  const body=await response.text();
  if(response.status===400&&/already exists|duplicate/i.test(body))return;
  throw new Error(`Supabase 封面 bucket 建立失敗（${response.status}）`);
}

export async function readStoredCatalogCover(catalogId:string,sourceImageUrl:string,environment:ServerEnvironment=process.env,request:Requester=fetch){
  const config=cloudConfig(environment);
  if(!config)return null;
  const base=`${config.url}/storage/v1/object/authenticated/${VISUAL_GUIDE_BUCKET}/${catalogCoverObjectPath(catalogId,sourceImageUrl)}`;
  for(const extension of ["jpg","png","webp"]){
    const response=await request(base.replace(/\.[a-z0-9]+$/i,`.${extension}`),{headers:supabaseServerHeaders(config.key)});
    if(response.ok)return response;
  }
  return null;
}

export async function storeCatalogCover(catalogId:string,sourceImageUrl:string,bytes:ArrayBuffer,contentType:string,environment:ServerEnvironment=process.env,request:Requester=fetch){
  const config=cloudConfig(environment);
  if(!config)return false;
  await ensureBucket(config,request);
  const response=await request(`${config.url}/storage/v1/object/${VISUAL_GUIDE_BUCKET}/${catalogCoverObjectPath(catalogId,sourceImageUrl,contentType)}`,{method:"POST",headers:supabaseServerHeaders(config.key,{"Content-Type":contentType,"cache-control":"604800","x-upsert":"true"}),body:bytes});
  if(!response.ok)throw new Error(`Supabase 封面保存失敗（${response.status}）`);
  return true;
}
