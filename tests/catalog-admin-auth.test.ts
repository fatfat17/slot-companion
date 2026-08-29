import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { authorizeCatalogAdmin, catalogAdminEnabled, catalogCloudConfigured } from "../src/lib/catalog/adminAuth.server.ts";
import { supabaseServerHeaders } from "../src/lib/catalog/supabaseAuth.ts";

const request=(token?:string)=>new Request("https://example.test/api",{headers:token?{"x-catalog-admin-token":token}:{}});
const env=(values:Record<string,string>)=>values as NodeJS.ProcessEnv;

test("Vercel Supabase secret key enables cloud Catalog storage",()=>{
  assert.equal(catalogCloudConfigured(env({NODE_ENV:"test",SUPABASE_URL:"https://db.test",SUPABASE_SECRET_KEY:"secret"})),true);
  assert.equal(catalogCloudConfigured(env({NODE_ENV:"test",SUPABASE_URL:"https://db.test"})),false);
});

test("production Catalog admin requires cloud storage and an admin token",()=>{
  assert.equal(catalogAdminEnabled(env({NODE_ENV:"production",SUPABASE_URL:"https://db.test",SUPABASE_SECRET_KEY:"secret",CATALOG_ADMIN_TOKEN:"owner-password"})),true);
  assert.equal(catalogAdminEnabled(env({NODE_ENV:"production",SUPABASE_URL:"https://db.test",SUPABASE_SECRET_KEY:"secret"})),false);
  assert.equal(catalogAdminEnabled(env({NODE_ENV:"development"})),true);
});

test("production Catalog mutations reject missing and incorrect passwords",()=>{
  const environment=env({NODE_ENV:"production",SUPABASE_URL:"https://db.test",SUPABASE_SECRET_KEY:"secret",CATALOG_ADMIN_TOKEN:"owner-password"});
  assert.equal(authorizeCatalogAdmin(request(),environment),false);
  assert.equal(authorizeCatalogAdmin(request("wrong"),environment),false);
  assert.equal(authorizeCatalogAdmin(request("owner-password"),environment),true);
});

test("local development remains available without a password",()=>{
  assert.equal(authorizeCatalogAdmin(request(),env({NODE_ENV:"development"})),true);
});

test("opaque Supabase secret keys are sent only through apikey",()=>{
  assert.deepEqual(supabaseServerHeaders("sb_secret_example"),{apikey:"sb_secret_example"});
  assert.deepEqual(supabaseServerHeaders("legacy-jwt"),{apikey:"legacy-jwt",Authorization:"Bearer legacy-jwt"});
});

test("online importer keeps its password in component memory and protects every mutation route",()=>{
  const client=fs.readFileSync(new URL("../src/app/admin/catalog-import/CatalogImportClient.tsx",import.meta.url),"utf8");
  assert.match(client,/adminToken,setAdminToken/);
  assert.match(client,/x-catalog-admin-token/);
  assert.doesNotMatch(client,/localStorage/);
  for(const route of ["preview","batch-preview","approve"]){
    const source=fs.readFileSync(new URL(`../src/app/api/admin/catalog-import/${route}/route.ts`,import.meta.url),"utf8");
    assert.match(source,/authorizeCatalogAdmin\(request\)/);
  }
});
