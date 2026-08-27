import assert from "node:assert/strict";
import test from "node:test";
import type { Machine } from "../src/types/index.ts";
import type { ProfileDraft, ProfileSourceEvidence } from "../src/types/profileBuilder.ts";
import { buildMachineCardMetrics, metricLabels } from "../src/lib/machine-card/presentation.ts";

const evidence = (id:string, sourceName:string, metricKey:string, rows:string[][]):ProfileSourceEvidence => ({
  id, sourceName, metricKey, rows, tableHeaders:["設定","數值"], sourceUrl:`https://${sourceName}.example/test`,
  retrievedAt:"2026-08-27T00:00:00.000Z", sectionKey:metricKey, extractedValue:["設定 | 數值",...rows.map(row=>row.join(" | "))],
  rawLabel:metricKey, confidence:1, reviewStatus:"approved", extractedFrom:"table",
});

const nanaEnd=evidence("nana-end","なな徹","endScreenIndications",[["金木","設定4以上"]]);
const ichiEnd={...evidence("ichi-end","一撃","endScreenIndications",[["金木","デフォルト"]]),reviewStatus:"rejected" as const};
const nanaSingle=evidence("nana-cz-end","なな徹","czEndScreenIndications",[["梟","設定4以上"]]);
const atIchi=evidence("ichi-at","一撃","atInitialRate",[["1","1/394.4"]]);
const atNana=evidence("nana-at","なな徹","atInitialRate",[["1","1/394.4"]]);

const draft:ProfileDraft={
  id:"draft-tokyo",catalogId:"tokyo-ghoul",machineId:"tokyo-ghoul",status:"verified",basedOnStatus:"placeholder",
  createdAt:"2026-08-27",updatedAt:"2026-08-27",sources:[],benchmarkDrafts:[],smartCounterSuggestions:[],
  evidence:[nanaEnd,ichiEnd,nanaSingle,atIchi,atNana],
  metrics:[
    {metricKey:"endScreenIndications",value:nanaEnd.extractedValue,evidenceIds:[nanaEnd.id,ichiEnd.id],verificationStatus:"conflict",sourceCount:2,sourceNames:["一撃","なな徹"],resolutionStatus:"source_selected",selectedEvidenceIds:[nanaEnd.id],rejectedEvidenceIds:[ichiEnd.id]},
    {metricKey:"czEndScreenIndications",value:nanaSingle.extractedValue,evidenceIds:[nanaSingle.id],verificationStatus:"single",sourceCount:1,sourceNames:["なな徹"]},
    {metricKey:"atInitialRate",value:atIchi.extractedValue,evidenceIds:[atIchi.id,atNana.id],verificationStatus:"agree",sourceCount:2,sourceNames:["一撃","なな徹"]},
  ],
};

const machine={
  id:"tokyo-ghoul",sourceDraftId:draft.id,profileStatus:"verified",
  profile:{verifiedMetrics:draft.metrics.map(metric=>({metricKey:metric.metricKey,value:metric.value,sourceNames:metric.sourceNames??[],verificationStatus:metric.verificationStatus}))},
} as Machine;

test("Machine Card uses human-readable metric labels",()=>{
  assert.equal(metricLabels.atInitialRate,"AT 初當率");
  assert.equal(buildMachineCardMetrics(machine,draft)[0].label,"AT 終了畫面示唆");
});

test("resolved conflict presents the final selected source",()=>{
  const metric=buildMachineCardMetrics(machine,draft).find(item=>item.metricKey==="endScreenIndications");
  assert.equal(metric?.statusLabel,"已人工核准 · 採用なな徹");
  assert.doesNotMatch(metric?.statusLabel??"",/conflict/i);
});

test("selected evidence keeps its structured table",()=>{
  const metric=buildMachineCardMetrics(machine,draft).find(item=>item.metricKey==="endScreenIndications");
  assert.deepEqual(metric?.headers,["設定","數值"]);
  assert.deepEqual(metric?.rows,[["金木","設定4以上"]]);
});

test("single-source evidence is not presented as multi-source verified",()=>{
  const metric=buildMachineCardMetrics(machine,draft).find(item=>item.metricKey==="czEndScreenIndications");
  assert.equal(metric?.statusLabel,"單一來源 · なな徹");
});

test("multi-source agreement names both sources",()=>{
  const metric=buildMachineCardMetrics(machine,draft).find(item=>item.metricKey==="atInitialRate");
  assert.equal(metric?.statusLabel,"2 個來源一致 · 一撃 + なな徹");
});
