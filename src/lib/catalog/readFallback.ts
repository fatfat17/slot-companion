export async function readWithFallback<T>(primary:()=>Promise<T>,fallback:()=>Promise<T>,onPrimaryError?:(error:unknown)=>void):Promise<T>{
  try{return await primary()}catch(error){onPrimaryError?.(error);return fallback()}
}

export function mergeCatalogRecords<T extends {id:string}>(baseline:T[],primary:T[]):T[]{
  const records=new Map(baseline.map(record=>[record.id,record]));
  for(const record of primary)records.set(record.id,record);
  return [...records.values()];
}

export async function readMergedCatalog<T extends {id:string}>(primary:()=>Promise<T[]>,fallback:()=>Promise<T[]>,onPrimaryError?:(error:unknown)=>void):Promise<T[]>{
  let baseline:T[];
  try{baseline=await fallback()}catch{return primary()}
  return readWithFallback(async()=>mergeCatalogRecords(baseline,await primary()),async()=>baseline,onPrimaryError);
}
