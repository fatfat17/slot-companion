import type { CounterDefinition, HunterFieldDefinition, InitialHitMetric, Machine, MetricDefinition, SettingBenchmark, TrackerDefinition, TrialRelationship } from "@/types";

const counter = (machineId: string, key: string, labelZh: string, labelJa: string, icon: string, type: CounterDefinition["type"], extra: Partial<CounterDefinition> = {}): CounterDefinition => ({
  id: `${machineId}-${key}`, machineId, key, labelZh, labelJa, icon,
  description: "此項目由該機種的 Machine Profile 動態提供，目前為操作示範。",
  recognition: "辨識方式待接入已驗證機種資料；請勿依此佔位名稱判斷實際圖樣。",
  reason: "用來示範每台機種可以有不同的 Smart Counter 組合。",
  type,
  ...extra,
});

const smartCounterProfiles: Record<string, CounterDefinition[]> = {
  "tokyo-ghoul": [
    counter("tokyo-ghoul", "focusRole", "關注小役 A", "注目役 A（仮）", "🎯", "count", { denominatorMetricKey: "observedTotalGame" }),
    counter("tokyo-ghoul", "specialCue", "契機結果", "契機結果（仮）", "🩸", "event", { eventState: "special", parentCounterKey: "focusRole", trialRelationshipId: "ghoul-focus-trial" }),
    counter("tokyo-ghoul", "sceneMemo", "畫面紀錄", "画面メモ（仮）", "📷", "photo"),
    counter("tokyo-ghoul", "testSettingEvidence", "TEST 判定畫面", "TEST DATA", "🧪", "choice", { choices: [{ value: "none", labelZh: "TEST：無", labelJa: "なし" }, { value: "gte4", labelZh: "TEST：設定4以上濃厚", labelJa: "設定4以上濃厚" }, { value: "s6", labelZh: "TEST：設定6濃厚", labelJa: "設定6濃厚" }] }),
  ],
  "karakuri-2": [
    counter("karakuri-2", "chancePattern", "機會圖樣", "チャンス図柄（仮）", "🎭", "count", { denominatorMetricKey: "observedTotalGame" }),
    counter("karakuri-2", "stageShift", "舞台選擇", "ステージ選択（仮）", "⚙️", "choice", { choices: [{ value: "a", labelZh: "舞台 A", labelJa: "ステージ A（仮）" }, { value: "b", labelZh: "舞台 B", labelJa: "ステージ B（仮）" }, { value: "other", labelZh: "其他", labelJa: "その他" }] }),
    counter("karakuri-2", "focusCue", "契機結果", "契機結果（仮）", "✨", "event", { eventState: "prelude", parentCounterKey: "chancePattern", trialRelationshipId: "karakuri-chance-trial" }),
    counter("karakuri-2", "testSettingEvidence", "TEST 判定畫面", "TEST DATA", "🧪", "choice", { choices: [{ value: "none", labelZh: "TEST：無", labelJa: "なし" }, { value: "gte4", labelZh: "TEST：設定4以上濃厚", labelJa: "設定4以上濃厚" }, { value: "s6", labelZh: "TEST：設定6濃厚", labelJa: "設定6濃厚" }] }),
  ],
  "million-god": [
    counter("million-god", "yellowPattern", "黃色圖樣", "黄図柄（仮）", "🟨", "count", { denominatorMetricKey: "observedTotalGame" }),
    counter("million-god", "godCue", "特殊演出", "特殊演出（仮）", "⚡", "photo", { eventState: "special" }),
    counter("million-god", "testSettingEvidence", "TEST 判定畫面", "TEST DATA", "🧪", "choice", { choices: [{ value: "none", labelZh: "TEST：無", labelJa: "なし" }, { value: "gte4", labelZh: "TEST：設定4以上濃厚", labelJa: "設定4以上濃厚" }, { value: "s6", labelZh: "TEST：設定6濃厚", labelJa: "設定6濃厚" }] }),
  ],
};

const tracker = (key: TrackerDefinition["key"], labelZh: string, labelJa: string, primary = false, quickAdd?: number): TrackerDefinition => ({ key, labelZh, labelJa, primary, quickAdd });
const hunter = (key: HunterFieldDefinition["key"], labelZh: string, labelJa: string, inputType: HunterFieldDefinition["inputType"] = "number", placeholder = "0"): HunterFieldDefinition => ({ key, labelZh, labelJa, inputType, placeholder });

