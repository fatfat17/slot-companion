import type { CounterDefinition, Machine, SettingBenchmark, SettingValues } from "@/types";

export type MachineGuideStatus = "usable" | "partial" | "no_data";
export type GuideAvailability = "available" | "partial" | "unavailable";
export type GuideMachineType = "a_type" | "cz_at" | "bonus_art" | "cycle_point_at" | "bonus_loop" | "multi_zone_at" | "set_based_at" | "generic";
export type GuideEvidenceReference={id:string;layer:"family"|"control"|"estimator";sourceUrl:string;sectionKey:MachineGuideSectionKey|null;structure:"heading"|"paragraph"|"table"|"table_header"|"derived";label:string;sufficient:boolean;reason:string};
export type MachineFamilyClassification={family:GuideMachineType;confidence:"high"|"medium"|"low";evidence:string[];familyEvidence:GuideEvidenceReference[];unsupportedReasons:string[]};
export type ControlManifestItem={
  id:string;label:string;eventType:"game"|"cz"|"at"|"art"|"bonus"|"special"|"indication"|"state"|"numeric"|"derived"|"custom";
  controlType:"counter"|"state_switch"|"choice"|"numeric_input"|"derived_metric";playerWhen:string;observationKey:string;
  stateEffect:import("@/types").GameState|null;estimatorUsable:boolean;numerator:string|null;denominator:GuideDenominator|null;
  sourceEvidence:string[];controlEvidence:GuideEvidenceReference[];evidenceGate:"passed"|"blocked"|"not_applicable";availability:CapabilityStatus;unavailableReason:string|null;quickPriority:number;moduleKind?:SessionModuleKind;eventId?:string;
  choices?:Array<{value:string;labelZh:string;labelJa:string;sourceDescription?:string;referenceOnly?:boolean;sourceUrl?:string;sourceSectionKey?:string;sourceTableId?:string;sourceEvidenceId?:string}>;
};
export type MachineGuideSectionKey = "features" | "play" | "flow" | "cz" | "at_art" | "bonus" | "ceiling" | "setting_rates" | "payout" | "small_roles" | "special_events";
export type GuideStateType = "normal" | "chance_zone" | "at" | "art" | "bonus" | "special" | "entry" | "end" | "beginner" | "source";
export type SessionModuleKind = "total_games" | "normal_games" | "big_reg_bonus" | "named_cz" | "at" | "art" | "set" | "cycle" | "points" | "cz_failures" | "dual_games" | "role_streak" | "end_evidence" | "custom_event";
export type GuideDenominator = "total_games" | "normal_games" | "bonus_interval_games" | "cycle_arrivals" | "point_arrivals" | "cz_trials" | "at_art_ends" | "specific_trials";
export type CapabilityStatus = "operational" | "read_only" | "unavailable";
export type CapabilityControlType = "tracker" | "event" | "choice" | "relationship" | "derived" | "none";
export type SessionObservationTarget = {type:"metric"|"counter"|"relationship"|"derived";key:string};
export type SessionCapability = {
  moduleId:string;moduleKind:SessionModuleKind;controlType:CapabilityControlType;labelZh:string;labelJa:string;
  observationKey:string;writeTarget:SessionObservationTarget;stateEffect:import("@/types").GameState|null;
  status:CapabilityStatus;reason:string|null;estimatorUsable:boolean;choicesRequired:boolean;choicesAvailable:boolean;
  numeratorDependency:string|null;denominatorDependency:GuideDenominator|null;eventId?:string;
  playerWhen?:string;sourceEvidence?:string[];controlEvidence?:GuideEvidenceReference[];evidenceGate?:ControlManifestItem["evidenceGate"];quickPriority?:number;manifestControlType?:ControlManifestItem["controlType"];
};
export type DenominatorCapability = {key:GuideDenominator;observationKey:string;status:"operational"|"planned"|"unavailable";requiredControl:string;requiredRelationship:string|null;reason:string|null};
export type EstimatorObservationContract = {
  status:"eligible"|"blocked";
  numeratorKey:string|null;
  numeratorControlId:string|null;
  denominator:GuideDenominator|null;
  denominatorObservationKey:string|null;
  minimumSample:number|null;
  reason:string|null;
};

