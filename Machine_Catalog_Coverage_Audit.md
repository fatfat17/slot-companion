# Machine Catalog Coverage Audit

Audit date：2026-08-29

Code baseline：`dev` · v0.2.8.2 Estimator Observation Contract

Scope：`data/machine-catalog.json` 全部 202 筆正式 Catalog records

## v0.2.8.2 Estimator Observation Contract

本節是目前有效的 Estimator audit。工具連續執行兩次，兩輪皆為 202/202 來源成功，JSON 完全相同，SHA-256：`3952488d8912d305c4f583537cad3c0c0833a160e7e64f1f6f421ada74635d09`。

- 每個 metric 現在保存 `status`、canonical numerator key、唯一 numerator control id、denominator contract、denominator observation key、minimum sample、來源 evidence 與 blocked reason。
- eligibility 仍為 **60 / 202 台**，代表本版沒有為提高覆蓋率而放寬安全門檻。
- 完整可用 observation contracts：**153 metrics**。
- 安全阻擋：**1658 metrics**；機台層級主因為 75 台缺唯一 canonical numerator、67 台沒有可用完整設定資料、另有 1 個 denominator blocker（原因口徑可重疊）。
- Operational machines **196**、basic record mode **6**、generic CZ／AT fallback **0**，Control Evidence Gate 不退化。
- 本次重新解析後 operational controls 為 **668**（560 Counter + 108 Choice）；Choice 數量較上一輪少 3，來自 v0.2.8.1 已核准的逐項 Choice evidence ownership 收斂，不是本版新增刪除規則。
- LB Triple Crown 的 BIG／REG 對應 `observedTotalGame` 且 minimum sample 600；ULTRAMAN rate-only metric 因無唯一 operational numerator 維持 blocked；ART 不會映射到 AT；自訂項目仍不進 Estimator。
- compiler cache revision：`2026-08-29-estimator-observation-contract-5`。舊 Guide cache 失效後需重新建立；既有 Session snapshot 與歷史紀錄保持不變。

## v0.2.8.1 Evidence Gate 重跑結果

本節是目前有效結果；下方 v0.2.8.0 內容保留為修正前 baseline。Audit 由 `scripts/audit-machine-controls.ts` 依序重跑兩次，兩次皆為 202/202 來源成功，輸出 SHA-256 完全相同：`8f4648c8d01d26fce878a94419dbeab7453dc7e7b7c5cc02494e5343e67b0eaf`。完整逐機 traceability 位於 `reports/machine-catalog-control-audit.json`，未保存來源 HTML 或圖片。

| 指標 | v0.2.8.0 baseline | v0.2.8.1 | 變化／解讀 |
|---|---:|---:|---|
| Catalog／有效 P-WORLD URL／成功取得 | 202 / 202 / 202 | 202 / 202 / 202 | 本次 bounded retry 後兩輪均完整 |
| Family confidence High / Medium / Low | 51 / 69 / 82 | 33 / 151 / 18 | 官方 `articleBox-content` 納入結構化 family evidence；Medium 仍不冒充 confirmed |
| 有 operational event／choice 的機台 | 180 | 196 | 新增的是具名官方正文證據，不是 generic fallback |
| Operational controls | 456 | 671 | 560 Counter + 111 Choice；每筆都有自己的 control evidence |
| Generic CZ／AT fallback 機台 | 64 | **0** | family／機率表不再直接產生按鈕 |
| 基本記錄模式 | 22 | 6 | 沒有任何具名 event／有效 Choice 時仍安全降級 |
| Evidence gate 阻擋 | 未獨立計算 | 64 metrics / 28 台 | 有設定 metric，但欠缺自己的 canonical operational control |
| Estimator eligible | 69 | 60 | 移除 9 台無法安全證明 numerator ownership 的 eligibility |
| Estimator ineligible | 133 | 142 | 67 無完整 metric；75 缺唯一 numerator；另有 1 個 denominator blocker（原因可重疊） |
| 只有 Choice、沒有主要 Counter | 21 | 5 | 明確列入 audit，不將 Choice-only 冒充完整遊玩 coverage |

