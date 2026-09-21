export async function readWithFallback<T>(primary:()=>Promise<T>,fallback:()=>Promise<T>,onPrimaryError?:(error:unknown)=>void):Promise<T>{
  try{return await primary()}catch(error){onPrimaryError?.(error);return fallback()}
}
