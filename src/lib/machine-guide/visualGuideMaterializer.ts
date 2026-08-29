import type { MachineGuide,MachineGuideImage } from "../../types/machineGuide.ts";
import { supabaseServerHeaders } from "../catalog/supabaseAuth.ts";
import { isVisualGuidePilotCatalog,VISUAL_GUIDE_BUCKET,VISUAL_GUIDE_MAX_IMAGE_BYTES,visualGuideAssetId,visualGuideAssetUrl,visualGuideObjectPath } from "./visualGuide.ts";

type CloudConfig={url:string;key:string};
type Requester=typeof fetch;
type ServerEnvironment=Record<string,string|undefined>;

function cloudConfig(environment:ServerEnvironment):CloudConfig|null{
  const url=environment.SUPABASE_URL,key=environment.SUPABASE_SECRET_KEY??environment.SUPABASE_SERVICE_ROLE_KEY;
  return url&&key?{url:url.replace(/\/$/,""),key}:null;
}

async function ensureBucket(config:CloudConfig,request:Requester){
  const response=await request(`${config.url}/storage/v1/bucket`,{method:"POST",headers:supabaseServerHeaders(config.key,{"Content-Type":"application/json"}),body:JSON.stringify({id:VISUAL_GUIDE_BUCKET,name:VISUAL_GUIDE_BUCKET,public:false,file_size_limit:VISUAL_GUIDE_MAX_IMAGE_BYTES,allowed_mime_types:["image/jpeg","image/png","image/webp"]})});
  if(response.ok||response.status===409)return;
  const body=await response.text();
  if(response.status===400&&/already exists|duplicate/i.test(body))return;
  throw new Error(`Supabase 圖片 bucket 建立失敗（${response.status}）`);
}

async function uploadAsset(config:CloudConfig,catalogId:string,image:MachineGuideImage,bytes:ArrayBuffer,contentType:string,request:Requester){
  const objectPath=visualGuideObjectPath(catalogId,{...image,contentType});
  const response=await request(`${config.url}/storage/v1/object/${VISUAL_GUIDE_BUCKET}/${objectPath}`,{method:"POST",headers:supabaseServerHeaders(config.key,{"Content-Type":contentType,"cache-control":"86400","x-upsert":"true"}),body:bytes});
  if(!response.ok)throw new Error(`Supabase 圖片保存失敗（${response.status}）`);
}

async function materializeOne(catalogId:string,image:MachineGuideImage,config:CloudConfig|null,request:Requester):Promise<MachineGuideImage>{
  const response=await request(image.sourceImageUrl,{headers:{Accept:"image/avif,image/webp,image/png,image/jpeg","User-Agent":"Slot Companion visual guide pilot","Referer":image.sourcePageUrl},cache:"no-store",signal:AbortSignal.timeout(12_000)});
  if(!response.ok)throw new Error(`圖片來源回應 ${response.status}`);
  const contentType=(response.headers.get("content-type")??"").split(";")[0].toLowerCase();
  if(!["image/jpeg","image/png","image/webp"].includes(contentType))throw new Error("來源不是可保存的圖片格式");
  const bytes=await response.arrayBuffer();
  if(bytes.byteLength===0||bytes.byteLength>VISUAL_GUIDE_MAX_IMAGE_BYTES)throw new Error(`圖片大小不符合限制（${bytes.byteLength} bytes）`);
  if(config)await uploadAsset(config,catalogId,image,bytes,contentType,request);
  return{...image,displayUrl:visualGuideAssetUrl(catalogId,image.sourceImageUrl),byteSize:bytes.byteLength,contentType,storageStatus:config?"stored":"source"};
}

export async function materializeVisualGuideAssets(guide:MachineGuide,environment:ServerEnvironment=process.env,request:Requester=fetch){
  if(!isVisualGuidePilotCatalog(guide.catalogId)||!guide.images?.length)return guide;
  const config=cloudConfig(environment),warnings:string[]=[];
  if(config)try{await ensureBucket(config,request)}catch(error){warnings.push(error instanceof Error?error.message:"Supabase 圖片儲存初始化失敗");}
  const canStore=config&&!warnings.length?config:null,next:MachineGuideImage[]=[];
  for(let index=0;index<guide.images.length;index+=3){
    const batch=guide.images.slice(index,index+3);
    const settled=await Promise.allSettled(batch.map(image=>materializeOne(guide.catalogId,image,canStore,request)));
    settled.forEach((result,at)=>{if(result.status==="fulfilled")next.push(result.value);else warnings.push(`${batch[at].captionZh}：${result.reason instanceof Error?result.reason.message:"圖片處理失敗"}`);});
  }
  return{...guide,images:next,sourceWarnings:[...new Set([...(guide.sourceWarnings??[]),...warnings])]};
}

export async function readStoredVisualGuideAsset(catalogId:string,sourceImageUrl:string,environment:ServerEnvironment=process.env,request:Requester=fetch){
  const config=cloudConfig(environment);
  if(!config)return null;
  const image:MachineGuideImage={id:visualGuideAssetId(sourceImageUrl),sectionKey:"features",altJa:"",captionZh:"",sourcePageUrl:"",sourceImageUrl,displayUrl:"",width:null,height:null,byteSize:null,contentType:null,storageStatus:"stored"};
  const objectPath=visualGuideObjectPath(catalogId,image);
  const response=await request(`${config.url}/storage/v1/object/authenticated/${VISUAL_GUIDE_BUCKET}/${objectPath}`,{headers:supabaseServerHeaders(config.key)});
  return response.ok?response:null;
}
