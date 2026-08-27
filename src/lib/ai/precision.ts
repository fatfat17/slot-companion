import type { MachineIdentificationResult } from "@/types";
import type { CatalogVisibleEvidence } from "@/types/catalog";
import type { MachineCatalogEntry } from "./matching.ts";
import { searchCatalogRecords } from "../catalog/core.ts";

const romanNumerals=new Set(["II","III","IV","V","VI"]);
function normalized(value:string){return value.normalize("NFKC").toUpperCase().replace(/[‐‑‒–—―ー]/g,"-").replace(/\s+/g," ").trim()}
export function identityVersionTokens(value:string){const text=normalized(value),tokens=new Set<string>();for(const match of text.matchAll(/RE\s*[:\-]?\s*(\d+)/g))tokens.add(`RE:${match[1]}`);for(const match of text.matchAll(/(?:^|[^A-Z0-9])(II|III|IV|V|VI)(?:$|[^A-Z0-9])/g))if(romanNumerals.has(match[1]))tokens.add(match[1]);for(const match of text.matchAll(/(?:^|[^A-Z0-9])(\d+)(?:$|[^A-Z0-9])/g))tokens.add(match[1]);for(const match of text.matchAll(/V\s*-\s*(\d+)/g))tokens.add(`V-${match[1]}`);return[...tokens]}
export function hasVersionConflict(visibleTitle:string,catalogTitle:string){const visible=identityVersionTokens(visibleTitle),catalog=identityVersionTokens(catalogTitle);if(visible.length===0)return false;const specific=visible.filter(token=>/^RE:|^V-|^\d+$/.test(token));return specific.length>0?!specific.some(token=>catalog.includes(token)):!visible.some(token=>catalog.includes(token))}
function titleAlignment(title:string,record:MachineCatalogEntry){const searchable={...record,sourceName:"",sourceUrl:"",retrievedAt:"",verified:false,catalogStatus:"reviewed" as const,sources:[]};return searchCatalogRecords([searchable],[title],[],1)[0]}

export function applyIdentityPrecisionGate(result:MachineIdentificationResult,evidence:CatalogVisibleEvidence,shortlist:MachineCatalogEntry[]){
  const officialTitles=evidence.visibleOfficialTitleCandidates.filter(item=>item.confidence>=.75),decisionReasons:string[]=[];let rejected=false;
  const candidates=result.candidates.map(candidate=>{
    const record=candidate.matchedCatalogId?shortlist.find(item=>item.id===candidate.matchedCatalogId):undefined;
    if(result.status!=="identified"||officialTitles.length===0)return candidate;
    if(!record){rejected=true;const reason="Phase 2 rejected：高信心正式標題存在，但候選沒有有效 Catalog match。";decisionReasons.push(reason);return{...candidate,identityBasis:"inferred" as const,confidence:Math.min(candidate.confidence,.49),reason:`${candidate.reason} ${reason}`}}
    const conflicts=officialTitles.filter(item=>hasVersionConflict(item.text,record.officialNameJa));
    if(conflicts.length){rejected=true;const reason=`Phase 2 rejected：版本／續作 token 衝突（可見：${conflicts.map(item=>item.text).join("、")}；Catalog：${record.officialNameJa}）。`;decisionReasons.push(reason);return{...candidate,identityBasis:"inferred" as const,confidence:Math.min(candidate.confidence,.49),reason:`${candidate.reason} ${reason}`}}
    const aligned=officialTitles.some(item=>titleAlignment(item.text,record)?.searchScore>=90);
    if(!aligned){rejected=true;const reason=`Phase 2 rejected：可見正式標題與 Catalog officialName / alias 一致度不足（${record.officialNameJa}）。`;decisionReasons.push(reason);return{...candidate,identityBasis:"inferred" as const,confidence:Math.min(candidate.confidence,.49),reason:`${candidate.reason} ${reason}`}}
    decisionReasons.push(`Phase 2 accepted：正式標題與 ${record.officialNameJa} 一致，且無版本衝突。`);return candidate;
  });
  return{result:{...result,status:rejected?"uncertain" as const:result.status,candidates},decisionReasons};
}