### Evidence 分層與 gate

- `familyEvidence`：只解釋 family 與 confidence，不產生 Counter、Choice 或 state。
- `controlEvidence`：逐 control 保存來源 URL、section、DOM structure、label、充分性與原因；具名 paragraph／table heading、精確 Bonus header、有效 Choice table 才能通過。
- `estimatorEvidence`：設定 1～6 table 只證明理論 metric；仍須唯一 canonical numerator、operational denominator 與 minimum sample。
- 設定表、`CZ`／`AT` 字樣、family classification、generic template 均不能單獨通過 gate。
- compiler cache revision 更新為 `2026-08-29-control-evidence-gate-3`；舊 Guide cache 失效，但舊 Session snapshot、自訂記錄與歷史觀測不改寫。

### 修正後 family 統計

| Family | 台數 | 有 operational | 基本模式 | Estimator eligible | 被阻擋 metrics |
|---|---:|---:|---:|---:|---:|
| `a_type` | 35 | 35 | 0 | 19 | 0 |
| `bonus_art` | 3 | 3 | 0 | 1 | 0 |
| `bonus_loop` | 64 | 61 | 3 | 6 | 48 |
| `cycle_point_at` | 22 | 22 | 0 | 5 | 0 |
| `multi_zone_at` | 52 | 50 | 2 | 24 | 14 |
| `set_based_at` | 8 | 8 | 0 | 0 | 0 |
| `generic` | 18 | 17 | 1 | 5 | 2 |
| **合計** | **202** | **196** | **6** | **60** | **64** |

Family 分布改變來自先前未進入 facts 的官方 `articleBox-content` 現在由同一個 deterministic official-section parser 解析；這只提高 family／具名 control evidence 可見度，不會把未具名的設定機率表當作按鈕。

### 必要代表案例

- `LBトリプルクラウンX‐300`：BIG／REG operational、無 CZ／AT；Estimator 仍 eligible。
- `スマスロ やじきた道中記参る!`：由官方基本仕様中的 `CZ「関所チャレンジ」`、`CZ「真剣チャレンジ」`、`AT「やじきた祭」`、`AT「超やじきた祭」` 與有效終了畫面表通過 gate；Zone／まいる仍不冒充操作按鈕。
- `L ULTRAMAN 最終決戦`：完整 CZ／AT 機率表只形成 family／estimator evidence；沒有具名 control evidence，因此維持基本記錄模式。
- `Lパチスロ 喰霊‐零‐Re`：BIG、REG、EPISODE BONUS、具名 CZ、具名 ART 與有效 Choice 均保留自己的 evidence，不退化。

## v0.2.8.0 修正前 baseline（歷史）

## 1. 結論摘要

本次使用 Catalog 已保存的 canonical P-WORLD `sourceUrl`，以現行 P-WORLD parser、Machine Guide compiler、Machine Family、Control Manifest 與 estimator dependency rules，對 **202 / 202** 台逐筆做一次節流 runtime audit。

| 指標 | 數量 | 比例 | 說明 |
|---|---:|---:|---|
| Catalog records | 202 | 100.0% | 正式 Catalog identity |
| 有效 canonical P-WORLD URL | 202 | 100.0% | URL 格式符合 provider 規則 |
| 本次來源取得成功 | 202 | 100.0% | 本次掃描無 HTTP／timeout failure；不代表來源永遠可用 |
| High-confidence family | 51 | 25.2% | 來源表格提供明確 family signature |
| Medium / probable family | 69 | 34.2% | 來源玩法／表格符合共用 family，仍需代表案例驗證 |
| Generic / low / unknown | 82 | 40.6% | 無法可靠指派更具體 family |
| 有至少一個 compiler operational candidate | 180 | 89.1% | 不是 180 台均已人工確認可靠 |
| 不依賴 generic CZ／AT fallback 的 operational candidate | 116 | 57.4% | 較保守的自動可操作覆蓋指標 |
| 含 generic CZ／AT fallback | 64 | 31.7% | 需再確認事件名稱與玩家按下時機 |
| 基本記錄模式 | 22 | 10.9% | 無來源支持的 event／choice control；仍有 G、投入、持枚與自訂記錄 |
| Estimator 有至少一個 compiler-eligible benchmark | 69 | 34.2% | 仍須 Session 實際 numerator、denominator 與最低樣本 |
| Estimator 不可用 | 133 | 65.8% | 67 台無可解析設定 metric；66 台缺唯一 canonical numerator |

