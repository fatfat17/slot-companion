export type HallSearchResult = {name:string;address:string;pworldUrl:string;nearbyUrl:string|null;slotRates:string[];updatedLabel:string|null};
export type HallSearchResponse = {results:HallSearchResult[];sourceUrl:string;retrievedAt:string;matchedQuery:string;attemptedQueries:string[];normalizedReason:string|null};
export type HallMachineResult={name:string;pworldMachineId:string|null;pworldUrl:string;catalogId:string|null;catalogName:string|null};
export type HallDetailResponse={hallUrl:string;machines:HallMachineResult[];retrievedAt:string};
