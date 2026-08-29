import { timingSafeEqual } from "node:crypto";

export function catalogCloudConfigured(environment:NodeJS.ProcessEnv=process.env){
  return Boolean(environment.SUPABASE_URL&&(environment.SUPABASE_SECRET_KEY||environment.SUPABASE_SERVICE_ROLE_KEY));
}

export function catalogAdminEnabled(environment:NodeJS.ProcessEnv=process.env){
  return environment.NODE_ENV==="development"||Boolean(catalogCloudConfigured(environment)&&environment.CATALOG_ADMIN_TOKEN);
}

export function authorizeCatalogAdmin(request:Request,environment:NodeJS.ProcessEnv=process.env){
  if(environment.NODE_ENV==="development")return true;
  const expected=environment.CATALOG_ADMIN_TOKEN;
  const received=request.headers.get("x-catalog-admin-token");
  if(!catalogCloudConfigured(environment)||!expected||!received)return false;
  const expectedBuffer=Buffer.from(expected);
  const receivedBuffer=Buffer.from(received);
  return expectedBuffer.length===receivedBuffer.length&&timingSafeEqual(expectedBuffer,receivedBuffer);
}
