import type { CounterDefinition, GameState, SettingValues } from "@/types";
import type { DenominatorCapability, EstimatorObservationContract, GuideDenominator, MachineGuideEvent, MachineGuideSessionModule, SessionCapability, SessionModuleKind } from "@/types/machineGuide";

type ContractTemplate={controlType:SessionCapability["controlType"];observationKey:string;writeTarget:SessionCapability["writeTarget"];stateEffect:GameState|null;defaultStatus:SessionCapability["status"];reason:string|null;estimatorUsable:boolean;choicesRequired:boolean};

export const SESSION_MODULE_CONTRACTS = {
  total_games:{controlType:"tracker",observationKey:"observedTotalGame",writeTarget:{type:"metric",key:"observedTotalGame"},stateEffect:null,defaultStatus:"operational",reason:null,estimatorUsable:true,choicesRequired:false},
  normal_games:{controlType:"tracker",observationKey:"observedNormalGame",writeTarget:{type:"metric",key:"observedNormalGame"},stateEffect:"normal",defaultStatus:"operational",reason:null,estimatorUsable:true,choicesRequired:false},
  big_reg_bonus:{controlType:"event",observationKey:"bonus",writeTarget:{type:"derived",key:"bonusTotal"},stateEffect:"bonus",defaultStatus:"read_only",reason:"只有具名 Bonus 事件可直接記錄；合計由 BIG／REG／其他 Bonus 推導。",estimatorUsable:false,choicesRequired:false},
  named_cz:{controlType:"event",observationKey:"cz",writeTarget:{type:"counter",key:"cz"},stateEffect:"cz",defaultStatus:"operational",reason:null,estimatorUsable:true,choicesRequired:false},
  at:{controlType:"event",observationKey:"at",writeTarget:{type:"counter",key:"at"},stateEffect:"at",defaultStatus:"operational",reason:null,estimatorUsable:true,choicesRequired:false},
  art:{controlType:"event",observationKey:"art",writeTarget:{type:"counter",key:"art"},stateEffect:"art",defaultStatus:"read_only",reason:"需要具名 ART event counter。",estimatorUsable:false,choicesRequired:false},
  set:{controlType:"event",observationKey:"set",writeTarget:{type:"counter",key:"set"},stateEffect:null,defaultStatus:"read_only",reason:"Adaptive Session UI 尚未提供 Set 操作。",estimatorUsable:false,choicesRequired:false},
  cycle:{controlType:"event",observationKey:"cycleArrivals",writeTarget:{type:"counter",key:"cycleArrivals"},stateEffect:null,defaultStatus:"read_only",reason:"Adaptive Session UI 尚未提供週期到達操作。",estimatorUsable:false,choicesRequired:false},
  points:{controlType:"event",observationKey:"pointArrivals",writeTarget:{type:"counter",key:"pointArrivals"},stateEffect:null,defaultStatus:"read_only",reason:"Adaptive Session UI 尚未提供點數到達操作。",estimatorUsable:false,choicesRequired:false},
  cz_failures:{controlType:"relationship",observationKey:"czFailures",writeTarget:{type:"relationship",key:"czTrials"},stateEffect:null,defaultStatus:"read_only",reason:"尚未提供 CZ trial/outcome 操作。",estimatorUsable:false,choicesRequired:false},
  dual_games:{controlType:"tracker",observationKey:"dualGames",writeTarget:{type:"metric",key:"trackerDelta"},stateEffect:null,defaultStatus:"read_only",reason:"Guide snapshot 尚未提供兩個獨立 tracker control。",estimatorUsable:false,choicesRequired:false},
  role_streak:{controlType:"event",observationKey:"roleStreak",writeTarget:{type:"counter",key:"roleStreak"},stateEffect:null,defaultStatus:"read_only",reason:"Adaptive Session UI 尚未提供連續次數操作。",estimatorUsable:false,choicesRequired:false},
  end_evidence:{controlType:"choice",observationKey:"endEvidence",writeTarget:{type:"counter",key:"endEvidence"},stateEffect:null,defaultStatus:"unavailable",reason:"來源沒有可靠且可選擇的示唆表。",estimatorUsable:false,choicesRequired:true},
  custom_event:{controlType:"none",observationKey:"customEvent",writeTarget:{type:"counter",key:"customEvent"},stateEffect:null,defaultStatus:"unavailable",reason:"來源未定義可觀察的自訂事件。",estimatorUsable:false,choicesRequired:false},
} satisfies Record<SessionModuleKind,ContractTemplate>;

export function assertSessionModuleKindMapped(kind:string):asserts kind is SessionModuleKind{if(!(kind in SESSION_MODULE_CONTRACTS))throw new Error(`Unmapped SessionModuleKind: ${kind}`)}

