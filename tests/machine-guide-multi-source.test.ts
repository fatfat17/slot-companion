import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parseChonboristaMachineFacts,ChonboristaMachineGuideProvider } from "../src/lib/machine-guide/chonborista.ts";
import { mergeMachineGuideFacts } from "../src/lib/machine-guide/merge.ts";
import { parsePWorldMachineFacts } from "../src/lib/machine-guide/pworld.ts";
import { compileMachineGuide } from "../src/lib/machine-guide/compiler.ts";
import { collectSupplementalGuideFacts } from "../src/lib/machine-guide/multiSource.ts";
import type { MachineCatalogRecord } from "../src/types/catalog.ts";

const read=(name:string)=>fs.readFileSync(new URL(`./fixtures/${name}`,import.meta.url),"utf8");
const record:MachineCatalogRecord={id:"pilot-test",officialNameJa:"TEST DATA BONUS MACHINE",displayNameZh:"TEST DATA",manufacturer:"TEST",brand:"",seriesName:"",aliases:[],machineType:"パチスロ",introducedAt:null,sourceName:"P-WORLD",sourceUrl:"https://www.p-world.co.jp/machine/database/10542",retrievedAt:"2026-08-30",verified:false,catalogStatus:"imported",sources:[]};
const chonUrl="https://chonborista.com/slot/test-slot/123456/";

test("Chonborista provider only accepts canonical machine article URLs",()=>{
  const provider=new ChonboristaMachineGuideProvider();
  assert.equal(provider.supports(chonUrl),true);
  assert.equal(provider.supports("https://chonborista.com/"),false);
  assert.equal(provider.supports("https://example.com/slot/test/123/"),false);
});

test("supplemental parser keeps article facts and excludes editorial comments, navigation and images",()=>{
  const facts=parseChonboristaMachineFacts(read("chonborista-machine-guide-minimal.html"),record,chonUrl,"2026-08-30T00:00:00Z"),text=facts.sections.flatMap(section=>[...section.paragraphsJa,...section.tables.flatMap(table=>table.rows.flat())]).join("\n");
  assert.match(text,/ボーナスで出玉/);
  assert.match(text,/1 \/ 303\.41/);
  assert.doesNotMatch(text,/50000ゲーム|確率詐欺|投稿日期|導覽列|関連記事/);
  assert.equal(facts.evidence.every(item=>item.sourceUrl===chonUrl),true);
  assert.ok(facts.sections.some(section=>section.key==="special_events"));
});

test("matching setting tables merge field sources despite harmless formatting differences",()=>{
  const primary=parsePWorldMachineFacts(read("pworld-10542-a-type-bonus.html"),record,"2026-08-30T00:00:00Z"),supplemental=parseChonboristaMachineFacts(read("chonborista-machine-guide-minimal.html"),record,chonUrl,"2026-08-30T00:00:00Z"),merged=mergeMachineGuideFacts(primary,[supplemental]),bonus=merged.sections.find(section=>section.key==="setting_rates")?.tables.find(table=>table.headers.includes("BB"));
  assert.deepEqual(bonus?.sourceNames,["P-WORLD","ちょんぼりすた"]);
  assert.deepEqual(bonus?.sourceUrls,[record.sourceUrl,chonUrl]);
  assert.equal(merged.conflicts?.length,0);
  assert.equal(merged.sources?.length,2);
});

test("conflicting source values block only their estimator metrics",()=>{
  const primary=parsePWorldMachineFacts(read("pworld-10542-a-type-bonus.html"),record,"2026-08-30T00:00:00Z"),conflictHtml=read("chonborista-machine-guide-minimal.html").replace("1/238.31","1/200.00"),supplemental=parseChonboristaMachineFacts(conflictHtml,record,chonUrl,"2026-08-30T00:00:00Z"),merged=mergeMachineGuideFacts(primary,[supplemental]),guide=compileMachineGuide(merged);
  assert.equal(merged.conflicts?.length,1);
  assert.ok(guide.sections.some(section=>section.key==="play"));
  assert.ok(guide.estimatorMetrics.filter(metric=>metric.metricKey==="bigBonus").every(metric=>metric.observationContract.status==="blocked"));
  assert.equal(guide.benchmarks.some(benchmark=>benchmark.metricKey==="bigBonus"),false);
});

