import { AI_CONFIG } from "@/lib/ai/config";
import { askSlotSelectionAssistant } from "@/lib/ai/slotSelection.server";
import { sanitizeSlotSelectionCandidates,sanitizeSlotSelectionGuides,sanitizeSlotSelectionMode,type SlotSelectionResolvedCandidate } from "@/lib/ai/slotSelection";
import { AIProviderError } from "@/lib/ai/types";
import { SELECTION_IMAGE_COMPRESSION } from "@/lib/ai/imageLimits";
import { catalogRepository } from "@/lib/catalog/repository.server";
export const runtime="nodejs";

export async function POST(request:Request){try{
  const contentLength=Number(request.headers.get("content-length")??0);if(contentLength>AI_CONFIG.maxRequestBytes)return Response.json({error:{code:"request_too_large",message:"候選照片總量過大，請減少照片後再試。"}},{status:413});
  if(!request.headers.get("content-type")?.includes("multipart/form-data"))return Response.json({error:{code:"invalid_request",message:"請重新送出選台資料。"}},{status:400});
  let form:FormData;try{form=await request.formData()}catch{return Response.json({error:{code:"invalid_request",message:"無法讀取這次選台資料。"}},{status:400})}
  const mode=sanitizeSlotSelectionMode(form.get("mode"));let rawCandidates:unknown,rawGuides:unknown;
  try{rawCandidates=JSON.parse(String(form.get("candidates")??"[]"));rawGuides=JSON.parse(String(form.get("guides")??"[]"))}catch{return Response.json({error:{code:"invalid_candidates",message:"候選資料格式不正確。"}},{status:400})}
  const candidates=sanitizeSlotSelectionCandidates(rawCandidates,mode);if(candidates.length===0)return Response.json({error:{code:"no_candidates",message:"請至少選擇一台 SLOT 候選。"}},{status:400});
  const records=await catalogRepository.list(),recordsById=new Map(records.map(record=>[record.id,record])),missing=candidates.find(candidate=>!recordsById.has(candidate.catalogId));if(missing)return Response.json({error:{code:"catalog_not_found",message:"其中一台候選已不在 SLOT 資料庫，請重新選擇。"}},{status:404});
  const guides=sanitizeSlotSelectionGuides(rawGuides,new Set(candidates.map(candidate=>candidate.catalogId))),guidesById=new Map(guides.map(guide=>[guide.catalogId,guide]));
  const resolved:SlotSelectionResolvedCandidate[]=candidates.map((candidate,index)=>{const record=recordsById.get(candidate.catalogId)!;return{catalog:{catalogId:record.id,officialNameJa:record.officialNameJa,displayNameZh:record.displayNameZh,manufacturer:record.manufacturer,machineType:record.machineType,introducedAt:record.introducedAt,sourceName:record.sourceName,sourceUrl:record.sourceUrl},currentGame:candidate.currentGame,note:candidate.note,guide:guidesById.get(candidate.catalogId)??null,photoIndex:form.get(`image-${index}`) instanceof File?index:null}});
  const photos:Array<{candidateIndex:number;dataUrl:string}>=[];let totalImageBytes=0;
  for(let index=0;index<resolved.length;index+=1){const image=form.get(`image-${index}`);if(!(image instanceof File)||image.size===0)continue;if(!image.type.startsWith("image/"))return Response.json({error:{code:"invalid_image",message:"候選照片只能使用圖片檔案。"}},{status:415});if(image.size>SELECTION_IMAGE_COMPRESSION.hardMaxBytes)return Response.json({error:{code:"image_too_large",message:"其中一張照片壓縮後仍過大，請重新選擇。"}},{status:413});totalImageBytes+=image.size;if(totalImageBytes>AI_CONFIG.maxRequestBytes-200_000)return Response.json({error:{code:"request_too_large",message:"候選照片總量過大，請減少照片後再試。"}},{status:413});const bytes=Buffer.from(await image.arrayBuffer());photos.push({candidateIndex:index,dataUrl:`data:${image.type};base64,${bytes.toString("base64")}`})}
  const question=typeof form.get("question")==="string"?String(form.get("question")).trim().slice(0,500):"";
  return Response.json({answer:await askSlotSelectionAssistant(mode,resolved,question,photos)});
}catch(error){if(error instanceof AIProviderError)return Response.json({error:{code:error.code,message:error.message}},{status:error.status});return Response.json({error:{code:"request_failed",message:"AI 選台助手發生錯誤，請稍後再試。"}},{status:500})}}
