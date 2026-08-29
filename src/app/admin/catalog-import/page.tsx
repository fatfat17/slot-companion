import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { catalogAdminEnabled } from "@/lib/catalog/adminAuth.server";
import { catalogRepository } from "@/lib/catalog/repository.server";
import { getCatalogHealthSummary } from "@/lib/catalog/health.server";
import { CatalogImportClient } from "./CatalogImportClient";
export default async function CatalogImportPage(){if(!catalogAdminEnabled())notFound();const records=await catalogRepository.list(),health=await getCatalogHealthSummary(records.length);return<><PageHeader title="Catalog Importer" eyebrow="Private Admin"/><CatalogImportClient requiresToken={process.env.NODE_ENV==="production"} health={health}/></>}
