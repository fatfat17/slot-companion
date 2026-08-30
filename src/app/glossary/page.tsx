import { PageHeader } from "@/components/PageHeader";

const groups=[
  {title:"先懂遊戲流程",items:[
    ["通常時","通常ゲーム","尚未進入 CZ、Bonus、AT 或 ART 的一般遊戲階段。多數機台會在這裡累積 G 數、點數或抽選機會。"],
    ["前兆","前兆","機台用畫面、音效或演出提示可能接近結果的階段。前兆不等於一定中獎。"],
    ["CZ","チャンスゾーン","進入 AT／ART 或 Bonus 前的挑戰區。看到機台明確顯示具名 CZ 時，再按對應記錄。"],
    ["AT","アシストタイム","透過押順提示增加出玉的主要狀態。不同機台的 AT 名稱與流程不同。"],
    ["ART","アシストリプレイタイム","結合押順輔助與 Replay 機制的出玉狀態；ART 與 AT 必須分開記錄。"],
    ["Bonus","ボーナス","BIG、REG 等獎勵遊戲的統稱。機台有具名 Bonus 時，應分開記錄。"],
  ]},
  {title:"看懂數字",items:[
    ["G 數","ゲーム数","遊戲轉數。設定參考常用本 Session 實際觀測 G 作為分母，不等於坐下時機台已顯示的累積 G。"],
    ["初當率","初当り確率","第一次進入某個 CZ、AT 或 Bonus 的出現頻率，常寫成 1/X。X 越小代表平均出現越頻繁。"],
    ["小役","小役","櫻桃、西瓜、鈴等圖示組合。只有來源提供設定差且 Session 能可靠記錄時，才適合用於設定參考。"],
    ["純增","純増","AT／ART 每 1G 平均增加的枚數，是機台玩法說明，不是保證每一段都相同。"],
    ["機械割","機械割","長期理論投入與回收的比率。它不是單次遊玩的獲利保證。"],
    ["設定 1～6","設定","店家設定的機台參數。部分機率會隨設定不同，但短期樣本仍可能大幅波動。"],
  ]},
  {title:"現場常見用語",items:[
    ["高確","高確","特定抽選機會較高的狀態。只有機台有明確辨認方式時，才適合切換或記錄。"],
    ["Zone","ゾーン","特定 G 數、週期或點數附近的參考區間。來源沒有明確數據時不應自行猜測。"],
    ["天井","天井","達到特定條件後可能觸發的救濟機制。各機台條件不同，請以該機指南來源為準。"],
    ["引回","引き戻し","AT／ART 或 Bonus 結束後，在特定條件下再次回到主要狀態。"],
    ["終了畫面","終了画面","CZ、AT、ART 或 Bonus 結束時顯示的畫面；有些機台會用它提供設定示唆。"],
    ["設定示唆","設定示唆","用畫面、獎盃或演出提示設定傾向。『示唆』不是單憑一次畫面就能精確確定設定。"],
  ]},
] as const;

export default function GlossaryPage(){return<><PageHeader title="新手術語" eyebrow="Pachislot Basics"/><main className="page glossary-page"><section className="glossary-hero card"><span>60 秒入門</span><h1>先看懂常用詞，再上機。</h1><p>日文術語保留小字對照；實際按鈕仍以每台機種指南為準。</p></section>{groups.map(group=><section className="section" key={group.title}><div className="section-title"><h2>{group.title}</h2><span>{group.items.length} 個</span></div><div className="glossary-list">{group.items.map(([zh,ja,description])=><article className="card" key={ja}><h3>{zh}<small>{ja}</small></h3><p>{description}</p></article>)}</div></section>)}</main></>}
