import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { ProfileDraft } from "@/types/profileBuilder";

export class JsonProfileDraftRepository{
  constructor(private filePath=path.join(process.cwd(),"data","profile-drafts.json")){}
  async list(){try{return JSON.parse(await fs.readFile(this.filePath,"utf8")) as ProfileDraft[]}catch{return[]}}
  async get(catalogId:string){return(await this.list()).find(item=>item.catalogId===catalogId)??null}
  async save(draft:ProfileDraft){const drafts=await this.list(),index=drafts.findIndex(item=>item.catalogId===draft.catalogId);if(index>=0)drafts[index]=draft;else drafts.push(draft);const temp=`${this.filePath}.tmp`;await fs.writeFile(temp,`${JSON.stringify(drafts,null,2)}\n`,"utf8");await fs.rename(temp,this.filePath);return draft}
}
export const profileDraftRepository=new JsonProfileDraftRepository();
