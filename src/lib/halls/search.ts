export type HallQuickSearch={label:string;query:string};
export type HallLocationQuery={query:string;alternatives:string[];area:string;changed:boolean;reason:string|null};
const SIMPLE_ALIASES:Record<string,string>={"豐州":"豊洲","toy０su":"豊洲","toyosu":"豊洲","澀谷":"渋谷","涩谷":"渋谷","shibuya":"渋谷","新宿":"新宿","shinjuku":"新宿","池袋":"池袋","ikebukuro":"池袋","秋葉原":"秋葉原","akihabara":"秋葉原","上野":"上野","ueno":"上野","橫濱":"横浜","横滨":"横浜","yokohama":"横浜","難波":"難波","namba":"難波","nagoya":"名古屋","nagoyastation":"名古屋駅","nagoyaeki":"名古屋駅"};
const AREA_HINTS:Array<[RegExp,string]>=[[/北海道|hokkaido/i,"hokkaido"],[/東京|tokyo/i,"tokyo"],[/大阪|osaka/i,"osaka"],[/京都|kyoto/i,"kyoto"],[/愛知|名古屋|aichi|nagoya/i,"aichi"],[/神奈川|横浜|kanagawa|yokohama/i,"kanagawa"],[/福岡|fukuoka/i,"fukuoka"],[/沖縄|okinawa/i,"okinawa"]];
const ENGLISH_ADDRESS_PARTS:Array<[RegExp,string]>=[[/\baichi(?:\s+prefecture)?\b/i,"愛知県"],[/\bnagoya(?:\s+city)?\b/i,"名古屋市"],[/\bnakamura(?:\s+ward)?\b/i,"中村区"],[/\btsubaki(?:\s*-?\s*cho|cho)\b/i,"椿町"],[/\bshinjuku(?:\s+ward)?\b/i,"新宿区"],[/\bshibuya(?:\s+ward)?\b/i,"渋谷区"]];
const LANDMARK_HINTS:Array<[RegExp,string]>=[[/\bvia\s*inn\b.*\bnagoya\b|ヴィアイン名古屋新幹線口/i,"名古屋駅"],[/yamamotoya\s+honten\s+esuka(?:ten)?|山本屋本店.*エスカ/i,"名古屋駅"]];
export const HALL_QUICK_SEARCHES:HallQuickSearch[]=[{label:"名古屋站",query:"名古屋駅"},{label:"新宿",query:"新宿"},{label:"池袋",query:"池袋"},{label:"秋葉原",query:"秋葉原"},{label:"澀谷",query:"渋谷"},{label:"豐洲",query:"豊洲"}];
function aliasKey(value:string){return value.normalize("NFKC").trim().toLowerCase().replace(/[\s\-ー]+/g,"")}
function unique(values:string[]){return values.map(value=>value.replace(/\s+/g," ").trim()).filter((value,index,array)=>value.length>=2&&array.indexOf(value)===index)}
function cleanInput(value:string){return value.normalize("NFKC").replace(/^\s*#{1,6}\s*/gm,"").replace(/日本\s*$/i,"").replace(/["'“”]/g," ").replace(/\s+/g," ").trim()}
function japaneseLine(value:string){return value.split(/\r?\n/).map(line=>line.replace(/^\s*#{1,6}\s*/,"").trim()).filter(Boolean).find(line=>{const japanese=(line.match(/[ぁ-んァ-ヶ一-龠]/g)??[]).join("").replace(/日本$/g,"");return japanese.length>=2})??""}
function inferArea(value:string){return AREA_HINTS.find(([pattern])=>pattern.test(value))?.[1]??"all"}
export function extractJapanesePostalCode(value:string){const match=value.normalize("NFKC").match(/(?:〒\s*)?(\d{3})[\s-]?(\d{4})/);return match?`${match[1]}-${match[2]}`:null}
export function normalizeHallLocationInput(value:string):HallLocationQuery{
  const original=value.normalize("NFKC").trim();if(!original)return{query:"",alternatives:[],area:"all",changed:false,reason:null};
  const cleaned=cleanInput(original),simple=SIMPLE_ALIASES[aliasKey(cleaned)];if(simple)return{query:simple,alternatives:[],area:inferArea(simple),changed:simple!==cleaned,reason:simple!==cleaned?"已轉成可供 P-WORLD 搜尋的日本地名":null};
  const landmark=LANDMARK_HINTS.find(([pattern])=>pattern.test(cleaned));if(landmark)return{query:landmark[1],alternatives:["名古屋市中村区","名古屋"],area:inferArea(landmark[1]),changed:true,reason:"已辨識地標所在的車站區域；結果不是精確距離排序"};
  const addressParts=ENGLISH_ADDRESS_PARTS.flatMap(([pattern,replacement])=>pattern.test(cleaned)?[replacement]:[]);if(addressParts.length){const combined=unique(addressParts).join(""),alternatives=unique([addressParts.filter(part=>/市|区/.test(part)).join(""),addressParts.find(part=>/区$/.test(part))??"",addressParts.find(part=>/市$/.test(part))?.replace(/市$/,"")??""]);return{query:combined,alternatives:alternatives.filter(item=>item!==combined),area:inferArea(combined),changed:true,reason:"已從英文地址抽出日本都道府縣／市區／町名，找不到時會逐步放寬"}}
  const japanese=japaneseLine(original);if(japanese&&japanese!==cleaned){const geographic=japanese.match(/(?:東京都|北海道|(?:京都|大阪)府|.{2,3}県)?[^\s]{1,8}(?:市|区|町|村|駅)/g)??[];return{query:japanese,alternatives:unique(geographic.reverse()),area:inferArea(japanese),changed:true,reason:"已優先使用貼上內容中的日文名稱"}}
  const normalized=cleaned.replace(/區/g,"区").replace(/站/g,"駅");return{query:normalized,alternatives:[],area:inferArea(normalized),changed:normalized!==cleaned,reason:normalized!==cleaned?"已轉成日本常用地名寫法":null}
}
export function normalizeHallSearchQuery(value:string){const result=normalizeHallLocationInput(value);return{query:result.query,changed:result.changed}}
