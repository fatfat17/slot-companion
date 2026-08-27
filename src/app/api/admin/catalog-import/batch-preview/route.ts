import { runCatalogBatch, CatalogBatchValidationError } from "@/lib/catalog/batch";
import { catalogRepository } from "@/lib/catalog/repository.server";
import { PWorldCatalogProvider } from "@/lib/catalog/providers/pworld";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") return Response.json({ error: { message: "Catalog Importer 僅限 development。" } }, { status: 403 });
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
