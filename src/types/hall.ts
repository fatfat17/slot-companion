export type HallSearchResult = {name:string;address:string;pworldUrl:string;nearbyUrl:string|null;slotRates:string[];updatedLabel:string|null};
export type HallSearchResponse = {results:HallSearchResult[];sourceUrl:string;retrievedAt:string};
