import "server-only";
import { getMachine } from "@/data/machines";
import { publishedProfileRepository } from "./repository.server";
export async function getEffectiveMachineServer(machineId:string){const base=getMachine(machineId);if(!base)return undefined;return(await publishedProfileRepository.active(base.catalogId??base.id))?.machine??base}
