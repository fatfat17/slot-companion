import {PageHeader} from "@/components/PageHeader";
import {PachinkoSessionScreen} from "@/components/PachinkoSessionScreen";
export default async function PachinkoSessionPage({params}:{params:Promise<{id:string}>}){const{id}=await params;return<><PageHeader title="柏青哥紀錄" eyebrow="Pachinko Session" backHref="/pachinko" backLabel="返回柏青哥資料庫"/><PachinkoSessionScreen id={id}/></>}