const gameTrackerProfiles: Record<string, TrackerDefinition[]> = {
  "tokyo-ghoul": [tracker("dataGame", "資料 G", "データ G", true, 10), tracker("lcdGame", "液晶 G", "液晶 G")],
  "karakuri-2": [tracker("dataGame", "目前 G", "現在 G", true, 10), tracker("czSince", "CZ 間", "CZ 間")],
  "million-god": [tracker("dataGame", "目前 G", "現在 G", true, 10), tracker("atSince", "AT 間", "AT 間")],
};

const hunterProfiles: Record<string, HunterFieldDefinition[]> = {
  "tokyo-ghoul": [hunter("currentG", "現在 G", "現在 G"), hunter("budgetYen", "剩餘單台預算", "残り予算", "number", "¥"), hunter("leaveAt", "預計離店時間", "退店予定", "time", "")],
  "karakuri-2": [hunter("currentG", "現在 G", "現在 G"), hunter("czSince", "CZ 間", "CZ 間"), hunter("budgetYen", "剩餘單台預算", "残り予算", "number", "¥"), hunter("leaveAt", "預計離店時間", "退店予定", "time", "")],
  "million-god": [hunter("currentG", "現在 G", "現在 G"), hunter("atSince", "AT 間", "AT 間"), hunter("budgetYen", "剩餘單台預算", "残り予算", "number", "¥"), hunter("leaveAt", "預計離店時間", "退店予定", "time", "")],
};

const initialHitProfiles: Record<string, InitialHitMetric[]> = {
  "tokyo-ghoul": [{ metricKey: "czInitialRate", counterKey: "cz", labelZh: "CZ 初當率", labelJa: "CZ 初当り", denominatorMetricKey: "observedNormalGame" }],
  "karakuri-2": [{ metricKey: "czInitialRate", counterKey: "cz", labelZh: "CZ 初當率", labelJa: "CZ 初当り", denominatorMetricKey: "observedTotalGame" }],
  "million-god": [{ metricKey: "atInitialRate", counterKey: "at", labelZh: "AT 初當率", labelJa: "AT 初当り", denominatorMetricKey: "observedTotalGame" }],
};

const metric = (key:string,labelZh:string,labelJa:string,source:MetricDefinition["source"]):MetricDefinition => ({key,labelZh,labelJa,source});
const measurementProfiles: Record<string, MetricDefinition[]> = {
  "tokyo-ghoul": [metric("observedTotalGame","本 Session 已觀測","セッション観測 G",{type:"observedTotalGame"}),metric("observedNormalGame","通常狀態觀測","通常時観測 G",{type:"observedNormalGame"}),metric("dataGameDelta","資料 G 差值","データ G 差分",{type:"trackerDelta",trackerKey:"dataGame"})],
  "karakuri-2": [metric("observedTotalGame","本 Session 已觀測","セッション観測 G",{type:"observedTotalGame"}),metric("dataGameDelta","目前 G 差值","現在 G 差分",{type:"trackerDelta",trackerKey:"dataGame"})],
  "million-god": [metric("observedTotalGame","本 Session 已觀測","セッション観測 G",{type:"observedTotalGame"}),metric("dataGameDelta","目前 G 差值","現在 G 差分",{type:"trackerDelta",trackerKey:"dataGame"})],
};

const trialProfiles: Record<string, TrialRelationship[]> = {
  "tokyo-ghoul": [{id:"ghoul-focus-trial",trialCounterKey:"focusRole",outcomeCounterKey:"specialCue"}],
  "karakuri-2": [{id:"karakuri-chance-trial",trialCounterKey:"chancePattern",outcomeCounterKey:"focusCue"}],
  "million-god": [],
};

const values = (v1:number,v2:number,v3:number,v4:number,v5:number,v6:number) => ({1:v1,2:v2,3:v3,4:v4,5:v5,6:v6});
const testBenchmarks = (machineId:string, rateCounter:"cz"|"at", denominatorMetricKey:string, relationshipId?:string):SettingBenchmark[] => [
  { id:`${machineId}-test-rate`, labelZh:`TEST ${rateCounter.toUpperCase()} 初當`, labelJa:"TEST DATA", metricKey:`${rateCounter}InitialRate`, kind:"rate", observation:{type:"rate",numeratorKey:rateCounter,denominatorMetricKey,valueMode:"oneIn"}, settingValues:values(180,160,142,125,108,92), minimumSample:600, source:"Slot Companion TEST DATA fixture", updatedAt:"2026-08-27", verified:true, testData:true },
  ...(relationshipId?[{ id:`${machineId}-test-trial`, labelZh:"TEST 契機成功率", labelJa:"TEST DATA", metricKey:"testTrialSuccess", kind:"trialOutcome" as const, observation:{type:"trialOutcome" as const,relationshipId}, settingValues:values(.12,.16,.21,.28,.36,.46), minimumSample:20, source:"Slot Companion TEST DATA fixture", updatedAt:"2026-08-27", verified:true, testData:true }]:[]),
  { id:`${machineId}-test-gte4`, labelZh:"TEST 設定4以上濃厚", labelJa:"TEST DATA", metricKey:"testConstraintGte4", kind:"constraint", observation:{type:"constraint",counterKey:"testSettingEvidence",equals:"gte4"}, settingValues:values(.02,.02,.04,1,1,1), minimumSample:1, source:"Slot Companion TEST DATA fixture", updatedAt:"2026-08-27", verified:true, testData:true },
  { id:`${machineId}-test-s6`, labelZh:"TEST 設定6濃厚", labelJa:"TEST DATA", metricKey:"testConstraintS6", kind:"constraint", observation:{type:"constraint",counterKey:"testSettingEvidence",equals:"s6"}, settingValues:values(.01,.01,.01,.02,.05,1), minimumSample:1, source:"Slot Companion TEST DATA fixture", updatedAt:"2026-08-27", verified:true, testData:true },
];

