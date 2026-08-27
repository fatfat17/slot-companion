import type { CounterDefinition, Machine } from "@/types";

const counters = (machineId: string): CounterDefinition[] => [
  { id: `${machineId}-cherry`, machineId, key: "weakCherry", labelZh: "弱櫻桃", labelJa: "弱チェリー", icon: "🍒", description: "常見的小役之一，本版只提供記錄用途。", recognition: "請以機台說明或已驗證攻略判斷；目前為佔位說明。", reason: "留下樣本，方便回顧 Session 節奏。" },
  { id: `${machineId}-suika`, machineId, key: "watermelon", labelZh: "西瓜", labelJa: "スイカ", icon: "🍉", description: "本版不提供真實機率或設定推測。", recognition: "依轉輪圖樣與有效線判斷；目前為佔位說明。", reason: "快速留下發生次數，結算時由程式計算比率。" },
  { id: `${machineId}-bell`, machineId, key: "commonBell", labelZh: "共通鈴", labelJa: "共通ベル", icon: "🔔", description: "示範用 Counter，資料尚待驗證。", recognition: "請以已驗證的機種資料為準。", reason: "作為未來 Verified Machine Data 接入前的操作範例。" },
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
  { id: "tokyo-ghoul", nameZh: "東京喰種", nameJa: "L 東京喰種", manufacturer: "メーカー資料待驗證", category: "智慧型角子機｜スマスロ", accent: "#f45b78", ...placeholder, counters: counters("tokyo-ghoul") },
  { id: "karakuri-2", nameZh: "機關馬戲團 2", nameJa: "L からくりサーカス2", manufacturer: "メーカー資料待驗證", category: "智慧型角子機｜スマスロ", accent: "#d4a94f", ...placeholder, counters: counters("karakuri-2") },
  { id: "million-god", nameZh: "GOD 神之軌跡", nameJa: "スマスロ ミリオンゴッド－神々の軌跡－", manufacturer: "メーカー資料待驗證", category: "智慧型角子機｜スマスロ", accent: "#8bc5ff", ...placeholder, counters: counters("million-god") },
];

export const getMachine = (id: string) => machines.find((machine) => machine.id === id);
