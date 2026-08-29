import { catalogRepository } from "@/lib/catalog/repository.server";
import { buildChineseGuide } from "@/lib/machine-guide/chineseGuide.server";
import { buildMachineGuideFromSources } from "@/lib/machine-guide/service.server";

export const dynamic="force-dynamic";
export async function POST(_request:Request,{params}:{params:Promise<{catalogId:string}>}){const{catalogId}=await params,record=(await catalogRepository.list()).find(item=>item.id===catalogId);if(!record)return Response.json({error:"找不到 Machine Catalog 資料。",code:"catalog_not_found"},{status:404});try{const guide=await buildMachineGuideFromSources(record);if(guide.status==="no_data")return Response.json({error:"公開來源目前沒有足夠資料可建立機台指南。",code:"no_data"},{status:422});guide.playerGuideZh=await buildChineseGuide(guide);return Response.json({guide})}catch(error){return Response.json({error:error instanceof Error?error.message:"公開來源取得失敗。",code:"source_fetch_failed"},{status:502})}}
