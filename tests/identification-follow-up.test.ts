import assert from "node:assert/strict";
import test from "node:test";
import type { MachineIdentificationCandidate } from "../src/types/index.ts";
import { getIdentificationFollowUp } from "../src/lib/ai/identificationFollowUp.ts";

const catalogOnly:MachineIdentificationCandidate={machineNameJa:"スマスロ とある魔術の禁書目録2",machineNameZh:"魔法禁書目錄2",manufacturer:"TEST",confidence:.9,reason:"TEST",visibleEvidence:["TEST"],identityBasis:"catalog_match",matchedCatalogId:"machine-index-2"};

test("identified + Catalog-only shows Profile Builder and Catalog Detail routes",()=>{
  const action=getIdentificationFollowUp("identified",catalogOnly,"2026-08-27T00:00:00.000Z");
  assert.deepEqual(action,{kind:"catalog-only",primaryHref:"/admin/profile-builder/machine-index-2",primaryLabel:"✓ 就是這台 · 建立攻略 Profile",secondaryHref:"/catalog/machine-index-2",secondaryLabel:"查看 Machine Catalog 資料"});
});

test("identified + existing Profile keeps the load Profile action only",()=>{
  const action=getIdentificationFollowUp("identified",{...catalogOnly,matchedMachineId:"tokyo-ghoul"},"2026-08-27T00:00:00.000Z");
  assert.equal(action?.kind,"existing-profile");
  assert.equal(action?.primaryLabel,"✓ 就是這台 · 載入現有 Profile");
  assert.match(action?.primaryHref??"",/^\/machines\/tokyo-ghoul\?ai=1&/);
  assert.equal("secondaryHref" in (action??{}),false);
});

test("uncertain and unknown never expose Profile Builder",()=>{
  assert.equal(getIdentificationFollowUp("uncertain",catalogOnly,"2026-08-27"),null);
  assert.equal(getIdentificationFollowUp("unknown",catalogOnly,"2026-08-27"),null);
});

test("identified without a reliable Catalog id has no follow-up",()=>{
  assert.equal(getIdentificationFollowUp("identified",{...catalogOnly,matchedCatalogId:null},"2026-08-27"),null);
});

test("catalog id is safely passed to both dynamic routes",()=>{
  const action=getIdentificationFollowUp("identified",{...catalogOnly,matchedCatalogId:"catalog/id 2"},"2026-08-27");
  assert.equal(action?.kind,"catalog-only");
  if(action?.kind!=="catalog-only")throw new Error("Expected catalog-only action");
  assert.equal(action.primaryHref,"/admin/profile-builder/catalog%2Fid%202");
  assert.equal(action.secondaryHref,"/catalog/catalog%2Fid%202");
});
