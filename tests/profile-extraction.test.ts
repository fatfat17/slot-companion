import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseStructuredProfileHtml } from "../src/lib/profile-builder/providers/html-structure.ts";

const html=readFileSync(new URL("./fixtures/onegeki-tokyo-ghoul-structure.html",import.meta.url),"utf8"),sections=parseStructuredProfileHtml(html);
const byKey=(key:string)=>sections.find(item=>item.metricKey===key)!;

test("一撃東京喰種 fixture 抽出 8 個指定 section",()=>assert.deepEqual(sections.map(item=>item.metricKey),["atInitialRate","endScreenIndications","czInitialRate","weakCherryCzSuccessRate","within100GameHitRate","atDirectHitRate","atReturnRate","lowerReplayRate"]));
test("設定 1～6 table 保留 headers、rows 與 numeric values",()=>{const at=byKey("atInitialRate");assert.deepEqual(at.tableHeaders,["設定","AT初当り確率"]);assert.equal(at.rows.length,6);assert.deepEqual(at.rows[0],["1","1/394.4"]);assert.deepEqual(at.rows[5],["6","1/261.3"]);assert.equal(at.extractedFrom,"table")});
test("rowspan 展開後設定2仍保留 AT 引き戻し數值",()=>assert.deepEqual(byKey("atReturnRate").rows[1],["2","7.81%"]));
test("弱チェリー multi-row headers 正確",()=>assert.deepEqual(byKey("weakCherryCzSuccessRate").tableHeaders,["設定","通常滞在時","高確滞在時"]));
test("AT終了畫面保留結構化 rows",()=>{const evidence=byKey("endScreenIndications");assert.deepEqual(evidence.tableHeaders,["終了画面","示唆内容"]);assert.ok(evidence.rows.some(row=>row.includes("設定6 濃厚!?")))});
test("navigation / SEO / related / ads 不成為 metric 或 note",()=>{const serialized=JSON.stringify(sections);assert.doesNotMatch(serialized,/navigation|SEO|関連記事|ランキング|広告の下/)});
test("沒有可靠 table 或明確正文時不建立 evidence",()=>assert.deepEqual(parseStructuredProfileHtml("<nav>AT初当り確率</nav><h2>AT初当り確率</h2><div>値なし</div>"),[]));
