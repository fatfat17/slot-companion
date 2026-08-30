import type { MachineGuide } from "@/types/machineGuide";

export type GuideEstimatorSupport={status:"supported"|"unavailable";metricCount:number;labels:string[];summary:string};

export function getGuideEstimatorSupport(guide:MachineGuide):GuideEstimatorSupport{
  const eligible=guide.estimatorMetrics.filter(metric=>metric.estimatorEligible&&metric.observationContract.status==="eligible"&&metric.settingValues);
  const labels=[...new Set(eligible.map(metric=>metric.labelZh))];
  if(!labels.length)return{status:"unavailable",metricCount:0,labels:[],summary:"這台目前只支援遊玩紀錄，尚無可安全計算的設定資料。"};
  return{status:"supported",metricCount:labels.length,labels,summary:`可用 ${labels.length} 項公開設定數值；開始 Session 後仍需累積足夠 G 數與事件次數。`};
}
