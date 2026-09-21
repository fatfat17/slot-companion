import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

const topics=[
  {href:"#identify",icon:"📷",title:"拍照找機台",sub:"不知道名稱時怎麼找"},
  {href:"#guide",icon:"📖",title:"中文機台指南",sub:"建立、閱讀與更新攻略"},
  {href:"#session",icon:"🎮",title:"遊玩紀錄",sub:"SLOT 與柏青哥分開記"},
  {href:"#ai",icon:"🤖",title:"AI 陪打助手",sub:"問畫面與確認紀錄的差別"},
  {href:"#selector",icon:"🌅",title:"SLOT 選台助手",sub:"朝一與晚間候選比較"},
  {href:"#finish",icon:"📊",title:"結束與今日紀錄",sub:"保留結算，再回最近機台"},
] as const;

function Step({number,children}:{number:number;children:React.ReactNode}){return <li><b>{number}</b><span>{children}</span></li>}

export default function HelpPage(){return <><PageHeader title="APP 使用指南" eyebrow="QUICK START"/><main className="page help-page">
  <section className="help-hero card"><span>第一次使用，從這裡開始</span><h1>不用全部看完，選現在要做的事。</h1><p>指南不會自動彈出，也不記錄你是否看過。需要時再回來查即可。</p></section>

  <section className="help-paths" aria-label="選擇遊戲類型">
    <a href="#slot-path" className="slot"><span>🎰</span><strong>我要打 SLOT</strong><small>指南・Session・AI・選台</small></a>
    <a href="#pachinko-path" className="pachinko"><span>🔴</span><strong>我要打柏青哥</strong><small>指南・回轉・RUSH 紀錄</small></a>
  </section>

  <section className="section"><div className="section-title"><h2>你想做什麼？</h2><span>點選查看</span></div><nav className="help-topic-grid" aria-label="使用指南目錄">{topics.map(topic=><a href={topic.href} key={topic.href}><b>{topic.icon}</b><span><strong>{topic.title}</strong><small>{topic.sub}</small></span><em>›</em></a>)}</nav></section>

  <section className="section help-route-section" id="slot-path"><div className="section-title"><h2>SLOT 快速流程</h2><span>5 步驟</span></div><ol className="help-route"><Step number={1}>進入「打柏青嫂（SLOT）」</Step><Step number={2}>搜尋名稱，或用照片辨識機台</Step><Step number={3}>查看／建立繁體中文機台指南</Step><Step number={4}>開始一局，記錄 G 數、CZ、Bonus、AT</Step><Step number={5}>需要時問 AI，結束後查看今日紀錄</Step></ol><Link className="help-cta slot" href="/catalog">前往 SLOT 資料庫　›</Link></section>

  <section className="section help-route-section pachinko" id="pachinko-path"><div className="section-title"><h2>柏青哥快速流程</h2><span>5 步驟</span></div><ol className="help-route"><Step number={1}>進入「打柏青哥（Pachinko）」</Step><Step number={2}>搜尋名稱，或從柏青哥入口拍照辨識</Step><Step number={3}>查看／建立繁體中文圖文指南</Step><Step number={4}>記錄液晶回轉、投入、初當、RUSH 與持玉</Step><Step number={5}>結束後回到柏青哥最近打過</Step></ol><Link className="help-cta pachinko" href="/pachinko">前往柏青哥資料庫　›</Link></section>

  <section className="section help-detail" id="identify"><div className="section-title"><h2>📷 拍照找機台</h2><span>畫面示意</span></div><div className="help-visual card" aria-label="資料庫與拍照辨識入口畫面示意"><div className="help-visual-bar"><i>←</i><span><small>MACHINE CATALOG</small><strong>找機台</strong></span></div><div className="help-visual-action active"><b>1</b><span>📷 拍照辨識<small>不知道名稱時使用</small></span></div><div className="help-visual-search"><b>2</b><span>搜尋機種名稱或作品</span></div></div><ol className="help-copy"><Step number={1}>先進入正確資料庫。同一作品可能同時有 SLOT 與柏青哥。</Step><Step number={2}>拍清楚機台上方名稱、筐體或液晶標題；也可以從相簿選照片。</Step><Step number={3}>AI 提供候選後，請看名稱與外觀再確認，不確定時不要硬選。</Step></ol><div className="help-actions"><Link href="/identify">SLOT 拍照辨識</Link><Link href="/identify/pachinko">柏青哥拍照辨識</Link></div></section>

  <section className="section help-detail" id="guide"><div className="section-title"><h2>📖 中文機台指南</h2><span>畫面示意</span></div><div className="help-visual card guide"><div className="help-visual-bar"><i>←</i><span><small>MACHINE GUIDE</small><strong>機台指南</strong></span></div><div className="help-visual-block"><small>快速看懂</small><strong>基本玩法與遊戲流程</strong><p>繁體中文重點與來源圖解</p></div><div className="help-visual-button"><b>1</b>建立／重新整理機台指南</div><div className="help-visual-button secondary"><b>2</b>開始簡易紀錄</div></div><p className="help-note">第一次按下建立時，系統才會抓取公開資料並整理成繁中內容。SLOT 與柏青哥使用不同的指南架構；來源沒有的數字不應由 AI 補猜。</p></section>

  <section className="section help-detail" id="session"><div className="section-title"><h2>🎮 遊玩中的紀錄</h2><span>畫面示意</span></div><div className="help-visual card session"><div className="help-visual-bar"><i>←</i><span><small>ACTIVE SESSION</small><strong>遊玩紀錄</strong></span></div><div className="help-session-total"><span><small>目前 G／回轉</small><strong>248</strong></span><span><small>投入</small><strong>¥10,000</strong></span></div><div className="help-counter-row"><i><b>−</b></i><span><small>事件紀錄</small><strong>CZ／初當／RUSH</strong></span><i className="plus"><b>＋</b></i></div><div className="help-visual-button"><b>1</b>結束此局</div></div><div className="help-split-copy"><article><strong>🎰 SLOT</strong><p>記錄 G 數與指南支援的 CZ、Bonus、AT 等事件。每台能記的項目可能不同。</p></article><article><strong>🔴 柏青哥</strong><p>記錄液晶回轉、投入、初當、RUSH、大當、連莊與持玉，不套用 SLOT 天井或設定模式。</p></article></div></section>

  <section className="section help-detail" id="ai"><div className="section-title"><h2>🤖 AI 陪打助手</h2><span>SLOT</span></div><div className="help-visual card ai"><div className="help-ai-tabs"><span className="active">陪玩</span><span>冷靜判斷</span><span>小回顧</span></div><div className="help-ai-message">拍現在畫面，或直接問這台目前的流程。</div><div className="help-ai-actions"><span>📷 問這張畫面</span><span>✓ 檢查可記錄項目</span></div></div><ul className="help-bullets"><li>「問這張畫面」只會解釋，不會修改 Session。</li><li>「檢查可記錄項目」只會比對目前機台既有的記錄按鈕。</li><li>仍須由你按下「確認並記錄」才會寫入資料。</li><li>AI 是陪打與資料解釋，不保證中獎或獲利。</li></ul></section>

  <section className="section help-detail" id="selector"><div className="section-title"><h2>🌅 SLOT 選台助手</h2><span>開局前</span></div><div className="help-split-copy"><article><strong>早上：朝一模式</strong><p>選一台機種，提供目前 G 數、現場條件或照片。Reset／天井必須以這台已有的指南資料為準。</p></article><article><strong>晚間：撿台模式</strong><p>最多比較五台候選，可附各台履歷照片。資料不足時 AI 可以拒絕硬選。</p></article></div><Link className="help-cta slot" href="/catalog/assistant">開啟 SLOT 選台助手　›</Link></section>

  <section className="section help-detail" id="finish"><div className="section-title"><h2>📊 結束與今日紀錄</h2><span>最後一步</span></div><ol className="help-copy"><Step number={1}>按「結束此局」後確認投入、回收與備註。</Step><Step number={2}>SLOT 會回到 SLOT 最近打過；柏青哥會回到柏青哥最近打過。</Step><Step number={3}>首頁「今日紀錄」會分開呈現枚與玉，不混合計算。</Step></ol><Link className="help-cta" href="/records">查看今日紀錄　›</Link></section>

  <section className="help-footer card"><strong>只想查日文術語？</strong><p>SLOT 與柏青哥有獨立的新手常用術語。</p><div><Link href="/glossary?kind=slot">SLOT 術語</Link><Link href="/glossary?kind=pachinko">柏青哥術語</Link></div></section>
</main></>}
