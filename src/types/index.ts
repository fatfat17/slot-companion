export type CounterDefinition = {
  id: string;
  machineId: string;
  key: string;
  labelZh: string;
  labelJa: string;
  icon: string;
  description: string;
  recognition: string;
  reason: string;
  type: "count" | "event" | "choice" | "photo";
  choices?: Array<{ value: string; labelZh: string; labelJa: string }>;
  eventState?: GameState;
  denominatorMetricKey?: string;
  parentCounterKey?: string;
  trialRelationshipId?: string;
};

export type TrackerDefinition = {
  key: "dataGame" | "lcdGame" | "czSince" | "atSince";
  labelZh: string;
  labelJa: string;
  primary?: boolean;
  quickAdd?: number;
};

export type HunterFieldDefinition = {
  key: "currentG" | "czSince" | "atSince" | "budgetYen" | "leaveAt";
  labelZh: string;
  labelJa: string;
  inputType: "number" | "time";
  placeholder: string;
};

export type InitialHitMetric = {
  metricKey: string;
  counterKey: "cz" | "at";
  labelZh: string;
  labelJa: string;
  denominatorMetricKey: string;
};

export type MetricDefinition = {
  key: string;
  labelZh: string;
  labelJa: string;
  source:
    | { type: "observedTotalGame" }
    | { type: "observedNormalGame" }
    | { type: "trackerDelta"; trackerKey: TrackerDefinition["key"] }
    | { type: "custom"; sessionMetricKey: string };
};

export type TrialRelationship = {
  id: string;
  trialCounterKey: string;
  outcomeCounterKey: string;
};

export type TrialRecord = {
  id: string;
  relationshipId: string;
  createdAt: string;
  outcome: "pending" | "success" | "failure";
  resolvedAt?: string;
};

export type SettingValues = {
  1: number | null;
  2: number | null;
  3: number | null;
  4: number | null;
  5: number | null;
  6: number | null;
};

export type SettingBenchmark = {
  id: string;
  labelZh: string;
  labelJa: string;
  metricKey: string;
  kind: "rate" | "trialOutcome" | "constraint";
  observation:
    | { type: "rate"; numeratorKey: "cz" | "at" | string; denominatorMetricKey: string; valueMode: "oneIn" | "probability" }
    | { type: "trialOutcome"; relationshipId: string }
    | { type: "constraint"; counterKey: string; equals: string };
  settingValues: SettingValues;
  minimumSample: number;
  source: string;
  updatedAt: string;
  verified: boolean;
  testData: boolean;
  evidenceIds?: string[];
};

export type MachineProfileStatus = "placeholder" | "draft" | "reviewed" | "verified";

export type GameState = "normal" | "prelude" | "cz" | "at" | "special";

export type MachineProfile = {
  smartCounters: CounterDefinition[];
  gameTrackers: TrackerDefinition[];
  nightHunterFields: HunterFieldDefinition[];
  initialHitMetrics: InitialHitMetric[];
  measurementMetrics: MetricDefinition[];
  trialRelationships: TrialRelationship[];
  benchmarks: SettingBenchmark[];
  verifiedMetrics?: Array<{metricKey:string;value:string|string[];sourceNames:string[];verificationStatus:string}>;
};

export type Machine = {
  id: string;
  catalogId?: string;
  nameZh: string;
  nameJa: string;
  aliases?: string[];
  modelNumber?: string;
  seriesName?: string;
  manufacturer: string;
  category: string;
  journey: string[];
  watchPoints: string[];
  milestones: string[];
  funPoints: string[];
  pitfalls: string[];
  profile: MachineProfile;
  playGuide: string;
  accent: string;
  profileStatus: MachineProfileStatus;
  profileVersion?: number;
  previousProfileVersion?: number;
  publishedAt?: string;
  sourceDraftId?: string;
  guideStatus?: "usable" | "partial";
  guideSourceUrl?: string;
};

export type SessionCounter = { sessionId: string; counterKey: string; count: number };

export type CounterValue = number | string | { fileName: string; capturedAt: string };

export type SessionEvent = {
  id: string;
  sessionId: string;
  createdAt: string;
  type: "start" | "game" | "investment" | "medals" | "cz" | "at" | "special" | "counter" | "state" | "end";
  label: string;
  value?: number;
  note?: string;
};

export type Session = {
  id: string;
  machineId: string;
  profileSnapshot?: Machine;
  machineNumber: string;
  startedAt: string;
  endedAt?: string;
  startG: number;
  actualG: number;
  displayG: number;
  investmentYen: number;
  medals: number;
  czCount: number;
  atCount: number;
  gameState: GameState;
  trackers: Record<string, number>;
  trackerBaselines: Record<string, number>;
  metrics: Record<string, number>;
  trials: Record<string, TrialRecord[]>;
  status: "active" | "completed";
  counters: Record<string, CounterValue>;
  events: SessionEvent[];
  identifiedByAI?: boolean;
  identificationConfidence?: number;
  identificationTimestamp?: string;
};

export type MachineIdentificationStatus = "identified" | "uncertain" | "unknown";

export type MachineIdentificationCandidate = {
  machineNameJa: string;
  machineNameZh: string;
  manufacturer: string;
  confidence: number;
  reason: string;
  visibleEvidence: string[];
  matchedMachineId?: string;
  matchedCatalogId?: string | null;
  identityBasis:
    | "catalog_match"
    | "official_title_visible"
    | "multi_visual_evidence"
    | "visual_text"
    | "inferred"
    | "unknown";
};

export type MachineIdentificationResult = {
  status: MachineIdentificationStatus;
  candidates: MachineIdentificationCandidate[];
  provider: "openai" | "mock";
  researchStatus?: "pending_new_machine";
  debug?: {
    phase1Evidence: import("./catalog").CatalogVisibleEvidence;
    searchQueryTerms: string[];
    shortlist: Array<{id:string;officialNameJa:string;score:number;matchReasons:string[]}>;
    phase2: {status:MachineIdentificationStatus;selectedCatalogIds:string[];decisionReasons:string[]};
  };
};

export type IdentificationContext = {
  identifiedByAI: true;
  confidence: number;
  timestamp: string;
};

export type HunterForm = {
  machineId: string;
  currentG: number;
  sinceCz: number;
  sinceAt: number;
  budgetYen: number;
  leaveAt: string;
};
