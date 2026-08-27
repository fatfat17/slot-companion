import "server-only";
import { fetchProfileHtml } from "./fetch-html.server";
import { parseNanaPressProfileHtml } from "./nanapress";
import type { ProfileSourceProvider } from "./types";
export class NanaPressProfileSourceProvider implements ProfileSourceProvider{id="nana-press";supports(url:URL){return url.hostname==="nana-press.com"||url.hostname.endsWith(".nana-press.com")}async extract(url:URL){const sections=parseNanaPressProfileHtml(await fetchProfileHtml(url));return{sourceName:"なな徹",sourceUrl:url.toString(),retrievedAt:new Date().toISOString(),sections,confidence:.9,status:sections.length===0?"no_evidence" as const:sections.length<8?"partial" as const:"extracted" as const}}}
