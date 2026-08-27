import type { CounterDefinition, MachineProfileStatus, SettingBenchmark } from "@/types";

export type ProfileMetricKey =
  | "gameFlow" | "czInitialRate" | "atInitialRate" | "smallRoleSettingDifferences"
  | "triggerSuccessRate" | "ceiling" | "zone" | "reset" | "endScreenIndications"
  | "trophySettingIndications" | "playGuide";

export type ExtractedProfileData = Record<ProfileMetricKey, string | string[] | null>;
export type EvidenceReviewStatus = "pending" | "approved" | "rejected";
export type MetricVerificationStatus = "single" | "agree" | "conflict" | "duplicate_source" | "incomparable";
export type MetricResolutionStatus = "unresolved" | "source_selected" | "merged" | "rejected";
export type MetricResolutionType = Exclude<MetricResolutionStatus,"unresolved">;

export type ProfileSourceEvidence = {
  id: string;
  sourceName: string;
  sourceUrl: string;
  retrievedAt: string;
  metricKey: string;
  sectionKey: string;
  extractedValue: string | string[];
  rawLabel: string;
  sectionTitle?: string;
  tableHeaders?: string[];
  rows?: string[][];
  note?: string | null;
  extractedFrom?: "table" | "paragraph" | "heading";
  confidence: number;
  reviewStatus: EvidenceReviewStatus;
};

export type ProfileSource = { id: string; sourceName: string; sourceUrl: string; retrievedAt: string; status: "pending" | "extracted" | "partial" | "no_evidence" | "failed"; extractedEvidenceCount?: number; error?: string };
export type DraftMetric = {
  metricKey: string;
  value: string | string[];
  evidenceIds: string[];
  verificationStatus: MetricVerificationStatus;
  sourceCount?: number;
  sourceNames?: string[];
  resolutionStatus?: MetricResolutionStatus;
  resolvedAt?: string;
  resolutionType?: MetricResolutionType;
  selectedEvidenceIds?: string[];
  rejectedEvidenceIds?: string[];
  mergedFromEvidenceIds?: string[];
  resolutionNote?: string;
  mergedValue?: string | string[];
  mergedTableHeaders?: string[];
  mergedRows?: string[][];
};
export type SmartCounterSuggestion = { id: string; metricKey: string; definition: Pick<CounterDefinition,"key"|"labelZh"|"labelJa"|"type">; reason: string; approved: boolean };

export type ProfileDraft = {
  id: string;
  catalogId: string;
  machineId?: string;
  status: Exclude<MachineProfileStatus,"placeholder">;
  basedOnStatus: MachineProfileStatus | "catalog-only";
  createdAt: string;
  updatedAt: string;
  sources: ProfileSource[];
  evidence: ProfileSourceEvidence[];
  metrics: DraftMetric[];
  benchmarkDrafts: SettingBenchmark[];
  smartCounterSuggestions: SmartCounterSuggestion[];
  rejectionReason?: string;
};
