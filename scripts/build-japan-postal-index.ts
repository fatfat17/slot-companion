import { brotliCompressSync, constants } from "node:zlib";
import { readFileSync, writeFileSync } from "node:fs";

type PostalRow = [postalCode:string,prefectureJa:string,cityJa:string,townJa:string,prefectureEn:string,cityEn:string,townEn:string];

function parseCsvLine(line:string){
  return [...line.matchAll(/"((?:[^"]|"")*)"/g)].map(match=>match[1].replace(/""/g,'"'));
}

const input=process.argv[2],output=process.argv[3];
if(!input||!output)throw new Error("Usage: build-japan-postal-index <KEN_ALL_ROME.CSV> <output.json.br>");
const decoded=new TextDecoder("shift_jis").decode(readFileSync(input));
const rows:PostalRow[]=[];
const seen=new Set<string>();
for(const line of decoded.split(/\r?\n/)){
  const values=parseCsvLine(line);
  if(values.length<7)continue;
  const row=values.slice(0,7) as PostalRow,key=row.join("\u0000");
  if(!/^\d{7}$/.test(row[0])||seen.has(key))continue;
  seen.add(key);rows.push(row);
}
const payload=JSON.stringify({source:"Japan Post KEN_ALL_ROME",sourceUrl:"https://www.post.japanpost.jp/service/search/zipcode/download/roman-zip.html",retrievedAt:"2026-08-30",rows});
const compressed=brotliCompressSync(Buffer.from(payload),{params:{[constants.BROTLI_PARAM_QUALITY]:11}});
writeFileSync(output,compressed);
process.stdout.write(`Wrote ${rows.length} rows (${compressed.byteLength} bytes)\n`);
