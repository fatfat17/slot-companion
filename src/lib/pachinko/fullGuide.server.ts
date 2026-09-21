import "server-only";
import type {PachinkoCatalogRecord,PachinkoFullGuide} from "@/types/pachinko";
import {materializeVisualGuideAssets} from "@/lib/machine-guide/visualGuideStorage.server";
import {buildPachinkoChineseGuide} from "./chineseGuide.server";
import {parsePWorldPachinkoFullGuide} from "./pworld";

export async function buildPachinkoFullGuide(record:PachinkoCatalogRecord):Promise<PachinkoFullGuide>{const response=await fetch(record.sourceUrl,{headers:{"User-Agent":"Slot Companion Pachinko guide reader"},cache:"no-store",signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error(`P-WORLD 機台資料暫時無法讀取（${response.status}）。`);let guide=parsePWorldPachinkoFullGuide(await response.text(),record,new Date().toISOString());if(!guide.sections.length)throw new Error("公開來源目前沒有足夠資料可建立柏青哥指南。");guide={...guide,playerGuideZh:await buildPachinkoChineseGuide(guide)};return materializeVisualGuideAssets(guide)}
