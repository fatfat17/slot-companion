import "server-only";
import { AI_CONFIG } from "./config";
import { companionDeveloperPrompt,type SessionCompanionContext,type SessionCompanionMessage,type SessionCompanionMode } from "./companion";
import { AIProviderError } from "./types";

export async function askSessionCompanion(question:string,context:SessionCompanionContext,options:{mode?:SessionCompanionMode;history?:SessionCompanionMessage[];imageDataUrl?:string}={},request:typeof fetch=fetch){
  const apiKey=process.env.OPENAI_API_KEY;if(!apiKey)throw new AIProviderError("missing_api_key","尚未設定 OPENAI_API_KEY，AI 陪玩目前無法使用。",503);
  const history=(options.history??[]).map(message=>({role:message.role,content:[{type:"input_text" as const,text:message.text}]}));
  const userContent:Array<{type:"input_text";text:string}|{type:"input_image";image_url:string;detail:"high"}>=[{type:"input_text",text:JSON.stringify({question,context})}];
  if(options.imageDataUrl)userContent.push({type:"input_image",image_url:options.imageDataUrl,detail:"high"});
  let response:Response;try{response=await request("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model:AI_CONFIG.openAICompanionModel,store:false,instructions:companionDeveloperPrompt(options.mode),input:[...history,{role:"user",content:userContent}],max_output_tokens:600})})}catch{throw new AIProviderError("request_failed","AI 陪玩暫時無法連線，請稍後再試。",502)}
  if(!response.ok)throw new AIProviderError("request_failed",`AI 陪玩暫時無法使用（${response.status}）。`,502);
  const payload=await response.json() as {output_text?:string;output?:Array<{content?:Array<{type?:string;text?:string}>}>};const answer=payload.output_text??payload.output?.flatMap(item=>item.content??[]).find(item=>item.type==="output_text")?.text;
  if(!answer?.trim())throw new AIProviderError("invalid_response","AI 沒有回傳可用答案。",502);return answer.trim();
}
