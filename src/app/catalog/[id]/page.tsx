import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { machines } from "@/data/machines";
import { getProfileBuilderPresentation } from "@/lib/catalog/profileBuilderPresentation";
import { catalogRepository } from "@/lib/catalog/repository.server";
import { profileDraftRepository } from "@/lib/profile-builder/repository.server";

export default async function CatalogDetailPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params,record=(await catalogRepository.list()).find(item=>item.id===id);
  if(!record)notFound();
  const profile=machines.find(machine=>(machine.catalogId??machine.id)===record.id),draft=await profileDraftRepository.get(record.id);
  const builder=getProfileBuilderPresentation({catalogId:record.id,hasProfile:Boolean(profile),hasDraft:Boolean(draft),environment:process.env.NODE_ENV});
  const details=[["中文顯示名",record.displayNameZh||"未設定"],["メーカー",record.manufacturer],["Brand",record.brand||"未設定"],["Series",record.seriesName||"未設定"],["Aliases",record.aliases.length?record.aliases.join("、"):"無"],["機種類型",record.machineType],["導入日",record.introducedAt??"未設定"],["Catalog 狀態",record.catalogStatus],["Source",record.sourceName],["Retrieved",record.retrievedAt]];
  return <><PageHeader title="機種詳細" eyebrow="Machine Catalog"/><main className="page catalog-detail">
    <section className="catalog-detail-hero card"><span className="badge">{record.catalogStatus}</span><h1>{record.officialNameJa}</h1>{record.displayNameZh&&<p>{record.displayNameZh}</p>}<div className={profile?"profile-ready":"catalog-only"}>{profile?`✅ 攻略 Profile：${profile.profileStatus}`:"📚 攻略 Profile 尚未建立"}</div></section>
    <section className="section card catalog-detail-list"><h2>Identity Data</h2>{details.map(([label,value])=><dl key={label}><dt>{label}</dt><dd>{value}</dd></dl>)}<dl><dt>Source URL</dt><dd>{record.sourceUrl?<a href={record.sourceUrl} target="_blank" rel="noreferrer">查看來源 ↗</a>:"未設定"}</dd></dl>{record.sourceImageUrl&&<dl><dt>Source Image URL</dt><dd><a href={record.sourceImageUrl} target="_blank" rel="noreferrer">查看來源圖片 ↗</a></dd></dl>}</section>
    {profile&&<Link className="primary-button mt-4" href={`/machines/${profile.id}`}>查看 Machine Card</Link>}
    {builder.available?<Link className="secondary-button mt-3" href={builder.href}>{builder.label}</Link>:<div className="notice mt-3">{builder.notice}</div>}
    <div className="notice mt-3">Draft 必須經過來源 Evidence 與人工 Review 才能成為 verified；未核准前不影響現有 Session。</div>
  </main></>;
}
