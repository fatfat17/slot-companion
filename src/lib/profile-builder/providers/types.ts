import type { ExtractedProfileData,ProfileMetricKey } from "@/types/profileBuilder";

export type StructuredExtractedSection={sectionTitle:string;metricKey:string;sectionKey:string;tableHeaders:string[];rows:string[][];note:string|null;extractedFrom:"table"|"paragraph"|"heading";extractedValue:string|string[];rawLabel:string};
export type ProfileSourceExtraction = { sourceName: string; sourceUrl: string; retrievedAt: string; sections?:StructuredExtractedSection[];data?:ExtractedProfileData; labels?: Partial<Record<ProfileMetricKey,string>>; confidence: number; status?:"extracted"|"partial"|"no_evidence" };
export interface ProfileSourceProvider { id: string; supports(url: URL): boolean; extract(url: URL): Promise<ProfileSourceExtraction> }
