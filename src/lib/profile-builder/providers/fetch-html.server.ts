import "server-only";
export async function fetchProfileHtml(url:URL){const response=await fetch(url,{headers:{"User-Agent":"SlotCompanion/0.2.4 ProfileBuilder"},signal:AbortSignal.timeout(12000)});if(!response.ok)throw new Error(`來源頁讀取失敗（HTTP ${response.status}）`);return response.text()}
