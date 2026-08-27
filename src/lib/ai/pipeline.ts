import type { MachineIdentificationResult } from "@/types";
import type { CatalogVisibleEvidence,MachineCatalogRecord } from "@/types/catalog";
import { searchCatalogRecords } from "../catalog/core.ts";
import { applyIdentityPrecisionGate } from "./precision.ts";

export interface TwoPhaseIdentityProvider{
  extractVisibleEvidence(image:{dataUrl:string;fileName:string;mimeType:string}):Promise<CatalogVisibleEvidence>;
  verifyMachine(image:{dataUrl:string;fileName:string;mimeType:string},evidence:CatalogVisibleEvidence,catalog:ReturnType<typeof searchCatalogRecords>):Promise<MachineIdentificationResult>;
}
export async function runIdentificationPipeline(options:{image:{dataUrl:string;fileName:string;mimeType:string};provider:TwoPhaseIdentityProvider;catalog:MachineCatalogRecord[];includeDebug?:boolean}){
  const evidence=await options.provider.extractVisibleEvidence(options.image);
  const searchQueryTerms=[...evidence.visibleOfficialTitleCandidates.map(item=>item.text),...evidence.searchTerms,...evidence.visibleFranchiseTerms,...evidence.visibleText];
  const manufacturerTerms=[...evidence.visibleManufacturerMarks,...evidence.manufacturerText];
  const shortlist=searchCatalogRecords(options.catalog,searchQueryTerms,manufacturerTerms,20);
  if(shortlist.length===0){const result:MachineIdentificationResult={status:evidence.status==="unknown"?"unknown":"uncertain",candidates:[],provider:"openai",researchStatus:"pending_new_machine"};return options.includeDebug?{...result,debug:{phase1Evidence:evidence,searchQueryTerms,shortlist:[],phase2:{status:result.status,selectedCatalogIds:[],decisionReasons:["Phase 2 skipped：Catalog shortlist 為空。"]}}}:result}
  const phase2=await options.provider.verifyMachine(options.image,evidence,shortlist),gated=applyIdentityPrecisionGate(phase2,evidence,shortlist);
  if(!options.includeDebug)return gated.result;
  const fallbackReasons=gated.result.candidates.length?gated.result.candidates.map(item=>item.reason):["Phase 2 rejected：模型未從非空 shortlist 選出候選。"];return{...gated.result,debug:{phase1Evidence:evidence,searchQueryTerms,shortlist:shortlist.map(item=>({id:item.id,officialNameJa:item.officialNameJa,score:item.searchScore,matchReasons:item.searchMatchReasons})),phase2:{status:gated.result.status,selectedCatalogIds:gated.result.candidates.map(item=>item.matchedCatalogId).filter((id):id is string=>Boolean(id)),decisionReasons:gated.decisionReasons.length?gated.decisionReasons:fallbackReasons}}};
}
