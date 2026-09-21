export type HallMachineKind="slot"|"pachinko";
export type HallSearchResult = {name:string;address:string;pworldUrl:string;nearbyUrl:string|null;slotRates:string[];pachinkoRates:string[];updatedLabel:string|null};
export type HallSearchResponse = {results:HallSearchResult[];sourceUrl:string;retrievedAt:string;matchedQuery:string;resolvedQuery:string;attemptedQueries:string[];normalizedReason:string|null;postalSource:{sourceUrl:string;retrievedAt:string}};
export type HallMachineResult={name:string;pworldMachineId:string|null;pworldUrl:string;catalogId:string|null;catalogName:string|null};
export type HallDetailResponse={hallUrl:string;kind:HallMachineKind;machines:HallMachineResult[];retrievedAt:string};
