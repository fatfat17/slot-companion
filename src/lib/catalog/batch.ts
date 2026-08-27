import { findDuplicate, normalizeCatalogName } from "./core.ts";
import type { CatalogSourceProvider } from "./providers/types.ts";
import type { MachineCatalogCandidate, MachineCatalogRecord } from "@/types/catalog";

export const MAX_BATCH_MONTHS = 36;
export const DEFAULT_BATCH_PACING_MS = 500;

export class CatalogBatchValidationError extends Error {}

export type CatalogBatchFailure = { month: string; reason: string };
export type CatalogBatchPreview = {
  months: string[];
  failures: CatalogBatchFailure[];
  summary: {
    scannedMonths: number;
    successfulMonths: number;
    failedMonths: number;
    rawSlotCandidates: number;
    normalizedCandidates: number;
    deduplicatedCandidates: number;
    existingCatalogCount: number;
    newCandidateCount: number;
    mergeCandidateCount: number;
  };
  candidates: Array<{ candidate: MachineCatalogCandidate; duplicate: MachineCatalogRecord | null }>;
};

function monthIndex(value: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) throw new CatalogBatchValidationError("月份格式必須為 YYYY-MM。");
  const [year, month] = value.split("-").map(Number);
  return year * 12 + month - 1;
}

export function enumerateMonths(startMonth: string, endMonth: string) {
  const start = monthIndex(startMonth);
  const end = monthIndex(endMonth);
  if (end < start) throw new CatalogBatchValidationError("End Month 不可早於 Start Month。");
  const count = end - start + 1;
  if (count > MAX_BATCH_MONTHS) throw new CatalogBatchValidationError(`一次最多掃描 ${MAX_BATCH_MONTHS} 個月。`);
  return Array.from({ length: count }, (_, offset) => {
    const value = start + offset;
    return `${Math.floor(value / 12).toString().padStart(4, "0")}-${(value % 12 + 1).toString().padStart(2, "0")}`;
  });
}

export function buildPWorldMonthUrl(month: string) {
  monthIndex(month);
  return `https://www.p-world.co.jp/database/machine/introduce_calendar.cgi?year_month=${month}`;
}

export async function runCatalogBatch(options: {
  startMonth: string;
  endMonth: string;
  provider: CatalogSourceProvider;
  existingRecords: MachineCatalogRecord[];
  pacingMs?: number;
  wait?: (milliseconds: number) => Promise<void>;
}): Promise<CatalogBatchPreview> {
  const months = enumerateMonths(options.startMonth, options.endMonth);
  const failures: CatalogBatchFailure[] = [];
  const raw: MachineCatalogCandidate[] = [];
  const wait = options.wait ?? (milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)));
  for (const [index, month] of months.entries()) {
    try {
      raw.push(...await options.provider.fetchCandidates(buildPWorldMonthUrl(month)));
    } catch (error) {
      failures.push({ month, reason: error instanceof Error ? error.message : "未知錯誤" });
    }
    if (index < months.length - 1) await wait(options.pacingMs ?? DEFAULT_BATCH_PACING_MS);
  }

  const normalized = raw.filter(candidate => normalizeCatalogName(candidate.officialNameJa));
  const unique = new Map<string, MachineCatalogCandidate>();
  for (const candidate of normalized) {
    const key = normalizeCatalogName(candidate.officialNameJa);
    const previous = unique.get(key);
    if (!previous) unique.set(key, candidate);
    else unique.set(key, {
      ...previous,
      aliases: [...new Set([...previous.aliases, ...candidate.aliases])],
      manufacturer: previous.manufacturer === "不明" ? candidate.manufacturer : previous.manufacturer,
      introducedAt: previous.introducedAt && candidate.introducedAt
        ? (previous.introducedAt < candidate.introducedAt ? previous.introducedAt : candidate.introducedAt)
        : previous.introducedAt ?? candidate.introducedAt,
    });
  }
  const candidates = [...unique.values()].map(candidate => ({ candidate, duplicate: findDuplicate(candidate, options.existingRecords) ?? null }));
  const existingCatalogCount = candidates.filter(item => item.duplicate).length;
  return {
    months,
    failures,
    summary: {
      scannedMonths: months.length,
      successfulMonths: months.length - failures.length,
      failedMonths: failures.length,
      rawSlotCandidates: raw.length,
      normalizedCandidates: normalized.length,
      deduplicatedCandidates: candidates.length,
      existingCatalogCount,
      newCandidateCount: candidates.length - existingCatalogCount,
      mergeCandidateCount: existingCatalogCount,
    },
    candidates,
  };
}
