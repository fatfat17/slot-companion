import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {readWithFallback} from "../src/lib/catalog/readFallback.ts";

test("Catalog read returns cloud data without invoking fallback",async()=>{
  let fallbackCalls=0;
  const result=await readWithFallback(async()=>["cloud"],async()=>{fallbackCalls+=1;return["json"]});
  assert.deepEqual(result,["cloud"]);
  assert.equal(fallbackCalls,0);
});

test("Catalog read falls back to repo JSON when cloud throws",async()=>{
  let reported="";
  const result=await readWithFallback<string[]>(async()=>{throw new Error("upstream unavailable")},async()=>["json"],error=>{reported=error instanceof Error?error.message:"unknown"});
  assert.deepEqual(result,["json"]);
  assert.equal(reported,"upstream unavailable");
});

test("Catalog read still surfaces an error when both sources fail",async()=>{
  await assert.rejects(()=>readWithFallback(async()=>{throw new Error("cloud")},async()=>{throw new Error("json")}),/json/);
});

test("cloud configuration wraps only reads while Catalog writes stay on the primary repository",()=>{
  const source=fs.readFileSync(new URL("../src/lib/catalog/repository.server.ts",import.meta.url),"utf8");
  assert.match(source,/new ReadFallbackMachineCatalogRepository\(new SupabaseMachineCatalogRepository/);
  assert.match(source,/async approve\(decisions:CatalogImportDecision\[\]\)\{return this\.primary\.approve\(decisions\)\}/);
  assert.match(source,/async recordImportJob\(job:CatalogImportJob\)\{return this\.primary\.recordImportJob\(job\)\}/);
});
