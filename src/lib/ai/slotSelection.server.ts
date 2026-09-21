import "server-only";
import { AI_CONFIG } from "./config";
import { slotSelectionPrompt,type SlotSelectionMode,type SlotSelectionResolvedCandidate } from "./slotSelection";
import { AIProviderError } from "./types";

type CandidatePhoto={candidateIndex:number;dataUrl:string};

export async function askSlotSelectionAssistant(mode:SlotSelectionMode,candidates:SlotSelectionResolvedCandidate[],question:string,photos:CandidatePhoto[],request:typeof fetch=fetch){
  const apiKey=process.env.OPENAI_API_KEY;if(!apiKey)throw new AIProviderError("missing_api_key","尚未設定 OPENAI_API_KEY，AI 選台助手目前無法使用。",503);
  const content:Array<{type:"input_text";text:string}|{type:"input_image";image_url:string;detail:"high"}>=[{type:"input_text",text:JSON.stringify({mode,question,candidates})}];
  for(const photo of photos){content.push({type:"input_text",text:`以下照片屬於候選 ${photo.candidateIndex+1}：${candidates[photo.candidateIndex]?.catalog.displayNameZh||candidates[photo.candidateIndex]?.catalog.officialNameJa||"未知候選"}`});content.push({type:"input_image",image_url:photo.dataUrl,detail:"high"})}
  let response:Response;try{response=await request("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model:AI_CONFIG.openAISelectionModel,store:false,instructions:slotSelectionPrompt(mode),input:[{role:"user",content}],max_output_tokens:900})})}catch{throw new AIProviderError("request_failed","AI 選台助手暫時無法連線，請稍後再試。",502)}
  if(!response.ok)throw new AIProviderError("request_failed",`AI 選台助手暫時無法使用（${response.status}）。`,502);
  const payload=await response.json() as{output_text?:string;output?:Array<{content?:Array<{type?:string;text?:string}>}>},answer=payload.output_text??payload.output?.flatMap(item=>item.content??[]).find(item=>item.type==="output_text")?.text;
  if(!answer?.trim())throw new AIProviderError("invalid_response","AI 沒有回傳可用的選台分析。",502);return answer.trim();
}
