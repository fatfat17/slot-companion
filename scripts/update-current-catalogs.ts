import {promises as fs} from "node:fs";
import path from "node:path";
import {catalogMonth,newPachinkoCatalogRecords,newSlotCatalogRecords,validateMonthlyCatalogSource} from "../src/lib/catalog/automation.ts";
import {PWorldCatalogProvider} from "../src/lib/catalog/providers/pworld.ts";
import {parsePWorldPachinkoCalendar} from "../src/lib/pachinko/pworld.ts";
import type {MachineCatalogRecord} from "../src/types/catalog.ts";
import type {PachinkoCatalogRecord} from "../src/types/pachinko.ts";

const month=catalogMonth(),retrievedAt=new Date().toISOString(),sourceUrl=`https://www.p-world.co.jp/database/machine/introduce_calendar.cgi?year_month=${month}`,machinePath=path.join(process.cwd(),"data","machine-catalog.json"),pachinkoPath=path.join(process.cwd(),"data","pachinko-catalog.json"),machineCatalog=JSON.parse(await fs.readFile(machinePath,"utf8"))as MachineCatalogRecord[],pachinkoCatalog=JSON.parse(await fs.readFile(pachinkoPath,"utf8"))as PachinkoCatalogRecord[];

async function fetchPachinko(){
  const response=await fetch(sourceUrl,{headers:{"User-Agent":"Pachi Companion scheduled catalog updater"},signal:AbortSignal.timeout(15000),cache:"no-store"});
  if(!response.ok)throw new Error(`P-WORLD Pachinko 月曆讀取失敗（${response.status}）。`);
  return parsePWorldPachinkoCalendar(await response.text(),sourceUrl,retrievedAt);
}

const[slotCandidates,pachinkoCandidates]=await Promise.all([new PWorldCatalogProvider().fetchCandidates(sourceUrl),fetchPachinko()]);
validateMonthlyCatalogSource(month,slotCandidates,pachinkoCandidates);
const slotRows=newSlotCatalogRecords(slotCandidates,machineCatalog,machineCatalog),pachinkoRows=newPachinkoCatalogRecords(pachinkoCandidates,pachinkoCatalog,pachinkoCatalog);
if(slotRows.length)await fs.writeFile(machinePath,`${JSON.stringify([...machineCatalog,...slotRows],null,2)}\n`);
if(pachinkoRows.length){const records=[...pachinkoCatalog,...pachinkoRows].sort((left,right)=>(right.introducedAt??"").localeCompare(left.introducedAt??"")||left.id.localeCompare(right.id));await fs.writeFile(pachinkoPath,`${JSON.stringify(records,null,2)}\n`)}
console.log(JSON.stringify({month,slot:{source:slotCandidates.length,added:slotRows.length,total:machineCatalog.length+slotRows.length},pachinko:{source:pachinkoCandidates.length,added:pachinkoRows.length,total:pachinkoCatalog.length+pachinkoRows.length}},null,2));
