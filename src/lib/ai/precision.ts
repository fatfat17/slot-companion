import type { MachineIdentificationResult } from "@/types";
import type { CatalogVisibleEvidence } from "@/types/catalog";
import type { MachineCatalogEntry } from "./matching.ts";
import { normalizeIdentityTitle,searchCatalogRecords } from "../catalog/core.ts";

const romanNumerals=new Set(["II","III","IV","V","VI"]);
function normalized(value:string){return value.normalize("NFKC").toUpperCase().replace(/[‐‑‒–—―ー]/g,"-").replace(/\s+/g," ").trim()}
export function identityVersionTokens(value:string){
  const text=normalized(value),tokens=new Set<string>();
  for(const match of text.matchAll(/RE\s*[:\-]?\s*(\d+)/g))tokens.add(`RE:${match[1]}`);
  for(const match of text.matchAll(/V\s*-\s*(\d+)/g))tokens.add(`V-${match[1]}`);
  const standalone=text.replace(/RE\s*[:\-]?\s*\d+/g," ").replace(/V\s*-\s*\d+/g," ");
  for(const match of standalone.matchAll(/(?:^|[^A-Z0-9])(II|III|IV|V|VI)(?:$|[^A-Z0-9])/g))if(romanNumerals.has(match[1]))tokens.add(match[1]);
  for(const match of standalone.matchAll(/(?:^|[^A-Z0-9])(\d+)(?:$|[^A-Z0-9])/g))tokens.add(match[1]);
  return[...tokens];
}
export function hasVersionConflict(visibleTitle:string,catalogTitle:string){const visible=identityVersionTokens(visibleTitle),catalog=identityVersionTokens(catalogTitle);return visible.length>0&&!visible.every(token=>catalog.includes(token))}
function titleAlignment(title:string,record:MachineCatalogEntry){const searchable={...record,sourceName:"",sourceUrl:"",retrievedAt:"",verified:false,catalogStatus:"reviewed" as const,sources:[]};return searchCatalogRecords([searchable],[title],[],1)[0]}
function comparableTitles(record:MachineCatalogEntry){return[record.officialNameJa,...record.aliases,record.displayNameZh].filter(Boolean).map(normalizeIdentityTitle)}
function exactCoreTitleMatch(title:string,record:MachineCatalogEntry){const normalizedTitle=normalizeIdentityTitle(title);return normalizedTitle.length>=4&&comparableTitles(record).includes(normalizedTitle)}
function normalizedManufacturer(value:string){return value.normalize("NFKC").toLocaleLowerCase().replace(/株式会社|有限会社|㈱|メーカー|製|ロゴ|[\s\-‐‑‒–—―ー・･·_~～!！'’"“”/／]/g,"")}
function manufacturerConflict(evidence:CatalogVisibleEvidence,record:MachineCatalogEntry){const marks=evidence.visibleManufacturerMarks.map(normalizedManufacturer).filter(mark=>mark&&!mark.includes("不明")&&!mark.includes("unknown")&&!mark.includes("判別不可")),catalogMarks=[record.manufacturer,record.brand].map(normalizedManufacturer).filter(Boolean);return marks.length>0&&!marks.some(mark=>catalogMarks.some(catalogMark=>catalogMark.includes(mark)||mark.includes(catalogMark)))}
function uniqueExactTitleRecord(titles:Array<{text:string}>,shortlist:MachineCatalogEntry[]){const matches=shortlist.filter(record=>titles.some(title=>exactCoreTitleMatch(title.text,record)));return matches.length===1?matches[0]:undefined}
function candidateMatchesOfficialTitle(candidate:MachineIdentificationResult["candidates"][number],titles:Array<{text:string}>){const candidateNames=[candidate.machineNameJa,candidate.machineNameZh].filter(Boolean).map(normalizeIdentityTitle);return titles.some(item=>{const title=normalizeIdentityTitle(item.text);return title.length>=4&&candidateNames.includes(title)})}

export function applyIdentityPrecisionGate(result:MachineIdentificationResult,evidence:CatalogVisibleEvidence,shortlist:MachineCatalogEntry[]){
  const officialTitles=evidence.visibleOfficialTitleCandidates.filter(item=>item.confidence>=.75),decisionReasons:string[]=[];let rejected=false;
  const deterministicRecord=uniqueExactTitleRecord(officialTitles,shortlist);
  const candidates=result.candidates.map(candidate=>{
    let record=candidate.matchedCatalogId?shortlist.find(item=>item.id===candidate.matchedCatalogId):undefined;
    const candidateMatchesVisibleTitle=candidateMatchesOfficialTitle(candidate,officialTitles);
    if(deterministicRecord&&candidateMatchesVisibleTitle&&manufacturerConflict(evidence,deterministicRecord)){rejected=true;const reason=`Phase 2 rejected：圖片中的 manufacturer 與 Catalog（${deterministicRecord.manufacturer}）明確衝突。`;decisionReasons.push(reason);return{...candidate,identityBasis:"inferred" as const,confidence:Math.min(candidate.confidence,.49),reason:`${candidate.reason} ${reason}`}}
    if(deterministicRecord&&candidateMatchesVisibleTitle&&!manufacturerConflict(evidence,deterministicRecord)){
      record=deterministicRecord;
      candidate={...candidate,machineNameJa:record.officialNameJa,machineNameZh:record.displayNameZh,manufacturer:record.manufacturer||"不明",matchedCatalogId:record.id,identityBasis:"catalog_match" as const};
      decisionReasons.push(`Deterministic accepted：移除機種類型前綴後，正式標題唯一匹配 ${record.officialNameJa}。`);
    }
    if(officialTitles.length===0)return candidate;
    if(record&&manufacturerConflict(evidence,record)){rejected=true;const reason=`Phase 2 rejected：圖片中的 manufacturer 與 Catalog（${record.manufacturer}）明確衝突。`;decisionReasons.push(reason);return{...candidate,identityBasis:"inferred" as const,confidence:Math.min(candidate.confidence,.49),reason:`${candidate.reason} ${reason}`}}
    if(result.status!=="identified"&&!record)return candidate;
    if(!record){rejected=true;const reason="Phase 2 rejected：高信心正式標題存在，但候選沒有有效 Catalog match。";decisionReasons.push(reason);return{...candidate,identityBasis:"inferred" as const,confidence:Math.min(candidate.confidence,.49),reason:`${candidate.reason} ${reason}`}}
    const conflicts=officialTitles.filter(item=>hasVersionConflict(item.text,record.officialNameJa));
    if(conflicts.length){rejected=true;const reason=`Phase 2 rejected：版本／續作 token 衝突（可見：${conflicts.map(item=>item.text).join("、")}；Catalog：${record.officialNameJa}）。`;decisionReasons.push(reason);return{...candidate,identityBasis:"inferred" as const,confidence:Math.min(candidate.confidence,.49),reason:`${candidate.reason} ${reason}`}}
    const aligned=officialTitles.some(item=>titleAlignment(item.text,record)?.searchScore>=90);
    if(!aligned){rejected=true;const reason=`Phase 2 rejected：可見正式標題與 Catalog officialName / alias 一致度不足（${record.officialNameJa}）。`;decisionReasons.push(reason);return{...candidate,identityBasis:"inferred" as const,confidence:Math.min(candidate.confidence,.49),reason:`${candidate.reason} ${reason}`}}
    decisionReasons.push(`Phase 2 accepted：正式標題與 ${record.officialNameJa} 一致，且無版本衝突。`);return candidate;
  });
  const deterministicAccepted=Boolean(deterministicRecord)&&candidates.some(candidate=>candidate.matchedCatalogId===deterministicRecord?.id&&candidate.identityBasis==="catalog_match");
  return{result:{...result,status:rejected?"uncertain" as const:deterministicAccepted?"identified" as const:result.status,candidates},decisionReasons};
}
