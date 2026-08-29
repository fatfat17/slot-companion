export const GUIDE_FEEDBACK_KEY="slot-companion-guide-feedback-v1";
export type GuideFeedbackKind="incorrect"|"unclear"|"duplicate"|"missing";
export type GuideFeedback={id:string;catalogId:string;kind:GuideFeedbackKind;sectionKey:string|null;note:string;createdAt:string;status:"open"};
function readAll():GuideFeedback[]{if(typeof window==="undefined")return[];try{const value=JSON.parse(window.localStorage.getItem(GUIDE_FEEDBACK_KEY)??"[]");return Array.isArray(value)?value:[]}catch{return[]}}
export function loadGuideFeedback(catalogId:string){return readAll().filter(item=>item.catalogId===catalogId)}
export function saveGuideFeedback(input:Omit<GuideFeedback,"id"|"createdAt"|"status">,now=new Date().toISOString()){if(typeof window==="undefined")return null;const note=input.note.trim().slice(0,500);if(!note)return null;const item:GuideFeedback={...input,note,id:`feedback-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,createdAt:now,status:"open"};try{window.localStorage.setItem(GUIDE_FEEDBACK_KEY,JSON.stringify([...readAll(),item]));return item}catch{return null}}
