import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { catalogEstimatorCoverageFromAudit,filterCatalogRecordsByEstimatorSupport } from "../src/lib/catalog/estimatorCoverage.ts";

const audit=JSON.parse(fs.readFileSync(new URL("../reports/machine-catalog-control-audit.json",import.meta.url),"utf8"));

test("Catalog estimator coverage is generated from the reproducible control audit",()=>{
  const coverage=catalogEstimatorCoverageFromAudit(audit);
  assert.ok(coverage);
  assert.equal(coverage.catalogTotal,202);
  assert.equal(coverage.eligibleTotal,102);
  assert.equal(new Set(coverage.eligibleCatalogIds).size,102);
  assert.ok(coverage.eligibleCatalogIds.includes("machine-1cxlsjr"));
  assert.ok(!coverage.eligibleCatalogIds.includes("machine-1nc39ii"));
});

test("Catalog estimator filters split supported and record-only machines without changing records",()=>{
  const coverage=catalogEstimatorCoverageFromAudit(audit)!;
  const records=audit.details.map((item:{catalogId:string})=>({id:item.catalogId}));
  assert.equal(filterCatalogRecordsByEstimatorSupport(records,"all",coverage.eligibleCatalogIds).length,202);
  assert.equal(filterCatalogRecordsByEstimatorSupport(records,"supported",coverage.eligibleCatalogIds).length,102);
  assert.equal(filterCatalogRecordsByEstimatorSupport(records,"record-only",coverage.eligibleCatalogIds).length,100);
  assert.equal(filterCatalogRecordsByEstimatorSupport(records,"supported",null).length,202);
});

test("Catalog estimator coverage rejects missing or empty audit details",()=>{
  assert.equal(catalogEstimatorCoverageFromAudit(null),null);
  assert.equal(catalogEstimatorCoverageFromAudit({summary:{catalogTotal:202},details:[]}),null);
});

test("Catalog Library presents estimator badges and explicit filters",()=>{
  const source=fs.readFileSync(new URL("../src/app/catalog/CatalogLibraryClient.tsx",import.meta.url),"utf8");
  assert.match(source,/支援設定參考/);
  assert.match(source,/僅遊玩紀錄/);
  assert.match(source,/catalog-estimator-badge/);
  assert.match(source,/filterCatalogRecordsByEstimatorSupport/);
});
