import type { CounterDefinition, GameState, Machine } from "@/types";
import type { SessionCapability } from "@/types/machineGuide";

export type SessionStateControl={value:GameState;label:string;ja:string};
export type SessionUiModel={legacy:boolean;capabilities:SessionCapability[];actionCapabilities:SessionCapability[];counterDefinitions:CounterDefinition[];gameStates:SessionStateControl[]};
const LEGACY_STATES:SessionStateControl[]=[{value:"normal",label:"通常",ja:"通常"},{value:"prelude",label:"前兆",ja:"前兆"},{value:"cz",label:"CZ",ja:"チャンスゾーン"},{value:"at",label:"AT",ja:"AT"},{value:"special",label:"特殊",ja:"特殊"}];
const STATE_LABELS:Record<GameState,[string,string]>={normal:["通常","通常"],prelude:["前兆","前兆"],cz:["CZ","チャンスゾーン"],at:["AT","AT"],art:["ART","ART"],bonus:["Bonus","ボーナス"],special:["特殊","特殊"],other:["其他","その他"]};
function usableCounter(counter:CounterDefinition){return counter.type!=="choice"||Boolean(counter.choices?.length)}
export function buildSessionUiModel(machine:Machine):SessionUiModel{const snapshot=machine.profile.sessionCapabilities;if(!snapshot)return{legacy:true,capabilities:[],actionCapabilities:[],counterDefinitions:machine.profile.smartCounters.filter(usableCounter),gameStates:LEGACY_STATES};
  const capabilities=snapshot.filter(capability=>capability.status==="operational"),byObservation=new Map(capabilities.map(capability=>[capability.observationKey,capability])),counterDefinitions=machine.profile.smartCounters.filter(counter=>usableCounter(counter)&&Boolean(byObservation.get(counter.key))),actionCapabilities=capabilities.filter(capability=>capability.controlType==="event"&&!capability.eventId&&(capability.moduleKind==="named_cz"||capability.moduleKind==="at"));
  const stateValues=new Set<GameState>(["normal"]);for(const capability of capabilities)if(capability.stateEffect)stateValues.add(capability.stateEffect);const gameStates=[...stateValues].map(value=>{const guideState=machine.profile.guideStates?.find(state=>(state.type==="chance_zone"?"cz":state.type)===value),fallback=STATE_LABELS[value];return{value,label:guideState?.displayNameZh??fallback[0],ja:guideState?.originalNameJa??fallback[1]}});
  return{legacy:false,capabilities,actionCapabilities,counterDefinitions,gameStates};
}

export function capabilityForCounter(model:SessionUiModel,key:string){return model.capabilities.find(capability=>capability.observationKey===key)}
