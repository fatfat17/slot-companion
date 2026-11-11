import {isAuthorizedCronRequest} from "@/lib/catalog/automation";
import {runCatalogHealthCheck} from "@/lib/catalog/automation.server";

export const dynamic="force-dynamic";
export const runtime="nodejs";
export const maxDuration=60;

export async function GET(request:Request){
  if(!isAuthorizedCronRequest(request.headers.get("authorization"),process.env.CRON_SECRET))return Response.json({ok:false,error:"Unauthorized"},{status:401});
  try{return Response.json(await runCatalogHealthCheck())}catch(error){console.error("Catalog health cron failed.",error instanceof Error?error.message:"unknown error");return Response.json({ok:false,error:"Catalog health check failed."},{status:503})}
}
