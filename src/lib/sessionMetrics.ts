import type { Machine, Session } from "@/types";

function guideUsesSharedPrimaryGame(machine:Machine){
  return Boolean(machine.guideStatus&&machine.profile.gameTrackers.filter(item=>item.primary).length<=1);
}

export function sessionMetricValue(session:Session,machine:Machine,key:string){
  if(key==="observedNormalGame"&&guideUsesSharedPrimaryGame(machine)){
    return Math.max(session.metrics.observedNormalGame??0,session.metrics.observedTotalGame??0);
  }
  const definition=machine.profile.measurementMetrics.find(item=>item.key===key);
  if(!definition)return session.metrics[key]??0;
  const source=definition.source;
  if(source.type==="trackerDelta"){
    const baseline=session.trackerBaselines[source.trackerKey];
    return baseline===undefined?0:Math.max(0,(session.trackers[source.trackerKey]??0)-baseline);
  }
  if(source.type==="custom")return session.metrics[source.sessionMetricKey]??0;
  return session.metrics[source.type]??0;
}

export function accumulatePrimaryGameMetrics(session:Session,machine:Machine,delta:number){
  const metrics={...session.metrics};
  if(delta<=0)return metrics;
  metrics.observedTotalGame=(metrics.observedTotalGame??0)+delta;
  if(guideUsesSharedPrimaryGame(machine)){
    metrics.observedNormalGame=metrics.observedTotalGame;
  }else if(session.gameState==="normal"){
    metrics.observedNormalGame=(metrics.observedNormalGame??0)+delta;
  }
  return metrics;
}
