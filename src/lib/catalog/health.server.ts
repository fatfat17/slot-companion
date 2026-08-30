import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { catalogCloudConfigured } from "./adminAuth.server";
import { catalogEstimatorCoverageFromAudit,type CatalogEstimatorCoverage } from "./estimatorCoverage";

export type CatalogHealthSummary={catalogTotal:number;cloudBacked:boolean;auditVersion:string|null;operationalMachines:number|null;basicRecordModeMachines:number|null;estimatorEligibleMachines:number|null;blockedControlCount:number|null};

export async function getCatalogHealthSummary(catalogTotal:number,environment:NodeJS.ProcessEnv=process.env):Promise<CatalogHealthSummary>{
  try{
    const report=JSON.parse(await fs.readFile(path.join(process.cwd(),"reports","machine-catalog-control-audit.json"),"utf8")) as {auditVersion?:string;summary?:{machinesWithOperationalControls?:number;basicRecordModeMachines?:number;estimatorEligibleMachines?:number;blockedControlCount?:number}};
    return{catalogTotal,cloudBacked:catalogCloudConfigured(environment),auditVersion:report.auditVersion??null,operationalMachines:report.summary?.machinesWithOperationalControls??null,basicRecordModeMachines:report.summary?.basicRecordModeMachines??null,estimatorEligibleMachines:report.summary?.estimatorEligibleMachines??null,blockedControlCount:report.summary?.blockedControlCount??null};
  }catch{return{catalogTotal,cloudBacked:catalogCloudConfigured(environment),auditVersion:null,operationalMachines:null,basicRecordModeMachines:null,estimatorEligibleMachines:null,blockedControlCount:null}}
}

export async function getCatalogEstimatorCoverage():Promise<CatalogEstimatorCoverage|null>{
  try{return catalogEstimatorCoverageFromAudit(JSON.parse(await fs.readFile(path.join(process.cwd(),"reports","machine-catalog-control-audit.json"),"utf8")))}catch{return null}
}
