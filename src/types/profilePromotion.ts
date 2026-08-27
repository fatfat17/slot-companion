import type { Machine,SettingBenchmark } from "@/types";

export type PublishBlocker={code:string;message:string;metricKey?:string};
export type PublishPreview={
  catalogId:string;
  draftId:string;
  canPublish:boolean;
  blockers:PublishBlocker[];
  currentStatus:string;
  nextStatus:"verified";
  currentVersion:number;
  nextVersion:number;
  addedMetrics:string[];
  replacedPlaceholderFields:string[];
  disabledTestBenchmarkIds:string[];
  addedBenchmarkDrafts:SettingBenchmark[];
  addedCounterKeys:string[];
  removedCounterKeys:string[];
  resultingMachine:Machine;
};
export type PublishedMachineProfileVersion={profileVersion:number;previousProfileVersion?:number;publishedAt:string;sourceDraftId:string;machine:Machine};
export type PublishedMachineProfileRecord={catalogId:string;activeVersion:number;versions:PublishedMachineProfileVersion[]};