主要結論：

1. **URL coverage 已完成，不等於玩法 coverage。** 202 台均可在本次取得來源，但只有 51 台達 high-confidence family。
2. **目前的安全降級有效。** 22 台會進入基本記錄模式，包括手機驗收通過的 `L ULTRAMAN 最終決戰`。
3. **raw operational coverage 89.1% 會高估可信度。** 64 台仍依賴 family fallback 產生 generic `CZ`／`AT 次數`；其中已人工驗收案例可保留，但其他機台需要更明確 evidence gate。
4. **Estimator 不是只看設定表。** 133 台不可用；最主要 blocker 是無設定 metric（67）或缺少唯一可操作 numerator（66）。
5. **不應逐台寫規則。** 下一步應先強化 evidence ownership，再補 Bonus Trigger／沖スロ mode-loop／ART-only 等共用 family，以及 cycle／points／set numeric controls。

## 2. 方法與可信度界線

### 本次實際執行

- 逐筆讀取 202 筆 Catalog identity 與 P-WORLD source URL。
- 依序、節流抓取來源；不並發大量請求。
- 不保存完整 HTML、文章或圖片，只保留暫存的衍生 audit 結果。
- 每頁交由目前 production parser／compiler 產生 family、confidence、events、states、Control Manifest、metrics 與 benchmarks。
- 以 21 台跨 family 代表案例人工檢查 compiler output。
- 對照四台既有手機驗收案例，確保 audit interpretation 不否定已完成的人工事實。

### 分級定義

- **已由資料確認（High）**：來源結構化表格具明確 signature；本次 51 台。這確認 family signature，不等於每個按鈕都已人工驗收。
- **可能但仍需驗證（Medium）**：來源內容符合共用 family heuristic；本次 69 台。
- **資料不足／未知（Generic Low）**：無法可靠指派非 generic family；本次 82 台。它仍可能有來源明確的 Bonus 或 Choice control。
- **手機人工驗收通過**：只適用狀態文件明確記錄的機台與流程，不能外推到同 family 全部機種。

### 限制

- P-WORLD 頁面會更新；這是 2026-08-29 的一次性 snapshot，不是持續 crawler。
- 本次 202/202 成功不保證未來不會被擋、timeout 或改 DOM。
- `operational` 是 compiler 判定，不自動等於玩家已確認「看到什麼、何時按」。
- 未使用機台名稱猜測 family，也沒有把自訂記錄算入來源 coverage 或 estimator。
- 舊 Session snapshot 不在 audit 中重新編譯或改寫。

## 3. Machine Family 全量統計

| Family | 台數 | High | Medium | Low | 有 operational candidate | 基本模式 | Estimator eligible |
|---|---:|---:|---:|---:|---:|---:|---:|
| `a_type` | 33 | 33 | 0 | 0 | 33 | 0 | 18 |
| `bonus_art` | 2 | 0 | 2 | 0 | 2 | 0 | 0 |
| `bonus_loop` | 1 | 0 | 1 | 0 | 0 | 1 | 0 |
| `cycle_point_at` | 11 | 0 | 11 | 0 | 11 | 0 | 4 |
| `cz_at` | 18 | 18 | 0 | 0 | 11 | 7 | 1 |
| `generic` | 82 | 0 | 0 | 82 | 68 | 14 | 8 |
| `multi_zone_at` | 52 | 0 | 52 | 0 | 52 | 0 | 38 |
| `set_based_at` | 3 | 0 | 3 | 0 | 3 | 0 | 0 |
| **合計** | **202** | **51** | **69** | **82** | **180** | **22** | **69** |

