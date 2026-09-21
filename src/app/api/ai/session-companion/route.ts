import { AI_CONFIG } from "@/lib/ai/config";
import { askSessionCompanion } from "@/lib/ai/companion.server";
import { sanitizeCompanionContext,sanitizeCompanionHistory,sanitizeCompanionMode,sanitizeCompanionQuestion } from "@/lib/ai/companion";
import { AIProviderError } from "@/lib/ai/types";
export const runtime="nodejs";

export async function POST(request:Request){try{
  const contentLength=Number(request.headers.get("content-length")??0);if(contentLength>AI_CONFIG.maxRequestBytes)return Response.json({error:{code:"request_too_large",message:"上傳內容過大，請重新拍攝。"}},{status:413});
  let questionValue:unknown,contextValue:unknown,historyValue:unknown,modeValue:unknown,imageDataUrl:string|undefined;
  if(request.headers.get("content-type")?.includes("multipart/form-data")){
    let form:FormData;try{form=await request.formData()}catch{return Response.json({error:{code:"invalid_request",message:"無法讀取這次提問。"}},{status:400})}
    questionValue=form.get("question");modeValue=form.get("mode");
    try{contextValue=JSON.parse(String(form.get("context")??""));historyValue=JSON.parse(String(form.get("history")??"[]"))}catch{return Response.json({error:{code:"invalid_context",message:"目前 Session 資料不完整，請重新開啟後再試。"}},{status:400})}
    const image=form.get("image");if(image instanceof File){if(!image.type.startsWith("image/"))return Response.json({error:{code:"invalid_image",message:"只能使用圖片檔案。"}},{status:415});if(image.size>=AI_CONFIG.maxImageBytes)return Response.json({error:{code:"image_too_large",message:"壓縮後圖片仍過大，請重新拍攝。"}},{status:413});const bytes=Buffer.from(await image.arrayBuffer());imageDataUrl=`data:${image.type};base64,${bytes.toString("base64")}`}
  }else{
    let payload:unknown;try{payload=await request.json()}catch{return Response.json({error:{code:"invalid_request",message:"請輸入想問的問題。"}},{status:400})}
    const input=payload as {question?:unknown;context?:unknown;history?:unknown;mode?:unknown};questionValue=input.question;contextValue=input.context;historyValue=input.history;modeValue=input.mode;
  }
  const question=sanitizeCompanionQuestion(questionValue),context=sanitizeCompanionContext(contextValue),history=sanitizeCompanionHistory(historyValue),mode=sanitizeCompanionMode(modeValue);
  if(!question)return Response.json({error:{code:"invalid_question",message:"請輸入想問的問題。"}},{status:400});if(!context)return Response.json({error:{code:"invalid_context",message:"目前 Session 資料不完整，請重新開啟後再試。"}},{status:400});
  return Response.json({answer:await askSessionCompanion(question,context,{mode,history,imageDataUrl})});
}catch(error){if(error instanceof AIProviderError)return Response.json({error:{code:error.code,message:error.message}},{status:error.status});return Response.json({error:{code:"request_failed",message:"AI 陪玩發生錯誤，請稍後再試。"}},{status:500})}}
