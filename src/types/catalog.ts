export type CatalogStatus="imported"|"reviewed"|"verified";
export type MachineCatalogSource={sourceName:string;sourceUrl:string;sourceImageUrl?:string;retrievedAt:string};
export type MachineCatalogRecord={id:string;officialNameJa:string;displayNameZh:string;manufacturer:string;brand:string;seriesName:string;aliases:string[];machineType:string;introducedAt:string|null;sourceName:string;sourceUrl:string;sourceImageUrl?:string;retrievedAt:string;verified:boolean;catalogStatus:CatalogStatus;sources:MachineCatalogSource[]};
export type MachineCatalogCandidate=Omit<MachineCatalogRecord,"id"|"verified"|"catalogStatus"|"sources">&{sourceId:string};
export type CatalogImportAction="import"|"skip"|"merge";
export type CatalogImportDecision={candidate:MachineCatalogCandidate;action:CatalogImportAction;existingId?:string};
export type VisibleOfficialTitleCandidate={text:string;confidence:number};
export type CatalogVisibleEvidence={status:"slot"|"uncertain"|"unknown";visibleText:string[];manufacturerText:string[];visualEvidence:string[];searchTerms:string[];visibleOfficialTitleCandidates:VisibleOfficialTitleCandidate[];visibleFranchiseTerms:string[];visibleModeOrStageTerms:string[];visibleManufacturerMarks:string[]};
