import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { addSourceToDraft,applyExtraction,createProfileDraft,realEstimatorBenchmarks,reviewDraftEvidence } from "../src/lib/profile-builder/core.ts";
import { compareMetricEvidence } from "../src/lib/profile-builder/comparison.ts";
import { parseNanaPressProfileHtml } from "../src/lib/profile-builder/providers/nanapress.ts";
import type { SettingBenchmark } from "../src/types/index.ts";
import type { ProfileSourceEvidence } from "../src/types/profileBuilder.ts";

const fixture=readFileSync(new URL("./fixtures/nanapress-tokyo-ghoul-structure.html",import.meta.url),"utf8");
const evidence=(sourceUrl:string,sourceName:string,rows:string[][],id=sourceUrl):ProfileSourceEvidence=>({id,sourceName,sourceUrl,retrievedAt:"2026-08-27",metricKey:"atInitialRate",sectionKey:"atInitialRate",extractedValue:rows.map(row=>row.join(" | ")),rawLabel:"AT",sectionTitle:"AT",tableHeaders:["設定","AT"],rows,note:null,extractedFrom:"table",confidence:.9,reviewStatus:"approved"});
const rows=(values:string[])=>values.map((value,index)=>[String(index+1),value]);

test("なな徹真實 HTML 結構 fixture 可抽取 Evidence",()=>{const sections=parseNanaPressProfileHtml(fixture);assert.ok(sections.length>=4);assert.deepEqual(sections.find(item=>item.metricKey==="atInitialRate")?.rows[0],["1","1/394.4"]);assert.deepEqual(sections.find(item=>item.metricKey==="czInitialRate")?.rows[5],["6","1/203.7"]);assert.ok(sections.some(item=>item.metricKey==="endScreenIndications"));assert.ok(sections.some(item=>item.metricKey==="weakCherryCzSuccessRate"))});
test("source extraction 0 evidence → no_evidence",()=>{let draft=addSourceToDraft(createProfileDraft("x"),"https://example.com/empty");draft=applyExtraction(draft,{sourceName:"Empty",sourceUrl:"https://example.com/empty",retrievedAt:"2026-08-27",sections:[],confidence:.9,status:"no_evidence"});assert.equal(draft.sources[0].status,"no_evidence");assert.equal(draft.sources[0].extractedEvidenceCount,0)});
test("同來源重複 metric 不得 agree",()=>{const a=evidence("https://a.example/page","A",rows(["1/394.4"]),"a1"),b={...a,id:"a2"};assert.equal(compareMetricEvidence("atInitialRate",[a,b])?.verificationStatus,"duplicate_source")});
test("不同來源同值 → agree",()=>assert.equal(compareMetricEvidence("atInitialRate",[evidence("https://a.example/page","A",rows(["1/394.4"])),evidence("https://b.example/page","B",rows(["1/394.4"]))])?.verificationStatus,"agree"));
test("不同來源不同值 → conflict",()=>assert.equal(compareMetricEvidence("atInitialRate",[evidence("https://a.example/page","A",rows(["1/394.4"])),evidence("https://b.example/page","B",rows(["1/395.4"]))])?.verificationStatus,"conflict"));
test("ratio formatting normalization",()=>assert.equal(compareMetricEvidence("atInitialRate",[evidence("https://a.example/page","A",rows(["1/394.4"])),evidence("https://b.example/page","B",rows(["1 ／ 394.4"]))])?.verificationStatus,"agree"));
test("percentage formatting normalization",()=>assert.equal(compareMetricEvidence("atInitialRate",[evidence("https://a.example/page","A",rows(["7.81%"])),evidence("https://b.example/page","B",rows(["7.810 %"]))])?.verificationStatus,"agree"));
test("setting table row order 不同但數據相同 → agree",()=>{const normal=rows(["1/394.4","1/380.5"]),reverse=[...normal].reverse();assert.equal(compareMetricEvidence("atInitialRate",[evidence("https://a.example/page","A",normal),evidence("https://b.example/page","B",reverse)])?.verificationStatus,"agree")});
test("unresolved conflict 不進 estimator",()=>{const a=evidence("https://a.example/page","A",rows(["1/394.4"]),"a"),b=evidence("https://b.example/page","B",rows(["1/395.4"]),"b");let draft=createProfileDraft("x");draft={...draft,evidence:[a,b],metrics:[compareMetricEvidence("atInitialRate",[a,b])!]};draft=reviewDraftEvidence(draft,["a","b"],[]);const benchmark:SettingBenchmark={id:"real",labelZh:"REAL TEST FIXTURE",labelJa:"TEST",metricKey:"atInitialRate",kind:"rate",observation:{type:"rate",numeratorKey:"at",denominatorMetricKey:"observedTotalGame",valueMode:"oneIn"},settingValues:{1:1,2:1,3:1,4:1,5:1,6:1},minimumSample:1,source:"TEST",updatedAt:"2026-08-27",verified:true,testData:false,evidenceIds:["a","b"]};assert.equal(realEstimatorBenchmarks([benchmark],{...draft,status:"verified"},"verified").length,0)});
