export type CounterDefinition = {
  id: string;
  machineId: string;
  key: string;
  labelZh: string;
  labelJa: string;
  icon: string;
  description: string;
  recognition: string;
  reason: string;
};

export type Machine = {
  id: string;
  nameZh: string;
  nameJa: string;
  manufacturer: string;
  category: string;
  journey: string[];
  watchPoints: string[];
  milestones: string[];
  funPoints: string[];
  pitfalls: string[];
  counters: CounterDefinition[];
  playGuide: string;
  accent: string;
};

export type SessionCounter = { sessionId: string; counterKey: string; count: number };

export type SessionEvent = {
  id: string;
  sessionId: string;
  createdAt: string;
  type: "start" | "game" | "investment" | "medals" | "cz" | "at" | "special" | "counter" | "end";
  label: string;
  value?: number;
  note?: string;
};

export type Session = {
  id: string;
  machineId: string;
  machineNumber: string;
  startedAt: string;
  endedAt?: string;
  startG: number;
  actualG: number;
  displayG: number;
  investmentYen: number;
  medals: number;
  czCount: number;
  atCount: number;
  status: "active" | "completed";
  counters: Record<string, number>;
  events: SessionEvent[];
};

export type HunterForm = {
  machineId: string;
  currentG: number;
  sinceCz: number;
  sinceAt: number;
  budgetYen: number;
  leaveAt: string;
};
