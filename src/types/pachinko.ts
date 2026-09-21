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
