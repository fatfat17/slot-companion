import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parsePWorldMachineFacts } from "../src/lib/machine-guide/pworld.ts";
import { compileMachineGuide } from "../src/lib/machine-guide/compiler.ts";
import { materializeVisualGuideAssets } from "../src/lib/machine-guide/visualGuideMaterializer.ts";
import { VISUAL_GUIDE_FIRST_PILOT_CATALOG_IDS,VISUAL_GUIDE_PILOT_CATALOG_IDS,VISUAL_GUIDE_SECOND_PILOT_CATALOG_IDS,VISUAL_GUIDE_THIRD_PILOT_CATALOG_IDS } from "../src/lib/machine-guide/visualGuide.ts";
import { buildVisualGuideAssetManifest,buildVisualGuideAssetReport,visualGuideCapacityLevel } from "../src/lib/machine-guide/visualGuideGovernance.ts";
import { buildVisualGuideDisplaySections } from "../src/lib/machine-guide/visualPresentation.ts";
import type { MachineCatalogRecord } from "../src/types/catalog.ts";

const record:MachineCatalogRecord={id:"machine-1y0erql",officialNameJa:"スマスロ バイオハザードRE:3",displayNameZh:"惡靈古堡 RE:3",manufacturer:"エンターライズ",brand:"",seriesName:"",aliases:[],machineType:"スマスロ",introducedAt:"2026-05-11",sourceName:"P-WORLD",sourceUrl:"https://www.p-world.co.jp/machine/database/10440",retrievedAt:"2026-08-30",verified:true,catalogStatus:"verified",sources:[]};
const fixture=fs.readFileSync(new URL("./fixtures/pworld-visual-guide-minimal.html",import.meta.url),"utf8");
const pilotRecords:MachineCatalogRecord[]=VISUAL_GUIDE_PILOT_CATALOG_IDS.map(id=>({...record,id}));
const catalogRecords=JSON.parse(fs.readFileSync(new URL("../data/machine-catalog.json",import.meta.url),"utf8")) as MachineCatalogRecord[];

test("P-WORLD visual guide extracts only official-scope useful images and keeps stable order",()=>{
  const facts=parsePWorldMachineFacts(fixture,record,"2026-08-30T00:00:00Z"),images=facts.images??[];
  assert.equal(images.length,3);
  assert.deepEqual(images.map(image=>image.sectionKey),["flow","cz","at_art"]);
  assert.match(images[0].captionZh,/遊戲流程/);
  assert.match(images[1].captionZh,/NEMESIS BATTLE/);
  assert.match(images[2].captionZh,/HAZARD RUSH/);
  assert.equal(JSON.stringify(images).includes("kisyubbs"),false);
  assert.equal(JSON.stringify(images).includes("example.com"),false);
  assert.equal(JSON.stringify(images).includes("re3-small"),false);
});

test("all scale pilot catalogs use the same evidence-gated visual parser",()=>{
  for(const pilot of pilotRecords){
    const facts=parsePWorldMachineFacts(fixture,pilot,"2026-08-30T00:00:00Z");
    assert.equal(facts.images?.length,3,pilot.id);
    assert.ok(facts.images?.every(image=>image.sourcePageUrl===pilot.sourceUrl),pilot.id);
  }
});

test("visual pilot registry contains five accepted, twenty second-batch and twenty-five third-batch machines",()=>{
  assert.equal(VISUAL_GUIDE_FIRST_PILOT_CATALOG_IDS.length,5);
  assert.equal(VISUAL_GUIDE_SECOND_PILOT_CATALOG_IDS.length,20);
  assert.equal(VISUAL_GUIDE_THIRD_PILOT_CATALOG_IDS.length,25);
  assert.equal(VISUAL_GUIDE_PILOT_CATALOG_IDS.length,50);
  assert.equal(new Set(VISUAL_GUIDE_PILOT_CATALOG_IDS).size,50);
});

test("catalog records outside earlier pilots receive the same evidence-gated visual assets",()=>{
  const other=parsePWorldMachineFacts(fixture,{...record,id:"machine-other"},"2026-08-30T00:00:00Z");
  assert.equal(other.images?.length,3);
  assert.ok(other.images?.every(image=>image.sourcePageUrl===record.sourceUrl));
});

