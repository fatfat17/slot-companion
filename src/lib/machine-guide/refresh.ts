import type { MachineGuide,MachineGuideApiResponse } from "@/types/machineGuide";
import { saveCachedGuide } from "./storage.ts";

type Requester=(input:string,init:RequestInit)=>Promise<Response>;

export async function refreshCachedMachineGuide(catalogId:string,request:Requester=fetch):Promise<MachineGuide>{
  const response=await request(`/api/machine-guides/${encodeURIComponent(catalogId)}`,{method:"POST"});
  const data=await response.json() as MachineGuideApiResponse;
  if(!response.ok||!("guide" in data))throw new Error("error" in data?data.error:"機台指南建立失敗。");
  if(data.guide.catalogId!==catalogId||data.guide.schemaVersion!==2)throw new Error("來源回傳的機台指南格式不正確。");
  if(!saveCachedGuide(data.guide))throw new Error("指南已取得，但瀏覽器快取空間不足，無法安全保存。");
  return data.guide;
}
