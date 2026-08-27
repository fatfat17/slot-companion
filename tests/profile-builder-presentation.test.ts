import assert from "node:assert/strict";
import test from "node:test";
import { getProfileBuilderPresentation } from "../src/lib/catalog/profileBuilderPresentation.ts";

test("production Catalog Detail has no unreachable Builder link",()=>{
  const presentation=getProfileBuilderPresentation({catalogId:"machine-index-2",hasProfile:false,hasDraft:false,environment:"production"});
  assert.deepEqual(presentation,{available:false,notice:"Profile Lab 雲端建立功能準備中"});
  assert.doesNotMatch(JSON.stringify(presentation),/admin\/profile-builder/);
});

test("development Catalog Detail keeps the Builder entry",()=>{
  assert.deepEqual(getProfileBuilderPresentation({catalogId:"machine-index-2",hasProfile:false,hasDraft:false,environment:"development"}),{available:true,href:"/admin/profile-builder/machine-index-2",label:"建立攻略 Profile"});
});

test("development Builder entry preserves draft and upgrade labels",()=>{
  assert.equal(getProfileBuilderPresentation({catalogId:"draft",hasProfile:false,hasDraft:true,environment:"development"}).available,true);
  assert.deepEqual(getProfileBuilderPresentation({catalogId:"profile",hasProfile:true,hasDraft:false,environment:"development"}),{available:true,href:"/admin/profile-builder/profile",label:"重建／升級攻略 Profile"});
});
