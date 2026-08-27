import assert from "node:assert/strict";
import test from "node:test";
import { MockAIProvider } from "../src/lib/ai/providers/mock.ts";
import { buildMachineIdentityPrompt, OpenAIProvider } from "../src/lib/ai/providers/openai.ts";
import { machineCatalog, matchMachineProfiles } from "../src/lib/ai/matching.ts";

const image=(fileName:string)=>({fileName,mimeType:"image/jpeg",dataUrl:"data:image/jpeg;base64,AA=="});
const identify=async(fileName:string)=>matchMachineProfiles(await new MockAIProvider().identifyMachine(image(fileName)));

test("A. 東京喰種完整機台使用 catalog 正式 identity",async()=>{const result=await identify("tokyo-full.jpg");const candidate=result.candidates[0];assert.equal(result.status,"identified");assert.equal(candidate.machineNameJa,"L 東京喰種");assert.equal(candidate.machineNameZh,"東京喰種");assert.equal(candidate.matchedCatalogId,"tokyo-ghoul");assert.equal(candidate.matchedMachineId,"tokyo-ghoul");assert.equal(candidate.manufacturer,machineCatalog.find(item=>item.id==="tokyo-ghoul")?.manufacturer)});
test("B. 東京喰種只有角色 / IP 畫面必須 uncertain",async()=>{const result=await identify("tokyo-ip.jpg");assert.equal(result.status,"uncertain");assert.equal(result.candidates[0].matchedMachineId,undefined);assert.equal(result.candidates[0].identityBasis,"visual_text")});
test("C. HADES 正式 title 清楚可 identified，但 manufacturer 不猜測",async()=>{const result=await identify("hades-full.jpg");assert.equal(result.status,"identified");assert.equal(result.candidates[0].identityBasis,"official_title_visible");assert.equal(result.candidates[0].manufacturer,"不明");assert.equal(result.candidates[0].matchedMachineId,undefined)});
test("D. 只有 GOD 字樣不得 identified",async()=>assert.equal((await identify("god-text.jpg")).status,"uncertain"));
test("E. Bullet / Reload 類演出文字不得 identified",async()=>{const result=await identify("bullet-reload.jpg");assert.equal(result.status,"uncertain");assert.equal(result.candidates[0].manufacturer,"不明")});
test("F. 非 Slot 圖片 → unknown",async()=>assert.equal((await identify("non-slot.jpg")).status,"unknown"));
test("G. 正式 title 明確但本機無 Profile，不自動建立 Profile",async()=>{const result=await identify("unprofiled.jpg");assert.equal(result.status,"identified");assert.equal(result.candidates[0].matchedMachineId,undefined);assert.equal(result.candidates[0].matchedCatalogId,null)});
test("catalog prompt 包含 id、正式名稱、manufacturer 與 aliases",()=>{const prompt=buildMachineIdentityPrompt(machineCatalog);assert.match(prompt,/tokyo-ghoul/);assert.match(prompt,/L 東京喰種/);assert.match(prompt,/manufacturer/);assert.match(prompt,/aliases/)});
test("多候選不超過三個",async()=>assert.equal((await identify("multi.jpg")).candidates.length,3));
test("API Key 缺失",async()=>await assert.rejects(()=>new OpenAIProvider(undefined,"test-model").identifyMachine(image("clear.jpg")),(error:unknown)=>error instanceof Error&&error.message.includes("OPENAI_API_KEY")));
test("API request failure",async()=>await assert.rejects(()=>new OpenAIProvider("test-key","test-model",async()=>{throw new Error("offline")}).identifyMachine(image("clear.jpg")),/暫時無法連線/));
test("使用者取消辨識",async()=>await assert.rejects(()=>new MockAIProvider().identifyMachine(image("cancel.jpg")),(error:unknown)=>error instanceof DOMException&&error.name==="AbortError"));
