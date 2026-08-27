import assert from "node:assert/strict";
import test from "node:test";
import { buildPWorldMonthUrl, enumerateMonths, runCatalogBatch } from "../src/lib/catalog/batch.ts";
import { importCatalogCandidate } from "../src/lib/catalog/core.ts";
import { PWorldCatalogProvider } from "../src/lib/catalog/providers/pworld.ts";
import type { CatalogSourceProvider } from "../src/lib/catalog/providers/types.ts";
import type { MachineCatalogCandidate } from "../src/types/catalog.ts";

const candidate=(name:string,month:string):MachineCatalogCandidate=>({sourceId:`${month}-${name}`,officialNameJa:name,displayNameZh:"",manufacturer:"TEST MAKER",brand:"",seriesName:"",aliases:[],machineType:name.startsWith("L")?"スマスロ":"パチスロ",introducedAt:`${month}-01`,sourceName:"P-WORLD",sourceUrl:`https://www.p-world.co.jp/machine/${month}/${name}`,retrievedAt:"2026-08-27T00:00:00.000Z"});
class FakeProvider implements CatalogSourceProvider{
  readonly sourceName="P-WORLD";
  private readonly byMonth:Record<string,MachineCatalogCandidate[]|Error>;
  constructor(byMonth:Record<string,MachineCatalogCandidate[]|Error>){this.byMonth=byMonth}
  supports(){return true}
  parse(){return[]}
  async fetchCandidates(url:string){const month=new URL(url).searchParams.get("year_month")??"",value=this.byMonth[month];if(value instanceof Error)throw value;return value??[]}
}
const noWait=async()=>{};

test("月份範圍依序產生 3 個 P-WORLD URL 並全部成功",async()=>{const calls:string[]=[];const base=new FakeProvider({"2026-01":[candidate("L A","2026-01")],"2026-02":[candidate("L B","2026-02")],"2026-03":[candidate("L C","2026-03")]});const provider={...base,sourceName:base.sourceName,supports:base.supports.bind(base),parse:base.parse.bind(base),fetchCandidates:async(url:string)=>{calls.push(url);return base.fetchCandidates(url)}};const result=await runCatalogBatch({startMonth:"2026-01",endMonth:"2026-03",provider,existingRecords:[],wait:noWait});assert.deepEqual(calls,["2026-01","2026-02","2026-03"].map(buildPWorldMonthUrl));assert.equal(result.summary.successfulMonths,3);assert.equal(result.summary.failedMonths,0)});
test("單月失敗時繼續其餘月份",async()=>{const provider=new FakeProvider({"2026-01":[candidate("L A","2026-01")],"2026-02":new Error("timeout"),"2026-03":[candidate("L C","2026-03")]});const result=await runCatalogBatch({startMonth:"2026-01",endMonth:"2026-03",provider,existingRecords:[],wait:noWait});assert.equal(result.summary.successfulMonths,2);assert.equal(result.candidates.length,2);assert.deepEqual(result.failures,[{month:"2026-02",reason:"timeout"}])});
test("跨月份相同 normalized name 只保留一筆",async()=>{const provider=new FakeProvider({"2026-01":[candidate("Ｌ TEST－ONE","2026-01")],"2026-02":[candidate("スマスロ test one","2026-02")]});const result=await runCatalogBatch({startMonth:"2026-01",endMonth:"2026-02",provider,existingRecords:[],wait:noWait});assert.equal(result.summary.rawSlotCandidates,2);assert.equal(result.summary.deduplicatedCandidates,1)});
test("已存在 Catalog 顯示為 merge candidate",async()=>{const item=candidate("L EXISTING","2026-01"),provider=new FakeProvider({"2026-01":[item]});const result=await runCatalogBatch({startMonth:"2026-01",endMonth:"2026-01",provider,existingRecords:[importCatalogCandidate(item)],wait:noWait});assert.equal(result.summary.existingCatalogCount,1);assert.equal(result.summary.mergeCandidateCount,1);assert.equal(result.summary.newCandidateCount,0)});
test("超過 36 個月拒絕",()=>assert.throws(()=>enumerateMonths("2023-01","2026-01"),/最多掃描 36/));
test("malformed month 拒絕",()=>assert.throws(()=>enumerateMonths("2026/01","2026-02"),/YYYY-MM/));
test("P-WORLD parser 排除 Pachinko 並只保留 Slot",()=>{const html=`<div class="machineList js-machineList" data-yyyymmdd="20260101"><ul class="machineList-grid machineList-grid--pachi"><li class="machineList-item"><p class="machineList-item-title"><a>P PACHI</a></p></li></ul><ul class="machineList-grid machineList-grid--slot"><li class="machineList-item"><p class="machineList-item-title"><a>L SLOT</a></p><p class="machineList-item-maker">TEST</p></li></ul></div>`;const parsed=new PWorldCatalogProvider().parse(html,buildPWorldMonthUrl("2026-01"),"now");assert.deepEqual(parsed.map(item=>item.officialNameJa),["L SLOT"])});
