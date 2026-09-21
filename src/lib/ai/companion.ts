export type SessionCompanionMode="live"|"decision"|"review";
export type SessionCompanionMessage={role:"user"|"assistant";text:string};
export type SessionCompanionPreferences={playStyle:"balanced"|"conditions"|"entertainment";decisionPointYen:number;hardStopYen:number;maxGivebackPercent:number};
export type SessionCompanionDecision={investmentStatus:"below"|"decision_point"|"hard_stop";profitLock:"off"|"soft"|"active"|"strict";maxGivebackMedals:number|null;protectedMedals:number|null};
export type SessionCompanionContext={
  machineName:string;
  currentState:string;
  observedGame:number;
  investmentYen:number;
  medals:number;
  peakMedals:number;
  startedAt:string;
  japanLocalTime:string;
  journey:string[];
  recentEvents:Array<{time:string;label:string}>;
  records:Array<{label:string;value:string}>;
  preferences:SessionCompanionPreferences;
  decision:SessionCompanionDecision;
  guide:{corePlay:string|null;keyThings:string[];events:Array<{name:string;whatToSee:string;countingRule:string}>;sourceName:string;retrievedAt:string}|null;
};

export const DEFAULT_COMPANION_PREFERENCES:SessionCompanionPreferences={playStyle:"balanced",decisionPointYen:10000,hardStopYen:20000,maxGivebackPercent:30};
const companionModes=new Set<SessionCompanionMode>(["live","decision","review"]),playStyles=new Set<SessionCompanionPreferences["playStyle"]>(["balanced","conditions","entertainment"]);
const text=(input:unknown,max=180)=>typeof input==="string"?input.trim().slice(0,max):"";
const boundedNumber=(input:unknown,fallback:number,min:number,max:number)=>Number.isFinite(input)?Math.min(max,Math.max(min,Math.round(Number(input)))):fallback;

export function sanitizeCompanionMode(value:unknown):SessionCompanionMode{return typeof value==="string"&&companionModes.has(value as SessionCompanionMode)?value as SessionCompanionMode:"live"}
export function sanitizeCompanionQuestion(value:unknown){return text(value,300)}
export function sanitizeCompanionHistory(value:unknown):SessionCompanionMessage[]{return Array.isArray(value)?value.slice(-8).flatMap(item=>{if(!item||typeof item!=="object")return[];const raw=item as Record<string,unknown>,role=raw.role,message=text(raw.text,500);return(role==="user"||role==="assistant")&&message?[{role,text:message} as SessionCompanionMessage]:[]}):[]}
export function sanitizeCompanionPreferences(value:unknown):SessionCompanionPreferences{
  const raw=value&&typeof value==="object"?value as Partial<SessionCompanionPreferences>:{};
  const decisionPointYen=boundedNumber(raw.decisionPointYen,DEFAULT_COMPANION_PREFERENCES.decisionPointYen,1000,100000);
  return{playStyle:typeof raw.playStyle==="string"&&playStyles.has(raw.playStyle as SessionCompanionPreferences["playStyle"])?raw.playStyle as SessionCompanionPreferences["playStyle"]:DEFAULT_COMPANION_PREFERENCES.playStyle,decisionPointYen,hardStopYen:Math.max(decisionPointYen,boundedNumber(raw.hardStopYen,DEFAULT_COMPANION_PREFERENCES.hardStopYen,1000,200000)),maxGivebackPercent:boundedNumber(raw.maxGivebackPercent,DEFAULT_COMPANION_PREFERENCES.maxGivebackPercent,5,80)};
}
export function buildCompanionDecision(investmentYen:number,peakMedals:number,preferences:SessionCompanionPreferences):SessionCompanionDecision{
  const investmentStatus=investmentYen>=preferences.hardStopYen?"hard_stop":investmentYen>=preferences.decisionPointYen?"decision_point":"below";
  const profitLock=peakMedals>=1000?"strict":peakMedals>=800?"active":peakMedals>=500?"soft":"off";
  const maxGivebackMedals=profitLock==="active"||profitLock==="strict"?Math.floor(peakMedals*preferences.maxGivebackPercent/100):null;
  return{investmentStatus,profitLock,maxGivebackMedals,protectedMedals:maxGivebackMedals===null?null:peakMedals-maxGivebackMedals};
}
export function sanitizeCompanionContext(value:unknown):SessionCompanionContext|null{
  if(!value||typeof value!=="object")return null;
  const raw=value as Partial<SessionCompanionContext>;
  if(typeof raw.machineName!=="string"||!raw.machineName.trim())return null;
  const preferences=sanitizeCompanionPreferences(raw.preferences),investmentYen=boundedNumber(raw.investmentYen,0,0,10000000),medals=boundedNumber(raw.medals,0,0,10000000),peakMedals=Math.max(medals,boundedNumber(raw.peakMedals,medals,0,10000000));
  return{machineName:text(raw.machineName,100),currentState:text(raw.currentState,60),observedGame:boundedNumber(raw.observedGame,0,0,10000000),investmentYen,medals,peakMedals,startedAt:text(raw.startedAt,50),japanLocalTime:text(raw.japanLocalTime,80),journey:Array.isArray(raw.journey)?raw.journey.slice(0,8).map(item=>text(item,80)).filter(Boolean):[],recentEvents:Array.isArray(raw.recentEvents)?raw.recentEvents.slice(0,12).map(item=>({time:text(item?.time,20),label:text(item?.label,140)})).filter(item=>item.label):[],records:Array.isArray(raw.records)?raw.records.slice(0,24).map(item=>({label:text(item?.label,80),value:text(item?.value,80)})).filter(item=>item.label):[],preferences,decision:buildCompanionDecision(investmentYen,peakMedals,preferences),guide:raw.guide&&typeof raw.guide==="object"?{corePlay:text(raw.guide.corePlay,500)||null,keyThings:Array.isArray(raw.guide.keyThings)?raw.guide.keyThings.slice(0,6).map(item=>text(item,180)).filter(Boolean):[],events:Array.isArray(raw.guide.events)?raw.guide.events.slice(0,16).map(item=>({name:text(item?.name,100),whatToSee:text(item?.whatToSee,220),countingRule:text(item?.countingRule,180)})).filter(item=>item.name):[],sourceName:text(raw.guide.sourceName,80),retrievedAt:text(raw.guide.retrievedAt,50)}:null};
}

