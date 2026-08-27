import { PageHeader } from "@/components/PageHeader";
import { machines } from "@/data/machines";
import { catalogRepository } from "@/lib/catalog/repository.server";
import { CatalogLibraryClient } from "./CatalogLibraryClient";
export default async function CatalogPage(){const records=await catalogRepository.list(),profiles=machines.map(machine=>({catalogId:machine.catalogId??machine.id,machineId:machine.id,nameZh:machine.nameZh}));return<><PageHeader title="機種資料庫" eyebrow="Machine Catalog"/><CatalogLibraryClient records={records} profiles={profiles}/></>}
