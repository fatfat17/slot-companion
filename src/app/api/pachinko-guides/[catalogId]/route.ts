import {pachinkoCatalogRepository} from "@/lib/pachinko/repository.server";
import {buildPachinkoFullGuide} from "@/lib/pachinko/fullGuide.server";
export const runtime="nodejs";
export async function POST(_request:Request,{params}:{params:Promise<{catalogId:string}>}){const{catalogId}=await params,record=(await pachinkoCatalogRepository.list()).find(item=>item.id===catalogId);if(!record)return Response.json({error:"找不到柏青哥 Catalog 資料。",code:"catalog_not_found"},{status:404});try{return Response.json({guide:await buildPachinkoFullGuide(record)})}catch(error){return Response.json({error:error instanceof Error?error.message:"公開來源取得失敗。",code:"source_fetch_failed"},{status:502})}}
