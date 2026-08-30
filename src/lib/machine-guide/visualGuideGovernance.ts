import type { MachineGuideImage,VisualGuideAssetReport } from "../../types/machineGuide.ts";
import { MACHINE_GUIDE_COMPILER_REVISION } from "./storage.ts";
import { VISUAL_GUIDE_ASSET_REVISION,VISUAL_GUIDE_MAX_IMAGE_BYTES,VISUAL_GUIDE_MAX_IMAGES,VISUAL_GUIDE_WARNING_BYTES,visualGuideObjectPath } from "./visualGuide.ts";

export type VisualGuideAssetManifest={
  schemaVersion:1;
  catalogId:string;
  assetRevision:string;
  compilerRevision:string;
  generatedAt:string;
  assets:Array<{path:string;sourceImageUrl:string;byteSize:number;contentType:string}>;
  totals:{imageCount:number;totalBytes:number;maximumImageBytes:number};
};

export function uniqueVisualGuideImages(images:MachineGuideImage[]){
  return [...new Map(images.map(image=>[`${image.id}:${image.sourceImageUrl}`,image])).values()];
}

export function visualGuideCapacityLevel(imageCount:number,totalBytes:number):VisualGuideAssetReport["capacityLevel"]{
  if(imageCount>VISUAL_GUIDE_MAX_IMAGES||totalBytes>VISUAL_GUIDE_MAX_IMAGES*VISUAL_GUIDE_MAX_IMAGE_BYTES)return"blocked";
  return totalBytes>=VISUAL_GUIDE_WARNING_BYTES?"warning":"normal";
}

export function buildVisualGuideAssetManifest(catalogId:string,images:MachineGuideImage[],generatedAt=new Date().toISOString()):VisualGuideAssetManifest{
  const stored=images.filter((image):image is MachineGuideImage&{byteSize:number;contentType:string}=>image.storageStatus==="stored"&&image.byteSize!==null&&image.contentType!==null);
  const totalBytes=stored.reduce((sum,image)=>sum+image.byteSize,0),maximumImageBytes=Math.max(0,...stored.map(image=>image.byteSize));
  return{schemaVersion:1,catalogId,assetRevision:VISUAL_GUIDE_ASSET_REVISION,compilerRevision:MACHINE_GUIDE_COMPILER_REVISION,generatedAt,assets:stored.map(image=>({path:visualGuideObjectPath(catalogId,image),sourceImageUrl:image.sourceImageUrl,byteSize:image.byteSize,contentType:image.contentType})),totals:{imageCount:stored.length,totalBytes,maximumImageBytes}};
}

export function buildVisualGuideAssetReport(input:{images:MachineGuideImage[];deduplicatedCount:number;rejectedImageCount:number;cloud:boolean;cleanupStatus:VisualGuideAssetReport["cleanupStatus"];removedAssetCount:number;generatedAt?:string}):VisualGuideAssetReport{
  const totalBytes=input.images.reduce((sum,image)=>sum+(image.byteSize??0),0),maximumImageBytes=Math.max(0,...input.images.map(image=>image.byteSize??0));
  return{revision:VISUAL_GUIDE_ASSET_REVISION,imageCount:input.images.length,totalBytes,maximumImageBytes,deduplicatedCount:Math.max(0,input.deduplicatedCount),rejectedImageCount:Math.max(0,input.rejectedImageCount),storageMode:input.cloud?"cloud":"source",cleanupStatus:input.cleanupStatus,removedAssetCount:input.removedAssetCount,capacityLevel:visualGuideCapacityLevel(input.images.length,totalBytes),generatedAt:input.generatedAt??new Date().toISOString()};
}
