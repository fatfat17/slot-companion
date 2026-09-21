import "server-only";
import { AI_CONFIG } from "./config";
import { matchMachineProfiles } from "./matching";
import { MockAIProvider } from "./providers/mock";
import { OpenAIProvider } from "./providers/openai";
import type { IdentificationImage } from "./types";
import { catalogRepository } from "../catalog/repository.server";
import { runIdentificationPipeline } from "./pipeline";
import { pachinkoCatalogRepository } from "../pachinko/repository.server";
import type { MachineCatalogRecord } from "@/types/catalog";

export type IdentificationKind="slot"|"pachinko";
function asIdentificationCatalog(records:Awaited<ReturnType<typeof pachinkoCatalogRepository.list>>):MachineCatalogRecord[]{return records.map(record=>({id:record.id,officialNameJa:record.officialNameJa,displayNameZh:record.displayNameZh,manufacturer:record.manufacturer,brand:"",seriesName:record.seriesName,aliases:record.aliases,machineType:record.machineType,introducedAt:record.introducedAt,sourceName:record.sourceName,sourceUrl:record.sourceUrl,sourceImageUrl:record.sourceImageUrl,retrievedAt:record.retrievedAt,verified:false,catalogStatus:record.catalogStatus,sources:[{sourceName:record.sourceName,sourceUrl:record.sourceUrl,sourceImageUrl:record.sourceImageUrl,retrievedAt:record.retrievedAt}]}))}
export async function identifyMachineOnServer(image:IdentificationImage,kind:IdentificationKind="slot"){const catalog=kind==="pachinko"?asIdentificationCatalog(await pachinkoCatalogRepository.list()):await catalogRepository.list();if(AI_CONFIG.provider==="mock")return matchMachineProfiles(await new MockAIProvider().identifyMachine(image),catalog);const result=await runIdentificationPipeline({image,provider:new OpenAIProvider(process.env.OPENAI_API_KEY,AI_CONFIG.openAIModel,fetch,[],kind),catalog,kind,includeDebug:process.env.NODE_ENV!=="production"});return matchMachineProfiles(result,catalog)}