### 3.1 A-type／Bonus 型（33）

- 證據：設定表同時具有 BB／BIG 與 RB／REG 欄位，且結構化表格未指向 CZ／AT／ART family。
- 已支援：BIG、REG 個別 Counter；有效終了畫面 Choice；Bonus 合成為 derived metric，不重複輸入。
- 代表：10542 `LBトリプルクラウンX-300`、10009 `ジャグラーガールズSS`。
- 缺口：Bonus Trigger、技術介入、沖スロ告知／mode-loop 不應全部擠進純 A-type。
- 常見 estimator blocker：設定值不完整或其他 metric 缺唯一 numerator；18/33 有至少一項 eligible benchmark。

### 3.2 Bonus + ART（2）

- 證據：來源同時明確描述實 Bonus 與 ART。
- 已支援：具名 Bonus、具名 ART、具名 CZ 與有效 Choice。
- 代表：10530 `Lパチスロ 喰霊‐零‐Re`、10033 `パチスロ ダンまち2`。
- 缺口：ART 初當／Bonus 中事件與 Session numerator 的一對一 binding 尚不足，0/2 estimator eligible。

### 3.3 Bonus Loop（1）

- 證據：來源結構符合擬似 Bonus loop。
- 代表：10508 `ヤバチバ`。
- 現況：family 可判斷，但沒有可靠具名 event／control，因此正確進入基本記錄模式。
- 缺口：需要共用的 loop Bonus／mode transition evidence contract；不可因 family 名稱直接補 Bonus Counter。

### 3.4 Cycle／Points AT（11）

- 證據：來源同時出現週期、點數與 AT 結構。
- 已支援：可確認的 CZ、AT、Bonus、Choice；cycle、points、CZ failures 維持 read-only。
- 代表：10473 `L戦国乙女5`、10352 `革命機ヴァルヴレイヴ2`。
- 缺口：11 台目前都含 generic CZ 或 AT fallback；需補 numeric input 的單位、reset 條件與按下時機後才可 operational。
- Estimator：4/11 eligible。

### 3.5 CZ → AT（18）

- 證據：結構化設定表同時提供 CZ 與 AT 欄位。
- 安全規則：機率表只確認 family，不足以自動建立 CZ／AT control。
- 現況：11 台因其他具名 Bonus／有效 Choice 等 evidence 有 controls；7 台進基本記錄模式。
- 代表：10514 `L ULTRAMAN 最終決戰`、10516 `とある魔術の禁書目録2`、10086 `ゴッドイーター`。
- 缺口：需要從正式 heading／mode title／玩法說明取得事件 identity 與 record timing；Estimator 僅 1/18 eligible。

### 3.6 Multi-zone AT（52）

- 證據：來源含多個 CZ／zone signature 與 AT 結構。
- 已支援：具名或 generic CZ、AT、Bonus、有效 Choice。
- 代表：10489 `やじきた道中記参る!`、10485 `からくりサーカス2`、10446 `BIG DREAM`。
- 缺口：50/52 仍至少含一個 generic CZ／AT fallback；只有來源真正提供辨認時機時才應維持 operational。Zone 多數仍只適合 read-only。
- Estimator：38/52 eligible，是目前覆蓋最高 family，但也最需要 numerator ownership audit。

### 3.7 Set-based AT（3）

- 證據：來源具有 set 管理／loop stock 與 AT 結構。
- 已支援：AT、有效終了畫面 Choice。
- 代表：10424 `ミリオンゴッド`、10008 `忍魂参`、10531 `ストリートファイター6`。
- 缺口：Set 與 role streak 尚無明確 numeric／counter contract，維持 read-only；三台 AT 目前皆為 generic fallback，0/3 estimator eligible。