const placeholder = {
  journey: ["通常遊戲", "機會區間（示意）", "CZ／AT（示意）"],
  watchPoints: ["先確認目前所處狀態", "留意機台提示與畫面變化", "用 Session 記錄自己的實戰節奏"],
  milestones: ["關鍵節點資料待 Verified Machine Data", "本版不顯示天井或 Zone", "不根據未驗證資訊建議續打或離席"],
  funPoints: ["狀態推進時的演出變化", "達成契機後的節奏轉換"],
  pitfalls: ["畫面熱鬧不代表保證當選", "Counter 比率不能單獨用來判定設定"],
  playGuide: "請依機台提示操作；詳細打ち方待接入已驗證資料。",
};

export const machines: Machine[] = [
  { id: "tokyo-ghoul", catalogId: "tokyo-ghoul", nameZh: "東京喰種", nameJa: "L 東京喰種", aliases: ["東京喰種", "Tokyo Ghoul", "L東京喰種"], manufacturer: "メーカー資料待驗證", category: "智慧型角子機｜スマスロ", accent: "#f45b78", profileStatus:"placeholder", ...placeholder, profile: { smartCounters: smartCounterProfiles["tokyo-ghoul"], gameTrackers: gameTrackerProfiles["tokyo-ghoul"], nightHunterFields: hunterProfiles["tokyo-ghoul"], initialHitMetrics: initialHitProfiles["tokyo-ghoul"], measurementMetrics: measurementProfiles["tokyo-ghoul"], trialRelationships: trialProfiles["tokyo-ghoul"], benchmarks: testBenchmarks("tokyo-ghoul","cz","observedNormalGame","ghoul-focus-trial") } },
  { id: "karakuri-2", catalogId: "karakuri-2", nameZh: "機關馬戲團 2", nameJa: "L からくりサーカス2", aliases: ["機關馬戲團2", "からくりサーカス2", "Lからくりサーカス2"], manufacturer: "メーカー資料待驗證", category: "智慧型角子機｜スマスロ", accent: "#d4a94f", profileStatus:"placeholder", ...placeholder, profile: { smartCounters: smartCounterProfiles["karakuri-2"], gameTrackers: gameTrackerProfiles["karakuri-2"], nightHunterFields: hunterProfiles["karakuri-2"], initialHitMetrics: initialHitProfiles["karakuri-2"], measurementMetrics: measurementProfiles["karakuri-2"], trialRelationships: trialProfiles["karakuri-2"], benchmarks: testBenchmarks("karakuri-2","cz","observedTotalGame","karakuri-chance-trial") } },
  { id: "million-god", catalogId: "million-god", nameZh: "GOD 神之軌跡", nameJa: "スマスロ ミリオンゴッド－神々の軌跡－", aliases: ["GOD 神々の軌跡", "ミリオンゴッド神々の軌跡", "Million God"], manufacturer: "メーカー資料待驗證", category: "智慧型角子機｜スマスロ", accent: "#8bc5ff", profileStatus:"placeholder", ...placeholder, profile: { smartCounters: smartCounterProfiles["million-god"], gameTrackers: gameTrackerProfiles["million-god"], nightHunterFields: hunterProfiles["million-god"], initialHitMetrics: initialHitProfiles["million-god"], measurementMetrics: measurementProfiles["million-god"], trialRelationships: trialProfiles["million-god"], benchmarks: testBenchmarks("million-god","at","observedTotalGame") } },
];

export const getMachine = (id: string) => machines.find((machine) => machine.id === id);
