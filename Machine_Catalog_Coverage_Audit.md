# Machine Catalog Coverage Audit

Audit date：2026-08-28  
Repository baseline：`dev` @ `88812fec1736eaf4905d8f95c95aa6b1c8a13218`  
Product baseline：v0.2.6.1（手機人工複驗通過）

## 1. Executive Summary

本次只讀稽核檢查 repository 內的 Catalog、fixtures、Profile、compiler、Session、Setting Estimator、tests 與 Project Status；沒有請求任何 P-WORLD 頁面，也沒有批次建立指南。

最重要的結論：

- Catalog 實際共有 **202 筆**正式 records；**202 / 202（100.0%）**都有目前 provider 可接受的 canonical P-WORLD detail URL。
- 只有 **5 筆（2.5%）**正式 Catalog 有 fixture、runtime smoke 或手機 QA 足以列為 Confirmed；另有 **20 筆（9.9%）**可依本機名稱線索保守列為 Probable `a_type`，但仍未完成來源驗證；其餘 **177 筆（87.6%）**必須標為 Unknown／Needs Source Analysis。
- 現有七種 GuideMachineType 已證明能處理五種正式 Catalog 結構；`a_type` 目前只有 TEST DATA fixture，`generic` 是安全 fallback，不是已確認的玩法 archetype。
- **不需要為每一台機器寫專屬程式。** 應以共用 archetype、來源規則與 Session module 組合涵蓋大多數機台；只有來源結構或玩法無法由既有 archetype 表達時才需要新增共用能力。
- 最大的實際架構缺口不在 Catalog，而在 **compiler 產生的 `sessionModules` 尚未完整轉成 Session 可操作控制項**。Set、cycle、points、CZ failures、dual games、role streak 等目前主要只在指南中列出。
- Setting Estimator 有一項高優先風險：TEST DATA guide sample 中 3 個 benchmark 雖被 compiler 標為 eligible，numerator key 卻沒有對應 Session counter；它們可能永遠讀成 0。這是資料 dependency validation 問題，不代表公式本身錯誤。
- 建議下一輪只做 **18 個代表案例**，不要人工測試全部 202 台。現階段**不建議直接開始完整 Adaptive Session UI**；應先定義 module → Session control mapping 與 benchmark dependency contract。

## 2. Audit Scope 與限制

### 已檢查

- `data/machine-catalog.json`
- `data/published-machine-profiles.json`
- `src/data/machines.ts`
- Machine Guide schema、P-WORLD parser、compiler、module library、guide-to-session compatibility layer
- SessionScreen、CounterCard、Setting Estimator
- 8 個 `tests/fixtures/pworld-*.html` 與現有 regression tests
- `Slot_Companion_Project_Status.md`

### 未執行

- 沒有對 202 個 P-WORLD URL 發出請求
- 沒有建立或更新任何 browser guide cache
- 沒有修改 Catalog、parser、compiler、Session、UI 或產品資料
- 沒有用外部知識或 AI 猜測機型

因此 Probable 只表示「本機 identity metadata 有明確結構線索」，不是已完成支援；Unknown 不等於不支援，只表示目前證據不足。

## 3. Catalog Inventory

### 3.1 總覽

| 項目 | 數量 | 比例 |
|---|---:|---:|
| 正式 Catalog records | 202 | 100.0% |
| TEST DATA Catalog records | 0 | 0.0% |
| 已有 Machine Profile | 3 | 1.5% |
| Catalog-only | 199 | 98.5% |
| imported | 199 | 98.5% |
| reviewed | 3 | 1.5% |
| verified | 0 | 0.0% |
| スマスロ | 131 | 64.9% |
| パチスロ | 71 | 35.1% |

「已有 Profile」依 `src/data/machines.ts` 的 3 個 Catalog link 計算：東京喰種、からくりサーカス2、ミリオンゴッド。這個數字只表示 Profile record 存在，不表示三者全部是正式 verified gameplay data；其中 placeholder／TEST DATA 必須繼續分開理解。

### 3.2 重要欄位完整度

| 欄位 | 缺少數 | 完整率 |
|---|---:|---:|
| officialNameJa | 0 | 100.0% |
| manufacturer | 0 | 100.0% |
| machineType | 0 | 100.0% |
| introducedAt | 0 | 100.0% |
| primary sourceUrl | 0 | 100.0% |
| sourceImageUrl | 0 | 100.0% |

`sources[]` 共 205 筆 metadata，其中 202 筆是 canonical P-WORLD URL；另 3 筆是三個早期 Profile 的 `Local Machine Profile` provenance，URL 為空。它們不是 Catalog primary source 缺失。

### 3.3 Manufacturer 分布

| Manufacturer | 數量 | 比例 |
|---|---:|---:|
| サミー | 18 | 8.9% |
| コナミアミューズメント | 11 | 5.4% |
| パイオニア | 10 | 5.0% |
| 北電子 | 10 | 5.0% |
| SANKYO | 9 | 4.5% |
| 京楽 | 8 | 4.0% |
| オーイズミ | 7 | 3.5% |
| ミズホ | 7 | 3.5% |
| 大都技研 | 7 | 3.5% |
| オリンピアエステート | 6 | 3.0% |
| セブンリーグ | 6 | 3.0% |
| ネット | 6 | 3.0% |
| エレコ | 5 | 2.5% |
| オリンピア | 5 | 2.5% |
| パオン・ディーピー | 5 | 2.5% |
| ビスティ | 5 | 2.5% |
| ユニバーサルブロス | 5 | 2.5% |
| アデリオン | 4 | 2.0% |
| アムテックス | 4 | 2.0% |
| エンターライズ | 4 | 2.0% |
| サボハニ | 4 | 2.0% |
| サンスリー | 4 | 2.0% |
| スパイキー | 4 | 2.0% |
| エキサイト | 3 | 1.5% |
| オッケー. | 3 | 1.5% |
| カルミナ | 3 | 1.5% |
| 山佐 | 3 | 1.5% |
| 山佐ネクスト | 3 | 1.5% |
| Daiichi | 2 | 1.0% |
| DAXEL | 2 | 1.0% |
| JFJ | 2 | 1.0% |
| アクロス | 2 | 1.0% |
| ニューギン | 2 | 1.0% |
| ベルコ | 2 | 1.0% |
| ヤーマ | 2 | 1.0% |
| レオスター | 2 | 1.0% |
| 岡崎産業 | 2 | 1.0% |
| 清龍ゲームジャパン | 2 | 1.0% |
| 藤商事 | 2 | 1.0% |
| 平和 | 2 | 1.0% |
| D-light | 1 | 0.5% |
| アイドル | 1 | 0.5% |
| エフ | 1 | 0.5% |
| オレンジ | 1 | 0.5% |
| バルテック | 1 | 0.5% |
| ボーダー | 1 | 0.5% |
| メーシー | 1 | 0.5% |
| 三洋物産 | 1 | 0.5% |
| 新日テクノロジー | 1 | 0.5% |

