import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parsePWorldMachineFacts } from "../src/lib/machine-guide/pworld.ts";
import { compileMachineGuide } from "../src/lib/machine-guide/compiler.ts";
import { materializeVisualGuideAssets } from "../src/lib/machine-guide/visualGuideMaterializer.ts";
import type { MachineCatalogRecord } from "../src/types/catalog.ts";

const record:MachineCatalogRecord={id:"machine-1y0erql",officialNameJa:"スマスロ バイオハザードRE:3",displayNameZh:"惡靈古堡 RE:3",manufacturer:"エンターライズ",brand:"",seriesName:"",aliases:[],machineType:"スマスロ",introducedAt:"2026-05-11",sourceName:"P-WORLD",sourceUrl:"https://www.p-world.co.jp/machine/database/10440",retrievedAt:"2026-08-30",verified:true,catalogStatus:"verified",sources:[]};
const fixture=fs.readFileSync(new URL("./fixtures/pworld-visual-guide-minimal.html",import.meta.url),"utf8");

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

test("only the Golden Test catalog receives visual assets",()=>{
  const other=parsePWorldMachineFacts(fixture,{...record,id:"machine-other"},"2026-08-30T00:00:00Z");
  assert.deepEqual(other.images,[]);
});

test("visual guide assets are measured and routed through the app without cloud config",async()=>{
  const guide=compileMachineGuide(parsePWorldMachineFacts(fixture,record,"2026-08-30T00:00:00Z"));
  const request:typeof fetch=async input=>{const url=String(input);assert.match(url,/machine-image\.p-world\.co\.jp/);return new Response(new Uint8Array([1,2,3,4]),{headers:{"Content-Type":"image/jpeg"}})};
  const result=await materializeVisualGuideAssets(guide,{},request);
  assert.equal(result.images?.length,3);
  assert.ok(result.images?.every(image=>image.byteSize===4&&image.storageStatus==="source"&&image.displayUrl.startsWith("/api/machine-guide-assets/machine-1y0erql")));
});

test("configured Supabase stores each Golden Test image in the private asset bucket",async()=>{
  const guide=compileMachineGuide(parsePWorldMachineFacts(fixture,record,"2026-08-30T00:00:00Z"));
  const uploaded:string[]=[];
  const request:typeof fetch=async(input,init)=>{const url=String(input);if(url.endsWith("/storage/v1/bucket"))return Response.json({name:"machine-guide-assets"});if(url.includes("machine-image.p-world.co.jp"))return new Response(new Uint8Array([1,2,3]),{headers:{"Content-Type":"image/jpeg"}});if(url.includes("/storage/v1/object/machine-guide-assets/")){uploaded.push(url);assert.equal(init?.method,"POST");return Response.json({Key:"stored"})}throw new Error(`unexpected ${url}`)};
  const result=await materializeVisualGuideAssets(guide,{SUPABASE_URL:"https://project.supabase.co",SUPABASE_SECRET_KEY:"sb_secret_TEST"},request);
  assert.equal(uploaded.length,3);
  assert.ok(result.images?.every(image=>image.storageStatus==="stored"));
});

test("home exposes the quick Chinese guide entry and full guide renders grounded images",()=>{
  const home=fs.readFileSync(new URL("../src/app/page.tsx",import.meta.url),"utf8"),view=fs.readFileSync(new URL("../src/components/MachineGuideView.tsx",import.meta.url),"utf8");
  assert.match(home,/快速中文攻略/);
  assert.match(home,/60 秒重點與完整圖文/);
  assert.match(view,/visual-guide-gallery/);
  assert.match(view,/圖文校準版/);
  assert.match(view,/image\.captionZh/);
});