### 3.8 Generic／Unknown（82）

- 無法由現有 evidence 指派更具體 family。
- 68 台仍有來源明確的 Bonus／具名事件／Choice candidate；14 台完全沒有 event control，進基本記錄模式。
- 代表：10440 `バイオハザードRE:3` 有多個具名 Bonus，但 family 未知；10491 `ローティス` 無 controls；10368 `沖ドキ!DUO アンコール` 有具名 CZ，但整體 mode-loop 未建模。
- 名稱初篩只作規劃、不作事實：82 台中有 2 台 BT／A-SLOT 線索、14 台沖スロ／mode-loop 線索。

## 4. Control Manifest 涵蓋率

現行 compiler 在 180 台產生至少一個 event／choice operational candidate，共 **456** 個：

| Control | 數量 |
|---|---:|
| Counter | 345 |
| Choice | 111 |
| Numeric input | 0 |

Module 分布：

| Module | Controls |
|---|---:|
| BIG／REG／具名 Bonus | 203 |
| AT | 72 |
| CZ | 67 |
| 終了畫面／設定示唆 Choice | 111 |
| ART | 3 |

### 需要區分的兩種 operational

- **116 台**的 operational candidates 不依賴 generic `CZ`／`AT 次數` fallback，主要是具名 Bonus、具名 CZ／ART 或有效 Choice。
- **64 台**至少含一個 family fallback generic control，共 48 個 `CZ`、59 個 `AT 次數`。這 107 個 control 不是全部錯誤；例如已人工驗收的やじきた與 GOD 可用，但其他機台需要 evidence ownership 驗證。
- **21 台**只有 Choice、沒有 event Counter；這些機台雖不算 basic mode，實際遊玩記錄能力仍有限。
- **22 台**沒有 event／choice operational control，正確使用基本記錄模式。

### Basic record mode 保證

所有 202 台都至少保留：

- 總遊玩 G
- 投入
- 持枚
- per-machine 自訂 Counter／Choice

自訂項目只保存於目前瀏覽器 localStorage、跨不同 Catalog ID 隔離、可供新 Session 重用但每局計數從 0 開始，且固定不進 Setting Estimator。舊 Session 保存自己的 snapshot，不受新分類影響。

## 5. Setting Estimator 健檢

| 狀態 | 機台數 | 說明 |
|---|---:|---|
| 至少一項 compiler-eligible benchmark | 69 | 有 setting 1～6 values、可操作 numerator、明確 denominator |
| 無可解析設定 metric | 67 | 來源未提供完整設定表、為調查中／空值，或 parser 無法可靠結構化 |
| 有 metric，但缺唯一 canonical numerator | 66 | 無法把理論值安全綁到一個 Session observation |
| 另含 denominator 不明風險 | 1 | 此台同時已計入缺 numerator，不重複計總數 |

現行 benchmark minimum sample 為 **600G**。即使屬於 69 台 eligible：

- numerator 必須實際大於 0；
- denominator 必須可由 Session snapshot 取得且達最低樣本；
- `調査中`、缺失與無法確認的值不參與；
- 自訂記錄不參與；
- 結果仍只標示「參考推測」。

風險：69 台中有 40 台的 Machine Manifest 同時含 generic CZ／AT fallback。這不代表 benchmark 必然錯誤，但下一階段應逐 metric 確認 numerator 是否由真正可觀測 control 擁有。較保守的「eligible 且 Manifest 不含 generic CZ／AT fallback」為 29 台。

## 6. 代表性 21 台檢查矩陣

