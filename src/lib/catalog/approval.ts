import type { CatalogImportDecision } from "@/types/catalog";

export const MAX_APPROVAL_BATCH_SIZE = 100;

export type ApprovalCounts = {
  received: number;
  processed: number;
  imported: number;
  merged: number;
  skipped: number;
  total?: number;
};

export type ApprovalProgress = {
  total: number;
  processed: number;
  remaining: number;
  currentBatch: number;
  totalBatches: number;
};

export class ApprovalValidationError extends Error {}
export class ApprovalBatchError extends Error {
  readonly completed: number;
  readonly failedBatch: number;
  readonly totalBatches: number;
  readonly remaining: number;
  constructor(
    message: string,
    completed: number,
    failedBatch: number,
    totalBatches: number,
    remaining: number,
  ) { super(message);this.completed=completed;this.failedBatch=failedBatch;this.totalBatches=totalBatches;this.remaining=remaining; }
}

export function validateApprovalDecisions(decisions: unknown): asserts decisions is CatalogImportDecision[] {
  if (!Array.isArray(decisions) || decisions.length === 0) throw new ApprovalValidationError("沒有選取可處理的候選。");
  if (decisions.length > MAX_APPROVAL_BATCH_SIZE) throw new ApprovalValidationError(`單次最多處理 ${MAX_APPROVAL_BATCH_SIZE} 筆，請分批提交。`);
}

export async function runApprovalBatches(
  decisions: CatalogImportDecision[],
  submit: (batch: CatalogImportDecision[]) => Promise<ApprovalCounts>,
  onProgress?: (progress: ApprovalProgress) => void,
) {
  if (decisions.length === 0) throw new ApprovalValidationError("沒有選取可處理的候選。");
  const batches = Array.from({ length: Math.ceil(decisions.length / MAX_APPROVAL_BATCH_SIZE) }, (_, index) => decisions.slice(index * MAX_APPROVAL_BATCH_SIZE, (index + 1) * MAX_APPROVAL_BATCH_SIZE));
  const totals: ApprovalCounts = { received: decisions.length, processed: 0, imported: 0, merged: 0, skipped: 0 };
  onProgress?.({ total: decisions.length, processed: 0, remaining: decisions.length, currentBatch: 1, totalBatches: batches.length });
  for (const [index, batch] of batches.entries()) {
    try {
      const result = await submit(batch);
      if (result.received !== batch.length || result.processed !== batch.length) throw new Error(`回傳筆數不一致：送出 ${batch.length}，收到 ${result.received}，處理 ${result.processed}。`);
      totals.processed += result.processed;
      totals.imported += result.imported;
      totals.merged += result.merged;
      totals.skipped += result.skipped;
      totals.total = result.total;
      onProgress?.({ total: decisions.length, processed: totals.processed, remaining: decisions.length - totals.processed, currentBatch: index + 1, totalBatches: batches.length });
    } catch (error) {
      throw new ApprovalBatchError(error instanceof Error ? error.message : "批次提交失敗。", totals.processed, index + 1, batches.length, decisions.length - totals.processed);
    }
  }
  return totals;
}
