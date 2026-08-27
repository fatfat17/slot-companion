import "server-only";
import { AI_CONFIG } from "./config";
import { matchMachineProfiles } from "./matching";
import { MockAIProvider } from "./providers/mock";
import { OpenAIProvider } from "./providers/openai";
import type { IdentificationImage } from "./types";
import { catalogRepository } from "../catalog/repository.server";
import { runIdentificationPipeline } from "./pipeline";

export async function identifyMachineOnServer(image:IdentificationImage){const catalog=await catalogRepository.list();if(AI_CONFIG.provider==="mock")return matchMachineProfiles(await new MockAIProvider().identifyMachine(image),catalog);const result=await runIdentificationPipeline({image,provider:new OpenAIProvider(process.env.OPENAI_API_KEY,AI_CONFIG.openAIModel),catalog,includeDebug:process.env.NODE_ENV!=="production"});return matchMachineProfiles(result,catalog)}
