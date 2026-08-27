import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { machines } from "@/data/machines";
import { catalogRepository } from "@/lib/catalog/repository.server";
import { profileDraftRepository } from "@/lib/profile-builder/repository.server";
import { ProfileBuilderClient } from "./ProfileBuilderClient";

export default async function ProfileBuilderPage({params}:{params:Promise<{catalogId:string}>}){if(process.env.NODE_ENV==="production")notFound();const{catalogId}=await params,record=(await catalogRepository.list()).find(item=>item.id===catalogId);if(!record)notFound();const machine=machines.find(item=>(item.catalogId??item.id)===catalogId),draft=await profileDraftRepository.get(catalogId);return<><PageHeader title="Verified Profile Builder" eyebrow="Development Admin"/><ProfileBuilderClient catalog={record} machine={machine??null} initialDraft={draft}/></>}