| P-WORLD | 機種 | Family／信心 | Audit 結果 | 後續重點 |
|---:|---|---|---|---|
| 10542 | LBトリプルクラウンX-300 | a_type / high | BIG、REG；無 CZ／AT；4 benchmarks | 手機已通過 |
| 10009 | ジャグラーガールズSS | a_type / high | BIG、REG；2 benchmarks | A-type 第二案例 |
| 10383 | L不二子BT | generic / low | BIG、Choice；family 未識別 | Bonus Trigger family |
| 10530 | 喰霊‐零‐Re | bonus_art / medium | 具名 CZ、ART、BIG、REG、Choice | 手機既有流程不退化 |
| 10033 | ダンまち2 | bonus_art / medium | 具名 Bonus、ART、Choice | numerator binding |
| 10508 | ヤバチバ | bonus_loop / medium | 無可靠 event，基本模式 | loop Bonus contract |
| 10473 | 戦国乙女5 | cycle_point_at / medium | CZ、AT；週期／點數 read-only | 手機既有流程不退化 |
| 10352 | ヴァルヴレイヴ2 | cycle_point_at / medium | CZ、AT、Choice | generic timing 驗證 |
| 10514 | ULTRAMAN 最終決戦 | cz_at / high | 無 CZ／AT control，基本模式 | 手機已通過 |
| 10516 | とある魔術の禁書目録2 | cz_at / high | 無 event control，基本模式 | 不可只靠機率表補按鈕 |
| 10086 | ゴッドイーター | cz_at / high | 只有有效 Choice | 事件 identity 缺口 |
| 10489 | やじきた道中記参る! | multi_zone_at / medium | CZ、AT、Choice；4 benchmarks | 手機已通過 |
| 10485 | からくりサーカス2 | multi_zone_at / medium | 4 具名 CZ、AT、Choice | named ownership 正向案例 |
| 10207 | 東京喰種 | multi_zone_at / medium | Bonus、CZ、AT、Choice；4 benchmarks | 與 published Profile 比對 |
| 10446 | BIG DREAM | multi_zone_at / medium | 具名 CZ、具名 AT、Choice | 英日 identity 與玩法分離 |
| 10440 | バイオハザードRE:3 | generic / low | 4 個具名 Bonus，family 未識別 | generic 仍可有可靠 controls |
| 10424 | ミリオンゴッド | set_based_at / medium | AT、Choice；Set／streak read-only | 手機既有流程不退化 |
| 10008 | 忍魂参 | set_based_at / medium | AT、Choice | Set numeric contract |
| 10531 | ストリートファイター6 | set_based_at / medium | AT、Choice | Set evidence 驗證 |
| 10491 | ローティス | generic / low | 無 controls，基本模式 | unknown 安全降級 |
| 10368 | 沖ドキ!DUO アンコール | generic / low | 具名 CZ、Choice；family 未識別 | 沖スロ mode-loop family |

本矩陣刻意同時包含成功、部分成功、family 未知、只有 Choice 與完全基本模式案例，不只挑已知成功機種。

## 7. 既有手機驗收案例回歸判定

- `LBトリプルクラウンX-300`：runtime audit 仍為 high-confidence A-type；只有 BIG／REG，無 CZ／AT ✅
- `スマスロ やじきた道中記参る！`：CZ、AT、有效終了畫面 Choice 與 estimator dependencies 仍存在 ✅
- `L ULTRAMAN 最終決戰`：family table 可確認 CZ／AT 機率，但沒有事件 identity，因此無 CZ／AT controls 並進基本模式 ✅
- `Lパチスロ 喰霊‐零‐Re`：具名 CZ、兩個 ART、BIG、REG 與有效 Choice 保持獨立 ✅

本階段沒有建立新 Session、沒有改寫任何舊 Session snapshot，也沒有修改產品程式。

## 8. 主要分類與操作缺口

