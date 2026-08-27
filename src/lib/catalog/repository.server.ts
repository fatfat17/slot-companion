import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { CatalogImportDecision,MachineCatalogRecord } from "@/types/catalog";
import { applyCatalogDecisions,searchCatalogRecords } from "./core";

export class JsonMachineCatalogRepository{
  constructor(private filePath=path.join(process.cwd(),"data","machine-catalog.json")){}
  async list(){try{return JSON.parse(await fs.readFile(this.filePath,"utf8")) as MachineCatalogRecord[]}catch{return[]}}
  async search(terms:string[],manufacturers:string[]=[],limit=20){return searchCatalogRecords(await this.list(),terms,manufacturers,limit)}
  async approve(decisions:CatalogImportDecision[]){const result=applyCatalogDecisions(await this.list(),decisions);const temp=`${this.filePath}.tmp`;await fs.writeFile(temp,`${JSON.stringify(result.records,null,2)}\n`,"utf8");await fs.rename(temp,this.filePath);return{processed:decisions.length,imported:result.imported,merged:result.merged,skipped:result.skipped,total:result.total}}
}
export const catalogRepository=new JsonMachineCatalogRepository();
