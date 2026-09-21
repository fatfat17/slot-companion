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
  assert.doesNotMatch(home,/開始一局/);
  assert.match(home,/title: "打柏青嫂（SLOT）"/);
  assert.match(home,/title: "打柏青哥（Pachinko）"/);
  assert.match(home,/找機台・拍照辨識・最近打過/);
  assert.doesNotMatch(home,/title: "拍機台"/);
  assert.doesNotMatch(home,/快速中文攻略|title: "機種資料庫"/);
  assert.match(home,/activeHref=active\?`\/session\/\$\{active\.id\}`:activePachinko\?`\/pachinko\/session\/\$\{activePachinko\.id\}`:null/);
  assert.match(home,/\{activeHref&&<Link href=\{activeHref\}/);
  assert.match(home,/新手快速入門|新手第一次玩/);
  assert.match(home,/\/glossary\?kind=slot/);
  assert.match(home,/\/glossary\?kind=pachinko/);
});

test("beginner glossary separates SLOT and Pachinko terms",()=>{const glossary=fs.readFileSync(new URL("../src/app/glossary/page.tsx",import.meta.url),"utf8");assert.match(glossary,/glossary-kind-tabs/);assert.match(glossary,/Pachislot Basics/);assert.match(glossary,/Pachinko Basics/);for(const term of ["千圓回轉","初當","RUSH","確變","ST","LT","ヘソ","電チュー","保留","右打ち","交換率"])assert.match(glossary,new RegExp(term));assert.match(glossary,/下一轉比較容易中/);assert.match(glossary,/不是中獎保證/)});

test("legacy start route returns to the new home split while both catalogs own their player views",()=>{
  assert.match(start,/redirect\("\/"\)/);
  assert.doesNotMatch(start,/開始一局|拍照辨識 SLOT|最近遊玩/);
  assert.match(catalogPage,/view==="favorites"\|\|view==="recent"/);
  assert.match(catalogPage,/initialMode=\{initialMode\}/);
  const pachinkoPage=fs.readFileSync(new URL("../src/app/pachinko/page.tsx",import.meta.url),"utf8");
  assert.match(pachinkoPage,/view==="favorites"\|\|view==="recent"/);
  assert.match(pachinkoPage,/initialMode=\{initialMode\}/);
});

test("completed play keeps its machine kind context and still offers home",()=>{
  const slotSummary=fs.readFileSync(new URL("../src/app/summary/[id]/page.tsx",import.meta.url),"utf8");
  const pachinkoSession=fs.readFileSync(new URL("../src/components/PachinkoSessionScreen.tsx",import.meta.url),"utf8");
  assert.match(slotSummary,/href="\/catalog\?view=recent"[^>]*>回 SLOT 最近打過/);
  assert.match(pachinkoSession,/href="\/pachinko\?view=recent"[^>]*>回柏青哥最近打過/);
  assert.match(slotSummary,/href="\/"[^>]*>回首頁/);
  assert.match(pachinkoSession,/href="\/"[^>]*>回首頁/);
});

test("Catalog importer entry is reachable in development or a configured cloud admin environment",()=>{
  assert.deepEqual(getCatalogImporterPresentation("development"),{available:true,href:"/admin/catalog-import",label:"更新機種資料庫"});
  assert.deepEqual(getCatalogImporterPresentation("production"),{available:false,label:"更新機種資料庫",notice:"目前僅能在本機管理環境執行"});
  assert.deepEqual(getCatalogImporterPresentation("production",true),{available:true,href:"/admin/catalog-import",label:"更新機種資料庫"});
  assert.match(catalog,/\{summary\.total\} 台機種，隨時可查/);
  assert.match(catalog,/href="\/identify"[^>]*>📷 拍照找 SLOT/);
  const pachinko=fs.readFileSync(new URL("../src/app/pachinko/PachinkoLibraryClient.tsx",import.meta.url),"utf8");
  assert.match(pachinko,/href="\/identify\/pachinko"[^>]*>📷 拍照找柏青哥/);
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