export type MachineGuideSource = {name:string;url:string;retrievedAt:string;role:"primary"|"supplemental";status:"available"|"failed"};
export type MachineGuideConflict = {id:string;sectionKey:MachineGuideSectionKey;label:string;sourceUrls:string[];reason:string;status:"unresolved"};
export type MachineGuideTable = {id:string;title:string;headers:string[];rows:string[][];note:string|null;sourceUrl:string;sourceName?:string;sourceUrls?:string[];sourceNames?:string[]};
export type MachineGuideSection = {key:MachineGuideSectionKey;titleZh:string;titleJa:string;summaryZh:string|null;paragraphsJa:string[];paragraphSourceUrls?:string[];tables:MachineGuideTable[]};
export type MachineGuideEvidence = {sectionKey:MachineGuideSectionKey;rawLabel:string;extractedFrom:"heading"|"paragraph"|"table";sourceUrl:string};
export type ParsedMachineGuideFacts = {catalogId:string;officialNameJa:string;displayNameZh:string;manufacturer:string;catalogMachineType:string;introducedAt:string|null;sections:MachineGuideSection[];evidence:MachineGuideEvidence[];missingSections:MachineGuideSectionKey[];sourceName:string;sourceUrl:string;retrievedAt:string;sources?:MachineGuideSource[];conflicts?:MachineGuideConflict[];conflictedTableIds?:string[];sourceWarnings?:string[];familyClassificationHint?:MachineFamilyClassification};
export type MachineGuideState = {id:string;displayNameZh:string;originalNameJa:string;type:GuideStateType;sourceUrl:string};
export type MachineGuideEvent = {id:string;labelZh:string;labelJa:string;category:"bonus"|"cz"|"at"|"art"|"role"|"indication"|"special";whatToSee:string;countingRule:string;sessionModuleIds:string[];affectsEstimator:boolean;sourceUrl:string;controlEvidence:GuideEvidenceReference[];unavailableReason:string|null};
export type MachineGuideSessionModule = {id:string;kind:SessionModuleKind;labelZh:string;labelJa:string;eventId?:string;controlled:true};
export type MachineGuideMetric = {id:string;metricKey:string;labelZh:string;numeratorEventId:string|null;denominator:GuideDenominator|null;applicableStateIds:string[];minimumSample:number|null;settingValues:SettingValues|null;sourceUrl:string;estimatorEvidence:GuideEvidenceReference[];observationContract:EstimatorObservationContract;estimatorEligible:boolean;unavailableReason:string|null};
export type BeginnerGuide = {corePlay:string|null;keyThings:Array<{id:string;labelZh:string;labelJa:string;meaning:string;recordWhen:string}>;glossary:Array<{termJa:string;termZh:string}>;missingMessage:"尚無資料"|null};
export type PlayerGuideZh = {
  generator:"rules"|"openai";
  overview:string;
  goals:string[];
  highlights:Array<{id:string;label:string;meaning:string;recordWhen:string;sourceSectionKeys:MachineGuideSectionKey[]}>;
  sections:Array<{key:MachineGuideSectionKey;title:string;summary:string;points:string[];sourceSectionKeys:MachineGuideSectionKey[]}>;
  generatedAt:string;
};
export type SessionQuickGuide = {corePlay:string|null;flow:string[];events:MachineGuideEvent[];keyThings:BeginnerGuide["keyThings"];glossary:BeginnerGuide["glossary"];sourceName:string;sourceUrl:string;retrievedAt:string;missingSections?:MachineGuideSectionKey[];evidence?:MachineGuideEvidence[]};

export type MachineGuide = {
  schemaVersion:2;catalogId:string;officialNameJa:string;displayNameZh:string;manufacturer:string;machineType:GuideMachineType;introducedAt:string|null;status:MachineGuideStatus;
  availability:{guide:GuideAvailability;sessionTemplate:GuideAvailability;settingEstimator:GuideAvailability;reasons:string[]};
  familyClassification?:MachineFamilyClassification;controlManifest?:ControlManifestItem[];
  playerGuideZh?:PlayerGuideZh;
  beginnerGuide:BeginnerGuide;states:MachineGuideState[];recordableEvents:MachineGuideEvent[];sessionModules:MachineGuideSessionModule[];sessionCapabilities:SessionCapability[];denominatorCapabilities:DenominatorCapability[];estimatorMetrics:MachineGuideMetric[];
  sections:MachineGuideSection[];evidence:MachineGuideEvidence[];missingSections:MachineGuideSectionKey[];benchmarks:SettingBenchmark[];smartCounters:CounterDefinition[];
  sourceName:string;sourceUrl:string;retrievedAt:string;sources?:MachineGuideSource[];conflicts?:MachineGuideConflict[];sourceWarnings?:string[];
};
export type MachineGuideApiResponse = {guide:MachineGuide}|{error:string;code:string};
export type CachedMachineGuide = {guide:MachineGuide;cachedAt:string;compilerRevision:string};
export type GuideMachineSnapshot = Machine & {guideStatus:Exclude<MachineGuideStatus,"no_data">;guideSourceUrl:string};
