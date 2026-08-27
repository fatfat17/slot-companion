import { promises as fs } from "node:fs";
import path from "node:path";
import type { PublishedMachineProfileRecord,PublishedMachineProfileVersion } from "@/types/profilePromotion";

export class JsonPublishedProfileRepository{
  private filePath:string;
  constructor(filePath=path.join(process.cwd(),"data","published-machine-profiles.json")){this.filePath=filePath}
  async list(){try{return JSON.parse(await fs.readFile(this.filePath,"utf8")) as PublishedMachineProfileRecord[]}catch{return[]}}
  async get(catalogId:string){return(await this.list()).find(item=>item.catalogId===catalogId)??null}
  async active(catalogId:string){const record=await this.get(catalogId);return record?.versions.find(item=>item.profileVersion===record.activeVersion)??null}
  async publish(catalogId:string,version:PublishedMachineProfileVersion,baselineMachine?:PublishedMachineProfileVersion["machine"]){const records=await this.list(),index=records.findIndex(item=>item.catalogId===catalogId),baseline:PublishedMachineProfileVersion|undefined=index<0&&baselineMachine?{profileVersion:0,publishedAt:version.publishedAt,sourceDraftId:"baseline-placeholder",machine:{...baselineMachine,profileVersion:0,previousProfileVersion:undefined}}:undefined,record=index>=0?records[index]:{catalogId,activeVersion:0,versions:baseline?[baseline]:[]};if(record.versions.some(item=>item.profileVersion===version.profileVersion))throw new Error("Profile version 已存在");const next={...record,activeVersion:version.profileVersion,versions:[...record.versions,version]};if(index>=0)records[index]=next;else records.push(next);await this.atomicSave(records);return next}
  async rollback(catalogId:string){const records=await this.list(),index=records.findIndex(item=>item.catalogId===catalogId);if(index<0)throw new Error("沒有已發布 Profile");const record=records[index],active=record.versions.find(item=>item.profileVersion===record.activeVersion),previous=active?.previousProfileVersion;if(previous===undefined||!record.versions.some(item=>item.profileVersion===previous))throw new Error("沒有可 rollback 的前一版 Profile");records[index]={...record,activeVersion:previous};await this.atomicSave(records);return records[index]}
  private async atomicSave(records:PublishedMachineProfileRecord[]){await fs.mkdir(path.dirname(this.filePath),{recursive:true});const temp=`${this.filePath}.tmp`;await fs.writeFile(temp,`${JSON.stringify(records,null,2)}\n`,`utf8`);await fs.rename(temp,this.filePath)}
}
export const publishedProfileRepository=new JsonPublishedProfileRepository();
