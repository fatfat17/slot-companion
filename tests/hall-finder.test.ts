import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildPWorldHallSearchUrl,parsePWorldHallList } from "../src/lib/halls/pworld.ts";
import { NEARBY_SLOT_MAPS_URL,normalizeHallSearchQuery } from "../src/lib/halls/search.ts";

const fixture=`<main><div class="hallList-item"><a class="hallList-item-name-link" href="/tokyo/test.htm">テストホール</a><p class="hallList-item-address">東京都新宿区1-2-3<a class="hallList-item-nearhall" href="/halls/abc/nearby">周辺</a></p><span data-type="s">20円</span></div></main>`;
test("P-WORLD hall parser extracts identity, address and navigation sources",()=>{const [hall]=parsePWorldHallList(fixture,"https://www.p-world.co.jp/tokyo/halls");assert.equal(hall.name,"テストホール");assert.equal(hall.address,"東京都新宿区1-2-3");assert.equal(hall.pworldUrl,"https://www.p-world.co.jp/tokyo/test.htm");assert.deepEqual(hall.slotRates,["20円"])});
test("machine reverse lookup uses P-WORLD machine_name",()=>{const url=buildPWorldHallSearchUrl("tokyo","新宿","L 東京喰種");assert.equal(url.searchParams.get("hall_name_address"),"新宿");assert.equal(url.searchParams.get("machine_name"),"L 東京喰種")});
test("home and catalog expose hall discovery without Night Hunter",()=>{const home=fs.readFileSync(new URL("../src/app/page.tsx",import.meta.url),"utf8"),detail=fs.readFileSync(new URL("../src/app/catalog/[id]/page.tsx",import.meta.url),"utf8");assert.match(home,/附近店家/);assert.doesNotMatch(home,/晚上撿台/);assert.match(detail,/附近哪裡有這台/);assert.match(detail,/\/halls\?machine=/)});
test("traditional Chinese and English place aliases become searchable Japanese names",()=>{assert.deepEqual(normalizeHallSearchQuery("豐州"),{query:"豊洲",changed:true});assert.deepEqual(normalizeHallSearchQuery("Toyosu"),{query:"豊洲",changed:true});assert.deepEqual(normalizeHallSearchQuery("澀谷"),{query:"渋谷",changed:true});assert.deepEqual(normalizeHallSearchQuery("新宿"),{query:"新宿",changed:false})});
test("nearby hall action delegates location handling directly to Google Maps",()=>{assert.match(NEARBY_SLOT_MAPS_URL,/google\.com\/maps\/search/);const ui=fs.readFileSync(new URL("../src/components/HallFinder.tsx",import.meta.url),"utf8");assert.doesNotMatch(ui,/navigator\.geolocation/);assert.match(ui,/直接在 Google Maps 找附近店家/)});
