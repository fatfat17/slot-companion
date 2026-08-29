export type CatalogImporterPresentation=
  | {available:true;href:"/admin/catalog-import";label:"更新機種資料庫"}
  | {available:false;label:"更新機種資料庫";notice:"目前僅能在本機管理環境執行"};

export function getCatalogImporterPresentation(environment:"development"|"production"|"test"):CatalogImporterPresentation{
  return environment==="development"
    ?{available:true,href:"/admin/catalog-import",label:"更新機種資料庫"}
    :{available:false,label:"更新機種資料庫",notice:"目前僅能在本機管理環境執行"};
}
