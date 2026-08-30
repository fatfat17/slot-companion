import type { MachineIdentificationCandidate, MachineIdentificationStatus } from "@/types";

export type IdentificationFollowUp =
  | {kind:"existing-profile";primaryHref:string;primaryLabel:"✓ 就是這台 · 載入現有 Profile"}
  | {kind:"catalog-only";primaryHref:string;primaryLabel:"✓ 就是這台 · 查看機種資料"};

export function getIdentificationFollowUp(status:MachineIdentificationStatus,candidate:MachineIdentificationCandidate|undefined,timestamp:string):IdentificationFollowUp|null{
  if(status!=="identified"||!candidate)return null;
  if(candidate.matchedMachineId)return{kind:"existing-profile",primaryHref:`/machines/${encodeURIComponent(candidate.matchedMachineId)}?ai=1&confidence=${candidate.confidence}&timestamp=${encodeURIComponent(timestamp)}`,primaryLabel:"✓ 就是這台 · 載入現有 Profile"};
  if(candidate.matchedCatalogId){const catalogId=encodeURIComponent(candidate.matchedCatalogId);return{kind:"catalog-only",primaryHref:`/catalog/${catalogId}`,primaryLabel:"✓ 就是這台 · 查看機種資料"}}
  return null;
}
