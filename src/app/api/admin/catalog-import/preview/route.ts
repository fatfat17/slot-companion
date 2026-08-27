import { catalogRepository } from "@/lib/catalog/repository.server";
import { findDuplicate } from "@/lib/catalog/core";
import { PWorldCatalogProvider } from "@/lib/catalog/providers/pworld";
import { CatalogSourceError } from "@/lib/catalog/providers/types";

export const runtime="nodejs";
export async function POST(request:Request){if(process.env.NODE_ENV==="production")return Response.json({error:{message:"Catalog Importer 僅限 development。"}},{status:403});try{const {url}=await request.json() as {url?:string};if(!url)return Response.json({error:{message:"請輸入來源 URL。"}},{status:400});const provider=new PWorldCatalogProvider();const [candidates,records]=await Promise.all([provider.fetchCandidates(url),catalogRepository.list()]);return Response.json({source:provider.sourceName,candidates:candidates.map(candidate=>({candidate,duplicate:findDuplicate(candidate,records)??null}))})}catch(error){if(error instanceof CatalogSourceError)return Response.json({error:{code:error.code,message:error.message}},{status:422});return Response.json({error:{message:"Import preview 建立失敗。"}},{status:500})}}
