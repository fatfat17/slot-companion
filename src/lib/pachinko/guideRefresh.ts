import type {PachinkoFullGuide,PachinkoGuideApiResponse} from "@/types/pachinko";
import {saveCachedPachinkoGuide} from "./guideStorage";
type Requester=(input:string,init:RequestInit)=>Promise<Response>;
export async function refreshPachinkoGuide(catalogId:string,request:Requester=fetch):Promise<PachinkoFullGuide>{const response=await request(`/api/pachinko-guides/${encodeURIComponent(catalogId)}`,{method:"POST"}),data=await response.json()as PachinkoGuideApiResponse;if(!response.ok||!("guide"in data))throw new Error("error"in data?data.error:"柏青哥指南建立失敗。");if(data.guide.catalogId!==catalogId||data.guide.schemaVersion!==1)throw new Error("來源回傳的柏青哥指南格式不正確。");if(!await saveCachedPachinkoGuide(data.guide))throw new Error("指南已取得，但瀏覽器儲存空間不足，無法安全保存。");return data.guide}
