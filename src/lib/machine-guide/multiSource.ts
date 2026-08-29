import type { MachineGuideSource,ParsedMachineGuideFacts } from "@/types/machineGuide";

export type SupplementalSourceRequest={sourceName:string;sourceUrl:string};
export type SupplementalCollection={facts:ParsedMachineGuideFacts[];failedSources:MachineGuideSource[];warnings:string[]};

export async function collectSupplementalGuideFacts(sources:SupplementalSourceRequest[],load:(source:SupplementalSourceRequest)=>Promise<ParsedMachineGuideFacts>,now=()=>new Date().toISOString()):Promise<SupplementalCollection>{
  const facts:ParsedMachineGuideFacts[]=[],failedSources:MachineGuideSource[]=[],warnings:string[]=[];
  for(const source of sources){
    try{facts.push(await load(source))}
    catch(error){const message=error instanceof Error?error.message:"補充來源取得失敗。";warnings.push(`${source.sourceName}：${message}`);failedSources.push({name:source.sourceName,url:source.sourceUrl,retrievedAt:now(),role:"supplemental",status:"failed"})}
  }
  return{facts,failedSources,warnings};
}
