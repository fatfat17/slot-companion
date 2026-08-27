import "server-only";
import { fetchProfileHtml } from "./fetch-html.server";
import { parseStructuredProfileHtml } from "./html-structure";
import type { ProfileSourceProvider } from "./types";
export class IchigekiProfileSourceProvider implements ProfileSourceProvider{id="ichigeki";supports(url:URL){return url.hostname==="1geki.jp"||url.hostname.endsWith(".1geki.jp")}async extract(url:URL){const sections=parseStructuredProfileHtml(await fetchProfileHtml(url));return{sourceName:"一撃",sourceUrl:url.toString(),retrievedAt:new Date().toISOString(),sections,confidence:.9,status:sections.length===0?"no_evidence" as const:sections.length<8?"partial" as const:"extracted" as const}}}
