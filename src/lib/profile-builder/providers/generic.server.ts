import "server-only";
import type { ProfileSourceExtraction,ProfileSourceProvider } from "./types";
import { parseStructuredProfileHtml } from "./html-structure";
import { fetchProfileHtml } from "./fetch-html.server";

function sourceNameFor(url:URL){const host=url.hostname.replace(/^www\./,"");if(host.includes("nana-press"))return"なな徹";if(host.includes("p-town"))return"DMMぱちタウン";if(host.includes("1geki"))return"一撃";return host}
export class GenericProfileSourceProvider implements ProfileSourceProvider{
  id="generic-public-page";
  supports(){return true}
  async extract(url:URL):Promise<ProfileSourceExtraction>{const sections=parseStructuredProfileHtml(await fetchProfileHtml(url));return{sourceName:sourceNameFor(url),sourceUrl:url.toString(),retrievedAt:new Date().toISOString(),sections,confidence:.8,status:sections.length?"partial":"no_evidence"}}
}
