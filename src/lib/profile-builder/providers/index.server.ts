import "server-only";
import type { ProfileSourceProvider } from "./types";
import { GenericProfileSourceProvider } from "./generic.server";
import { IchigekiProfileSourceProvider } from "./ichigeki.server";
import { NanaPressProfileSourceProvider } from "./nanapress.server";

const providers:ProfileSourceProvider[]=[new IchigekiProfileSourceProvider(),new NanaPressProfileSourceProvider(),new GenericProfileSourceProvider()];
export function validatePublicSourceUrl(value:string){const url=new URL(value);if(!["http:","https:"].includes(url.protocol))throw new Error("只支援公開 HTTP / HTTPS URL");const host=url.hostname.toLowerCase();if(host==="localhost"||host.endsWith(".local")||host==="0.0.0.0"||host==="127.0.0.1"||host==="::1"||/^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(host))throw new Error("不允許讀取本機或私人網路 URL");return url}
export function providerForSource(url:URL){const provider=providers.find(item=>item.supports(url));if(!provider)throw new Error("目前沒有支援此來源的 provider");return provider}
