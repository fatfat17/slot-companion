import type { MachineGuideSessionModule, SessionModuleKind } from "@/types/machineGuide";

const LABELS:Record<SessionModuleKind,[string,string]>={
  total_games:["總遊玩 G","総ゲーム数"],normal_games:["通常遊玩 G","通常ゲーム数"],big_reg_bonus:["BIG／REG／Bonus","BIG・REG・ボーナス"],named_cz:["CZ","チャンスゾーン"],at:["AT 次數","AT"],art:["ART 次數","ART"],set:["Set 數","セット数"],cycle:["週期到達","周期到達"],points:["點數到達","ポイント到達"],cz_failures:["CZ 失敗","CZ失敗"],dual_games:["雙 G 數","実ゲーム・液晶ゲーム"],role_streak:["小役／圖示連續","小役・図柄連続"],end_evidence:["終了畫面／示唆","終了画面・示唆"],custom_event:["自訂事件","カスタムイベント"],
};
export function sessionModule(kind:SessionModuleKind,eventId?:string,label?:[string,string]):MachineGuideSessionModule{const names=label??LABELS[kind];return{id:`module:${kind}${eventId?`:${eventId}`:""}`,kind,labelZh:names[0],labelJa:names[1],eventId,controlled:true}}
