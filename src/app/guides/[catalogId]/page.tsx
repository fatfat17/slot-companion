import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { MachineGuideView } from "@/components/MachineGuideView";
import { catalogRepository } from "@/lib/catalog/repository.server";
export default async function MachineGuidePage({params}:{params:Promise<{catalogId:string}>}){const{catalogId}=await params,record=(await catalogRepository.list()).find(item=>item.id===catalogId);if(!record)notFound();return<><PageHeader title="機台指南" eyebrow="Machine Guide"/><MachineGuideView record={record}/></>}
