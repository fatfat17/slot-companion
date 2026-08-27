import { catalogRepository } from "@/lib/catalog/repository.server";
import { ApprovalValidationError,validateApprovalDecisions } from "@/lib/catalog/approval";
import type { CatalogImportDecision } from "@/types/catalog";

export const runtime="nodejs";
export async function POST(request:Request){if(process.env.NODE_ENV==="production")return Response.json({error:{message:"Catalog Importer 僅限 development。"}},{status:403});let received=0;try{const {decisions}=await request.json() as {decisions?:CatalogImportDecision[]};received=Array.isArray(decisions)?decisions.length:0;validateApprovalDecisions(decisions);const result=await catalogRepository.approve(decisions);return Response.json({received,processed:result.processed,imported:result.imported,merged:result.merged,skipped:result.skipped,total:result.total})}catch(error){if(error instanceof ApprovalValidationError)return Response.json({error:{message:error.message},received,processed:0,imported:0,merged:0,skipped:0},{status:422});return Response.json({error:{message:"Catalog 寫入失敗。"},received,processed:0,imported:0,merged:0,skipped:0},{status:500})}}
