import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export default function StartPage(){
  return <><PageHeader title="開始一局" eyebrow="Start Playing"/><main className="page start-flow-page">
    <section className="start-flow-intro">
      <span>先確認機台</span>
      <h1>你知道這是哪一台嗎？</h1>
      <p>拍照與手動選擇只負責確認機種；選定後都會進入同一套指南與 Session 流程。</p>
    </section>

    <div className="start-path-list">
      <Link href="/identify" className="start-path-card unknown">
        <span className="start-path-icon">📷</span>
        <span className="start-path-copy"><small>不知道機種</small><strong>拍照辨識機台</strong><em>拍整台、正式機種名稱或筐體上方</em></span>
        <b>›</b>
      </Link>
      <Link href="/catalog" className="start-path-card known">
        <span className="start-path-icon">⌕</span>
        <span className="start-path-copy"><small>知道機種</small><strong>搜尋機種開始</strong><em>直接搜尋名稱，查看指南後建立 Session</em></span>
        <b>›</b>
      </Link>
    </div>

    <section className="start-shortcuts card">
      <div><small>熟悉的機台</small><strong>更快回到常玩的機種</strong></div>
      <nav aria-label="快速選擇機台">
        <Link href="/catalog?view=recent">最近遊玩</Link>
        <Link href="/catalog?view=favorites">我的收藏</Link>
      </nav>
    </section>

    <p className="start-flow-note">進入 Session 後的「拍現在畫面」只用來辨認 CZ／AT 等場景，不會重新判斷機種。</p>
  </main></>;
}
