import type { CompressedImage } from "./imageCompression";
import type { SessionSceneContext,SessionSceneResult } from "./scene";

export async function requestSessionScene(image:CompressedImage,context:SessionSceneContext,signal?:AbortSignal):Promise<SessionSceneResult>{
  const form=new FormData();form.set("image",image.file);form.set("context",JSON.stringify(context));
  const response=await fetch("/api/ai/session-scene",{method:"POST",body:form,signal}),payload=await response.json();
  if(!response.ok)throw new Error(payload.error?.message??"畫面辨識失敗");
  return payload as SessionSceneResult;
}
