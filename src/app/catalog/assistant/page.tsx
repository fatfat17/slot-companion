import { PageHeader } from "@/components/PageHeader";
import { SlotSelectionAssistant } from "@/components/SlotSelectionAssistant";
import { catalogRepository } from "@/lib/catalog/repository.server";
export const dynamic="force-dynamic";

export default async function SlotSelectionAssistantPage(){const records=await catalogRepository.list();return<><PageHeader title="AI 選台助手" eyebrow="SLOT ONLY" backHref="/catalog"/><SlotSelectionAssistant records={records}/></>}
