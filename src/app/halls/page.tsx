import { PageHeader } from "@/components/PageHeader";
import { HallFinder } from "@/components/HallFinder";
export default async function HallsPage({searchParams}:{searchParams:Promise<{machine?:string}>}){const {machine=""}=await searchParams;return <><PageHeader eyebrow="Nearby Halls" title="附近店家"/><main className="page halls-page"><HallFinder initialMachine={machine}/></main></>}