export function buildSessionCapabilities(modules:MachineGuideSessionModule[],counters:CounterDefinition[],events:MachineGuideEvent[]=[]):SessionCapability[]{
  const counterByKey=new Map(counters.map(counter=>[counter.key,counter]));
  return modules.map(module=>{assertSessionModuleKindMapped(module.kind);const base=SESSION_MODULE_CONTRACTS[module.kind],eventCounter=module.eventId?counterByKey.get(module.eventId):undefined;
    const guideEvent=events.find(event=>event.id===module.eventId),controlEvidence=guideEvent?.controlEvidence??[],gatePassed=controlEvidence.some(item=>item.sufficient);
    let status=base.defaultStatus,reason=base.reason,estimatorUsable=base.estimatorUsable;const observationKey=module.eventId??base.observationKey,writeTarget=module.eventId?{type:"counter" as const,key:module.eventId}:base.writeTarget;
    if(module.eventId&&eventCounter&&gatePassed){status="operational";reason=null;estimatorUsable=eventCounter.type!=="photo";}
    else if(module.eventId&&eventCounter&&!gatePassed){status="read_only";reason="缺少可追溯的事件名稱與記錄時機證據。";estimatorUsable=false;}
    if(module.kind==="end_evidence"){const choice=counters.find(counter=>counter.type==="choice"&&counter.key===module.eventId);const available=Boolean(choice?.choices?.length);status=available?"operational":"unavailable";reason=available?null:"來源沒有可靠且可選擇的示唆表。";estimatorUsable=available;}
    const counter=counterByKey.get(observationKey),quickPriority=module.kind==="named_cz"?10:module.kind==="at"||module.kind==="art"?20:module.kind==="big_reg_bonus"?30:module.kind==="end_evidence"?40:80;
    return{moduleId:module.id,moduleKind:module.kind,controlType:base.controlType,labelZh:module.labelZh,labelJa:module.labelJa,observationKey,writeTarget,stateEffect:base.stateEffect,status,reason,estimatorUsable,choicesRequired:base.choicesRequired,choicesAvailable:!base.choicesRequired||status==="operational",numeratorDependency:status==="operational"?(module.eventId??observationKey):null,denominatorDependency:null,playerWhen:counter?.recognition??`機台明確顯示「${module.labelZh}」時`,sourceEvidence:controlEvidence.map(item=>item.id),controlEvidence,evidenceGate:module.kind==="total_games"||module.kind==="normal_games"?"not_applicable":gatePassed?"passed":"blocked",quickPriority,manifestControlType:base.controlType==="choice"?"choice":base.controlType==="tracker"?"numeric_input":"counter",...(module.eventId?{eventId:module.eventId}:{})};
  });
}

export function buildDenominatorCapabilities(capabilities:SessionCapability[]):DenominatorCapability[]{const operational=new Set(capabilities.filter(c=>c.status==="operational").map(c=>c.moduleKind));const item=(key:GuideDenominator,observationKey:string,status:DenominatorCapability["status"],requiredControl:string,reason:string|null,requiredRelationship:string|null=null):DenominatorCapability=>({key,observationKey,status,requiredControl,requiredRelationship,reason});return[
  item("total_games","observedTotalGame",operational.has("total_games")?"operational":"unavailable","total_games",operational.has("total_games")?null:"總 G tracker 不可操作"),
  item("normal_games","observedNormalGame",operational.has("normal_games")?"operational":"unavailable","normal_games",operational.has("normal_games")?null:"通常 G tracker 不可操作"),
  item("bonus_interval_games","bonusIntervalGames","planned","bonus interval tracker","尚未提供 Bonus 間 G tracker"),
  item("cycle_arrivals","cycleArrivals",operational.has("cycle")?"operational":"planned","cycle",operational.has("cycle")?null:"週期到達目前只有資料 contract"),
  item("point_arrivals","pointArrivals",operational.has("points")?"operational":"planned","points",operational.has("points")?null:"點數到達目前只有資料 contract"),
  item("cz_trials","czTrials",operational.has("cz_failures")?"operational":"planned","cz_failures",operational.has("cz_failures")?null:"CZ trial/outcome 尚未可操作","czTrials"),
  item("at_art_ends","atArtEnds",operational.has("end_evidence")?"operational":"planned","end_evidence",operational.has("end_evidence")?null:"終了畫面 choice 尚未可操作"),
  item("specific_trials","specificTrials","unavailable","trial/outcome relationship","來源未定義可記錄的 parent trial 與 outcome","specificTrials"),
];}

export function hasCompleteSettingValues(values:SettingValues|null){return Boolean(values&&([1,2,3,4,5,6] as const).every(setting=>typeof values[setting]==="number"&&Number.isFinite(values[setting]!)))}

export function validateEstimatorDependency(input:{settingValues:SettingValues|null;numeratorKey:string|null;denominator:GuideDenominator|null;minimumSample:number|null;capabilities:SessionCapability[];denominators:DenominatorCapability[]}){
  const blocked=(reason:string,numeratorControlId:string|null=null,denominatorObservationKey:string|null=null)=>({eligible:false,reason,contract:{status:"blocked",numeratorKey:input.numeratorKey,numeratorControlId,denominator:input.denominator,denominatorObservationKey,minimumSample:input.minimumSample,reason} satisfies EstimatorObservationContract});
  if(!hasCompleteSettingValues(input.settingValues))return blocked("設定 1～6 數值不完整");
  if(!input.numeratorKey)return blocked("缺少唯一 canonical numerator");
  const controls=input.capabilities.filter(c=>c.status==="operational"&&c.estimatorUsable&&(c.observationKey===input.numeratorKey||c.writeTarget.key===input.numeratorKey));
  if(controls.length!==1)return blocked(controls.length?"numerator 存在重複記錄路徑":"Session 尚無可操作的 numerator control");
  const control=controls[0];
  if(!input.denominator)return blocked("無法確認可靠分母",control.moduleId);const denominator=input.denominators.find(item=>item.key===input.denominator);
  if(!denominator||denominator.status!=="operational")return blocked(denominator?.reason??"Session 尚無可操作的 denominator",control.moduleId,denominator?.observationKey??null);
  if(!input.minimumSample||input.minimumSample<=0)return blocked("缺少最小樣本門檻",control.moduleId,denominator.observationKey);
  return{eligible:true,reason:null,contract:{status:"eligible",numeratorKey:input.numeratorKey,numeratorControlId:control.moduleId,denominator:input.denominator,denominatorObservationKey:denominator.observationKey,minimumSample:input.minimumSample,reason:null} satisfies EstimatorObservationContract};
}
