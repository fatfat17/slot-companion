import { catalogRepository } from "@/lib/catalog/repository.server";
import { findDuplicate } from "@/lib/catalog/core";
import { PWorldCatalogProvider } from "@/lib/catalog/providers/pworld";
import { CatalogSourceError } from "@/lib/catalog/providers/types";
import { authorizeCatalogAdmin } from "@/lib/catalog/adminAuth.server";

export const runtime="nodejs";
export async function POST(request:Request){if(!authorizeCatalogAdmin(request))return Response.json({error:{message:"管理密碼不正確，無法更新機種資料庫。"}},{status:401});try{const {url}=await request.json() as {url?:string};if(!url)return Response.json({error:{message:"請輸入來源 URL。"}},{status:400});const provider=new PWorldCatalogProvider();const [candidates,records]=await Promise.all([provider.fetchCandidates(url),catalogRepository.list()]);return Response.json({source:provider.sourceName,candidates:candidates.map(candidate=>({candidate,duplicate:findDuplicate(candidate,records)??null}))})}catch(error){if(error instanceof CatalogSourceError)return Response.json({error:{code:error.code,message:error.message}},{status:422});return Response.json({error:{message:"Import preview 建立失敗。"}},{status:500})}}
