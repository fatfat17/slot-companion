import type { MachineIdentificationCandidate, MachineIdentificationResult } from "@/types";
import type { AIProvider, IdentificationImage } from "../types";

const candidate=(machineNameZh:string,machineNameJa:string,confidence:number,reason:string,evidence:string[],identityBasis:MachineIdentificationCandidate["identityBasis"],matchedCatalogId:string|null=null,manufacturer="TEST DATA"):MachineIdentificationCandidate=>({machineNameZh,machineNameJa,manufacturer,confidence,reason,visibleEvidence:evidence,identityBasis,matchedCatalogId});
export class MockAIProvider implements AIProvider {
  readonly name="mock" as const;
  async identifyMachine(image:IdentificationImage):Promise<MachineIdentificationResult>{
    const name=image.fileName.toLowerCase();
    if(name.includes("cancel"))throw new DOMException("Cancelled","AbortError");
    if(name.includes("fail"))throw new Error("Mock request failure");
    if(name.includes("non-slot")||name.includes("unknown"))return{provider:"mock",status:"unknown",candidates:[]};
    if(name.includes("tokyo-ip"))return{provider:"mock",status:"uncertain",candidates:[candidate("東京喰種","",.48,"TEST：只能確認東京喰種 IP，不足以確認正式上市機種名稱。",["TEST：角色畫面","TEST：IP 文字"],"visual_text")]};
    if(name.includes("hades-full"))return{provider:"mock",status:"identified",candidates:[candidate("HADES 測試機種","TEST HADES 正式タイトル",.86,"TEST：正式 title plate 清楚可見。",["TEST：正式 title plate"],"official_title_visible",null,"Universal / Brand Group") ]};
    if(name.includes("god-text"))return{provider:"mock",status:"identified",candidates:[candidate("GOD 系列","GOD",.82,"TEST：只有 generic GOD 字樣。",["TEST：GOD 文字"],"visual_text")]};
    if(name.includes("bullet"))return{provider:"mock",status:"identified",candidates:[candidate("不明","Bullet Chance",.78,"TEST：只看到演出文字。",["TEST：Bullet Chance 字幕"],"visual_text")]};
    if(name.includes("blur"))return{provider:"mock",status:"uncertain",candidates:[candidate("東京喰種","L 東京喰種",.46,"TEST：圖片模糊，無法可靠確認。",["TEST：僅辨識到部分標題"],"inferred"),candidate("機關馬戲團 2","L からくりサーカス2",.31,"TEST：可能候選。",["TEST：筐體輪廓不清楚"],"inferred")]};
    if(name.includes("unprofiled"))return{provider:"mock",status:"identified",candidates:[candidate("測試未知機種","TEST 未登録正式機種",.89,"TEST：正式 title plate 清楚可見。",["TEST：完整正式名稱可見"],"official_title_visible")]};
    if(name.includes("multi"))return{provider:"mock",status:"uncertain",candidates:[candidate("東京喰種","L 東京喰種",.61,"TEST：只有部分 IP 文字。",["TEST：標題部分可見"],"visual_text"),candidate("機關馬戲團 2","L からくりサーカス2",.52,"TEST：依裝飾推測。",["TEST：裝飾相似"],"inferred"),candidate("GOD 神之軌跡","スマスロ ミリオンゴッド－神々の軌跡－",.35,"TEST：generic GOD 字樣。",["TEST：金色筐體"],"inferred")]};
    return{provider:"mock",status:"identified",candidates:[candidate("錯誤自由生成名稱","パチスロ 東京喰種",.94,"TEST：完整機台與 catalog 高度匹配。",["TEST：正式 title plate","TEST：特有筐體"],"catalog_match","tokyo-ghoul","錯誤猜測廠商")]};
  }
}
