import { readFileSync } from "node:fs";
import { join } from "node:path";
import { brotliDecompressSync } from "node:zlib";
import type { HallLocationQuery } from "./search";

type PostalRow=[postalCode:string,prefectureJa:string,cityJa:string,townJa:string,prefectureEn:string,cityEn:string,townEn:string];
type PostalIndex={source:string;sourceUrl:string;retrievedAt:string;rows:PostalRow[]};

const PREFECTURE_AREAS:Record<string,string>={"北海道":"hokkaido","青森県":"aomori","岩手県":"iwate","宮城県":"miyagi","秋田県":"akita","山形県":"yamagata","福島県":"fukushima","茨城県":"ibaraki","栃木県":"tochigi","群馬県":"gunma","埼玉県":"saitama","千葉県":"chiba","東京都":"tokyo","神奈川県":"kanagawa","新潟県":"niigata","富山県":"toyama","石川県":"ishikawa","福井県":"fukui","山梨県":"yamanashi","長野県":"nagano","岐阜県":"gifu","静岡県":"shizuoka","愛知県":"aichi","三重県":"mie","滋賀県":"shiga","京都府":"kyoto","大阪府":"osaka","兵庫県":"hyogo","奈良県":"nara","和歌山県":"wakayama","鳥取県":"tottori","島根県":"shimane","岡山県":"okayama","広島県":"hiroshima","山口県":"yamaguchi","徳島県":"tokushima","香川県":"kagawa","愛媛県":"ehime","高知県":"kochi","福岡県":"fukuoka","佐賀県":"saga","長崎県":"nagasaki","熊本県":"kumamoto","大分県":"oita","宮崎県":"miyazaki","鹿児島県":"kagoshima","沖縄県":"okinawa"};
const EMPTY_TOWN=/以下に掲載がない場合|一円|その他/;
const SOURCE_URL="https://www.post.japanpost.jp/service/search/zipcode/download/roman/KEN_ALL_ROME.zip";
const RETRIEVED_AT="2026-08-30";
let cached:PostalIndex|undefined;

function loadIndex(){
  if(cached)return cached;
  const path=join(process.cwd(),"data","japan-postal-addresses.json.br");
  cached=JSON.parse(brotliDecompressSync(readFileSync(path)).toString("utf8")) as PostalIndex;
  return cached;
}
function compactRoman(value:string){return value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/\b(?:JAPAN|PREFECTURE|PREF|WARD|CITY|CHOME|CHO|MACHI|MURA|GUN|SHI|KU|KEN|FU|TO|DO)\b/g," ").replace(/[^A-Z0-9]+/g,"").replace(/N(?=[BMP])/g,"M")}
function cleanJa(value:string){return value.replace(/[\s　]+/g,"")}
function postalCode(value:string){const match=value.normalize("NFKC").match(/(?:〒\s*)?(\d{3})[\s-]?(\d{4})/);return match?`${match[1]}${match[2]}`:null}
function location(row:PostalRow,reason:string):HallLocationQuery{
  const [,rawPrefecture,rawCity,rawTown]=row,prefecture=cleanJa(rawPrefecture),city=cleanJa(rawCity),town=EMPTY_TOWN.test(rawTown)?"":cleanJa(rawTown);
  const primary=`${prefecture}${city}${town}`,cityTown=`${city}${town}`;
  const district=city.match(/[^市]+区$/)?.[0]??"";
  const alternatives=[cityTown,city,district,city.replace(/市.*$/,"市")].filter((value,index,array)=>value.length>=2&&value!==primary&&array.indexOf(value)===index);
  return{query:primary,alternatives,area:PREFECTURE_AREAS[prefecture]??"all",changed:true,reason};
}
function bestPostalRow(rows:PostalRow[],input:string){
  const roman=compactRoman(input);
  return rows.map(row=>({row,score:[row[6],row[5],row[4]].reduce((score,field,index)=>{const key=compactRoman(field);return score+(key&&roman.includes(key)?3-index:0)},0)})).sort((a,b)=>b.score-a.score)[0]?.row;
}
function romanCandidate(input:string){
  const roman=compactRoman(input);if(roman.length<5)return null;
  let best:{row:PostalRow;score:number}|null=null;
  for(const row of loadIndex().rows){
    const town=compactRoman(row[6]),cityWords=row[5].split(/\s+/).map(compactRoman).filter(word=>word.length>=3),pref=compactRoman(row[4]);
    const townMatch=town.length>=4&&roman.includes(town),cityMatches=cityWords.filter(word=>roman.includes(word)).length,prefMatch=pref.length>=4&&roman.includes(pref);
    if(!townMatch&&cityMatches<2)continue;
    const score=(townMatch?10:0)+cityMatches*2+(prefMatch?2:0);
    if(!best||score>best.score)best={row,score};
  }
  return best&&best.score>=6?best.row:null;
}

export function resolveJapanPostalLocation(input:string):HallLocationQuery|null{
  const code=postalCode(input);
  if(code){const rows=loadIndex().rows.filter(row=>row[0]===code),row=bestPostalRow(rows,input);if(row)return location(row,`已依日本郵便官方資料解析郵遞區號 〒${code.slice(0,3)}-${code.slice(3)}`)}
  const latinWords=input.match(/[A-Za-z]{3,}/g)??[];
  if(latinWords.length<2)return null;
  const row=romanCandidate(input);return row?location(row,"已依日本郵便官方羅馬拼音地址資料辨識行政區；門牌不作距離排序"):null;
}

export function japanPostalSource(){return{sourceUrl:SOURCE_URL,retrievedAt:RETRIEVED_AT}}
