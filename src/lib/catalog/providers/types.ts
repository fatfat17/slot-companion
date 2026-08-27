import type { MachineCatalogCandidate } from "@/types/catalog";
export interface CatalogSourceProvider{readonly sourceName:string;supports(url:URL):boolean;fetchCandidates(url:string):Promise<MachineCatalogCandidate[]>;parse(html:string,sourceUrl:string,retrievedAt:string):MachineCatalogCandidate[]}
export class CatalogSourceError extends Error{code:string;constructor(code:string,message:string){super(message);this.code=code}}
