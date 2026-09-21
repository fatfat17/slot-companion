import {PageHeader} from "@/components/PageHeader";
import {pachinkoCatalogRepository} from "@/lib/pachinko/repository.server";
import {PachinkoLibraryClient} from "./PachinkoLibraryClient";
export default async function PachinkoPage({searchParams}:{searchParams:Promise<{view?:string}>}){const{view}=await searchParams,initialMode=view==="favorites"||view==="recent"?view:"browse",records=await pachinkoCatalogRepository.list();return<><PageHeader title="柏青哥機種資料庫" eyebrow="Pachinko Catalog"/><PachinkoLibraryClient records={records} initialMode={initialMode}/></>}
