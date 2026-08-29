import fs from "node:fs/promises";
import path from "node:path";
import { buildMachineControlAudit } from "../src/lib/machine-guide/audit.ts";
import { PWorldMachineGuideProvider } from "../src/lib/machine-guide/pworld.ts";
import type { MachineCatalogRecord } from "../src/types/catalog.ts";

const args=process.argv.slice(2),outputArg=args.indexOf("--output"),pacingArg=args.indexOf("--pacing-ms"),output=outputArg>=0?args[outputArg+1]:"reports/machine-catalog-control-audit.json",pacing=Math.max(0,Number(pacingArg>=0?args[pacingArg+1]:350)||0),catalog=JSON.parse(await fs.readFile(path.join(process.cwd(),"data/machine-catalog.json"),"utf8")) as MachineCatalogRecord[],provider=new PWorldMachineGuideProvider(),results=[];
async function fetchWithRetry(record:MachineCatalogRecord){let last:unknown;for(let attempt=1;attempt<=3;attempt++)try{return await provider.fetch(record)}catch(error){last=error;if(attempt<3)await new Promise(resolve=>setTimeout(resolve,500*attempt))}throw last}
for(const [index,record] of catalog.entries()){try{const guide=await fetchWithRetry(record);results.push({record,guide})}catch(error){results.push({record,error:error instanceof Error?error.message:String(error)})}if(pacing&&index<catalog.length-1)await new Promise(resolve=>setTimeout(resolve,pacing))}
const report=buildMachineControlAudit(results);await fs.mkdir(path.dirname(output),{recursive:true});await fs.writeFile(output,`${JSON.stringify(report,null,2)}\n`,"utf8");console.log(JSON.stringify(report.summary,null,2));
