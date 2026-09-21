import { DEFAULT_COMPANION_PREFERENCES,sanitizeCompanionPreferences,type SessionCompanionPreferences } from "./companion";

const key="slot-companion-ai-preferences-v1";
export function loadCompanionPreferences():SessionCompanionPreferences{if(typeof window==="undefined")return DEFAULT_COMPANION_PREFERENCES;try{return sanitizeCompanionPreferences(JSON.parse(localStorage.getItem(key)??"null"))}catch{return DEFAULT_COMPANION_PREFERENCES}}
export function saveCompanionPreferences(value:SessionCompanionPreferences){if(typeof window==="undefined")return;localStorage.setItem(key,JSON.stringify(sanitizeCompanionPreferences(value)))}
