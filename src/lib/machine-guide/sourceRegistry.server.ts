import "server-only";
import pilotSources from "../../../data/machine-guide-supplemental-sources.json";
import type { MachineCatalogRecord } from "@/types/catalog";

export type SupplementalGuideSource={sourceName:string;sourceUrl:string;status:"pilot"};

export function supplementalGuideSources(record:MachineCatalogRecord):SupplementalGuideSource[]{
  const catalogSources=(record.sources??[])
    .filter(source=>/chonborista|ちょんぼりすた/i.test(source.sourceName))
    .map(source=>({sourceName:source.sourceName,sourceUrl:source.sourceUrl,status:"pilot" as const}));
  const configured=pilotSources
    .filter(source=>source.catalogId===record.id)
    .map(source=>({sourceName:source.sourceName,sourceUrl:source.sourceUrl,status:source.status as "pilot"}));
  return [...new Map([...catalogSources,...configured].map(source=>[source.sourceUrl,source])).values()];
}
