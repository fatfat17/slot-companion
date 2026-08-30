export type CatalogEstimatorCoverage={eligibleCatalogIds:string[];catalogTotal:number;eligibleTotal:number;source:"control-audit"};
export type CatalogEstimatorFilter="all"|"supported"|"record-only";

type AuditInput={summary?:{catalogTotal?:unknown;estimatorEligibleMachines?:unknown};details?:Array<{catalogId?:unknown;estimatorEligible?:unknown}>};

export function catalogEstimatorCoverageFromAudit(input:unknown):CatalogEstimatorCoverage|null{
  if(!input||typeof input!=="object")return null;
  const audit=input as AuditInput,details=Array.isArray(audit.details)?audit.details:[],eligibleCatalogIds=details.filter(item=>item.estimatorEligible===true&&typeof item.catalogId==="string").map(item=>item.catalogId as string);
  if(!details.length)return null;
  return{eligibleCatalogIds:[...new Set(eligibleCatalogIds)],catalogTotal:typeof audit.summary?.catalogTotal==="number"?audit.summary.catalogTotal:details.length,eligibleTotal:eligibleCatalogIds.length,source:"control-audit"};
}

export function filterCatalogRecordsByEstimatorSupport<T extends {id:string}>(records:T[],filter:CatalogEstimatorFilter,eligibleCatalogIds:string[]|null){
  if(!eligibleCatalogIds||filter==="all")return records;
  const eligibleIds=new Set(eligibleCatalogIds);
  return records.filter(record=>filter==="supported"?eligibleIds.has(record.id):!eligibleIds.has(record.id));
}
