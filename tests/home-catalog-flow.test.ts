import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {getCatalogImporterPresentation} from "../src/lib/catalog/importerPresentation.ts";

const home=fs.readFileSync(new URL("../src/app/page.tsx",import.meta.url),"utf8");
const start=fs.readFileSync(new URL("../src/app/start/page.tsx",import.meta.url),"utf8");
const catalogPage=fs.readFileSync(new URL("../src/app/catalog/page.tsx",import.meta.url),"utf8");
const catalog=fs.readFileSync(new URL("../src/app/catalog/CatalogLibraryClient.tsx",import.meta.url),"utf8");
const drawer=fs.readFileSync(new URL("../src/components/SessionGuideDrawer.tsx",import.meta.url),"utf8");

test("home uses the guide-first player flow without rendering legacy Profile cards",()=>{
  assert.doesNotMatch(home,/已建立攻略 Profile/);
  assert.doesNotMatch(home,/machines\.map/);
  assert.match(home,/拍照辨識，或從熟悉的機種開始/);
  assert.match(home,/開始一局/);
  assert.match(home,/搜尋機種・查看中文圖文指南・開始 Session/);
  assert.match(home,/title: "機台攻略"/);
  assert.doesNotMatch(home,/title: "拍機台"/);
  assert.doesNotMatch(home,/快速中文攻略|title: "機種資料庫"/);
  assert.match(home,/href=\{active \? `\/session\/\$\{active\.id\}` : "\/start"\}/);
});

test("start flow separates unknown-machine identification from known-machine selection",()=>{
  assert.match(start,/不知道機種/);
  assert.match(start,/href="\/identify"/);
  assert.match(start,/知道機種/);
  assert.match(start,/href="\/catalog"/);
  assert.match(start,/href="\/catalog\?view=recent"/);
  assert.match(start,/href="\/catalog\?view=favorites"/);
  assert.match(start,/拍現在畫面/);
  assert.match(catalogPage,/view==="favorites"\|\|view==="recent"/);
  assert.match(catalogPage,/initialMode=\{initialMode\}/);
});

test("Catalog importer entry is reachable in development or a configured cloud admin environment",()=>{
  assert.deepEqual(getCatalogImporterPresentation("development"),{available:true,href:"/admin/catalog-import",label:"更新機種資料庫"});
  assert.deepEqual(getCatalogImporterPresentation("production"),{available:false,label:"更新機種資料庫",notice:"目前僅能在本機管理環境執行"});
  assert.deepEqual(getCatalogImporterPresentation("production",true),{available:true,href:"/admin/catalog-import",label:"更新機種資料庫"});
  assert.match(catalog,/\{summary\.total\} 台機種，隨時可查/);
  assert.match(catalog,/importer\.available/);
  assert.match(catalog,/onClick=\{\(\)=>setManagementOpen\(true\)\}/);
  assert.match(catalog,/線上版目前不能永久寫入專案 Catalog/);
  assert.match(catalog,/在本機開發環境開啟 Catalog Importer/);
  assert.doesNotMatch(catalog,/<Link[^>]+href="\/admin\/catalog-import"/);
});

test("Session guide offers refresh without replacing the current Session snapshot",()=>{
  assert.match(drawer,/refreshCachedMachineGuide\(catalogId\)/);
  assert.match(drawer,/重新整理機台指南/);
  assert.match(drawer,/新的記錄項目會在下一個 Session 套用/);
  assert.match(drawer,/目前 Session 與上一份指南仍保留/);
});