### 3.4 Duplicate 檢查

- 依目前 `normalizeCatalogName` 對 officialNameJa 正規化後：**0 組重複**。
- 相同 primary sourceUrl 被多筆 Catalog 使用：**0 組**。
- 這只能證明目前 normalization 規則下沒有重複；不同名稱但實際同一筐體／版本仍可能需要來源頁或人工 identity review。

## 4. Source URL Coverage

| 項目 | 數量 | 比例 |
|---|---:|---:|
| canonical P-WORLD detail URL | 202 | 100.0% |
| 缺少 primary sourceUrl | 0 | 0.0% |
| primary sourceUrl 不符合 provider 規則 | 0 | 0.0% |
| 重複 primary sourceUrl | 0 | 0.0% |

Provider 規則為 `https://www.p-world.co.jp/machine/database/{number}`（允許省略 `www` 與尾端 `/`）。URL coverage 很好，但 URL 存在不代表頁面內容一定可被 parser 完整取得或分類；本次禁止批次請求，因此 197 筆未驗證 Catalog 不應被宣稱已可完整產生指南。

## 5. Confirmed／Probable／Unknown 分類

### 5.1 整體

| 證據等級 | 正式 Catalog 數量 | 比例 |
|---|---:|---:|
| Confirmed | 5 | 2.5% |
| Probable | 20 | 9.9% |
| Unknown／Needs Source Analysis | 177 | 87.6% |
| 合計 | 202 | 100.0% |

### 5.2 Confirmed 正式 Catalog

| P-WORLD ID | Catalog | GuideMachineType | 證據 |
|---:|---|---|---|
| 10530 | Lパチスロ 喰霊‐零‐Re | `bonus_art` | fixture、runtime smoke、手機 QA |
| 10473 | L戦国乙女5 業火を穿つ宿焔の双刃 | `cycle_point_at` | fixture、runtime smoke、手機 QA |
| 10508 | ヤバチバ | `bonus_loop` | fixture、runtime smoke |
| 10485 | L からくりサーカス2 | `multi_zone_at` | fixture、runtime smoke |
| 10424 | スマスロ ミリオンゴッド－神々の軌跡－ | `set_based_at` | fixture、runtime smoke、手機 QA |

P-WORLD 10513 的 `a_type` 僅有最小 TEST DATA fixture；本機 Catalog 沒有 10513 record，因此不能計入 202 筆正式 Catalog 的 Confirmed 數。

### 5.3 Probable（全部為推測）

以下 20 筆只有名稱中出現 A-SLOT、A-LIVE、ジャグラー、ハナハナ、Bonus Trigger／BT 等直接結構線索，暫列 Probable `a_type`。這不是來源驗證，也不能算已完成支援。

| Catalog ID | officialNameJa | P-WORLD ID |
|---|---|---:|
| machine-1dwft26 | ドラゴンハナハナ~閃光~ | 9980 |
| machine-nzyfox | スマート沖スロ ドラゴンハナハナ~閃光~ | 9998 |
| machine-1sbpobu | ジャグラーガールズSS | 10009 |
| machine-14moq6f | アオハル♪操 A‐LIVE | 10049 |
| machine-gw74kg | ミスタージャグラー | 10056 |
| machine-73a4j7 | A‐SLOT+ この素晴らしい世界に祝福を! | 10081 |
| machine-5cdl9t | ウルトラミラクルジャグラー | 10145 |
| machine-febfi2 | スマート沖スロ スターハナハナ | 10162 |
| machine-3q0io6 | A‐SLOT+ ディスクアップ ULTRAREMIX | 10164 |
| machine-b91mt2 | スターハナハナ‐30 | 10143 |
| machine-1069y1a | スマスロニューパルサーBT | 10254 |
| machine-gb14me | マジカルハロウィン ボーナストリガー | 10318 |
| machine-8fytrk | クレアの秘宝伝 ~はじまりの扉と太陽の石~ ボーナストリガーver. | 10325 |
| machine-sgt9wz | ネオアイムジャグラーEX | 10269 |
| machine-mf1b3s | SHAKE BONUS TRIGGER | 10361 |
| machine-cmokk2 | L不二子BT | 10383 |
| machine-1o9wfds | スマート沖スロ ニューキングハナハナV | 10374 |
| machine-o7hm8g | ニューキングハナハナV‐30 | 10375 |
| machine-wj7icu | A‐SLOT+ 異世界かるてっとBT | 10425 |
| machine-iat6jl | スマスロケロット5BT | 10479 |

### 5.4 Unknown

其餘 177 筆只靠 Catalog identity metadata 無法可靠區分 AT、ART、擬似 Bonus loop、多 CZ、週期／點數、Set 管理或其他結構。完整清單見 Appendix。

## 6. GuideMachineType Coverage

