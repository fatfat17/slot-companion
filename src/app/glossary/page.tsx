import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";

const slotGroups=[
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

const pachinkoGroups=[
  {title:"先懂基本數字",items:[
    ["回轉數","回転数","液晶畫面或資料機顯示的轉動次數。它是已發生的遊玩紀錄，不代表下一轉比較容易中。"],
    ["千圓回轉","千円スタート","每投入 ¥1,000 大約能轉幾回，是玩家用來整理本次實際打感的觀測值；短時間可能明顯波動。"],
    ["出玉","出玉","大當、RUSH 等狀態實際得到的玉數。規格上的標示值與現場實得玉數可能不同。"],
    ["持玉","持ち玉","目前手上可繼續遊玩的玉。使用持玉與重新投入現金，成本感受並不相同。"],
    ["初當","初当り","這次遊玩第一次大當，或統計上的一般大當入口。初當次數不等於 RUSH 突入次數。"],
    ["大當機率","大当り確率","規格上的抽選機率，常寫成 1/X。它是長期機率，不代表累積很多回後下一回必定當選。"],
  ]},
  {title:"大當後常見流程",items:[
    ["大當","大当り","機台抽選成立後進入的獎勵狀態；實際回合數、出玉與之後流程依機種規格而異。"],
    ["RUSH","RUSH","大當後可能進入的主要連莊／高頻遊戲狀態。突入率與持續方式必須看該機種指南。"],
    ["確變","確変","中獎機率提高的狀態。不是所有現代機種都用相同方式呈現，也不等於一定會再次大當。"],
    ["ST","ST","只在限定回轉數內維持特定抽選狀態的玩法；剩餘回數歸零後通常會結束或轉入其他狀態。"],
    ["時短","時短","縮短變動時間或提供電サポ的狀態；抽選機率是否改變要依機種規格，不能只看到時短就假設是確變。"],
    ["LT","ラッキートリガー","Lucky Trigger。達成指定條件後進入的高性能出玉狀態；條件與性能因機種不同，不代表看到相關演出就已進入。"],
    ["連莊","連チャン","短時間內連續大當的俗稱。連莊次數是已發生結果，不是下一次中獎的保證。"],
    ["繼續率","継続率","RUSH／ST 等狀態長期平均能繼續的參考比例，不代表單次一定能維持到對應次數。"],
  ]},
  {title:"看懂盤面與操作",items:[
    ["入賞口","入賞口","玉進入後可能取得賞球或觸發抽選的盤面入口；不同入口功能不同。"],
    ["ヘソ","ヘソ","通常遊戲時主要進球、啟動抽選的位置，常在盤面中央附近。"],
    ["電チュー","電チュー","電動役物入口，常在時短、ST 或 RUSH 中使用；抽選或大當分配可能與ヘソ不同。"],
    ["保留","保留","玉已進入啟動口、等待液晶變動的抽選數量。保留圖示變化通常只是演出參考，不是中獎保證。"],
    ["左打ち","左打ち","依機台指示把玉打向盤面左側，通常用於一般遊戲。"],
    ["右打ち","右打ち","依機台指示把玉打向盤面右側，常用於大當、時短、ST 或 RUSH；畫面要求時再切換。"],
    ["打止","打ち止め","暫時停止發射玉，常用於等待演出、保留已滿或避免不必要的玉耗。"],
    ["交換率","交換率","景品交換時玉數與價值的換算條件，依店家不同；App 內的遊玩紀錄不會自行假設店家交換率。"],
  ]},
] as const;

export default async function GlossaryPage({searchParams}:{searchParams:Promise<{kind?:string}>}){const{kind:requested}=await searchParams,kind=requested==="pachinko"?"pachinko":"slot",groups=kind==="pachinko"?pachinkoGroups:slotGroups;return<><PageHeader title="新手術語" eyebrow={kind==="pachinko"?"Pachinko Basics":"Pachislot Basics"}/><main className="page glossary-page"><nav className="glossary-kind-tabs" aria-label="術語種類"><Link className={kind==="slot"?"active":""} href="/glossary?kind=slot">🎰 SLOT</Link><Link className={kind==="pachinko"?"active pachinko":""} href="/glossary?kind=pachinko">🔴 柏青哥</Link></nav><section className={`glossary-hero card ${kind}`}><span>60 秒入門</span><h1>{kind==="pachinko"?"第一次打柏青哥，先懂這些詞。":"先看懂常用詞，再上機。"}</h1><p>{kind==="pachinko"?"先分清回轉、大當、RUSH 與盤面操作；所有機率與流程仍以該機種指南為準。":"日文術語保留小字對照；實際按鈕仍以每台機種指南為準。"}</p></section>{groups.map(group=><section className="section" key={group.title}><div className="section-title"><h2>{group.title}</h2><span>{group.items.length} 個</span></div><div className="glossary-list">{group.items.map(([zh,ja,description])=><article className="card" key={ja}><h3>{zh}<small>{ja}</small></h3><p>{description}</p></article>)}</div></section>)}</main></>}
