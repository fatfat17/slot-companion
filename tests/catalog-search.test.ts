import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildMachineIdentityPrompt } from "../src/lib/ai/providers/openai.ts";
import { searchCatalogRecords } from "../src/lib/catalog/core.ts";
import type { MachineCatalogRecord } from "../src/types/catalog.ts";

const catalog=JSON.parse(readFileSync(new URL("../data/machine-catalog.json",import.meta.url),"utf8")) as MachineCatalogRecord[];

test("BIG DREAM 召回スマスロ ビッグドリーム",()=>{const result=searchCatalogRecords(catalog,["BIG DREAM"]);assert.equal(result[0]?.officialNameJa,"スマスロ ビッグドリーム THE GOLDEN PUSHER");assert.ok(result[0]?.searchMatchReasons.includes("romanized alias"))});
test("normalized English 忽略大小寫、空白與 dash",()=>{const spaced=searchCatalogRecords(catalog,["big-dream"]),compact=searchCatalogRecords(catalog,["BIGDREAM"]);assert.equal(spaced[0]?.id,"machine-1ryjocr");assert.equal(compact[0]?.id,"machine-1ryjocr")});
test("official title 支援 tokenized partial matching",()=>{const result=searchCatalogRecords(catalog,["GOLDEN PUSHER"]);assert.equal(result[0]?.id,"machine-1ryjocr");assert.ok(result[0]?.searchMatchReasons.includes("partial official title"))});
test("Tokyo Ghoul 召回 L 東京喰種",()=>{const result=searchCatalogRecords(catalog,["Tokyo Ghoul"]);assert.equal(result[0]?.id,"tokyo-ghoul")});
test("identity search 將 L 與スマスロ視為正式 title 前綴差異",()=>{const fromL=searchCatalogRecords(catalog,["L とある魔術の禁書目録2"]),fromSmartSlot=searchCatalogRecords(catalog,["スマスロ とある魔術の禁書目録2"]);assert.equal(fromL[0]?.id,"machine-th4uhu");assert.equal(fromSmartSlot[0]?.id,"machine-th4uhu");assert.ok(fromL[0]?.searchMatchReasons.includes("exact official title"));assert.ok((fromL[0]?.searchScore??0)>=180)});
test("manufacturer 只加權，不是召回必要條件",()=>{const withoutMaker=searchCatalogRecords(catalog,["BIG DREAM"]),withMaker=searchCatalogRecords(catalog,["BIG DREAM"],["サミー"]);assert.equal(withoutMaker[0]?.id,"machine-1ryjocr");assert.ok(withMaker[0]?.searchMatchReasons.includes("manufacturer boost"));assert.ok((withMaker[0]?.searchScore??0)>(withoutMaker[0]?.searchScore??0))});
test("GOD 單獨不形成唯一 shortlist",()=>assert.deepEqual(searchCatalogRecords(catalog,["GOD"]),[]));
test("Bullet of Bullets 無 Catalog 對應時不產生 shortlist",()=>assert.deepEqual(searchCatalogRecords(catalog,["Bullet of Bullets"]),[]));
test("衍生 alias 不覆寫 Catalog officialNameJa 或 aliases",()=>{const record=catalog.find(item=>item.id==="machine-1ryjocr")!;searchCatalogRecords(catalog,["BIG DREAM"]);assert.equal(record.officialNameJa,"スマスロ ビッグドリーム THE GOLDEN PUSHER");assert.deepEqual(record.aliases,[])});
test("AI shortlist prompt 包含 debug match reason",()=>{const result=searchCatalogRecords(catalog,["BIG DREAM"],["サミー"]);const prompt=buildMachineIdentityPrompt(result);assert.match(prompt,/romanized alias/);assert.match(prompt,/manufacturer boost/)});