| GuideMachineType | Confirmed Catalog | Probable Catalog | 本機證據與限制 |
|---|---:|---:|---|
| `a_type` | 0 | 20 | 10513 只有 TEST DATA fixture；20 筆依名稱線索推測 |
| `bonus_art` | 1 | 0 | 10530 已 fixture、runtime、手機驗收 |
| `cycle_point_at` | 1 | 0 | 10473 已 fixture、runtime、手機驗收 |
| `bonus_loop` | 1 | 0 | 10508 已 fixture、runtime |
| `multi_zone_at` | 1 | 0 | 10485 已 fixture、runtime |
| `set_based_at` | 1 | 0 | 10424 已 fixture、runtime、手機驗收 |
| `generic` | 0 | 0 | 安全 fallback；不代表玩法已被理解 |

### 為什麼會落入 `generic`

compiler 只有在正文出現特定且組合完整的 deterministic signature 時才選擇六種具體 archetype。例如 A-type、real Bonus + ART、週期 + 點數 + AT、多個具名 CZ、擬似 Bonus loop、Set 管理等。來源資料不足、用詞不同、或混合結構沒有命中規則時就回 `generic`。

### 七種類型可能不足的本機信號

- 20 筆名稱帶 BT／Bonus Trigger／A-SLOT／ジャグラー／ハナハナ，可能需要把「純 Bonus、Bonus Trigger、技術介入」的差異建模；目前只能先列 Probable。
- 多筆名稱含 `沖スロ`、`30Φ`、`沖ドキ`、`南国育ち`，可能具有連莊／區間型玩法，但本機 identity metadata 無法證明是否都等同 `bonus_loop`。
- 多筆名稱含 `CUSTOM EDITION`、`REVIVAL`、`V-30`、`II` 等版本資訊；identity 已保護版本差異，但玩法 archetype 是否相同仍需來源頁分析。
- `generic` 目前混合「真的通用」與「規則尚未辨識」兩種情況。若未來大量來源落入 generic，應先分析 signature 分布，再決定是否新增共用 archetype。

## 7. Session Module Coverage

### 7.1 Module library 與 compiler 使用

| Module | compiler 產生條件／已知機型 | Guide UI | Session 實際操作 | 驗收狀態 |
|---|---|---|---|---|
| total games | 所有非 no-data guide | 列出 | 透過 primary `dataGame` delta 間接累計 | 手機流程已驗收 |
| normal games | 所有非 no-data guide | 列出 | 只在固定 `normal` 狀態更新 G 時間接累計 | 基本流程已驗收，跨狀態精度未全面驗證 |
| BIG／REG／Bonus | 有可辨識 Bonus event | 列出 | 具名 Bonus 會成為 Smart Counter；沒有統一 Bonus 控制項 | 10530 具名事件已驗收 |
| named CZ | 結構化具名 CZ | 列出名稱 | 具名 CZ Smart Counter + 固定 generic CZ 按鈕並存 | 10473／10530 已驗收；有雙重記錄風險 |
| AT | compiler 有 AT state | 列出 | 固定 AT +1 可操作；具名 AT 另有 event Counter | 10473／10424 已驗收部分流程 |
| ART | compiler 有 ART state | 列出 | 無固定 ART 狀態／次數；只能透過具名 event Counter | 10530 事件已驗收，ART state 未完整呈現 |
| Set | `set_based_at` | 列出 | 沒有由 module 生成的 Set 控制項 | GOD 僅確認指南列出，Session 未驗收 |
| cycle | `cycle_point_at` | 列出 | 沒有由 module 生成的週期控制項 | 只存在 compiler output |
| points | `cycle_point_at` | 列出 | 沒有由 module 生成的點數控制項 | 只存在 compiler output |
| CZ failures | `cycle_point_at` | 列出 | 沒有由 module 生成的失敗控制項 | 只存在 compiler output |
| dual games | 實 G／液晶 G signature | 列出 | guide snapshot 永遠只建立 `dataGame` tracker | 只存在 compiler output |
| role／symbol streak | `set_based_at` | 列出 | 沒有由 module 生成的連續計數控制項 | GOD 僅確認指南列出 |
| ending evidence | 可靠終了畫面／示唆 table | 列出 | compiler 建立 `choice` Counter，但未提供 choices，實際無選項可點 | 指南顯示已驗收；操作能力未完成 |
| custom event | module library 定義 | 未由 compiler 自動產生 | 沒有 guide module 對應 UI | 僅資料模型 |

### 7.2 分層結論

- **資料架構已支援：**14 種 SessionModuleKind 全部存在 type 與 label。
- **compiler 已產生：**fixtures 已覆蓋除 `custom_event` 外的 13 種；`dual_games`、role streak 等可被選出。
- **Guide UI 已呈現：**所有產生的 module 會以文字列表顯示。
- **Session UI 可直接操作：**dataGame／observed games、固定 CZ、固定 AT，以及由 `smartCounters` 產生的具名 event。
- **尚未形成 module-driven control：**Set、cycle、points、CZ failures、dual games、role streak、ART 固定狀態、可選的 ending evidence、custom event。

### 7.3 語意重疊與固定狀態列風險

- 固定 CZ 與具名 CZ Counter 可能被同一次事件重複記錄。
- 固定 AT 與具名 AT event 也可能重複；ART 則被固定 UI 當成 AT／缺少獨立狀態。
- `GameState` 只有 `normal / prelude / cz / at / special`，沒有 `art`、`bonus`、`set`、`cycle`。因此 observedNormalGame 的狀態分母可能在 ART／Bonus 機型上依賴使用者手動選擇不完全相符的狀態。
- `big_reg_bonus` 是合併 module，但 compiler events 可能是多個具名 Bonus；資料彙總規則尚未定義。
- Guide 的 `sessionModules` 沒有被 `machineFromGuide` 保存到 Profile snapshot；目前 Session 主要消費 `smartCounters` 和固定 tracker，這是「compiler 已產生」與「可使用」之間的主要斷點。

## 8. Setting Estimator Coverage

### 8.1 Profile 資料