test("supplemental setting values never invent an operational numerator",()=>{
  const html=`<!-- TEST DATA --><div class="entry-content"><h2>設定判別</h2><h3>CZ初当り確率</h3><table><tr><th>設定</th><th>CZ</th></tr>${[1,2,3,4,5,6].map(setting=>`<tr><td>${setting}</td><td>1/${400-setting*10}</td></tr>`).join("")}</table></div>`,supplemental=parseChonboristaMachineFacts(html,{...record,officialNameJa:"TEST DATA UNKNOWN"},chonUrl,"2026-08-30T00:00:00Z"),guide=compileMachineGuide(supplemental);
  assert.equal(guide.estimatorMetrics.length>0,true);
  assert.equal(guide.benchmarks.length,0);
  assert.equal(guide.estimatorMetrics.every(metric=>metric.observationContract.status==="blocked"),true);
});

test("supplemental request failure is isolated and reports a traceable warning",async()=>{
  const available=parseChonboristaMachineFacts(read("chonborista-machine-guide-minimal.html"),record,chonUrl,"2026-08-30T00:00:00Z"),sources=[{sourceName:"ちょんぼりすた",sourceUrl:chonUrl},{sourceName:"TEST DATA failed source",sourceUrl:"https://chonborista.com/slot/test/999999/"}],result=await collectSupplementalGuideFacts(sources,async source=>{if(source.sourceUrl.includes("999999"))throw new Error("HTTP 503");return available},()=>"2026-08-30T01:00:00Z");
  assert.equal(result.facts.length,1);
  assert.deepEqual(result.failedSources.map(source=>source.status),["failed"]);
  assert.match(result.warnings[0],/TEST DATA failed source.*503/);
});

test("bilingual and katakana spellings merge into one observable control",()=>{
  const baseFacts=parseChonboristaMachineFacts(`<!-- TEST DATA --><section class="entry-content"><h2>ゲームフロー</h2><h3>通常時のゲーム性</h3><p>CZ「NEMESIS BATTLE ネメシス バトル」に突入する。</p><p>ART「喰霊CHANCE」に突入する。</p></section>`,record,chonUrl),other=parseChonboristaMachineFacts(`<!-- TEST DATA --><section class="entry-content"><h2>ゲームフロー</h2><h3>通常時のゲーム性</h3><p>CZ「ネメシスバトル」に突入する。</p><p>ART「喰霊チャンス」に突入する。</p></section>`,record,"https://chonborista.com/slot/test/654321/");baseFacts.familyClassificationHint={family:"generic",confidence:"low",evidence:[],familyEvidence:[],unsupportedReasons:["TEST DATA"]};const guide=compileMachineGuide(mergeMachineGuideFacts(baseFacts,[other]));
  assert.equal(guide.recordableEvents.filter(event=>event.category==="cz").length,1);
  assert.equal(guide.recordableEvents.filter(event=>event.category==="art").length,1);
});

test("identical observations from repeated source tables compile to one benchmark",()=>{
  const primary=parsePWorldMachineFacts(read("pworld-10542-a-type-bonus.html"),record,"2026-08-30T00:00:00Z"),duplicate=parseChonboristaMachineFacts(read("chonborista-machine-guide-minimal.html").replace("ボーナス確率","設定推測"),record,chonUrl,"2026-08-30T00:00:00Z"),guide=compileMachineGuide(mergeMachineGuideFacts(primary,[duplicate]));
  assert.equal(guide.benchmarks.filter(benchmark=>benchmark.metricKey==="bigBonus").length,1);
  assert.equal(guide.benchmarks.filter(benchmark=>benchmark.metricKey==="regBonus").length,1);
  assert.ok((guide.benchmarks.find(benchmark=>benchmark.metricKey==="bigBonus")!.evidenceIds??[]).length>=1);
});

test("state-scoped rates without a session denominator stay out of estimator",()=>{
  const facts=parseChonboristaMachineFacts(`<!-- TEST DATA --><section class="entry-content"><h2>設定判別</h2><h3>CZ突入率</h3><table><tr><th>設定</th><th>AT中</th></tr>${[1,2,3,4,5,6].map(setting=>`<tr><td>${setting}</td><td>1/${230-setting}</td></tr>`).join("")}</table><h2>ゲームフロー</h2><p>AT「TEST RUSH」に突入する。</p></section>`,record,chonUrl);const guide=compileMachineGuide(facts);
  assert.equal(guide.benchmarks.length,0);
  assert.equal(guide.estimatorMetrics.every(metric=>metric.observationContract.status==="blocked"),true);
});
