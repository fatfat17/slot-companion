import { catalogRepository } from "@/lib/catalog/repository.server";
import { PWorldMachineGuideProvider } from "@/lib/machine-guide/pworld";

export const dynamic="force-dynamic";
export async function POST(_request:Request,{params}:{params:Promise<{catalogId:string}>}){const{catalogId}=await params,record=(await catalogRepository.list()).find(item=>item.id===catalogId);if(!record)return Response.json({error:"找不到 Machine Catalog 資料。",code:"catalog_not_found"},{status:404});const provider=new PWorldMachineGuideProvider();if(!provider.supports(record.sourceUrl))return Response.json({error:"此機種目前沒有可使用的 P-WORLD 詳細頁來源。",code:"source_unavailable"},{status:422});try{const guide=await provider.fetch(record);if(guide.status==="no_data")return Response.json({error:"P-WORLD 頁面目前沒有足夠的公開資料可建立機台指南。",code:"no_data"},{status:422});return Response.json({guide})}catch(error){return Response.json({error:error instanceof Error?error.message:"P-WORLD 來源取得失敗。",code:"source_fetch_failed"},{status:502})}}
