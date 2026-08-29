import { catalogRepository } from "@/lib/catalog/repository.server";
import { canonicalPWorldImageUrl } from "@/lib/machine-guide/visualGuide";
import { readStoredVisualGuideAsset } from "@/lib/machine-guide/visualGuideStorage.server";

export const dynamic="force-dynamic";

const CATALOG_ID_CACHE_TTL_MS=60_000;
let catalogIdCache:{expiresAt:number;ids:Set<string>}|undefined;

async function catalogContains(catalogId:string){
  const now=Date.now();
  if(!catalogIdCache||catalogIdCache.expiresAt<=now){
    catalogIdCache={expiresAt:now+CATALOG_ID_CACHE_TTL_MS,ids:new Set((await catalogRepository.list()).map(record=>record.id))};
  }
  return catalogIdCache.ids.has(catalogId);
}

export async function GET(request:Request,{params}:{params:Promise<{catalogId:string}>}){
  const{catalogId}=await params,source=new URL(request.url).searchParams.get("source");
  if(!(await catalogContains(catalogId))||!source)return new Response("Not found",{status:404});
  const sourceImageUrl=canonicalPWorldImageUrl(source,"https://www.p-world.co.jp/");
  if(!sourceImageUrl)return new Response("Invalid image source",{status:400});
  const stored=await readStoredVisualGuideAsset(catalogId,sourceImageUrl);
  const response=stored??await fetch(sourceImageUrl,{headers:{Accept:"image/avif,image/webp,image/png,image/jpeg","User-Agent":"Slot Companion visual guide pilot"},cache:"no-store",signal:AbortSignal.timeout(12_000)});
  if(!response.ok)return new Response("Image unavailable",{status:response.status});
  const contentType=response.headers.get("content-type")??"application/octet-stream";
  if(!contentType.startsWith("image/"))return new Response("Invalid image",{status:415});
  return new Response(response.body,{headers:{"Content-Type":contentType,"Cache-Control":"private, max-age=3600, stale-while-revalidate=86400","X-Content-Type-Options":"nosniff"}});
}