test("all Catalog records use the same evidence-gated visual guide pipeline",()=>{
  assert.equal(catalogRecords.length,202);
  for(const catalogRecord of catalogRecords){
    const facts=parsePWorldMachineFacts(fixture,catalogRecord,"2026-08-30T00:00:00Z");
    assert.equal(facts.images?.length,3,catalogRecord.id);
    assert.ok(facts.images?.every(image=>image.sourcePageUrl===catalogRecord.sourceUrl),catalogRecord.id);
  }
});

test("visual guide assets are measured and routed through the app without cloud config",async()=>{
  const guide=compileMachineGuide(parsePWorldMachineFacts(fixture,record,"2026-08-30T00:00:00Z"));
  const request:typeof fetch=async input=>{const url=String(input);assert.match(url,/machine-image\.p-world\.co\.jp/);return new Response(new Uint8Array([1,2,3,4]),{headers:{"Content-Type":"image/jpeg"}})};
  const result=await materializeVisualGuideAssets(guide,{},request);
  assert.equal(result.images?.length,3);
  assert.ok(result.images?.every(image=>image.byteSize===4&&image.storageStatus==="source"&&image.displayUrl.startsWith("/api/machine-guide-assets/machine-1y0erql")));
});

test("configured Supabase stores each pilot image under its own catalog path",async()=>{
  const guide=compileMachineGuide(parsePWorldMachineFacts(fixture,record,"2026-08-30T00:00:00Z"));
  const uploaded:string[]=[];
  const request:typeof fetch=async(input,init)=>{const url=String(input);if(url.endsWith("/storage/v1/bucket"))return Response.json({name:"machine-guide-assets"});if(url.includes("machine-image.p-world.co.jp"))return new Response(new Uint8Array([1,2,3]),{headers:{"Content-Type":"image/jpeg"}});if(url.includes("/storage/v1/object/list/"))return Response.json([]);if(url.endsWith("/_manifest.json"))return Response.json({Key:"manifest"});if(url.includes("/storage/v1/object/machine-guide-assets/")){uploaded.push(url);assert.equal(init?.method,"POST");return Response.json({Key:"stored"})}throw new Error(`unexpected ${url}`)};
  const result=await materializeVisualGuideAssets(guide,{SUPABASE_URL:"https://project.supabase.co",SUPABASE_SECRET_KEY:"sb_secret_TEST"},request);
  assert.equal(uploaded.length,3);
  assert.ok(uploaded.every(url=>url.includes("/machine-guide-assets/machine-1y0erql/")));
  assert.ok(result.images?.every(image=>image.storageStatus==="stored"));
  assert.equal(result.visualAssetReport?.cleanupStatus,"completed");
  assert.equal(result.visualAssetReport?.storageMode,"cloud");
});

test("successful rebuild removes only stale assets owned by the same catalog",async()=>{
  const guide=compileMachineGuide(parsePWorldMachineFacts(fixture,record,"2026-08-30T00:00:00Z")),deleted:string[][]=[];
  const request:typeof fetch=async(input,init)=>{const url=String(input);if(url.endsWith("/storage/v1/bucket"))return Response.json({name:"machine-guide-assets"});if(url.includes("machine-image.p-world.co.jp"))return new Response(new Uint8Array([1]),{headers:{"Content-Type":"image/jpeg"}});if(url.includes("/storage/v1/object/list/"))return Response.json([{name:"old.jpg"},{name:"machine-1y0erql/older.jpg"},{name:"_manifest.json"},{name:"machine-1y0erql/_manifest.json"}]);if(init?.method==="DELETE"){deleted.push((JSON.parse(String(init.body)) as {prefixes:string[]}).prefixes);return Response.json({})}if(url.includes("/storage/v1/object/machine-guide-assets/"))return Response.json({Key:"stored"});throw new Error(`unexpected ${url}`)};
  const result=await materializeVisualGuideAssets(guide,{SUPABASE_URL:"https://project.supabase.co",SUPABASE_SECRET_KEY:"sb_secret_TEST"},request);
  assert.deepEqual(deleted,[["machine-1y0erql/old.jpg","machine-1y0erql/older.jpg"]]);
  assert.equal(result.visualAssetReport?.removedAssetCount,2);
});

