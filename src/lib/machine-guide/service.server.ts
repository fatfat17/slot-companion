import "server-only";
import type { MachineCatalogRecord } from "@/types/catalog";
import type { MachineGuide } from "@/types/machineGuide";
import { ChonboristaMachineGuideProvider } from "./chonborista";
import { compileMachineGuide } from "./compiler";
import { mergeMachineGuideFacts } from "./merge";
import { collectSupplementalGuideFacts } from "./multiSource";
import { PWorldMachineGuideProvider } from "./pworld";
import { supplementalGuideSources } from "./sourceRegistry.server";

type Providers={pworld?:PWorldMachineGuideProvider;chonborista?:ChonboristaMachineGuideProvider};

export async function buildMachineGuideFromSources(record:MachineCatalogRecord,providers:Providers={}):Promise<MachineGuide>{
  const primaryProvider=providers.pworld??new PWorldMachineGuideProvider();
  const supplementalProvider=providers.chonborista??new ChonboristaMachineGuideProvider();
  const primary=await primaryProvider.fetchFacts(record);
  const collected=await collectSupplementalGuideFacts(supplementalGuideSources(record),source=>supplementalProvider.fetchFacts(record,source.sourceUrl));
  const merged=mergeMachineGuideFacts(primary,collected.facts);
  merged.sources=[...(merged.sources??[]),...collected.failedSources];
  merged.sourceWarnings=[...new Set([...(merged.sourceWarnings??[]),...collected.warnings])];
  return compileMachineGuide(merged);
}
