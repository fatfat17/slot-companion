import "server-only";

export const AI_CONFIG = {
  provider: process.env.AI_IDENTIFICATION_PROVIDER === "mock" ? "mock" : "openai",
  openAIModel: process.env.OPENAI_MACHINE_IDENTIFICATION_MODEL || "gpt-5.4-mini",
  maxImageBytes: 8 * 1024 * 1024,
} as const;
