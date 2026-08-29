import fs from "node:fs/promises";
import path from "node:path";
import { PWorldMachineGuideProvider } from "../src/lib/machine-guide/pworld.ts";
import { materializeVisualGuideAssets } from "../src/lib/machine-guide/visualGuideMaterializer.ts";
import { VISUAL_GUIDE_FIRST_PILOT_CATALOG_IDS,VISUAL_GUIDE_SECOND_PILOT_CATALOG_IDS,VISUAL_GUIDE_THIRD_PILOT_CATALOG_IDS } from "../src/lib/machine-guide/visualGuide.ts";
import type { MachineCatalogRecord } from "../src/types/catalog.ts";

type Environment=Record<string,string|undefined>;
const args=process.argv.slice(2),outputAt=args.indexOf("--output"),pacingAt=args.indexOf("--pacing-ms"),pilotAt=args.indexOf("--pilot"),output=outputAt>=0?args[outputAt+1]:"reports/visual-guide-scale-pilot.json",pacing=Math.max(0,Number(pacingAt>=0?args[pacingAt+1]:350)||0),pilot=pilotAt>=0?args[pilotAt+1]:"second",materialize=args.includes("--materialize"),sourceOnly=args.includes("--source-only");

async function localEnvironment():Promise<Environment>{
  if(!materialize||sourceOnly)return{};
  try{
    const raw=await fs.readFile(path.join(process.cwd(),".env.local"),"utf8"),environment:Environment={};
    for(const line of raw.split(/\r?\n/)){const match=line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);if(!match)continue;environment[match[1]]=match[2].trim().replace(/^(["'])(.*)\1$/,"$2")}
    return environment;
  }catch{return process.env}
}

const pilotIds={first:[...VISUAL_GUIDE_FIRST_PILOT_CATALOG_IDS],second:[...VISUAL_GUIDE_SECOND_PILOT_CATALOG_IDS],third:[...VISUAL_GUIDE_THIRD_PILOT_CATALOG_IDS]},selectedIds=pilot==="all"?[...pilotIds.first,...pilotIds.second,...pilotIds.third]:pilotIds[pilot as keyof typeof pilotIds]??pilotIds.third,catalog=JSON.parse(await fs.readFile(path.join(process.cwd(),"data/machine-catalog.json"),"utf8")) as MachineCatalogRecord[],byId=new Map(catalog.map(record=>[record.id,record])),provider=new PWorldMachineGuideProvider(),environment=await localEnvironment(),results=[];
for(const [index,catalogId] of selectedIds.entries()){
  const record=byId.get(catalogId);
  if(!record){results.push({catalogId,status:"failed",error:"Catalog record missing"});continue}
  try{
    const guide=await provider.fetch(record),selectedImageCount=guide.images?.length??0,finalGuide=materialize?await materializeVisualGuideAssets(guide,environment):guide,operationalControls=(finalGuide.controlManifest??[]).filter(control=>control.availability==="operational"),recordableControls=operationalControls.filter(control=>(control.controlType==="counter"||control.controlType==="choice")&&control.eventType!=="game");
    results.push({catalogId,machineName:record.officialNameJa,sourceUrl:record.sourceUrl,status:"success",family:finalGuide.familyClassification?{family:finalGuide.familyClassification.family,confidence:finalGuide.familyClassification.confidence}:null,guideStatus:finalGuide.status,selectedImageCount,materializedImageCount:finalGuide.images?.length??0,basicRecordMode:recordableControls.length===0,visualAssetReport:finalGuide.visualAssetReport??null,operationalControls:operationalControls.map(control=>({id:control.id,type:control.controlType,eventType:control.eventType,label:control.label})),estimatorEligibleCount:finalGuide.estimatorMetrics.filter(metric=>metric.estimatorEligible).length,warnings:finalGuide.sourceWarnings??[]});
  }catch(error){results.push({catalogId,machineName:record.officialNameJa,sourceUrl:record.sourceUrl,status:"failed",error:error instanceof Error?error.message:String(error)})}
  if(pacing&&index<selectedIds.length-1)await new Promise(resolve=>setTimeout(resolve,pacing));
}
const successful=results.filter(result=>result.status==="success"),failed=results.filter(result=>result.status==="failed"),totalBytes=successful.reduce((sum,result)=>sum+(result.visualAssetReport?.totalBytes??0),0),summary={pilot,requested:results.length,successful:successful.length,failed:failed.length,selectedImages:successful.reduce((sum,result)=>sum+(result.selectedImageCount??0),0),materializedImages:successful.reduce((sum,result)=>sum+(result.materializedImageCount??0),0),totalBytes,capacityWarnings:successful.filter(result=>result.visualAssetReport?.capacityLevel!==undefined&&result.visualAssetReport.capacityLevel!=="normal").length,basicRecordMode:successful.filter(result=>result.basicRecordMode===true).length,estimatorEligible:successful.filter(result=>(result.estimatorEligibleCount??0)>0).length};
const report={schemaVersion:1,generatedAt:new Date().toISOString(),materialize,sourceOnly,summary,results};await fs.mkdir(path.dirname(output),{recursive:true});await fs.writeFile(output,`${JSON.stringify(report,null,2)}\n`,"utf8");console.log(JSON.stringify(summary,null,2));
