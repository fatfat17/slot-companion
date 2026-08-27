import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { catalogProfileStatus,matchMachineProfiles } from "../src/lib/ai/matching.ts";
import { runIdentificationPipeline,type TwoPhaseIdentityProvider } from "../src/lib/ai/pipeline.ts";
import { hasVersionConflict } from "../src/lib/ai/precision.ts";
import type { MachineIdentificationResult } from "../src/types/index.ts";
import type { CatalogVisibleEvidence,MachineCatalogRecord } from "../src/types/catalog.ts";

const catalog=JSON.parse(readFileSync(new URL("../data/machine-catalog.json",import.meta.url),"utf8")) as MachineCatalogRecord[];
const image={dataUrl:"data:image/jpeg;base64,AA==",fileName:"pipeline.jpg",mimeType:"image/jpeg"};
const evidence=(title:string,confidence=.95):CatalogVisibleEvidence=>({status:"slot",visibleText:[title],manufacturerText:[],visualEvidence:["title plate"],searchTerms:[title],visibleOfficialTitleCandidates:[{text:title,confidence}],visibleFranchiseTerms:[],visibleModeOrStageTerms:[],visibleManufacturerMarks:[]});
const phase2Result=(record:MachineCatalogRecord):MachineIdentificationResult=>({provider:"openai",status:"identified",candidates:[{machineNameJa:record.officialNameJa,machineNameZh:record.displayNameZh,manufacturer:record.manufacturer,confidence:.9,reason:"TEST phase 2 catalog selection",visibleEvidence:["title plate"],matchedCatalogId:record.id,identityBasis:"catalog_match"}]});
class FakeTwoPhaseProvider implements TwoPhaseIdentityProvider{
  constructor(privateEvidence:CatalogVisibleEvidence,privateResult:(shortlist:MachineCatalogRecord[])=>MachineIdentificationResult){this.privateEvidence=privateEvidence;this.privateResult=privateResult}
  privateEvidence:CatalogVisibleEvidence;privateResult:(shortlist:MachineCatalogRecord[])=>MachineIdentificationResult;
  async extractVisibleEvidence(){return this.privateEvidence}
  async verifyMachine(_image:typeof image,_evidence:CatalogVisibleEvidence,shortlist:MachineCatalogRecord[]){return this.privateResult(shortlist)}
}
async function identify(title:string,select:(shortlist:MachineCatalogRecord[])=>MachineIdentificationResult){return runIdentificationPipeline({image,provider:new FakeTwoPhaseProvider(evidence(title),select),catalog,includeDebug:true})}

test("東京喰種完整 pipeline 正確",async()=>{const result=await identify("L 東京喰種",shortlist=>phase2Result(shortlist.find(item=>item.id==="tokyo-ghoul")!));assert.equal(result.status,"identified");assert.equal(result.candidates[0].matchedCatalogId,"tokyo-ghoul")});
test("BIOHAZARD RE:3 完整 pipeline 正確",async()=>{const result=await identify("BIOHAZARD RE:3",shortlist=>phase2Result(shortlist.find(item=>item.id==="machine-1y0erql")!));assert.equal(result.debug?.shortlist[0].id,"machine-1y0erql");assert.equal(result.status,"identified")});
test("戰國乙女5 是 Catalog match 且沒有 Machine Profile",async()=>{const raw=await identify("L戦国乙女5 業火を穿つ宿焔の双刃",shortlist=>phase2Result(shortlist.find(item=>item.id==="machine-1712ndq")!)),result=matchMachineProfiles(raw,catalog),candidate=result.candidates[0];assert.equal(candidate.matchedCatalogId,"machine-1712ndq");assert.equal(candidate.matchedMachineId,undefined);assert.equal(catalogProfileStatus(candidate),"已匹配 Machine Catalog｜尚未建立攻略 Profile")});
test("とある魔術の禁書目録2 不得 identified 成一方通行",async()=>{const result=await identify("とある魔術の禁書目録2",shortlist=>phase2Result(shortlist.find(item=>item.id==="machine-9bisnd")!));assert.equal(result.status,"uncertain");assert.match(result.debug?.phase2.decisionReasons.join(" ")??"",/版本／續作 token 衝突/)});
test("BIG DREAM 完整 pipeline 進 shortlist，Phase 2 reject 有原因",async()=>{const visibleOnly={...evidence("BIG DREAM"),searchTerms:[],visibleOfficialTitleCandidates:[]},provider=new FakeTwoPhaseProvider(visibleOnly,()=>({provider:"openai",status:"unknown",candidates:[]})),result=await runIdentificationPipeline({image,provider,catalog,includeDebug:true});assert.ok(result.debug?.shortlist.some(item=>item.id==="machine-1ryjocr"));assert.equal(result.status,"unknown");assert.match(result.debug?.phase2.decisionReasons.join(" ")??"",/Phase 2 rejected/)});
test("GOD generic token 不進 shortlist、不硬判",async()=>{const result=await identify("GOD",()=>{throw new Error("Phase 2 不應執行")});assert.equal(result.status,"uncertain");assert.equal(result.debug?.shortlist.length,0)});
test("Bullet of Bullets 不唯一時維持 uncertain",async()=>{const result=await identify("Bullet of Bullets",()=>{throw new Error("Phase 2 不應執行")});assert.equal(result.status,"uncertain");assert.equal(result.debug?.shortlist.length,0)});
test("version suffix conflict：V-30 不可匹配 V",()=>assert.equal(hasVersionConflict("TEST TITLE V-30","TEST TITLE V"),true));
