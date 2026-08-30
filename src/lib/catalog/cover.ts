import { createHash } from "node:crypto";

export const CATALOG_COVER_PREFIX="catalog-covers";
export const CATALOG_COVER_MAX_BYTES=1_000_000;

export function catalogCoverId(sourceImageUrl:string){
  return createHash("sha256").update(sourceImageUrl).digest("hex").slice(0,20);
}

function extension(contentType:string|null,sourceImageUrl:string){
  if(contentType?.includes("png"))return"png";
  if(contentType?.includes("webp"))return"webp";
  const match=new URL(sourceImageUrl).pathname.match(/\.([a-z0-9]+)$/i);
  return match?.[1]?.toLowerCase()==="png"?"png":match?.[1]?.toLowerCase()==="webp"?"webp":"jpg";
}

export function catalogCoverObjectPath(catalogId:string,sourceImageUrl:string,contentType:string|null=null){
  return`${CATALOG_COVER_PREFIX}/${catalogId}/${catalogCoverId(sourceImageUrl)}.${extension(contentType,sourceImageUrl)}`;
}

export function catalogCoverAssetUrl(catalogId:string,sourceImageUrl:string){
  return`/api/catalog-covers/${encodeURIComponent(catalogId)}?source=${encodeURIComponent(sourceImageUrl)}`;
}
