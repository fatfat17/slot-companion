import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { catalogCoverAssetUrl,catalogCoverObjectPath } from "../src/lib/catalog/cover.ts";

test("Catalog cover object keys are deterministic and isolated per machine",()=>{
  const source="https://idn.p-world.co.jp/TEST/image.jpg";
  const first=catalogCoverObjectPath("machine-a",source,"image/jpeg");
  assert.equal(first,catalogCoverObjectPath("machine-a",source,"image/jpeg"));
  assert.match(first,/^catalog-covers\/machine-a\/[a-f0-9]{20}\.jpg$/);
  assert.notEqual(first,catalogCoverObjectPath("machine-b",source,"image/jpeg"));
  assert.equal(catalogCoverAssetUrl("machine-a",source),"/api/catalog-covers/machine-a?source=https%3A%2F%2Fidn.p-world.co.jp%2FTEST%2Fimage.jpg");
});

test("Catalog cover proxy only accepts a Catalog-owned P-WORLD image",()=>{
  const source=fs.readFileSync(new URL("../src/app/api/catalog-covers/[catalogId]/route.ts",import.meta.url),"utf8");
  assert.match(source,/catalogRepository\.list/);
  assert.match(source,/allowed\.includes\(canonical\)/);
  assert.match(source,/canonicalPWorldImageUrl/);
  assert.match(source,/CATALOG_COVER_MAX_BYTES/);
});

test("travel pack UI supports updating, inspecting and deleting only its own cache",()=>{
  const tools=fs.readFileSync(new URL("../src/components/CatalogGuideTools.tsx",import.meta.url),"utf8"),offline=fs.readFileSync(new URL("../src/lib/machine-guide/offlinePack.ts",import.meta.url),"utf8");
  assert.match(tools,/管理離線包/);assert.match(tools,/更新旅行離線包/);assert.match(tools,/deleteOfflinePack/);assert.match(tools,/Session、收藏與指南未受影響/);
  assert.match(offline,/caches\.delete\(OFFLINE_PACK_CACHE\)/);assert.doesNotMatch(offline,/localStorage\.clear/);assert.match(offline,/navigator\.storage\?\.estimate\?\./);
});
