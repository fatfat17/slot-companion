import type { CounterDefinition, Machine, SettingBenchmark } from "@/types";

export type MachineGuideStatus = "usable" | "partial" | "no_data";
export type MachineGuideSectionKey = "features" | "play" | "flow" | "cz" | "at_art" | "bonus" | "ceiling" | "setting_rates" | "payout" | "small_roles" | "special_events";

export type MachineGuideTable = {
  id: string;
  title: string;
  headers: string[];
  rows: string[][];
  note: string | null;
  sourceUrl: string;
};

export type MachineGuideSection = {
  key: MachineGuideSectionKey;
  titleZh: string;
  titleJa: string;
  summaryZh: string | null;
  paragraphsJa: string[];
  tables: MachineGuideTable[];
};

export type MachineGuideEvidence = {
  sectionKey: MachineGuideSectionKey;
  rawLabel: string;
  extractedFrom: "heading" | "paragraph" | "table";
  sourceUrl: string;
};

export type MachineGuide = {
  schemaVersion: 1;
  catalogId: string;
  officialNameJa: string;
  displayNameZh: string;
  manufacturer: string;
  machineType: string;
  introducedAt: string | null;
  status: MachineGuideStatus;
  sections: MachineGuideSection[];
  evidence: MachineGuideEvidence[];
  missingSections: MachineGuideSectionKey[];
  benchmarks: SettingBenchmark[];
  smartCounters: CounterDefinition[];
  sourceName: "P-WORLD";
  sourceUrl: string;
  retrievedAt: string;
};

export type MachineGuideApiResponse = { guide: MachineGuide } | { error: string; code: string };

export type CachedMachineGuide = { guide: MachineGuide; cachedAt: string };

export type GuideMachineSnapshot = Machine & { guideStatus: Exclude<MachineGuideStatus, "no_data">; guideSourceUrl: string };