test("partial rebuild preserves previous cloud assets and skips cleanup",async()=>{
  const guide=compileMachineGuide(parsePWorldMachineFacts(fixture,record,"2026-08-30T00:00:00Z"));let downloads=0,listCalls=0;
  const request:typeof fetch=async(input)=>{const url=String(input);if(url.endsWith("/storage/v1/bucket"))return Response.json({name:"machine-guide-assets"});if(url.includes("machine-image.p-world.co.jp")){downloads++;return downloads===2?new Response("failed",{status:503}):new Response(new Uint8Array([1]),{headers:{"Content-Type":"image/jpeg"}})}if(url.includes("/storage/v1/object/list/")){listCalls++;return Response.json([])}if(url.includes("/storage/v1/object/machine-guide-assets/"))return Response.json({Key:"stored"});throw new Error(`unexpected ${url}`)};
  const result=await materializeVisualGuideAssets(guide,{SUPABASE_URL:"https://project.supabase.co",SUPABASE_SECRET_KEY:"sb_secret_TEST"},request);
  assert.equal(listCalls,0);
  assert.equal(result.visualAssetReport?.cleanupStatus,"skipped");
  assert.equal(result.images?.length,2);
});

test("asset manifest and capacity report are deterministic and contain no source HTML",()=>{
  const guide=compileMachineGuide(parsePWorldMachineFacts(fixture,record,"2026-08-30T00:00:00Z")),images=(guide.images??[]).map(image=>({...image,byteSize:400_000,contentType:"image/jpeg",storageStatus:"stored" as const})),manifest=buildVisualGuideAssetManifest(record.id,images,"now"),report=buildVisualGuideAssetReport({images,deduplicatedCount:1,rejectedImageCount:2,cloud:true,cleanupStatus:"completed",removedAssetCount:2,generatedAt:"now"});
  assert.equal(manifest.assets.length,3);
  assert.ok(manifest.assets.every(asset=>asset.path.startsWith(`${record.id}/`)));
  assert.equal(JSON.stringify(manifest).includes("<html"),false);
  assert.equal(report.deduplicatedCount,1);
  assert.equal(report.rejectedImageCount,2);
  assert.equal(report.totalBytes,1_200_000);
  assert.equal(report.capacityLevel,"normal");
  assert.equal(visualGuideCapacityLevel(18,12_000_000),"warning");
  assert.equal(visualGuideCapacityLevel(19,1),"blocked");
});

test("visual assets cannot cross-pollinate between pilot machines",async()=>{
  const otherRecord={...record,id:"machine-u0ht3u"},guide=compileMachineGuide(parsePWorldMachineFacts(fixture,otherRecord,"2026-08-30T00:00:00Z"));
  const request:typeof fetch=async input=>{assert.match(String(input),/machine-image\.p-world\.co\.jp/);return new Response(new Uint8Array([1]),{headers:{"Content-Type":"image/jpeg"}})};
  const result=await materializeVisualGuideAssets(guide,{},request);
  assert.ok(result.images?.every(image=>image.displayUrl.startsWith("/api/machine-guide-assets/machine-u0ht3u")));
  assert.ok(result.images?.every(image=>!image.displayUrl.includes("machine-1y0erql")));
});

test("image sections remain visible when the Chinese summary omits a source section",()=>{
  const guide=compileMachineGuide(parsePWorldMachineFacts(fixture,record,"2026-08-30T00:00:00Z"));
  guide.playerGuideZh={generator:"rules",overview:"TEST DATA",goals:[],highlights:[],sections:[{key:"flow",title:"遊戲流程",summary:"TEST DATA",points:[],sourceSectionKeys:["flow"]}],generatedAt:"2026-08-30T00:00:00Z"};
  const sections=buildVisualGuideDisplaySections(guide),shown=sections.flatMap(section=>section.images);
  assert.equal(shown.length,guide.images?.length);
  assert.equal(new Set(shown.map(image=>image.id)).size,shown.length);
  assert.ok(sections.some(section=>section.key==="cz"&&section.summary.includes("來源圖解")));
});

test("home exposes the quick Chinese guide entry and full guide renders grounded images",()=>{
  const home=fs.readFileSync(new URL("../src/app/page.tsx",import.meta.url),"utf8"),view=fs.readFileSync(new URL("../src/components/MachineGuideView.tsx",import.meta.url),"utf8");
  assert.match(home,/快速中文攻略/);
  assert.match(home,/60 秒重點與完整圖文/);
  assert.match(view,/visual-guide-gallery/);
  assert.match(view,/圖文指南/);
  assert.match(view,/image\.captionZh/);
});