| 資料集合 | 含完整設定 1～6 的 Profile | 完整 benchmarks | numerator／relationship 可記錄 | denominator 可觀測 | 實際可投入 estimator |
|---|---:|---:|---:|---:|---:|
| 3 個 base Profile | 3 | 11 | 11 | 11 | 11（全部為 TEST DATA） |
| 東京喰種 published v1 | 1 | 2 | 2 | 2 | 2（real、非 TEST DATA） |

base Profile 的 11 個 benchmark 全部是明確標示的 **TEST DATA**：東京喰種 4、からくり2 4、GOD 3。它們只驗證計算流程，不能當成真實機率。東京喰種 published v1 另有 2 個 real rate benchmark（AT／CZ 初當、denominator=`observedNormalGame`），由固定 AT／CZ 與 Session observed normal G 支援。

### 8.2 Guide fixtures

8 個 Machine Guide fixtures 中，2 個含完整設定 1～6 table：

- `pworld-machine-guide-minimal.html`：4 個完整 metric；compiler 將 BIG、ART、弱チェリー 3 個標為 estimator eligible，出玉率因沒有 denominator 而只展示。
- `pworld-official-scope-pollution.html`：1 個完整 AT metric，denominator=`normal_games`，可由固定 AT 與 observedNormalGame 記錄。

合計有 **5 個完整 metric**，其中 compiler 認定 numerator + denominator 完整並啟用 4 個；但依目前 Session 實際控制項重新核對，只有 `at` 這 1 個能直接記錄。其餘 3 個的 benchmark numerator key 分別是 `bigBonus`、`art`、`guide-弱チェリー`，沒有對應的 Session counter key；compiler 雖保存了 event/state identity，benchmark 卻沒有引用該 identity。

因此：

- 完整設定值：5 / 5。
- compiler 判定有 numerator：4 / 5。
- compiler 判定有 denominator：4 / 5。
- 目前 Session 真正可記錄：1 / 5。
- 只能展示、不可安全推測：至少 4 / 5；其中 1 個是正確停用的出玉率，另 3 個是應由 dependency validation 擋下但目前仍啟用。

### 8.3 Denominator 支援

- `observedTotalGame`：Session 可由 primary tracker delta 累計。
- `observedNormalGame`：Session 可累計，但只認固定 `normal` state；ART／Bonus 等缺失狀態可能影響精度。
- `trackerDelta`：資料模型與既有 Profile 支援；guide snapshot 目前只有 `dataGame`。
- trial／outcome：既有 Profile 支援，Machine Guide compiler 目前不建立 relationship。
- `bonus_interval_games`、`cycle_arrivals`、`point_arrivals`、`cz_trials`、`at_art_ends`、`specific_trials`：GuideDenominator type 已存在，但 compiler-to-Session 尚未提供完整 UI／relationship mapping。

目前未發現把 denominator 為 null 的 metric 啟用；真正問題是 numerator key 與 Session control 未綁定。沒有證據顯示現有 rate 把 total games 與 normal games互換，但固定狀態模型不足，仍可能造成 observedNormalGame 的測量語意不精確。

## 9. Automated Consistency Findings

### 9.1 通過

- A-type fixture 不產生 CZ／AT／ART module 或 state。
- Bonus + ART fixture 產生 ART、不錯產 AT。
- Set-based AT fixture 有 Set 與 role streak module。
- cycle／point fixture 有 cycle、points、CZ failures 與 AT。
- 多 CZ fixture 產生至少兩個具名 CZ，而不是只有 generic CZ。
- 戰國乙女句子碎片不進 quickStart、events、smartCounters。
- 掲示板、玩家留言、評論型文字與投稿日期不進 guide。
- 重複頁名、破碎表格與 duplicate rows 會被排除／去重。
- 可靠 AT、小役、特殊示唆 table 存在時，`missingSections` 不再誤標缺失。
- Catalog normalized identity duplicate：0；primary source URL duplicate：0。
- denominator 為 null 的 estimator metric 不會被啟用。

### 9.2 發現的問題

1. **sessionModules 沒有進入 Session snapshot。** `machineFromGuide` 只轉 smartCounters、固定 dataGame tracker、initial hit metrics 與 benchmarks。
2. **3 個 guide benchmark numerator 不可操作。** `bigBonus`、`art`、`guide-弱チェリー` 被標為 eligible，但 Session 沒有同名 counter。
3. **ending evidence Counter 沒有 choices。** compiler 建立 `type: choice`，但未建立 choices array，CounterCard 因此不會顯示可選項。
4. **ART／Bonus 缺少固定 GameState。** 固定狀態列可能讓 observedNormalGame 在 bonus_art 等機型上的狀態邊界不精確。
5. **named CZ／AT 與固定 CZ／AT 重疊。** 使用者可能對同一次進入操作兩個控制項。
6. `pworld-machine-guide-minimal.html` 位於 test fixture 目錄且 Status 將 fixtures 定義為 TEST DATA，但檔案本身不像其他 7 個 fixture 一樣有清楚的 `TEST DATA` header comment；文件層標示不一致。

### 9.3 無法從本機確認

- 177 筆 Unknown Catalog 的真實玩法分類與頁面 DOM 相容性。
- 20 筆 Probable A-type 是否全部符合相同 Session 需求。
- P-WORLD 頁面未來欄位／DOM 變化。
- 各機種是否需要 ST、差枚、枚數、引き戻し、天國／模式、周期進度或其他尚未建模的共用 module。
- 除已 smoke／手機 QA 案例外，其他 Catalog 的 guide completeness 與 estimator safety。

## 10. Representative Test Matrix

建議 **18 個案例**：6 個既有結構基準、6 個 Probable A／BT、6 個 Unknown 高風險。這是後續測試建議，不是本次已執行工作。

### 10.1 既有結構基準（6）

