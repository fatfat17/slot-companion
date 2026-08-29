import { createHash } from "node:crypto";
import type { MachineGuideImage,MachineGuideSectionKey } from "@/types/machineGuide";

export const VISUAL_GUIDE_FIRST_PILOT_CATALOG_IDS=[
  "machine-1y0erql",
  "machine-1bh564g",
  "machine-u0ht3u",
  "tokyo-ghoul",
  "machine-1xl2y3d",
] as const;
export const VISUAL_GUIDE_SECOND_PILOT_CATALOG_IDS=[
  "machine-1cxlsjr",
  "machine-1sbpobu",
  "machine-cmokk2",
  "machine-vrfegw",
  "machine-yj5szs",
  "machine-1712ndq",
  "machine-5f0b6m",
  "machine-th4uhu",
  "machine-lbz92e",
  "karakuri-2",
  "machine-1ryjocr",
  "million-god",
  "machine-7bn1a1",
  "machine-1ar2ivp",
  "machine-nhun8m",
  "machine-wkwdec",
  "machine-73a4j7",
  "machine-wmlmat",
  "machine-9pj2ap",
  "machine-12i4zri",
] as const;
export const VISUAL_GUIDE_PILOT_CATALOG_IDS=[...VISUAL_GUIDE_FIRST_PILOT_CATALOG_IDS,...VISUAL_GUIDE_SECOND_PILOT_CATALOG_IDS] as const;
export const VISUAL_GUIDE_MAX_IMAGES=18;
export const VISUAL_GUIDE_MAX_IMAGE_BYTES=1_000_000;
export const VISUAL_GUIDE_WARNING_BYTES=12_000_000;
export const VISUAL_GUIDE_BUCKET="machine-guide-assets";
export const VISUAL_GUIDE_ASSET_REVISION="visual-assets-2";

const visualGuidePilotCatalogIds=new Set<string>(VISUAL_GUIDE_PILOT_CATALOG_IDS);
export function isVisualGuidePilotCatalog(catalogId:string){return visualGuidePilotCatalogIds.has(catalogId)}

export function canonicalPWorldImageUrl(value:string,baseUrl:string){
  try{
    const url=new URL(value,baseUrl);
    if(url.protocol!=="https:")return null;
    const allowed=url.hostname==="machine-image.p-world.co.jp"||url.hostname==="idn.p-world.co.jp"&&/^\/machines\/\d+\/image\//.test(url.pathname);
    if(!allowed)return null;
    url.search="";
    return url.toString();
  }catch{return null}
}

export function visualGuideAssetId(sourceImageUrl:string){return createHash("sha256").update(sourceImageUrl).digest("hex").slice(0,20)}

function extension(contentType:string|null,sourceImageUrl:string){
  if(contentType?.includes("png"))return"png";
  if(contentType?.includes("webp"))return"webp";
  const match=new URL(sourceImageUrl).pathname.match(/\.([a-z0-9]+)$/i);
  return match?.[1]?.toLowerCase()==="png"?"png":match?.[1]?.toLowerCase()==="webp"?"webp":"jpg";
}

export function visualGuideObjectPath(catalogId:string,image:Pick<MachineGuideImage,"id"|"sourceImageUrl"|"contentType">){return`${catalogId}/${image.id}.${extension(image.contentType,image.sourceImageUrl)}`}

const captions:Partial<Record<MachineGuideSectionKey,string>>={
  features:"機台外觀與基本特色",
  play:"基本打法圖解",
  flow:"通常時遊戲流程",
  cz:"CZ 畫面與流程",
  at_art:"AT／ART 畫面與流程",
  bonus:"Bonus 畫面與流程",
  ceiling:"天井與遊戲區間參考",
  setting_rates:"設定差資料圖解",
  payout:"配當與機械割參考",
  small_roles:"小役與圖柄參考",
  special_events:"特殊演出與設定示唆",
};

export function visualGuideCaption(sectionKey:MachineGuideSectionKey,altJa:string,officialNameJa:string){
  const cleaned=altJa.normalize("NFKC").replace(officialNameJa.normalize("NFKC"),"").replace(/かんたん初打講座|について|演出法則/g," ").replace(/\s+/g," ").trim();
  const replacements:Array<[RegExp,string]>=[
    [/通常時のゲーム性/g,"通常時玩法"],[/ゲームフロー/g,"遊戲流程"],[/通常時の打ち方/g,"通常時打法"],[/打ち方/g,"打法"],
    [/ボーナス/g,"Bonus"],[/終了画面/g,"終了畫面"],[/設定示唆/g,"設定示唆"],[/リール配列/g,"轉輪排列"],[/配当表/g,"配當表"],
  ];
  const translated=replacements.reduce((value,[pattern,replacement])=>value.replace(pattern,replacement),cleaned).trim();
  return translated||captions[sectionKey]||"機台畫面參考";
}

export function visualGuideAssetUrl(catalogId:string,sourceImageUrl:string){return`/api/machine-guide-assets/${encodeURIComponent(catalogId)}?source=${encodeURIComponent(sourceImageUrl)}`}