1. **Generic state/control ownership**：64 台的 generic CZ／AT fallback 需要逐 evidence 判斷，而不是逐機台特例。
2. **Numeric controls 缺失**：目前全 Catalog operational numeric input 為 0；cycle、points、set、zone 雖有資料仍多為 read-only。
3. **Bonus family 粒度不足**：A-type、Bonus Trigger、擬似 Bonus loop、沖スロ告知／mode-loop 需要分開。
4. **ART-only family 缺失**：現有 `bonus_art` 可處理兩個代表，但獨立 ART 結構仍可能落入 generic。
5. **Estimator numerator binding**：66 台已解析 metric 卻缺唯一 numerator；不能用接近名稱或 generic counter 猜綁定。
6. **Choice-only 假象**：21 台雖算 operational，但只有終了畫面 Choice，主遊玩事件仍無法記錄。
7. **Medium 不等於 confirmed**：69 台 medium family 需以代表來源／手機案例逐類提升可信度，不能批次標成 verified。

## 9. 建議的分階段最小改造

### 建議下一個最小版本：v0.2.8.1 – Control Evidence Gate & Audit Tooling

範圍只做：

1. 為 control 增加共用 evidence strength／origin（named heading、quoted mode、table-only、family fallback）。
2. generic CZ／AT 只有在來源包含可觀察事件 identity 與 record timing 時才 operational；否則 read-only 或 basic mode。
3. 建立可重複執行、只輸出衍生 JSON／Markdown 統計的 audit command，不保存來源 HTML。
4. 用本報告 21 台矩陣做 regression；已人工驗收案例作 allow-by-evidence，不以機台 ID hardcode。
5. 不新增 UI family、不修改 estimator 公式、不改舊 Session。

預期影響：不追求提高 180 的 raw coverage，而是把 64 台 generic fallback 的可信度明確化。短期 operational 數可能下降，但錯誤按鈕風險會下降；這是安全改善，不應用「覆蓋率增加」衡量。

### 後續候選 A：Bonus Trigger + 沖スロ Mode Loop

- 目前 generic 中有 2 台 BT／A-SLOT 明示候選、14 台沖スロ／mode-loop 名稱候選。
- 只有來源 signature 確認後才加入 family；若 16 台全部確認，specific-family coverage 的理論上限可由 120/202（59.4%）提高至 136/202（67.3%），實際增幅必須以來源結果為準。
- 代表：10383、10425、10368、10488、10190。

### 後續候選 B：Cycle／Points／Set Numeric Controls

- 直接影響現有 11 台 cycle-point、3 台 set-based 與 1 台 bonus-loop，共最多 15 台（7.4%）。
- 必須先定義單位、何時更新、reset 規則與 snapshot storage；資料不完整時仍 read-only。
- 可能使 10508 從 basic mode 增加可靠 Bonus／mode control，但不可預先承諾。

### 後續候選 C：Estimator Dependency Binding

- 上限候選是 66 台「有 metric、缺唯一 numerator」；不是預估能一次解鎖 66 台。
- 第一批只針對 21 台代表矩陣逐 metric 驗證 numerator、denominator 與 600G minimum sample。
- unresolved、generic fallback、choice-only 或來源缺失一律不得啟用。

## 10. Reproducibility 與資料安全

- Catalog inventory：`data/machine-catalog.json`，202 筆。
- Source validity：現有 provider canonical URL 規則。
- Runtime interpretation：`src/lib/machine-guide/pworld.ts`、`compiler.ts`、`controlManifest.ts`、`capabilities.ts`、`sessionUi.ts`、`settingEstimator.ts`。
- 本次沒有把 runtime HTML 或 audit 暫存檔提交進 repository。
- TEST DATA fixtures 只驗證 parser/compiler 規則，不代表真實 Catalog 數據。
- Catalog、Published Profile、Session、localStorage 與 `StartSession 2.tsx` 均未修改。

## 11. 決策建議

下一步建議只核准 **v0.2.8.1 – Control Evidence Gate & Audit Tooling**，先把「來源證明 family」與「來源證明可按 control」拆清楚。完成後再由產品決定是否優先做 Bonus Trigger／沖スロ family，或 numeric cycle／points／set controls。

本 audit 到此停止，不自行開始下一版本。
