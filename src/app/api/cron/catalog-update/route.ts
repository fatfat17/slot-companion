import {isAuthorizedCronRequest} from "@/lib/catalog/automation";
import {runScheduledCatalogUpdate} from "@/lib/catalog/automation.server";

export const dynamic="force-dynamic";
export const runtime="nodejs";
export const maxDuration=60;

export async function GET(request:Request){
  if(!isAuthorizedCronRequest(request.headers.get("authorization"),process.env.CRON_SECRET))return Response.json({ok:false,error:"Unauthorized"},{status:401});
  try{return Response.json(await runScheduledCatalogUpdate())}catch(error){console.error("Catalog update cron failed.",error instanceof Error?error.message:"unknown error");return Response.json({ok:false,error:"Catalog update failed without changing existing records."},{status:503})}
}
