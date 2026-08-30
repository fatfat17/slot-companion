import { AI_CONFIG } from "@/lib/ai/config";
import { sanitizeSessionSceneContext } from "@/lib/ai/scene";
import { identifySessionScene } from "@/lib/ai/scene.server";
import { AIProviderError } from "@/lib/ai/types";

export const runtime="nodejs";
export async function POST(request:Request){try{
  const contentLength=Number(request.headers.get("content-length")??0);if(contentLength>AI_CONFIG.maxRequestBytes)return Response.json({error:{code:"request_too_large",message:"上傳內容過大，請重新拍攝。"}},{status:413});
  let form:FormData;try{form=await request.formData()}catch{return Response.json({error:{code:"invalid_request",message:"請先選擇一張遊戲畫面。"}},{status:400})}
  const image=form.get("image"),contextValue=form.get("context");if(!(image instanceof File))return Response.json({error:{code:"missing_image",message:"請先選擇一張遊戲畫面。"}},{status:400});
  if(!image.type.startsWith("image/"))return Response.json({error:{code:"invalid_image",message:"只能使用圖片檔案。"}},{status:415});if(image.size>=AI_CONFIG.maxImageBytes)return Response.json({error:{code:"image_too_large",message:"壓縮後圖片仍過大，請重新拍攝。"}},{status:413});
  let rawContext:unknown;try{rawContext=JSON.parse(typeof contextValue==="string"?contextValue:"")}catch{return Response.json({error:{code:"invalid_context",message:"目前 Session 資料不完整，請重新開啟後再試。"}},{status:400})}
  const context=sanitizeSessionSceneContext(rawContext);if(!context)return Response.json({error:{code:"invalid_context",message:"目前沒有可供比對的記錄按鈕。"}},{status:400});
  const bytes=Buffer.from(await image.arrayBuffer()),dataUrl=`data:${image.type};base64,${bytes.toString("base64")}`;return Response.json(await identifySessionScene(dataUrl,context));
}catch(error){if(error instanceof AIProviderError)return Response.json({error:{code:error.code,message:error.message}},{status:error.status});if(error instanceof DOMException&&error.name==="AbortError")return Response.json({error:{code:"cancelled",message:"已取消畫面辨識。"}},{status:499});return Response.json({error:{code:"request_failed",message:"畫面辨識發生錯誤，請稍後再試。"}},{status:500})}}
