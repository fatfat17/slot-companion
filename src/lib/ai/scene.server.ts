import "server-only";
import { AI_CONFIG } from "./config";
import { sanitizeSessionSceneResult,type SessionSceneContext,type SessionSceneResult } from "./scene";
import { AIProviderError } from "./types";

const sceneSchema={type:"object",additionalProperties:false,required:["status","summaryZh","visibleText","candidates"],properties:{status:{type:"string",enum:["matched","uncertain","unknown"]},summaryZh:{type:"string"},visibleText:{type:"array",maxItems:8,items:{type:"string"}},candidates:{type:"array",maxItems:3,items:{type:"object",additionalProperties:false,required:["controlId","confidence","reason"],properties:{controlId:{type:"string"},confidence:{type:"string",enum:["high","medium","low"]},reason:{type:"string"}}}}}};
function prompt(context:SessionSceneContext){return `你是 Slot Companion 的遊戲畫面辨識器。只判斷照片是否明確對應下列這個 Session 已允許操作的控制項。不得創造控制項、機率、設定或玩法。只有看到清楚的正式模式／事件名稱，或足以唯一辨認的畫面證據，才能回 matched；只有角色、動畫、模糊文字、通用 BONUS/GOD 字樣或不唯一的視覺時回 uncertain 或 unknown。照片未顯示廠商或機種名稱不是衝突，但不可把其他機台畫面硬配。candidates.controlId 只能逐字使用 CONTEXT controls 中的 id。用繁體中文簡短說明。CONTEXT:\n${JSON.stringify(context)}`}
export async function identifySessionScene(dataUrl:string,context:SessionSceneContext,request:typeof fetch=fetch):Promise<SessionSceneResult>{
  const apiKey=process.env.OPENAI_API_KEY;if(!apiKey)throw new AIProviderError("missing_api_key","尚未設定 OPENAI_API_KEY，畫面辨識目前無法使用。",503);
  let response:Response;try{response=await request("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model:AI_CONFIG.openAISceneModel,store:false,input:[{role:"user",content:[{type:"input_text",text:prompt(context)},{type:"input_image",image_url:dataUrl,detail:"high"}]}],text:{format:{type:"json_schema",name:"session_scene_identification",strict:true,schema:sceneSchema}},max_output_tokens:500})})}catch{throw new AIProviderError("request_failed","畫面辨識暫時無法連線，請稍後再試。",502)}
  if(!response.ok)throw new AIProviderError("request_failed",`畫面辨識失敗（${response.status}），請稍後再試。`,502);
  const payload=await response.json() as {output?:Array<{content?:Array<{type?:string;text?:string}>}>},output=payload.output?.flatMap(item=>item.content??[]).find(item=>item.type==="output_text")?.text;
  if(!output)throw new AIProviderError("invalid_response","AI 未回傳可用的畫面辨識結果。",502);
  try{return sanitizeSessionSceneResult(JSON.parse(output),context)}catch{throw new AIProviderError("invalid_response","AI 畫面辨識格式無法解析。",502)}
}
