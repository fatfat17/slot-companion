import type { CounterDefinition, Machine } from "@/types";
import type { ControlManifestItem, SessionCapability } from "@/types/machineGuide";

export const CUSTOM_RECORDS_KEY="slot-companion-custom-records-v1";
export type CustomRecordDefinition={id:string;machineId:string;name:string;type:"counter"|"choice";choices:string[];quick:boolean};

export function validateCustomRecord(definition:Pick<CustomRecordDefinition,"name"|"type"|"choices">){
  if(!definition.name.trim())return "請輸入記錄名稱";
  if(definition.type==="choice"&&definition.choices.length<2)return "Choice 至少需要兩個選項";
  return null;
}

function readAll():CustomRecordDefinition[]{if(typeof window==="undefined")return[];try{return JSON.parse(window.localStorage.getItem(CUSTOM_RECORDS_KEY)??"[]") as CustomRecordDefinition[]}catch{return[]}}
function writeAll(items:CustomRecordDefinition[]){if(typeof window==="undefined")return false;try{window.localStorage.setItem(CUSTOM_RECORDS_KEY,JSON.stringify(items));return true}catch{return false}}
export function loadCustomRecords(machineId:string){return readAll().filter(item=>item.machineId===machineId)}
export function saveCustomRecord(definition:CustomRecordDefinition){return writeAll([...readAll().filter(item=>item.id!==definition.id),definition])}
export function deleteCustomRecord(machineId:string,id:string){return writeAll(readAll().filter(item=>item.machineId!==machineId||item.id!==id))}

export function replaceCustomRecord(machine:Machine,definition:CustomRecordDefinition):Machine{
  const key=`custom:${definition.id}`,copy=structuredClone(machine);
  copy.profile.smartCounters=copy.profile.smartCounters.filter(item=>item.key!==key);
  copy.profile.sessionCapabilities=copy.profile.sessionCapabilities?.filter(item=>item.observationKey!==key);
  copy.profile.controlManifest=copy.profile.controlManifest?.filter(item=>item.observationKey!==key);
  return withCustomRecords(copy,[definition]);
}

export function withCustomRecords(machine:Machine,definitions:CustomRecordDefinition[]):Machine{
  if(!definitions.length)return machine;const copy=structuredClone(machine),manifest=copy.profile.controlManifest??[];
  for(const definition of definitions){const key=`custom:${definition.id}`;if(copy.profile.sessionCapabilities?.some(item=>item.observationKey===key))continue;const choices=definition.type==="choice"?definition.choices.map((label,index)=>({value:`custom:${definition.id}:${index}`,labelZh:label,labelJa:label})):undefined;
    const counter:CounterDefinition={id:key,machineId:copy.id,key,labelZh:definition.name,labelJa:definition.name,icon:"✦",description:"使用者自訂記錄",recognition:`看到「${definition.name}」時`,reason:"依自己的遊玩需求記錄。",type:definition.type==="choice"?"choice":"event",...(choices?.length?{choices}:{})};
    const capability:SessionCapability={moduleId:`custom:${definition.id}`,moduleKind:"custom_event",controlType:definition.type==="choice"?"choice":"event",labelZh:definition.name,labelJa:definition.name,observationKey:key,writeTarget:{type:"counter",key},stateEffect:null,status:"operational",reason:null,estimatorUsable:false,choicesRequired:definition.type==="choice",choicesAvailable:definition.type==="counter"||Boolean(choices?.length),numeratorDependency:null,denominatorDependency:null,eventId:key,playerWhen:counter.recognition,sourceEvidence:["使用者自訂"],controlEvidence:[],evidenceGate:"not_applicable",quickPriority:definition.quick?35:90,manifestControlType:definition.type==="choice"?"choice":"counter"};
    const item:ControlManifestItem={id:`control:${key}`,label:definition.name,eventType:"custom",controlType:definition.type==="choice"?"choice":"counter",playerWhen:counter.recognition,observationKey:key,stateEffect:null,estimatorUsable:false,numerator:null,denominator:null,sourceEvidence:["使用者自訂"],controlEvidence:[],evidenceGate:"not_applicable",availability:"operational",unavailableReason:null,quickPriority:definition.quick?35:90,moduleKind:"custom_event",eventId:key,...(choices?{choices}:{})};
    copy.profile.smartCounters.push(counter);copy.profile.sessionCapabilities=[...(copy.profile.sessionCapabilities??[]),capability];manifest.push(item)
  }
  copy.profile.controlManifest=manifest;return copy
}