| P-WORLD ID | 案例 | 目的 |
|---:|---|---|
| 10530 | 喰霊‐零‐Re | Bonus + ART、具名 CZ／ART／Bonus |
| 10473 | 戰國乙女5 | cycle、points、CZ failures、AT、ending evidence |
| 10513 | A-type TEST DATA fixture | A-type 不得產生 CZ／AT／ART；尚無 Catalog runtime |
| 10508 | ヤバチバ | 擬似 Bonus loop |
| 10485 | からくりサーカス2 | 多 CZ、AT、dual games |
| 10424 | ミリオンゴッド | Set AT、role／symbol streak、pollution boundary |

### 10.2 Probable A／BT（6）

| P-WORLD ID | Catalog | 風險／目的 |
|---:|---|---|
| 10009 | ジャグラーガールズSS | 傳統 Bonus 型名稱線索 |
| 9998 | スマート沖スロ ドラゴンハナハナ~閃光~ | Smart + 沖スロ + ハナハナ交叉結構 |
| 10164 | A‐SLOT+ ディスクアップ ULTRAREMIX | A-SLOT + 技術介入可能性需來源確認 |
| 10254 | スマスロニューパルサーBT | Smart Slot + BT |
| 10318 | マジカルハロウィン ボーナストリガー | IP 機種 + Bonus Trigger |
| 10383 | L不二子BT | 最短 BT 名稱與頁面結構 |

### 10.3 Unknown 高風險（6）

| P-WORLD ID | Catalog | 為何優先 |
|---:|---|---|
| 10207 | L 東京喰種 | 已有 published Profile，可比對 guide 與 Profile schema |
| 10516 | スマスロ とある魔術の禁書目録2 | identity 手機 QA 已通過，但 guide archetype 未分析 |
| 10446 | スマスロ ビッグドリーム THE GOLDEN PUSHER | 英日 alias 已處理，玩法未知 |
| 10368 | スマスロ 沖ドキ!DUO アンコール | 可能需要 bonus-loop／mode 類共用能力，必須來源確認 |
| 10471 | 戦国コレクション6 | 續作／週期／AT 結構不可由名稱猜測 |
| 10531 | スマスロ ストリートファイター6 | 版本 token 清楚但玩法與 counter 需求未知 |

## 11. Architecture Gaps

按影響排序：

1. 建立 `sessionModules` → Session snapshot/control 的單一 mapping，避免 compiler output 只停在指南文字。
2. Publish／guide build 前驗證每個 benchmark 的 numerator counter、denominator metric、trial relationship 都能被 Session 實際記錄。
3. 將 `art`、`bonus` 與可能的 set/cycle 狀態納入狀態模型，或明確定義它們是否只作事件而非 state。
4. 解決 fixed CZ／AT 與 named event 的 ownership，避免重複計數。
5. 為 ending evidence 建立可操作的 choice/photo schema；不能只產生空 choice Counter。
6. 用來源分析結果決定是否需要 `bonus_trigger`、沖スロ／mode-loop 或其他共用 archetype；不要先按名稱寫死。
7. 讓 fixture 的 TEST DATA 標示一致且可自動檢查。

## 12. Recommended Next Steps

### 建議先做

1. 對 18 個代表案例做受控來源分析；每次只取得必要頁面，不做 202 台批次。
2. 先補 module/control capability matrix 與 benchmark dependency validator 的設計規格。
3. 用代表案例統計 `generic` fallback 的實際原因，再決定是否新增 archetype。
4. 將 estimator「compiler eligible」與「Session recordable」拆成可驗證條件。

### 是否直接開始 Adaptive Session UI

**不建議直接全面開始。** 現有 UI 已安全支援 G、固定 CZ／AT 與 event Counter，但 module semantics、重複計數與 estimator dependency 尚未收斂。較安全的順序是先定義共用 mapping，再以 18 個代表案例驗證，之後才做 Adaptive Session UI；否則 UI 可能把 compiler 的宣告誤當成已可操作能力。

### 哪些可由資料規則解決

- Catalog identity 完整度、URL validity、duplicate detection
- section completeness
- event sentence-fragment filtering
- benchmark numerator／denominator dependency validation
- fixture TEST DATA 標示
- archetype signature 規則（前提是有來源證據）

### 哪些真正需要程式修改

- module-driven Session controls
- ART／Bonus／Set／cycle 等狀態與觀測行為
- ending evidence choices／photo interaction
- named 與 fixed CZ／AT 的去重 ownership
- guide benchmark 對實際 Session counter key 的綁定

## 13. Appendix：需要來源頁分析的 Catalog 清單

下列 177 筆全部為 Unknown／Needs Source Analysis。本表只列本機 identity 與 canonical source，不做玩法推測。

