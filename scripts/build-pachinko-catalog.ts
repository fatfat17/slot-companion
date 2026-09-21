import {promises as fs} from "node:fs";
import path from "node:path";
import {parsePWorldPachinkoCalendar} from "../src/lib/pachinko/pworld.ts";
import type {PachinkoCatalogRecord} from "../src/types/pachinko.ts";

const START_MONTH="2025-01";
const END_MONTH="2026-09";
const OUTPUT_PATH=path.join(process.cwd(),"data","pachinko-catalog.json");

function monthsBetween(start:string,end:string){
  const [startYear,startMonth]=start.split("-").map(Number),[endYear,endMonth]=end.split("-").map(Number),months:string[]=[];
  for(let year=startYear,month=startMonth;year<endYear||year===endYear&&month<=endMonth;){
    months.push(`${year}-${String(month).padStart(2,"0")}`);
    month++;if(month===13){year++;month=1}
  }
  return months;
}

async function fetchMonth(month:string,retrievedAt:string){
  const sourceUrl=`https://www.p-world.co.jp/database/machine/introduce_calendar.cgi?year_month=${month}`;
  const response=await fetch(sourceUrl,{headers:{"User-Agent":"Slot Companion Pachinko catalog builder"},signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error(`${month} 的 P-WORLD 新台頁讀取失敗（${response.status}）`);
  return parsePWorldPachinkoCalendar(await response.text(),sourceUrl,retrievedAt);
}

async function main(){
  const previous=JSON.parse(await fs.readFile(OUTPUT_PATH,"utf8"))as PachinkoCatalogRecord[],preserved=new Map(previous.map(record=>[record.id,record])),retrievedAt=new Date().toISOString(),months=monthsBetween(START_MONTH,END_MONTH),records:PachinkoCatalogRecord[]=[];
  for(let index=0;index<months.length;index+=3){
    const batch=months.slice(index,index+3),results=await Promise.all(batch.map(month=>fetchMonth(month,retrievedAt)));
    for(let at=0;at<batch.length;at++){console.log(`${batch[at]}: ${results[at].length}`);records.push(...results[at])}
  }
  const unique=new Map<string,PachinkoCatalogRecord>();
  for(const record of records){const existing=preserved.get(record.id);unique.set(record.id,existing?{...record,...existing,sourceUrl:record.sourceUrl,sourceImageUrl:record.sourceImageUrl??existing.sourceImageUrl,introducedAt:record.introducedAt,retrievedAt}:record)}
  const catalog=[...unique.values()].sort((left,right)=>(right.introducedAt??"").localeCompare(left.introducedAt??"")||left.id.localeCompare(right.id));
  await fs.writeFile(OUTPUT_PATH,`${JSON.stringify(catalog,null,2)}\n`);
  console.log(`Pachinko Catalog: ${catalog.length} records (${START_MONTH} → ${END_MONTH})`);
}

await main();
