import { catalogRepository } from "@/lib/catalog/repository.server";
import { CATALOG_COVER_MAX_BYTES } from "@/lib/catalog/cover";
import { readStoredCatalogCover,storeCatalogCover } from "@/lib/catalog/coverStorage.server";
import { canonicalPWorldImageUrl } from "@/lib/machine-guide/visualGuide";

export const dynamic="force-dynamic";

export async function GET(request:Request,{params}:{params:Promise<{catalogId:string}>}){
  const{catalogId}=await params,source=new URL(request.url).searchParams.get("source"),record=(await catalogRepository.list()).find(item=>item.id===catalogId);
  if(!record||!source)return new Response("Not found",{status:404});
  const canonical=canonicalPWorldImageUrl(source,record.sourceUrl),allowed=[record.sourceImageUrl,...record.sources.map(item=>item.sourceImageUrl)].filter((value):value is string=>Boolean(value)).map(value=>canonicalPWorldImageUrl(value,record.sourceUrl)).filter(Boolean);
  if(!canonical||!allowed.includes(canonical))return new Response("Invalid image source",{status:400});
  const stored=await readStoredCatalogCover(catalogId,canonical);
  if(stored)return imageResponse(stored,"stored");
  const upstream=await fetch(canonical,{headers:{Accept:"image/avif,image/webp,image/png,image/jpeg","User-Agent":"Slot Companion catalog cover","Referer":record.sourceUrl},cache:"no-store",signal:AbortSignal.timeout(12_000)});
  if(!upstream.ok)return new Response("Image unavailable",{status:upstream.status});
  const contentType=(upstream.headers.get("content-type")??"").split(";")[0].toLowerCase();
  if(!["image/jpeg","image/png","image/webp"].includes(contentType))return new Response("Invalid image",{status:415});
  const bytes=await upstream.arrayBuffer();
  if(!bytes.byteLength||bytes.byteLength>CATALOG_COVER_MAX_BYTES)return new Response("Image too large",{status:413});
  let storage="source";
  try{if(await storeCatalogCover(catalogId,canonical,bytes,contentType))storage="stored"}catch{}
  return new Response(bytes,{headers:imageHeaders(contentType,storage)});
}

function imageResponse(response:Response,storage:string){
  const contentType=(response.headers.get("content-type")??"application/octet-stream").split(";")[0].toLowerCase();
  if(!contentType.startsWith("image/"))return new Response("Invalid image",{status:415});
  return new Response(response.body,{headers:imageHeaders(contentType,storage)});
}

function imageHeaders(contentType:string,storage:string){
  return{"Content-Type":contentType,"Cache-Control":"public, max-age=86400, stale-while-revalidate=604800","X-Catalog-Cover-Storage":storage,"X-Content-Type-Options":"nosniff"};
}