| Catalog ID | officialNameJa | Manufacturer | P-WORLD ID |
|---|---|---|---:|
| tokyo-ghoul | L 東京喰種 | スパイキー | 10207 |
| machine-frx2z3 | パチスロ武装神姫 | コナミアミューズメント | 9922 |
| machine-10f8jzp | スマスロ バイオハザード ヴィレッジ | アデリオン | 9932 |
| machine-1nc39ii | Lパチスロ マクロスフロンティア4 | SANKYO | 9935 |
| machine-1gnkhdb | 吉宗RISING | サボハニ | 9958 |
| machine-piq3u8 | L 仮面ライダー 7RIDERS | 京楽 | 9962 |
| machine-62att3 | スマスロ コードギアス 反逆のルルーシュ/復活のルルーシュ | サミー | 9952 |
| machine-qz4s3r | Lパチスロガールズ&パンツァー 最終章 | 平和 | 9959 |
| machine-1p42aqx | Lストライクウィッチーズ2 | サンスリー | 9961 |
| machine-3p0pbi | Sky Love | カルミナ | 9963 |
| machine-13hhdh2 | GI優駿倶楽部黄金 | コナミアミューズメント | 9964 |
| machine-1jzku46 | ワードオブライツII | エレコ | 9967 |
| machine-15bcsmi | スロット 冴えない彼女の育てかた | サボハニ | 9978 |
| machine-hy8cd1 | L ゴジラ対エヴァンゲリオン | ビスティ | 9990 |
| machine-7hbf2b | SLOT忍者じゃじゃ丸くん | エレコ | 9991 |
| machine-7bn1a1 | 忍魂参 ~奥義皆伝ノ章~ | 大都技研 | 10008 |
| machine-19f1y81 | パチスロ ブラックミクちゃん | DAXEL | 10027 |
| machine-wmlmat | パチスロ ガメラ2 | サミー | 9972 |
| machine-10ab30o | L南国育ち | オリンピアエステート | 9983 |
| machine-1g6pgxy | スマスロキングパルサー | セブンリーグ | 9985 |
| machine-1ncdvxk | キングクリエーター30 | 北電子 | 9995 |
| machine-ntzq6k | チバリヨ2 | ネット | 10014 |
| machine-8d71hn | 押忍!番長4 | 大都技研 | 10023 |
| machine-vrfegw | パチスロ ダンジョンに出会いを求めるのは間違っているだろうか2 | 北電子 | 10033 |
| machine-ziy7kp | パチスロ金のかぼちゃ | バルテック | 10004 |
| machine-bxuip3 | スマスロ ゴールデンカムイ | サミー | 9987 |
| machine-1k4194m | Lパチスロうる星やつら | エキサイト | 10007 |
| machine-1m0hi5t | スマスロ ストライク・ザ・ブラッド | エンターライズ | 10017 |
| machine-y5b38n | スマスロ交響詩篇エウレカセブン4 HI‐EVOLUTION | サミー | 10011 |
| machine-1kk8hwi | ニューパルサーSP4 with 太鼓の達人 | セブンリーグ | 10019 |
| machine-km65ri | 沖シーサー‐30 | ヤーマ | 10025 |
| machine-16p2rdf | L ウルトラマンティガ | オッケー. | 10041 |
| machine-df95d7 | Lパチスロ 炎炎ノ消防隊 | SANKYO | 10042 |
| machine-1kuq0cl | スマスロ痛いのは嫌なので防御力に極振りしたいと思います。 | サミー | 10036 |
| machine-1apjgj6 | L ToLOVEるダークネス | オリンピアエステート | 10038 |
| machine-18brrfe | L聖闘士星矢 海皇覚醒 CUSTOM EDITION | サンスリー | 10039 |
| machine-1tdqysq | スマスロ ストリートファイターV 挑戦者の道 | エンターライズ | 10052 |
| machine-pyp07j | 賞金首Angel | ネット | 10043 |
| machine-8krzs7 | スロット ゾンビランドサガ | 大都技研 | 10072 |
| machine-lbz92e | スマスロ ゴッドイーター リザレクション | セブンリーグ | 10086 |
| machine-6c64p5 | スマスロ真・北斗無双 | サミー | 10044 |
| machine-89ppcl | Lパチスロ戦姫絶唱シンフォギア 正義の歌 | SANKYO | 10050 |
| machine-m9yjg | Sバハマ30 | アムテックス | 10053 |
| machine-nehnec | L アカメが斬る! 2 | 新日テクノロジー | 10067 |
| machine-mplk5i | S ご~やちゃんぷる~ 25φ | 京楽 | 10077 |
| machine-1rltpkc | S ご~やちゃんぷる~ 30φ | 京楽 | 10078 |
| machine-12i4zri | 沖ドキ!BLACK | ミズホ | 10051 |
| machine-9bxqb3 | スマスロ トロピカーナ | ミズホ | 10064 |
| machine-4pu7ys | L D4DJ Pachi‐Slot Mix | 京楽 | 10070 |
| machine-1i5rlw3 | スマスロ ゲゲゲの鬼太郎 覚醒 | JFJ | 10071 |
| machine-x0vrd8 | スマスロワンパンマン | エキサイト | 10090 |
| machine-9pj2ap | パチスロハイパーラッシュ | セブンリーグ | 10107 |
| machine-1i5uwss | パチスロL黄門ちゃま天 | オリンピア | 10076 |
| machine-1eupcgp | Lパチスロ閃乱カグラ2 SHINOVI MASTER | オーイズミ | 10079 |
| machine-1s9yz9c | パチスロ かぐや様は告らせたい | SANKYO | 10091 |
| machine-tzafw7 | スロット Re:ゼロから始める異世界生活 season2 | パオン・ディーピー | 10121 |
| machine-nw6oah | 今日から俺は!! パチスロ編 | コナミアミューズメント | 10094 |
| machine-e2szpq | スマスロ頭文字D 2nd | サミー | 10097 |
| machine-1igix9r | スマスロ 鬼武者3 | アデリオン | 10104 |
| machine-12gleei | L 真・一騎当千 | Daiichi | 10116 |
| machine-u52bse | トリプルクラウンフォーユー | 清龍ゲームジャパン | 10129 |
| machine-pca3yl | スマート沖スロ 超華祭 | パイオニア | 10102 |
| machine-ff7y9b | Lダブルアタック2 with OZS‐1000&RAPHAEL | オーイズミ | 10109 |
| machine-19f9mt6 | スマスロ モンスターハンターライズ | アデリオン | 10138 |
| machine-1ysw5av | Lバンドリ! | オリンピアエステート | 10106 |
| machine-1fpccn7 | L 新・必殺仕置人 回胴 CRASH SPEC | 京楽 | 10113 |
| machine-50xgj4 | Lパチスロ ダンベル何キロ持てる? | SANKYO | 10141 |
| machine-1etfu6o | Lスーパービンゴネオ | ベルコ | 10142 |
| machine-9bisnd | スマスロ 一方通行 とある魔術の禁書目録 | オレンジ | 10147 |
| machine-u0zzj1 | 桃太郎電鉄 ~パチスロも定番!~ | コナミアミューズメント | 10128 |
| machine-1mokjdw | 沖ドキ!ゴージャス 25Φ | ミズホ | 10136 |
| machine-sjomtm | 沖ドキ!ゴージャス 30Φ | エレコ | 10137 |
| machine-ccn71k | スマスロ 聖戦士ダンバイン | サミー | 10146 |
| machine-1l3dw3t | Lルパン三世 大航海者の秘宝 | 平和 | 10157 |
| machine-pa662a | L 犬夜叉2 | エフ | 10160 |
| machine-1xbagxv | 七つの魔剣が支配する | コナミアミューズメント | 10177 |
| machine-1m3odbh | L にゃんこ大戦争 超神速 | 京楽 | 10186 |
| machine-1ivp4lf | L島娘 | オリンピア | 10190 |
| machine-pf2bkc | Lパチスロ シン・エヴァンゲリオン | ビスティ | 10196 |
| machine-1k9ld03 | チバリヨ2プラス | ネット | 10180 |
| machine-1k59wrv | L サラリーマン金太郎 | エキサイト | 10187 |
| machine-1dnl4b | スマスロスーパーブラックジャック | セブンリーグ | 10174 |
| machine-meg4ep | Lパチスロ ありふれた職業で世界最強 | SANKYO | 10176 |
| machine-1kavfd0 | スマスロ シャーマンキング | エレコ | 10188 |
| machine-31t1rk | L少女☆歌劇 レヴュースタァライト ‐The SLOT‐ | オーイズミ | 10169 |
| machine-leu2pp | 回胴黙示録カイジ 狂宴 | サミー | 10198 |
| machine-1dtsu89 | Sister Quest | カルミナ | 10209 |
| machine-1ffjppy | スマスロ バイオハザード5 | エンターライズ | 10217 |
| machine-1qy630y | L 仮面ライダー電王 | 京楽 | 10220 |
| machine-i2mmfm | てぃだどんどん | パオン・ディーピー | 10226 |
| machine-cx7j4m | スマスロ アイドルマスター ミリオンライブ! ネクストプロローグ | 山佐 | 10216 |
| machine-b4c64h | L麻雀物語 | オリンピアエステート | 10234 |
| machine-6o2sw9 | 吉宗 | サボハニ | 10242 |
| machine-18k5odg | スマスロ マギアレコード 魔法少女まどか☆マギカ外伝 | ミズホ | 10211 |
| machine-pogkjl | スマート沖スロ アメイジングライブ | パイオニア | 10215 |
| machine-19jc5cm | Lうしおととら白面決戦VH | Daiichi | 10236 |
| machine-1gv9h14 | Lゴジラ | ニューギン | 10239 |
| machine-ldterl | L ToLOVEるダークネス TRANCE ver.8.7 | オリンピアエステート | 10259 |
| machine-1vgri0k | 花笠 | ネット | 10267 |
| machine-nuk9qf | スマスロ 緑ドン VIVA!情熱南米編 REVIVAL | ユニバーサルブロス | 10224 |
| machine-lx78sx | スマスロ ようこそ実力至上主義の教室へ | DAXEL | 10232 |
| machine-1leimdy | Lパチスロ 機動戦士ガンダムSEED | ビスティ | 10255 |
| machine-vn2obk | L 絶対衝激~PLATONIC HEART~ | スパイキー | 10290 |
| machine-8mb13w | LBパチスロ1000ちゃんA | オーイズミ | 10247 |
| machine-dfm53w | 翔べ!ハーレムエース | ネット | 10250 |
| machine-1q3oxiw | スマスロ ギルティクラウン2 | アクロス | 10251 |
| machine-1mt7owq | LBジャックポット | ヤーマ | 10258 |
| machine-1jurstr | LBプレミアムうまい棒 | オリンピアエステート | 10261 |
| machine-fx6x6n | L ULTRAMAN | オッケー. | 10271 |
| machine-vzo4qw | いざ!番長 | サボハニ | 10275 |
| machine-1sk6ww | スマスロ デビル メイ クライ5 スタイリッシュトライブ | アデリオン | 10277 |
| machine-1gmms02 | ハイビリターン‐30 | パイオニア | 10265 |
| machine-1rmoqbd | アレックス ブライト | ユニバーサルブロス | 10266 |
| machine-qhb575 | わたしの幸せな結婚 | コナミアミューズメント | 10270 |
| machine-1phlsii | LBトリプルクラウン | 岡崎産業 | 10299 |
| machine-1kf17n | LBパチスロ ヱヴァンゲリヲン ~約束の扉~ | ビスティ | 10301 |
| machine-avmbfs | パチスロなめ猫~液晶ないけどなめんじゃねぇ~ | ボーダー | 10283 |
| machine-3wt2dr | LBマタドールIII | 北電子 | 10287 |
| machine-ua56r5 | L咲‐Saki‐ 頂上決戦 | 三洋物産 | 10297 |
| machine-1fu5qjj | パチスロ 転生したら剣でした | コナミアミューズメント | 10308 |
| machine-1q0ieik | L アズールレーン THE ANIMATION | 京楽 | 10312 |
| machine-nktcd6 | L ダーリン・イン・ザ・フランキス | スパイキー | 10319 |
| machine-119b0xp | SLOTドルアーガの塔 | ミズホ | 10306 |
| machine-v47drd | スマスロ ドルアーガの塔 | ミズホ | 10307 |
| machine-1eqhyef | スマスロ 東京リベンジャーズ | サミー | 10313 |
| machine-1jq3j5y | L 荒野のコトブキ飛行隊 | スパイキー | 10360 |
| machine-1dpldt7 | スマスロ バベル | ユニバーサルブロス | 10315 |
| machine-1j6090o | L主役は銭形5 | オリンピア | 10339 |
| machine-1vwq8m9 | スマスロ 新鬼武者3 | レオスター | 10349 |
| machine-l3rzde | スマスロネオプラネット | セブンリーグ | 10340 |
| machine-5f0b6m | Lパチスロ 革命機ヴァルヴレイヴ2 | SANKYO | 10352 |
| machine-zcb8wm | スマスロ とある科学の超電磁砲2 | 藤商事 | 10354 |
| machine-1797ilb | L 絶対衝激IV | アイドル | 10376 |
| machine-wkwdec | スマスロ 沖ドキ!DUO アンコール | メーシー | 10368 |
| machine-g5wiw9 | スマスロ 秘宝伝 | パオン・ディーピー | 10390 |
| machine-1ko382b | L 無職転生 ~異世界行ったら本気だす~ | ニューギン | 10395 |
| machine-b3b80c | 銀河英雄伝説 Die Neue These | コナミアミューズメント | 10355 |
| machine-1c9y77e | スマスロ 化物語 | サミー | 10358 |
| machine-1f7miq | プリズムナナ | カルミナ | 10372 |
| machine-gwc4fx | バーニングエクスプレス | 北電子 | 10351 |
| machine-1cr991t | スマスロ 北斗の拳 転生の章2 | サミー | 10370 |
| machine-7hnuaq | スマスロ鉄拳6 | 山佐 | 10379 |
| machine-1rv6znp | Lパチスロうみねこのなく頃に2 | オーイズミ | 10387 |
| machine-ms59p9 | スマスロ ハナビ | アクロス | 10391 |
| machine-1mo5wkr | スマスロ 攻殻機動隊 | サミー | 10392 |
| machine-1ou9a2x | L範馬刃牙 | オリンピア | 10401 |
| machine-ceplo3 | スマスロ ゴブリンスレイヤーII | JFJ | 10414 |
| machine-103um1n | Lパチスロ 炎炎ノ消防隊2 | SANKYO | 10415 |
| machine-5ilch3 | スマスロ 甲鉄城のカバネリ 海門(うなと)決戦 | サミー | 10399 |
| machine-4ino9j | スマスロ サンダーV | エレコ | 10405 |
| machine-aauqyz | アニマルスロットドッチ | 北電子 | 10427 |
| machine-7znmde | Lパチスロ 機動戦士ガンダムユニコーン 覚醒DRIVE | ビスティ | 10468 |
| machine-lw8cs | Lアクダマドライブ | サンスリー | 10418 |
| machine-11ox7p7 | スマスロヨルムンガンド | 山佐ネクスト | 10430 |
| machine-41cxo8 | L虚構推理 | D-light | 10436 |
| machine-oknqw7 | 真打 吉宗 | 大都技研 | 10448 |
| machine-qdealg | LBトリプルクラウンセブン | 岡崎産業 | 10455 |
| machine-1yki29d | LBスロットGALFY | オーイズミ | 10474 |
| machine-1y0erql | スマスロ バイオハザードRE:3 | エンターライズ | 10440 |
| machine-1ryjocr | スマスロ ビッグドリーム THE GOLDEN PUSHER | サミー | 10446 |
| machine-dz7jky | スマスロスーパーリオエース2 | 山佐ネクスト | 10449 |
| machine-1qjl6tt | Lタクトオーパス デスティニー | アムテックス | 10460 |
| machine-uo8oet | スマート沖スロ ダークハイビ | パイオニア | 10465 |
| machine-1341xhz | スマスロ BIRDIE WING ‐Golf Girls' Story‐ | ユニバーサルブロス | 10458 |
| machine-1h9tk1a | スロット ソードアート・オンラインII | パオン・ディーピー | 10483 |
| machine-rq4e9z | 戦国コレクション6 | コナミアミューズメント | 10471 |
| machine-ln1mlv | L南国育ち SPECIAL | アムテックス | 10488 |
| machine-nhun8m | ローティス | 北電子 | 10491 |
| machine-1xl2y3d | L ULTRAMAN 最終決戦 | オッケー. | 10514 |
| machine-1bh564g | スマスロ やじきた道中記参る! | ユニバーサルブロス | 10489 |
| machine-xdvn75 | スマスロ とんでもスキルで異世界放浪メシ | コナミアミューズメント | 10493 |
| machine-4zk3w0 | Lすーぱぁびん娘 | ベルコ | 10496 |
| machine-zea6wn | L邪神ちゃんドロップキック | サンスリー | 10498 |
| machine-th4uhu | スマスロ とある魔術の禁書目録2 | 藤商事 | 10516 |
| machine-o184cm | スロット ワールドダイスター | パオン・ディーピー | 10517 |
| machine-1ar2ivp | スマスロ ストリートファイター6 | レオスター | 10531 |
| machine-1cxlsjr | LBトリプルクラウンX‐300 | 清龍ゲームジャパン | 10542 |

