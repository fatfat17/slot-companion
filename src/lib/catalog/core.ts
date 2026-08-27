import type { CatalogImportDecision,MachineCatalogCandidate,MachineCatalogRecord } from "@/types/catalog";

export function normalizeCatalogName(value:string){return value.normalize("NFKC").toLocaleLowerCase().replace(/^(?:(?:l|スマスロ|パチスロ|スロット)\s*)+/g,"").replace(/[\s\-‐‑‒–—―ー・･·_~～!！'’"“”/／]/g,"")}
export function findDuplicate(candidate:Pick<MachineCatalogCandidate,"officialNameJa"|"aliases">,records:MachineCatalogRecord[]){const names=[candidate.officialNameJa,...candidate.aliases].map(normalizeCatalogName);return records.find(record=>[record.officialNameJa,...record.aliases].map(normalizeCatalogName).some(name=>names.includes(name)))}
export function slugForCatalog(value:string){const normalized=normalizeCatalogName(value);let hash=2166136261;for(const char of normalized){hash^=char.codePointAt(0)??0;hash=Math.imul(hash,16777619)}return `machine-${(hash>>>0).toString(36)}`}
export function mergeCatalogRecord(existing:MachineCatalogRecord,candidate:MachineCatalogCandidate):MachineCatalogRecord{const source={sourceName:candidate.sourceName,sourceUrl:candidate.sourceUrl,sourceImageUrl:candidate.sourceImageUrl,retrievedAt:candidate.retrievedAt};const sources=existing.sources.some(item=>item.sourceUrl===source.sourceUrl)?existing.sources.map(item=>item.sourceUrl===source.sourceUrl?source:item):[...existing.sources,source];return{...existing,manufacturer:existing.manufacturer==="不明"&&candidate.manufacturer?candidate.manufacturer:existing.manufacturer,brand:existing.brand||candidate.brand,seriesName:existing.seriesName||candidate.seriesName,machineType:existing.machineType||candidate.machineType,introducedAt:existing.introducedAt||candidate.introducedAt,aliases:[...new Set([...existing.aliases,...candidate.aliases])],sourceName:candidate.sourceName,sourceUrl:candidate.sourceUrl,sourceImageUrl:candidate.sourceImageUrl||existing.sourceImageUrl,retrievedAt:candidate.retrievedAt,sources}}
export function importCatalogCandidate(candidate:MachineCatalogCandidate):MachineCatalogRecord{return{id:slugForCatalog(candidate.officialNameJa),...candidate,verified:false,catalogStatus:"imported",sources:[{sourceName:candidate.sourceName,sourceUrl:candidate.sourceUrl,sourceImageUrl:candidate.sourceImageUrl,retrievedAt:candidate.retrievedAt}]}}

export type CatalogSearchMatchReason="exact official title"|"exact alias"|"partial official title"|"romanized alias"|"token match"|"manufacturer boost";
export type MachineCatalogSearchResult=MachineCatalogRecord&{searchScore:number;searchMatchReasons:CatalogSearchMatchReason[]};

const genericSearchTokens=new Set(["god","dream","bonus","slot","smart","pachislot","the","of","a","an","スマスロ","パチスロ","スロット"]);
const derivedAliasPairs=[
  ["ビッグドリーム","BIG DREAM"],
  ["東京喰種","TOKYO GHOUL"],
  ["バイオハザード","BIOHAZARD"],
] as const;

function normalizeSearchText(value:string){return value.normalize("NFKC").toLocaleLowerCase().replace(/[\-‐‑‒–—―ー・･·_~～!！'’"“”/／:：]+/g," ").replace(/\s+/g," ").trim()}
function compactSearchText(value:string){return normalizeSearchText(value).replace(/\s/g,"")}
function searchTokens(value:string){return normalizeSearchText(value).match(/[a-z0-9]+|[\u3040-\u30ff\u3400-\u9fff]+/g)??[]}
function searchVersionTokens(value:string){const text=value.normalize("NFKC").toUpperCase(),tokens=new Set<string>();for(const match of text.matchAll(/RE\s*[:\-]?\s*(\d+)/g))tokens.add(`RE:${match[1]}`);for(const match of text.matchAll(/(?:^|[^A-Z0-9])(\d+)(?:$|[^A-Z0-9])/g))tokens.add(match[1]);for(const match of text.matchAll(/V\s*-\s*(\d+)/g))tokens.add(`V-${match[1]}`);return[...tokens]}
function isInformative(value:string){const tokens=searchTokens(value);return compactSearchText(value).length>=4&&(tokens.length>1||!genericSearchTokens.has(tokens[0]??""))}
function derivedAliases(record:MachineCatalogRecord){const raw=[record.officialNameJa,record.displayNameZh,...record.aliases],source=raw.map(compactSearchText);return derivedAliasPairs.flatMap(([japanese,english])=>{const japaneseKey=compactSearchText(japanese),englishKey=compactSearchText(english),hasJapanese=source.some(value=>value.includes(japaneseKey)),hasEnglish=source.some(value=>value.includes(englishKey));return [...(hasJapanese?[english,...raw.filter(value=>compactSearchText(value).includes(japaneseKey)).map(value=>value.replace(japanese,english))]:[]),...(hasEnglish?[japanese,...raw.filter(value=>compactSearchText(value).includes(englishKey)).map(value=>value.replace(new RegExp(english,"i"),japanese))]:[])]})}

export function searchCatalogRecords(records:MachineCatalogRecord[],terms:string[],manufacturerTerms:string[]=[],limit=20,options:{context?:"identity"|"library"}={}):MachineCatalogSearchResult[]{
  const context=options.context??"identity",queries=terms.map(value=>({raw:value,compact:compactSearchText(value),tokens:searchTokens(value)})).filter(item=>item.compact&&(context==="library"||isInformative(item.raw)));
  const makers=manufacturerTerms.map(compactSearchText).filter(Boolean);
  if(queries.length===0)return[];
  return records.map(record=>{
    const official=compactSearchText(record.officialNameJa),persistentAliases=[record.displayNameZh,...record.aliases].filter(Boolean).map(compactSearchText),runtimeAliases=derivedAliases(record).map(compactSearchText),officialTokens=searchTokens(record.officialNameJa).filter(token=>token.length>=2&&!genericSearchTokens.has(token)),reasons=new Set<CatalogSearchMatchReason>();
    let score=0;
    for(const query of queries){
      if(query.compact===official){score+=180;reasons.add("exact official title")}
      else if(persistentAliases.includes(query.compact)){score+=160;reasons.add("exact alias")}
      else if(official.includes(query.compact)||query.compact.includes(official)){score+=90;reasons.add("partial official title")}
      else if(runtimeAliases.includes(query.compact)){score+=150;reasons.add("romanized alias")}
      else if(runtimeAliases.some(alias=>alias.includes(query.compact)||query.compact.includes(alias))){score+=120;reasons.add("romanized alias")}
      else if(context==="library"&&persistentAliases.some(alias=>alias.includes(query.compact)||query.compact.includes(alias))){score+=genericSearchTokens.has(query.compact)?20:70;reasons.add("token match")}
      else{
        const informativeTokens=query.tokens.filter(token=>!genericSearchTokens.has(token)&&token.length>=3),comparableOfficialTokens=context==="library"?officialTokens.filter(token=>token.length>=3):officialTokens;
        const matches=informativeTokens.filter(token=>comparableOfficialTokens.some(titleToken=>titleToken.includes(token)||token.includes(titleToken))).length;
        if(matches){score+=matches*25;reasons.add("token match")}
      }
      const queryVersions=searchVersionTokens(query.raw),recordVersions=searchVersionTokens(record.officialNameJa);if(queryVersions.length&&queryVersions.some(token=>recordVersions.includes(token)))score+=60;else if(queryVersions.length&&recordVersions.length)score-=100;
    }
    const manufacturer=compactSearchText(record.manufacturer),manufacturerMatch=makers.includes(manufacturer)||(context==="library"&&queries.some(query=>query.compact.length>=2&&manufacturer.includes(query.compact)));if(manufacturerMatch){score+=score>0?15:70;reasons.add("manufacturer boost")}
    return{...record,searchScore:score,searchMatchReasons:[...reasons]};
  }).filter(item=>item.searchScore>0).sort((a,b)=>b.searchScore-a.searchScore||a.officialNameJa.localeCompare(b.officialNameJa,"ja")).slice(0,context==="identity"?Math.min(30,limit):limit);
}
export function searchCatalogRecordsForLibrary(records:MachineCatalogRecord[],query:string,limit=records.length){return searchCatalogRecords(records,[query],[],limit,{context:"library"})}
export function applyCatalogDecisions(initial:MachineCatalogRecord[],decisions:CatalogImportDecision[]){const records=[...initial];let imported=0,merged=0,skipped=0;for(const decision of decisions){if(decision.action==="skip"){skipped++;continue}const duplicate=records.find(item=>item.id===decision.existingId)??findDuplicate(decision.candidate,records);if(decision.action==="merge"&&duplicate){records[records.indexOf(duplicate)]=mergeCatalogRecord(duplicate,decision.candidate);merged++;continue}if(duplicate){skipped++;continue}records.push(importCatalogCandidate(decision.candidate));imported++}return{records,imported,merged,skipped,total:records.length}}