const commonPrompt=`你是 Slot Companion 的私人日本 Pachislot／Smart Slot 打台夥伴。娛樂判讀可以熱情，投注判斷必須冷靜。預告節奏，不預告結果；前兆很多不等於快中 AT，演出很熱也不是之後續打的理由。
只能使用提供的 Session、Machine Guide、照片與對話資料。硬數據沒有寫就說「目前指南沒有可靠資料」，不可用模型記憶補猜天井、Zone、Reset、設定差、勝率或機率。照片看不清會影響判斷的 G 數、持枚或文字時，要請玩家確認，並嚴格區分實 G、液晶 G、資料機 G、CZ 間與 AT 間。
語氣像坐在旁邊、懂 Slot 的台灣朋友：自然、簡短、有反應，可少量使用 😂、👀、✌️、🔥。先回答現在是什麼與代表什麼，必要時才說下一步；不要每次都安排 NEXT。不能保證獲利、宣稱即將中獎，也不能聲稱已替玩家修改紀錄。
回覆預設 1 至 4 個短段落，不使用 Markdown 標題、表格或星號。事件正式名稱可保留日文並附中文解釋。`;
export function companionDeveloperPrompt(mode:SessionCompanionMode="live"){
  if(mode==="decision")return `${commonPrompt}\n目前是冷靜決策模式。先接住情緒，再從當前位置重新判斷，不以已投入金額、一直出 CHANCE 或「走了被別人撿」當續打理由。使用 CONTEXT.decision 中由程式算好的決策點與 Profit Lock 數字，不自行重算；可用「繼續／再玩一段／收／Profit Lock／Sink Cost」，但只有理由充分才用。若建議再玩一段，必須給明確重新判斷節點。`;
  if(mode==="review")return `${commonPrompt}\n目前是回顧模式。依時間順序簡短整理本局路線，分開說 Decision Quality 與 Outcome；結果好不代表決策一定正確，結果差也不代表合理決策錯誤。指出今天學懂的玩法與下次一個最實用的改善點。`;
  return `${commonPrompt}\n目前是 LIVE 陪玩模式。玩家傳照片時優先理解為「這是什麼」，不要自動變成是否續打。依 Journey Map 說明現在走到哪一層、這段目標與下一個值得看的畫面；只有真的到決策節點或玩家主動問時，才提醒切到冷靜決策模式。`;
}
