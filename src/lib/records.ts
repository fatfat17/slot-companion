import type { Session } from "../types/index.ts";
export type RecordRange="today"|"7days"|"all";
export const RECORD_RANGE_OPTIONS=[{value:"today" as const,label:"今天"},{value:"7days" as const,label:"近 7 天"},{value:"all" as const,label:"全部"}];
function startOfToday(now:Date){const value=new Date(now);value.setHours(0,0,0,0);return value.getTime()}
export function sessionsInRange(sessions:Session[],range:RecordRange,now=new Date()){
  const from=range==="today"?startOfToday(now):range==="7days"?startOfToday(new Date(now.getTime()-6*86400000)):Number.NEGATIVE_INFINITY;
  return[...sessions].filter(session=>new Date(session.startedAt).getTime()>=from).sort((a,b)=>b.startedAt.localeCompare(a.startedAt));
}
export function observedGame(session:Session){return session.metrics?.observedTotalGame??session.actualG??0}
export function recordSummary(sessions:Session[]){return{sessions:sessions.length,active:sessions.filter(item=>item.status==="active").length,totalGame:sessions.reduce((sum,item)=>sum+observedGame(item),0),investment:sessions.reduce((sum,item)=>sum+item.investmentYen,0),medals:sessions.reduce((sum,item)=>sum+item.medals,0)}}
