import type { Session } from "@/types";

const KEY = "slot-companion-sessions-v1";

export function loadSessions(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(KEY);
    return value ? (JSON.parse(value) as Session[]) : [];
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
