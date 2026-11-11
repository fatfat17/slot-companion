import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {catalogMonth,isAuthorizedCronRequest,newPachinkoCatalogRecords,newSlotCatalogRecords,validateMonthlyCatalogSource} from "../src/lib/catalog/automation.ts";
import type {MachineCatalogCandidate,MachineCatalogRecord} from "../src/types/catalog.ts";
import type {PachinkoCatalogRecord} from "../src/types/pachinko.ts";

const slotCandidate:MachineCatalogCandidate={sourceId:"/machine/database/11000",officialNameJa:"L TEST SLOT",displayNameZh:"",manufacturer:"TEST",brand:"",seriesName:"",aliases:[],machineType:"スマスロ",introducedAt:"2026-11-02",sourceName:"P-WORLD",sourceUrl:"https://www.p-world.co.jp/machine/database/11000",sourceImageUrl:"https://idn.p-world.co.jp/machines/11000/image/thumb_1.jpg",retrievedAt:"2026-11-12T00:00:00Z"};
const slotRecord:MachineCatalogRecord={id:"machine-existing",...slotCandidate,verified:false,catalogStatus:"reviewed",displayNameZh:"測試",sources:[{sourceName:"P-WORLD",sourceUrl:slotCandidate.sourceUrl,sourceImageUrl:slotCandidate.sourceImageUrl,retrievedAt:slotCandidate.retrievedAt}]};
const pachinkoRecord:PachinkoCatalogRecord={id:"pachi-11001",officialNameJa:"e TEST PACHINKO",displayNameZh:"",manufacturer:"TEST",seriesName:"",aliases:[],machineType:"smart_pachinko",tags:[],introducedAt:"2026-11-02",sourceName:"P-WORLD",sourceUrl:"https://www.p-world.co.jp/machine/database/11001",sourceImageUrl:"https://idn.p-world.co.jp/machines/11001/image/thumb_1.jpg",retrievedAt:"2026-11-12T00:00:00Z",catalogStatus:"imported"};

test("cron requires the configured bearer secret",()=>{
  assert.equal(isAuthorizedCronRequest("Bearer secret","secret"),true);
  assert.equal(isAuthorizedCronRequest("Bearer wrong","secret"),false);
  assert.equal(isAuthorizedCronRequest(null,undefined),false);
});

test("scheduled month uses Japan time",()=>{
  assert.equal(catalogMonth(new Date("2026-10-31T15:30:00Z")),"2026-11");
});

test("monthly source validation rejects duplicates and malformed records",()=>{
  assert.doesNotThrow(()=>validateMonthlyCatalogSource("2026-11",[slotCandidate],[pachinkoRecord]));
  assert.throws(()=>validateMonthlyCatalogSource("2026-11",[slotCandidate,slotCandidate],[pachinkoRecord]),/重複/);
  assert.throws(()=>validateMonthlyCatalogSource("2026-10",[slotCandidate],[pachinkoRecord]),/不完整/);
});

test("weekly SLOT update syncs repo-only records but never overwrites cloud records",()=>{
  assert.deepEqual(newSlotCatalogRecords([slotCandidate],[],[slotRecord]),[slotRecord]);
  assert.deepEqual(newSlotCatalogRecords([slotCandidate],[slotRecord],[slotRecord]),[]);
});

test("weekly Pachinko update syncs repo-only records and skips existing cloud identity",()=>{
  assert.deepEqual(newPachinkoCatalogRecords([pachinkoRecord],[],[pachinkoRecord]),[pachinkoRecord]);
  assert.deepEqual(newPachinkoCatalogRecords([pachinkoRecord],[pachinkoRecord],[pachinkoRecord]),[]);
});

test("Vercel schedules daily health and weekly update routes",()=>{
  const config=JSON.parse(fs.readFileSync(new URL("../vercel.json",import.meta.url),"utf8"))as{crons:Array<{path:string;schedule:string}>};
  assert.deepEqual(config.crons,[{path:"/api/cron/catalog-health",schedule:"15 0 * * *"},{path:"/api/cron/catalog-update",schedule:"30 0 * * 1"}]);
  for(const route of ["catalog-health","catalog-update"]){const source=fs.readFileSync(new URL(`../src/app/api/cron/${route}/route.ts`,import.meta.url),"utf8");assert.match(source,/isAuthorizedCronRequest/);assert.match(source,/status:401/)}
});
