import type { MachineIdentificationResult } from "@/types";

export type IdentificationImage = { dataUrl: string; fileName: string; mimeType: string };
export interface AIProvider { readonly name: "openai" | "mock"; identifyMachine(image: IdentificationImage): Promise<MachineIdentificationResult>; }
export class AIProviderError extends Error { code:string;status:number;constructor(code:string,message:string,status=500){super(message);this.name="AIProviderError";this.code=code;this.status=status} }
