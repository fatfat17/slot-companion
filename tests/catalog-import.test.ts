import assert from "node:assert/strict";
import test from "node:test";
import { PWorldCatalogProvider } from "../src/lib/catalog/providers/pworld.ts";
import { applyCatalogDecisions,findDuplicate,importCatalogCandidate,normalizeCatalogName,searchCatalogRecords } from "../src/lib/catalog/core.ts";
import type { MachineCatalogCandidate } from "../src/types/catalog.ts";

const html=`<div class="machineList js-machineList" data-yyyymmdd="20260608"><ul class="machineList-grid machineList-grid--pachi"><li class="machineList-item"><p class="machineList-item-type">パチンコ</p><p class="machineList-item-title"><a href="/machine/database/1">P TEST</a></p></li></ul><ul class="machineList-grid machineList-grid--slot"><li class="machineList-item"><p class="machineList-item-type">パチスロ</p><p class="machineList-item-maker"><a>オリンピア</a></p><p class="machineList-item-title"><a href="/machine/database/10473">Ｌ 戦国乙女５</a></p></li><li class="machineList-item"><p class="machineList-item-type">パチスロ</p><p class="machineList-item-maker"><a>パオン</a></p><p class="machineList-item-title"><a href="/machine/database/10483">スマスロ ＴＥＳＴ II</a></p></li></ul></div><h2 class="pageTitle">導入機種一覧</h2>`;
const provider=new PWorldCatalogProvider();
const candidates=provider.parse(html,"https://www.p-world.co.jp/database/machine/introduce_calendar.cgi?year_month=2026-06","2026-08-27T00:00:00.000Z");
test("匯入一個 P-WORLD 列表頁並解析多筆 Slot",()=>{assert.equal(candidates.length,2);assert.equal(candidates[0].introducedAt,"2026-06-08");assert.equal(candidates[0].manufacturer,"オリンピア")});
test("malformed page",()=>assert.throws(()=>provider.parse("<html></html>","https://www.p-world.co.jp/database/machine/introduce_calendar.cgi","now"),/找不到/));
test("normalization 處理全半形、L、スマスロ、空白與符號",()=>assert.equal(normalizeCatalogName("Ｌ　スマスロ TEST－II"),normalizeCatalogName("パチスロ test ii")));
test("重複名稱不新增",()=>{const record=importCatalogCandidate(candidates[0]);assert.equal(findDuplicate({...candidates[0],officialNameJa:"L戦国乙女5"},[record])?.id,record.id)});
test("aliases 可匹配",()=>{const record={...importCatalogCandidate(candidates[0]),aliases:["乙女ファイブ"]};assert.equal(searchCatalogRecords([record],["乙女ファイブ"])[0].id,record.id)});
test("人工 Skip",()=>{const result=applyCatalogDecisions([],[{candidate:candidates[0],action:"skip"}]);assert.equal(result.records.length,0);assert.equal(result.skipped,1)});
test("Merge existing 合併 source metadata",()=>{const record=importCatalogCandidate(candidates[0]);const other={...candidates[0],sourceUrl:"https://www.p-world.co.jp/machine/database/10473?source=2"};const result=applyCatalogDecisions([record],[{candidate:other,action:"merge",existingId:record.id}]);assert.equal(result.merged,1);assert.equal(result.records[0].sources.length,2)});
test("Catalog 增加後 unknown 搜尋詞可找到新候選",()=>{const unknown:MachineCatalogCandidate={...candidates[1],officialNameJa:"L NEW UNKNOWN",aliases:["NEW UNKNOWN"]};assert.equal(searchCatalogRecords([], ["NEW UNKNOWN"]).length,0);const imported=importCatalogCandidate(unknown);assert.equal(searchCatalogRecords([imported],["NEW UNKNOWN"])[0].id,imported.id)});
test("request failure",async()=>{const failing=new PWorldCatalogProvider(async()=>{throw new Error("offline")});await assert.rejects(()=>failing.fetchCandidates("https://www.p-world.co.jp/database/machine/introduce_calendar.cgi?year_month=2026-06"),/無法讀取/)});
