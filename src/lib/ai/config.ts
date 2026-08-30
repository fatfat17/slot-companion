import "server-only";
import { IMAGE_COMPRESSION } from "@/lib/ai/imageLimits";

export const AI_CONFIG = {
  provider: process.env.AI_IDENTIFICATION_PROVIDER === "mock" ? "mock" : "openai",
  openAIModel: process.env.OPENAI_MACHINE_IDENTIFICATION_MODEL || "gpt-5.4-mini",
  openAIGuideModel: process.env.OPENAI_MACHINE_GUIDE_MODEL || process.env.OPENAI_MACHINE_IDENTIFICATION_MODEL || "gpt-5.4-mini",
  openAICompanionModel: process.env.OPENAI_SESSION_COMPANION_MODEL || process.env.OPENAI_MACHINE_GUIDE_MODEL || process.env.OPENAI_MACHINE_IDENTIFICATION_MODEL || "gpt-5.4-mini",
  openAISceneModel: process.env.OPENAI_SESSION_SCENE_MODEL || process.env.OPENAI_SESSION_COMPANION_MODEL || process.env.OPENAI_MACHINE_GUIDE_MODEL || process.env.OPENAI_MACHINE_IDENTIFICATION_MODEL || "gpt-5.4-mini",
  maxImageBytes: IMAGE_COMPRESSION.hardMaxBytes,
  maxRequestBytes: IMAGE_COMPRESSION.maxRequestBytes,
} as const;
