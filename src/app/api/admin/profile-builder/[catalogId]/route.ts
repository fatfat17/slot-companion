import { machines } from "@/data/machines";
import { catalogRepository } from "@/lib/catalog/repository.server";
import { addSourceToDraft,applyExtraction,approveProfileDraft,createProfileDraft,rejectProfileDraft,resolveDraftMetric,reviewDraftEvidence,reviewSmartCounterSuggestion } from "@/lib/profile-builder/core";
import { profileDraftRepository } from "@/lib/profile-builder/repository.server";
import { providerForSource,validatePublicSourceUrl } from "@/lib/profile-builder/providers/index.server";
import { buildPublishPreview,createPublishedVersion } from "@/lib/profile-promotion/core";
import { publishedProfileRepository } from "@/lib/profile-promotion/repository.server";

type Context={params:Promise<{catalogId:string}>};
export async function GET(_request:Request,{params}:Context){if(process.env.NODE_ENV==="production")return Response.json({error:"Not found"},{status:404});const{catalogId}=await params;return Response.json({draft:await profileDraftRepository.get(catalogId)})}
export async function POST(request:Request,{params}:Context){if(process.env.NODE_ENV==="production")return Response.json({error:"Not found"},{status:404});try{const{catalogId}=await params,record=(await catalogRepository.list()).find(item=>item.id===catalogId);if(!record)return Response.json({error:"Catalog record 不存在"},{status:404});const machine=machines.find(item=>(item.catalogId??item.id)===catalogId),body=await request.json() as {action?:string;sourceUrl?:string;approvedIds?:string[];rejectedIds?:string[];reason?:string;metricKey?:string;resolutionType?:string;selectedEvidenceIds?:string[];rejectedEvidenceIds?:string[];note?:string};let draft=await profileDraftRepository.get(catalogId);
    if(body.action==="create"){const created=!draft;draft=draft??createProfileDraft(catalogId,machine);return Response.json({draft:await profileDraftRepository.save(draft),created})}
    if(!draft)return Response.json({error:"請先建立 Profile Draft"},{status:409});
    if(body.action==="add-source"){const url=validatePublicSourceUrl(body.sourceUrl??"");draft=addSourceToDraft(draft,url.toString());draft=await profileDraftRepository.save(draft);return Response.json({draft})}
    if(body.action==="extract"){const url=validatePublicSourceUrl(body.sourceUrl??"");draft=addSourceToDraft(draft,url.toString());try{draft=applyExtraction(draft,await providerForSource(url).extract(url))}catch(error){draft={...draft,updatedAt:new Date().toISOString(),sources:draft.sources.map(item=>item.sourceUrl===url.toString()?{...item,status:"failed",error:error instanceof Error?error.message:"Extraction failed"}:item)};await profileDraftRepository.save(draft);throw error}return Response.json({draft:await profileDraftRepository.save(draft)})}
    if(body.action==="review"){draft=reviewDraftEvidence(draft,body.approvedIds??[],body.rejectedIds??[]);return Response.json({draft:await profileDraftRepository.save(draft)})}
    if(body.action==="review-counter"){draft=reviewSmartCounterSuggestion(draft,String(body.reason??""),true);return Response.json({draft:await profileDraftRepository.save(draft)})}
    if(body.action==="resolve-metric"){const resolutionType=body.resolutionType;if(resolutionType!=="source_selected"&&resolutionType!=="merged"&&resolutionType!=="rejected")return Response.json({error:"不支援的 Resolution 類型"},{status:400});draft=resolveDraftMetric(draft,String(body.metricKey??""),resolutionType,body.selectedEvidenceIds??[],body.rejectedEvidenceIds??[],String(body.note??""));return Response.json({draft:await profileDraftRepository.save(draft)})}
    if(body.action==="publish-preview"){const active=await publishedProfileRepository.active(catalogId),preview=buildPublishPreview(active?.machine??machine!,draft,active?.profileVersion??0);return Response.json({draft,preview})}
    if(body.action==="publish"){const active=await publishedProfileRepository.active(catalogId),base=active?.machine??machine!,preview=buildPublishPreview(base,draft,active?.profileVersion??0);if(!preview.canPublish)return Response.json({error:"Publish dependency validation failed",preview},{status:422});const record=await publishedProfileRepository.publish(catalogId,createPublishedVersion(preview),base);return Response.json({draft,preview,publication:record})}
    if(body.action==="rollback"){const record=await publishedProfileRepository.rollback(catalogId);return Response.json({draft,publication:record})}
    if(body.action==="approve"){draft=approveProfileDraft(draft);return Response.json({draft:await profileDraftRepository.save(draft)})}
    if(body.action==="reject"){draft=rejectProfileDraft(draft,body.reason??"");return Response.json({draft:await profileDraftRepository.save(draft)})}
    return Response.json({error:"不支援的操作"},{status:400});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Profile Builder 操作失敗"},{status:422})}}
