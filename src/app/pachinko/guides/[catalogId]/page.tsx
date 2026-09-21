import {notFound} from "next/navigation";
import {PageHeader} from "@/components/PageHeader";
import {PachinkoGuideView} from "@/components/PachinkoGuideView";
import {pachinkoCatalogRepository} from "@/lib/pachinko/repository.server";
export default async function PachinkoGuidePage({params}:{params:Promise<{catalogId:string}>}){const{catalogId}=await params,record=(await pachinkoCatalogRepository.list()).find(item=>item.id===catalogId);if(!record)notFound();return<><PageHeader title="柏青哥機台指南" eyebrow="Pachinko Guide" backHref={`/pachinko/${catalogId}`} backLabel="返回柏青哥機種詳細"/><PachinkoGuideView record={record}/></>}
