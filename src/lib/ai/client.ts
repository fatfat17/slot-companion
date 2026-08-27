import type { MachineIdentificationResult } from "@/types";

export class IdentificationRequestError extends Error{constructor(public code:string,message:string){super(message)}}
export async function identifyMachine(image:File,signal?:AbortSignal):Promise<MachineIdentificationResult>{const body=new FormData();body.set("image",image);const response=await fetch("/api/ai/identify-machine",{method:"POST",body,signal});const payload=await response.json().catch(()=>({}));if(!response.ok){const error=(payload as {error?:{code?:string;message?:string}}).error;throw new IdentificationRequestError(error?.code??"request_failed",error?.message??"辨識失敗，請稍後再試。")}return payload as MachineIdentificationResult}
