import assert from "node:assert/strict";
import test from "node:test";
import { ApprovalBatchError,runApprovalBatches,validateApprovalDecisions } from "../src/lib/catalog/approval.ts";
import { applyCatalogDecisions,findDuplicate } from "../src/lib/catalog/core.ts";
import type { CatalogImportDecision,MachineCatalogCandidate } from "../src/types/catalog.ts";

const makeDecisions=(count:number):CatalogImportDecision[]=>Array.from({length:count},(_,index)=>{const candidate:MachineCatalogCandidate={sourceId:`test-${index}`,officialNameJa:`L TEST ${index}`,displayNameZh:"",manufacturer:"TEST",brand:"",seriesName:"",aliases:[],machineType:"スマスロ",introducedAt:"2026-01-01",sourceName:"TEST",sourceUrl:`https://example.test/${index}`,retrievedAt:"2026-08-27T00:00:00.000Z"};return{candidate,action:"import"}});
const success=(batch:CatalogImportDecision[])=>Promise.resolve({received:batch.length,processed:batch.length,imported:batch.length,merged:0,skipped:0});

test("Approve API validation 接受 99 筆",()=>assert.doesNotThrow(()=>validateApprovalDecisions(makeDecisions(99))));
test("Approve API validation 接受 100 筆",()=>assert.doesNotThrow(()=>validateApprovalDecisions(makeDecisions(100))));
test("Approve API validation 對 101 筆直接拒絕",()=>assert.throws(()=>validateApprovalDecisions(makeDecisions(101)),/單次最多處理 100 筆/));
test("UI 184 筆依序拆成 100 + 84",async()=>{const sizes:number[]=[];const result=await runApprovalBatches(makeDecisions(184),async batch=>{sizes.push(batch.length);return success(batch)});assert.deepEqual(sizes,[100,84]);assert.equal(result.processed,184)});
test("第二批失敗後停止，不提交第三批",async()=>{const sizes:number[]=[];await assert.rejects(()=>runApprovalBatches(makeDecisions(250),async batch=>{sizes.push(batch.length);if(sizes.length===2)throw new Error("write failed");return success(batch)}),error=>{assert.ok(error instanceof ApprovalBatchError);assert.equal(error.completed,100);assert.equal(error.failedBatch,2);assert.equal(error.remaining,150);return true});assert.deepEqual(sizes,[100,100])});
test("processed count mismatch 視為錯誤",async()=>{await assert.rejects(()=>runApprovalBatches(makeDecisions(20),async batch=>({...await success(batch),processed:19})),/回傳筆數不一致/)});
test("partial success 後重新 Preview 會辨識第一批為既有資料",()=>{const decisions=makeDecisions(184),first=applyCatalogDecisions([],decisions.slice(0,100));const preview=decisions.map(decision=>findDuplicate(decision.candidate,first.records));assert.equal(preview.filter(Boolean).length,100);assert.equal(preview.filter(item=>!item).length,84)});
