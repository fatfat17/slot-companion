import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parsePWorldMachineGuide } from "../src/lib/machine-guide/pworld.ts";
import { getGuideEstimatorSupport } from "../src/lib/machine-guide/estimatorSupport.ts";
import { createGuideBatchProgress,remainingGuideBatchIds,runGuideRefreshBatch } from "../src/lib/machine-guide/batch.ts";
import { guideOfflineUrls,offlinePackUrls,OFFLINE_PACK_CACHE } from "../src/lib/machine-guide/offlinePack.ts";
import type { MachineCatalogRecord } from "../src/types/catalog.ts";

const base:MachineCatalogRecord={id:"10542",officialNameJa:"LBトリプルクラウンX-300",displayNameZh:"",manufacturer:"TEST",brand:"",seriesName:"",aliases:[],machineType:"パチスロ",introducedAt:"2026-01-01",sourceName:"P-WORLD",sourceUrl:"https://www.p-world.co.jp/machine/database/10542",retrievedAt:"2026-08-30",verified:false,catalogStatus:"imported",sources:[]};
const fixture=(name:string)=>fs.readFileSync(new URL(`./fixtures/${name}`,import.meta.url),"utf8");

test("guide exposes estimator support before Session only when observation contract is eligible",()=>{
  const supported=parsePWorldMachineGuide(fixture("pworld-10542-a-type-bonus.html"),base,"2026-08-30T00:00:00Z"),unsupported=parsePWorldMachineGuide(fixture("pworld-10514-insufficient-events.html"),{...base,id:"10514",officialNameJa:"L ULTRAMAN 最終決戰"},"2026-08-30T00:00:00Z");
  assert.equal(getGuideEstimatorSupport(supported).status,"supported");assert.ok(getGuideEstimatorSupport(supported).metricCount>0);assert.equal(getGuideEstimatorSupport(unsupported).status,"unavailable");
});

test("batch refresh is sequential, deduplicated and resumable",async()=>{
  const progress=createGuideBatchProgress("favorites",["a","b","a"]),order:string[]=[];
  const result=await runGuideRefreshBatch(progress,async id=>{order.push(`start:${id}`);await Promise.resolve();order.push(`end:${id}`)});
  assert.deepEqual(progress.catalogIds,["a","b"]);assert.deepEqual(order,["start:a","end:a","start:b","end:b"]);assert.equal(result.status,"complete");assert.deepEqual(remainingGuideBatchIds({...result,status:"paused",completedIds:["a"]}),["b"]);
});

test("batch records a failed machine without discarding successful work",async()=>{
  const result=await runGuideRefreshBatch(createGuideBatchProgress("recent",["a","b","c"]),async id=>{if(id==="b")throw new Error("TEST DATA failure")});
  assert.deepEqual(result.completedIds,["a","c"]);assert.deepEqual(result.failed.map(item=>item.catalogId),["b"]);assert.equal(result.status,"paused");assert.deepEqual(remainingGuideBatchIds(result),["b"]);
});

test("trip pack includes guide pages, same guide images and core player routes",()=>{
  const guide=parsePWorldMachineGuide(fixture("pworld-10530-bonus-art.html"),{...base,id:"10530"},"2026-08-30T00:00:00Z"),urls=offlinePackUrls([guide]);
  assert.ok(guideOfflineUrls(guide).includes("/guides/10530"));assert.ok(urls.includes("/catalog"));assert.ok(urls.includes("/records"));assert.equal(OFFLINE_PACK_CACHE.startsWith("slot-companion-trip-pack-"),true);
});

test("service worker preserves trip packs while replacing old shell caches",()=>{const source=fs.readFileSync(new URL("../public/sw.js",import.meta.url),"utf8");assert.match(source,/TRIP_PREFIX/);assert.match(source,/!key\.startsWith\(TRIP_PREFIX\)/);assert.doesNotMatch(source,/slot-companion-v0\.2\.2\.1/)});
test("legacy Machine Library redirects to Catalog and direct cards are marked compatibility-only",()=>{const list=fs.readFileSync(new URL("../src/app/machines/page.tsx",import.meta.url),"utf8"),detail=fs.readFileSync(new URL("../src/app/machines/[id]/page.tsx",import.meta.url),"utf8"),catalog=fs.readFileSync(new URL("../src/app/catalog/[id]/page.tsx",import.meta.url),"utf8");assert.match(list,/redirect\("\/catalog"\)/);assert.match(detail,/舊版相容 Machine Card/);assert.match(catalog,/舊版相容資料/)});
