import {promises as fs} from "node:fs";
import path from "node:path";
import {applyCatalogDecisions,findDuplicate} from "../src/lib/catalog/core.ts";
import {PWorldCatalogProvider} from "../src/lib/catalog/providers/pworld.ts";
import type {CatalogImportDecision,MachineCatalogRecord} from "../src/types/catalog.ts";

const month=process.argv[2]??"2026-09";
if(!/^\d{4}-(?:0[1-9]|1[0-2])$/.test(month))throw new Error("月份必須是 YYYY-MM。");
const outputPath=path.join(process.cwd(),"data","machine-catalog.json"),records=JSON.parse(await fs.readFile(outputPath,"utf8"))as MachineCatalogRecord[],sourceUrl=`https://www.p-world.co.jp/database/machine/introduce_calendar.cgi?year_month=${month}`,candidates=await new PWorldCatalogProvider().fetchCandidates(sourceUrl),decisions:CatalogImportDecision[]=candidates.map(candidate=>{const duplicate=findDuplicate(candidate,records);return{candidate,action:duplicate?"merge":"import",...(duplicate?{existingId:duplicate.id}:{})}}),result=applyCatalogDecisions(records,decisions);
await fs.writeFile(outputPath,`${JSON.stringify(result.records,null,2)}\n`);
console.log(JSON.stringify({month,candidates:candidates.length,imported:result.imported,merged:result.merged,skipped:result.skipped,total:result.total},null,2));
