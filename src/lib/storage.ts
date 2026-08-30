import type { Session } from "@/types";

const KEY = "slot-companion-sessions-v1";

export function loadSessions(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(KEY);
    const sessions = value ? (JSON.parse(value) as Array<Partial<Session> & Pick<Session, "id" | "machineId">>) : [];
    return sessions.map((session) => {
      const trackers=session.trackers ?? { dataGame: session.actualG ?? 0, lcdGame: session.displayG ?? 0 };
      return ({
      machineNumber: "未填", startedAt: new Date().toISOString(), startG: 0, actualG: 0,
      displayG: 0, investmentYen: 0, medals: 0, czCount: 0, atCount: 0,
      status: "active", counters: {}, events: [], ...session, gameState: session.gameState ?? "normal",
      trackers,
      trackerBaselines: session.trackerBaselines ?? {...trackers},
      metrics: session.metrics ?? { observedTotalGame: 0, observedNormalGame: 0 },
      trials: session.trials ?? {},
      mode: session.mode ?? "quick",
    } as Session)});
  } catch {
    return [];
  }
}

export function saveSession(session: Session): boolean {
  try {
    const sessions = loadSessions();
    const index = sessions.findIndex((item) => item.id === session.id);
    if (index >= 0) sessions[index] = session;
    else sessions.unshift(session);
    window.localStorage.setItem(KEY, JSON.stringify(sessions));
    return true;
  } catch {
    return false;
  }
}

export function findActiveSession(): Session | undefined {
  return loadSessions().find((session) => session.status === "active");
}

export function completeActiveSessions(): boolean {
  try {
    const now = new Date().toISOString();
    const sessions = loadSessions().map((session) => session.status === "active" ? {
      ...session, status: "completed" as const, endedAt: now,
      events: [{ id: crypto.randomUUID(), sessionId: session.id, createdAt: now, type: "end" as const, label: "換台並結束 Session" }, ...session.events],
    } : session);
    window.localStorage.setItem(KEY, JSON.stringify(sessions));
    return true;
  } catch { return false; }
}
