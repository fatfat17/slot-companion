import { PageHeader } from "@/components/PageHeader";
import { machines } from "@/data/machines";
import { catalogRepository } from "@/lib/catalog/repository.server";
import { getCatalogImporterPresentation } from "@/lib/catalog/importerPresentation";
import { catalogAdminEnabled } from "@/lib/catalog/adminAuth.server";
import { CatalogLibraryClient } from "./CatalogLibraryClient";
export default async function CatalogPage(){const records=await catalogRepository.list(),profiles=machines.map(machine=>({catalogId:machine.catalogId??machine.id,machineId:machine.id,nameZh:machine.nameZh})),importer=getCatalogImporterPresentation(process.env.NODE_ENV,catalogAdminEnabled());return<><PageHeader title="機種資料庫" eyebrow="Machine Catalog"/><CatalogLibraryClient records={records} profiles={profiles} importer={importer}/></>}
