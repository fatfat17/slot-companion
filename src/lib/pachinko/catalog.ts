import type {PachinkoCatalogRecord,PachinkoMachineType} from "@/types/pachinko";

export function classifyPachinkoType(name:string):PachinkoMachineType{
  const normalized=name.normalize("NFKC");
  if(/^(?:e|スマパチ)/i.test(normalized))return"smart_pachinko";
  if(/羽根|はねもの|ハネ/.test(normalized))return"hanemono";
  if(/^(?:P|PA|Pちょいパチ)/i.test(normalized))return"digital";
  return"other";
}

export function normalizePachinkoName(value:string){return value.normalize("NFKC").toLocaleLowerCase().replace(/^(?:e|p|pa)\s*/i,"").replace(/[\s\-‐‑‒–—―ー・･·_~～!！'’"“”/／]/g,"")}

export function searchPachinkoCatalog(records:PachinkoCatalogRecord[],query:string){
  const terms=query.normalize("NFKC").toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if(!terms.length)return records;
  return records.filter(record=>{const haystack=[record.officialNameJa,record.displayNameZh,record.manufacturer,record.seriesName,...record.aliases,...record.tags].join(" ").normalize("NFKC").toLocaleLowerCase();return terms.every(term=>haystack.includes(term))});
}
