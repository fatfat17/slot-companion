export type ProfileBuilderPresentation=
  | {available:true;href:string;label:string}
  | {available:false;notice:"Profile Lab 雲端建立功能準備中"};

export function getProfileBuilderPresentation(options:{catalogId:string;hasProfile:boolean;hasDraft:boolean;environment:"development"|"production"|"test"}):ProfileBuilderPresentation{
  if(options.environment!=="development")return{available:false,notice:"Profile Lab 雲端建立功能準備中"};
  const label=options.hasProfile?"重建／升級攻略 Profile":options.hasDraft?"繼續編輯 Profile Draft":"建立攻略 Profile";
  return{available:true,href:`/admin/profile-builder/${encodeURIComponent(options.catalogId)}`,label};
}
