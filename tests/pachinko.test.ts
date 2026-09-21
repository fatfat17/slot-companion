import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {classifyPachinkoType,searchPachinkoCatalog} from "../src/lib/pachinko/catalog.ts";
import {parsePWorldPachinkoCalendar,parsePWorldPachinkoGuide} from "../src/lib/pachinko/pworld.ts";
import {pachinkoSessionSummary} from "../src/lib/pachinko/storage.ts";
import type {PachinkoCatalogRecord,PachinkoSession} from "../src/types/pachinko.ts";

const record:PachinkoCatalogRecord={id:"pachi-10504",officialNameJa:"e 甲鉄城のカバネリ2",displayNameZh:"甲鐵城的卡巴內里2",manufacturer:"サミー",seriesName:"甲鉄城のカバネリ",aliases:["卡巴內里"],machineType:"smart_pachinko",tags:["LT"],introducedAt:"2026-09-07",sourceName:"P-WORLD",sourceUrl:"https://www.p-world.co.jp/machine/database/10504",retrievedAt:"2026-09-21T00:00:00Z",catalogStatus:"imported"};

test("Pachinko catalog classifies independently and searches Chinese aliases",()=>{assert.equal(classifyPachinkoType("e 新台"),"smart_pachinko");assert.equal(classifyPachinkoType("PHはねもの ハネ釈迦"),"hanemono");assert.equal(searchPachinkoCatalog([record],"卡巴內里").length,1)});

test("P-WORLD calendar parser reads only the Pachinko grid",()=>{const html=`<div class="machineList js-machineList" data-yyyymmdd="20260907"><ul class="machineList-grid machineList-grid--pachi"><li class="machineList-item"><div class="machineList-item-title"><a href="/machine/database/10504">e 甲鉄城のカバネリ2</a></div><div class="machineList-item-maker">サミー</div><div class="machineList-item-thumb"><img src="/cover.jpg"></div></li></ul><ul class="machineList-grid machineList-grid--slot"><li class="machineList-item"><div class="machineList-item-title"><a href="/machine/database/99999">SLOT TEST</a></div></li></ul></div>`;const records=parsePWorldPachinkoCalendar(html,"https://www.p-world.co.jp/database/calendar","2026-09-21T00:00:00Z");assert.equal(records.length,1);assert.equal(records[0].id,"pachi-10504");assert.equal(records[0].introducedAt,"2026-09-07");assert.equal(records[0].catalogStatus,"imported")});

test("Pachinko guide extracts public spec facts without predictive claims",()=>{const html=`<table><tr><th>大当り確率</th><td>1/119.8</td></tr><tr><th>RUSH突入率</th><td>約50%</td></tr><tr><th>RUSH継続率</th><td>約80%</td></tr></table><span class="kisyuTag-pachiType">LT</span><p>右打</p>`;const guide=parsePWorldPachinkoGuide(html,record,"2026-09-21T00:00:00Z");assert.equal(guide.status,"usable");assert.ok(guide.facts.some(item=>item.labelZh==="大當機率"&&item.value.includes("1/119.8")));assert.ok(guide.gameFlow.some(item=>item.includes("Lucky Trigger")));assert.ok(guide.playNotes.every(item=>!item.includes("必中")))});

test("Pachinko summary calculates observed rotations only",()=>{const session:PachinkoSession={id:"test",catalogId:record.id,machineName:record.displayNameZh,machineNumber:"1",startedAt:"2026-09-21T00:00:00Z",status:"completed",playState:"normal",startSpins:80,currentSpins:280,investmentYen:10000,heldBalls:0,initialHits:1,rushEntries:1,rushHits:3,maxRushStreak:3,currentRushStreak:3,note:"TEST DATA"};assert.deepEqual(pachinkoSessionSummary(session),{spins:200,rotationsPerThousand:20})});

test("Pachinko architecture uses independent catalog, storage and route",()=>{const repository=fs.readFileSync(new URL("../src/lib/pachinko/repository.server.ts",import.meta.url),"utf8"),storage=fs.readFileSync(new URL("../src/lib/pachinko/storage.ts",import.meta.url),"utf8"),detail=fs.readFileSync(new URL("../src/app/pachinko/[id]/page.tsx",import.meta.url),"utf8");assert.match(repository,/pachinko_catalog_records/);assert.match(storage,/pachinko-sessions-v1/);assert.match(detail,/kind=pachinko/)});
