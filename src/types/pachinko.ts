export type PachinkoCatalogStatus="imported"|"reviewed"|"verified";
export type PachinkoMachineType="smart_pachinko"|"digital"|"hanemono"|"other";

export type PachinkoCatalogRecord={
  id:string;
  officialNameJa:string;
  displayNameZh:string;
  manufacturer:string;
  seriesName:string;
  aliases:string[];
  machineType:PachinkoMachineType;
  tags:string[];
  introducedAt:string|null;
  sourceName:string;
  sourceUrl:string;
  sourceImageUrl?:string;
  retrievedAt:string;
  catalogStatus:PachinkoCatalogStatus;
};

export type PachinkoGuideFact={labelZh:string;labelJa:string;value:string};
export type PachinkoGuide={
  catalogId:string;
  status:"usable"|"partial";
  facts:PachinkoGuideFact[];
  gameFlow:string[];
  playNotes:string[];
  sourceName:string;
  sourceUrl:string;
  retrievedAt:string;
};

import type {MachineGuideImage,MachineGuideSectionKey,MachineGuideTable,VisualGuideAssetReport} from "./machineGuide";
export type PachinkoFullGuideSection={key:MachineGuideSectionKey;titleZh:string;titleJa:string;summaryZh:string;paragraphsJa:string[];tables:MachineGuideTable[]};
export type PachinkoPlayerGuideZh={generator:"rules"|"openai";overview:string;goals:string[];sections:Array<{key:MachineGuideSectionKey;title:string;summary:string;points:string[]}>;generatedAt:string};
export type PachinkoFullGuide={schemaVersion:1;catalogId:string;officialNameJa:string;displayNameZh:string;manufacturer:string;status:"usable"|"partial";sections:PachinkoFullGuideSection[];images:MachineGuideImage[];playerGuideZh:PachinkoPlayerGuideZh;sourceName:string;sourceUrl:string;retrievedAt:string;missingSections:MachineGuideSectionKey[];visualAssetReport?:VisualGuideAssetReport;sourceWarnings:string[]};
export type CachedPachinkoGuide={guide:PachinkoFullGuide;cachedAt:string;compilerRevision:string};
export type PachinkoGuideApiResponse={guide:PachinkoFullGuide}|{error:string;code:string};

export type PachinkoPlayState="normal"|"rush"|"st"|"time_short"|"other";
export type PachinkoSession={
  id:string;
  catalogId:string;
  machineName:string;
  machineNumber:string;
  startedAt:string;
  endedAt?:string;
  status:"active"|"completed";
  playState:PachinkoPlayState;
  startSpins:number;
  currentSpins:number;
  investmentYen:number;
  heldBalls:number;
  initialHits:number;
  rushEntries:number;
  rushHits:number;
  maxRushStreak:number;
  currentRushStreak:number;
  note:string;
};