## 14. TEST DATA 說明

- `data/machine-catalog.json` 的 202 筆 records 中沒有 TEST DATA。
- 3 個 base Profile 共有 11 個完整 benchmark，全部明確標示 `testData: true` 與 TEST DATA，只用於 estimator 計算流程驗證。
- `data/published-machine-profiles.json` 的東京喰種 active v1 有 2 個 real benchmark；baseline version 0 的 TEST DATA 歷史仍保留但不在 verified production profile 路徑啟用。
- 8 個 `tests/fixtures/pworld-*.html` 都只應視為最小測試資料，不是完整來源頁，也不能證明 202 台的實際覆蓋。
- 其中 7 個 fixture 具有明確 inline `TEST DATA` header；`pworld-machine-guide-minimal.html` 缺少相同 header，是本次 audit 發現的文件標示一致性問題。

## Reproducibility Notes

所有 Catalog 統計均可由本機 `data/machine-catalog.json` 重算：

- 狀態／manufacturer／machineType：依欄位直接 group count。
- canonical URL：使用現有 provider 等價規則 `^https://(www.)?p-world.co.jp/machine/database/[0-9]+/?$`。
- duplicate identity：使用現有 `normalizeCatalogName` 等價 normalization 後比較 officialNameJa。
- Confirmed 名單：只採 Project Status、fixture tests、runtime smoke 與使用者手機 QA 已記錄的 10424、10473、10485、10508、10530。
- Probable 名單：只採名稱中的 A-SLOT、A-LIVE、ジャグラー、ハナハナ、Bonus Trigger／BT 明示線索；其餘一律 Unknown。
