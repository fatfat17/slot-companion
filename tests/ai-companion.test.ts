import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { companionDeveloperPrompt,sanitizeCompanionContext,sanitizeCompanionQuestion } from "../src/lib/ai/companion.ts";
test("companion input is bounded and requires a machine",()=>{assert.equal(sanitizeCompanionQuestion(" x "),"x");assert.equal(sanitizeCompanionQuestion("a".repeat(400)).length,300);assert.equal(sanitizeCompanionContext({}),null);const context=sanitizeCompanionContext({machineName:"測試機",currentState:"通常",records:Array.from({length:40},(_,index)=>({label:`事件${index}`,value:"1 次"}))});assert.equal(context?.records.length,24)});
test("companion prompt is grounded and does not promise wins",()=>{const prompt=companionDeveloperPrompt();assert.match(prompt,/只能使用/);assert.match(prompt,/不可編造/);assert.match(prompt,/不可宣稱能準確判定設定或保證獲利/)});
test("Session drawer calls the server route and contains no mock claim",()=>{const drawer=fs.readFileSync(new URL("../src/components/AICompanionDrawer.tsx",import.meta.url),"utf8"),session=fs.readFileSync(new URL("../src/components/SessionScreen.tsx",import.meta.url),"utf8");assert.match(drawer,/\/api\/ai\/session-companion/);assert.match(session,/AICompanionDrawer/);assert.doesNotMatch(session,/AI 功能將於下一階段接入/)});
