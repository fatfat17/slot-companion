import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sanitizeSessionSceneContext,sanitizeSessionSceneResult } from "../src/lib/ai/scene.ts";

const rawContext={machineName:"測試機",currentState:"通常",controls:[
  {id:"cz-main",labelZh:"具名 CZ",labelJa:"ネーム CZ",controlType:"event",recognition:"機台顯示正式名稱",stateEffect:"cz",availability:"operational"},
  {id:"hidden",labelZh:"不可使用",labelJa:"",controlType:"event",recognition:"",stateEffect:"at",availability:"unavailable"},
]};

test("scene context only accepts operational Session controls",()=>{const context=sanitizeSessionSceneContext(rawContext);assert.ok(context);assert.deepEqual(context.controls.map(item=>item.id),["cz-main"])});
test("scene result drops invented controls and cannot stay matched without an allowed candidate",()=>{const context=sanitizeSessionSceneContext(rawContext)!;const result=sanitizeSessionSceneResult({status:"matched",summaryZh:"辨識結果",visibleText:["BONUS"],candidates:[{controlId:"invented-at",confidence:"high",reason:"猜測"}]},context);assert.equal(result.status,"uncertain");assert.deepEqual(result.candidates,[])});
test("scene result preserves an allowed candidate for user confirmation",()=>{const context=sanitizeSessionSceneContext(rawContext)!;const result=sanitizeSessionSceneResult({status:"matched",summaryZh:"看到正式名稱",visibleText:["ネーム CZ"],candidates:[{controlId:"cz-main",confidence:"high",reason:"畫面顯示正式模式名稱"}]},context);assert.equal(result.status,"matched");assert.equal(result.candidates[0].controlId,"cz-main")});
test("Session scene UI requires explicit confirmation and never stores the photo",()=>{const drawer=fs.readFileSync(new URL("../src/components/AICompanionDrawer.tsx",import.meta.url),"utf8"),session=fs.readFileSync(new URL("../src/components/SessionScreen.tsx",import.meta.url),"utf8"),route=fs.readFileSync(new URL("../src/app/api/ai/session-scene/route.ts",import.meta.url),"utf8");assert.match(drawer,/capture="environment"/);assert.match(drawer,/確認並記錄/);assert.match(drawer,/onConfirmScene/);assert.match(session,/confirmScene/);assert.doesNotMatch(drawer,/localStorage|saveSession/);assert.match(route,/maxRequestBytes/);assert.match(route,/maxImageBytes/) });
