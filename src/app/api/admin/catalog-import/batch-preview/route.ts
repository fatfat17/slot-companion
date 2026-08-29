import { runCatalogBatch, CatalogBatchValidationError } from "@/lib/catalog/batch";
import { catalogRepository } from "@/lib/catalog/repository.server";
import { PWorldCatalogProvider } from "@/lib/catalog/providers/pworld";
import { authorizeCatalogAdmin } from "@/lib/catalog/adminAuth.server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!authorizeCatalogAdmin(request)) return Response.json({ error: { message: "管理密碼不正確，無法更新機種資料庫。" } }, { status: 401 });
  try {
    const { startMonth, endMonth } = await request.json() as { startMonth?: string; endMonth?: string };
    if (!startMonth || !endMonth) return Response.json({ error: { message: "請輸入 Start Month 與 End Month。" } }, { status: 400 });
    const result = await runCatalogBatch({
      startMonth,
      endMonth,
      provider: new PWorldCatalogProvider(),
      existingRecords: await catalogRepository.list(),
    });
    return Response.json({ source: "P-WORLD", ...result });
  } catch (error) {
    if (error instanceof CatalogBatchValidationError) return Response.json({ error: { message: error.message } }, { status: 422 });
    return Response.json({ error: { message: "Batch preview 建立失敗。" } }, { status: 500 });
  }
}
