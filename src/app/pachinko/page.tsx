import {PageHeader} from "@/components/PageHeader";
import {pachinkoCatalogRepository} from "@/lib/pachinko/repository.server";
import {PachinkoLibraryClient} from "./PachinkoLibraryClient";
export default async function PachinkoPage(){const records=await pachinkoCatalogRepository.list();return<><PageHeader title="柏青哥資料庫" eyebrow="Pachinko Catalog"/><PachinkoLibraryClient records={records}/></>}
