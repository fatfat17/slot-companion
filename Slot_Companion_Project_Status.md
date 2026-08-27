# Slot Companion Project Status

Last Updated: 2026-08-27

## Current Version
**v0.2.5.1 – Verified Machine Card Presentation**

Status：**Completed；等待人工驗收**

目前核准穩定基準：**v0.2.3.1**

Git repository 初始 `main` 基準：**v0.2.5.1 current working snapshot（等待人工驗收，不代表 fully approved stable）**

## Product Goal
手機優先的日本 Pachislot / Smart Slot 輔助工具。

核心流程：
**Scan → Understand → Track → Estimate**

- Scan：QR、說明書、截圖、機台照片
- Understand：AI 轉成繁體中文並解釋玩法
- Track：依 Machine Profile 建立 Smart Counter
- Estimate：依 Verified benchmark + Session evidence 推定設定傾向

## Completed

### v0.1.x
- PWA 手機優先 UI
- Dark UI + 黃色 accent
- Machine Card
- Session 建立 / 結束
- 投入 / 持枚 / G tracker
- CZ / AT
- 今日紀錄
- Night Hunter
- localStorage
- 同時間只允許一個 Active Session

### v0.1.2
- Machine Profile driven Smart Counter
- Counter type：count / event / choice / photo
- G tracker：dataGame / lcdGame / czSince / atSince
- Night Hunter 動態欄位

### v0.1.3
- 即時 1/X
- CZ / AT 初當率
- event parent relationship
- success / trial 成功率

### v0.1.4
- Session baseline
- Observed G
- Current Machine G 與 Session observed G 分離
- Trial / Outcome 關聯保護

### v0.2.0 – Setting Estimator Core
- Setting 1～6 relative distribution
- Poisson likelihood
- Binomial likelihood
- Multi-evidence merge
- Choice evidence
- 僅供演算法與 UI 驗收的 TEST DATA benchmark（不是任何真實機種資料）
- Evidence 影響

### v0.2.1 – AI Machine Identification
- OpenAI Responses API
- Image input
- Structured Output
- Server-side API key
- MockAIProvider / OpenAIProvider
- identified / uncertain / unknown
- 使用者確認後才載入

### v0.2.1.1 – Machine Identity Accuracy
核心原則：
**寧可 uncertain，也不能錯接 Machine Profile。**

- Catalog-first matching
- 正式 Machine Name 優先
- IP / 演出名稱與正式機種名稱分離
- manufacturer 不可自行猜測
- Catalog 內機種辨識明顯較準

### v0.2.2 – Machine Catalog Importer
- Machine Catalog schema 與 Machine Profile 正式分離
- 現有三台 Machine Profile 以 `catalogId` 引用 Catalog record
- Server-side JSON repository：`data/machine-catalog.json`
- Catalog record 支援 imported / reviewed / verified 狀態
- Catalog 可保存多個 source metadata，未保存攻略文章或來源圖片
- Catalog Importer Admin UI
- Development admin route：`/admin/catalog-import`
- Preview API：`/api/admin/catalog-import/preview`
- Approve API：`/api/admin/catalog-import/approve`
- `CatalogSourceProvider` provider abstraction
- `PWorldCatalogProvider`
- P-WORLD 單頁 URL Fetch & Parse
- Import Preview
- Slot / Pachislot 過濾
- 人工勾選與 Edit before import
- Import / Skip / Merge existing
- 全形 / 半形、空白、L、スマスロ、パチスロ、dash 與 punctuation normalization
- official name / aliases duplicate detection
- 不同來源合併 source metadata，不重複建立 record
- 未核准前不寫入正式 Catalog

Catalog-first AI 實際流程：
**Image → AI extract visible evidence → Catalog text / alias / normalized name / manufacturer search → top 20 shortlist → AI verification → local identity policy → user confirmation**

- 第一階段只抽取圖片可見線索，不提供完整 Catalog
- 不把數百台 Catalog 全部放進單次 prompt
- Catalog 無候選時回 uncertain / unknown，並標示 `pending_new_machine`
- 不自由建立正式機種名稱
- 不自動建立 Machine Profile
- Catalog 新增後，既有搜尋流程可立即取得新候選

已確認 P-WORLD 2026-06：
- 2026/06/08：3 台 Slot
- 2026/06/22：1 台 Slot
- 共正確解析 4 台 Slot
- Pachinko 正確排除
- 使用 P-WORLD 實際公開頁面建立 Preview 成功
- QA 僅建立 Preview，未執行 Approve，未因此寫入 Catalog

Automated QA：
- lint ✅
- typecheck ✅
- production build ✅
- tests：**21 / 21 passed** ✅

### v0.2.2.1 – P-WORLD Batch Monthly Import
- 保留既有單一 URL Import 模式與人工 Approve 流程
- `/admin/catalog-import` 新增 Start Month / End Month 月份範圍模式
- 嚴格驗證 `YYYY-MM`、月份先後與最多 36 個月
- 依月份由舊到新逐筆請求 P-WORLD，請求間隔 500ms，不並發大量讀取
- 單月失敗不會中止整批，Preview 顯示失敗月份與原因
- 只解析 P-WORLD Slot 區塊，排除 Pachinko
- 跨月份沿用 normalization、alias 與 duplicate matching 去重
- Preview 顯示掃描、成功、失敗、原始 Slot、normalization、去重、既有、新增與 Merge 統計
- 每筆仍可 Import / Skip / Merge existing / Edit before import
- Batch API：`/api/admin/catalog-import/batch-preview`
- Batch API 僅回傳 Preview，不會自動 Approve 或寫入 Catalog
- Catalog identity source metadata 可選擇性保存可靠取得的 `sourceImageUrl`；只保存 URL，不保存圖片
- 未修改 AI Machine Identification、Setting Estimator、Session 或 Machine Profile benchmark

Approval Batch Safety Fix：
- 修正 Approve API 對超過 100 筆的 silent truncation blocker
- API 單次最多 100 筆；第 101 筆起明確回傳 422，不寫入、不靜默忽略
- API 回傳 `received / processed / imported / merged / skipped`
- Admin UI 以每批最多 100 筆依序提交，不並發；184 筆會拆成 100 + 84
- UI 即時顯示總選取、已處理、剩餘與目前批次 / 總批次
- 每批核對 `received` 與 `processed` 必須等於該批送出數量，不一致即停止並視為錯誤
- 任一批失敗後停止後續批次，不回滾已成功批次，並顯示完成、失敗批次與尚未處理數量
- 重新建立 Preview 時沿用 duplicate matching，已成功匯入項目會成為既有 Catalog / Merge candidate

P-WORLD 實頁 QA（2026-05 ～ 2026-06）：
- 掃描 2 個月，成功 2、失敗 0
- 原始 Slot 9、normalization 後 9、去重後 9
- 正確排除 Pachinko
- 僅建立 Batch Preview，未執行 Approve、未寫入正式 Catalog

最終驗收實測（2024-01 ～ 2026-06）：
- 共掃描 30 個月份，30 / 30 成功
- 取得 186 筆 Slot 去重候選
- Approve 自動分成 2 批並依序完成
- 186 / 186 全部處理完成，剩餘 0
- 重新建立 Preview 後：Existing Catalog 186、New Candidates 0
- 未發生 silent truncation

Automated QA：
- lint ✅
- typecheck ✅
- tests：**35 / 35 passed** ✅
- production build：Next.js webpack build ✅
- 備註：預設 Turbopack build 在目前受限執行環境因內部 port binding 被拒；webpack production build 完整成功

### v0.2.2.2 – Catalog Search Recall & Alias Enrichment
- Catalog search 支援 officialNameJa tokenized / partial matching
- 英文搜尋忽略大小寫、空白與 dash
- server-side search index 使用衍生 alias，不覆寫 `officialNameJa`，也不寫回 `data/machine-catalog.json`
- `ビッグドリーム` 可由 `BIG DREAM` / `big-dream` / `BIGDREAM` 召回
- `東京喰種` 可由 `Tokyo Ghoul` 召回
- 完整高資訊片語優先於零散 token
- manufacturer 僅作加權，不是必要搜尋條件
- `GOD`、`DREAM`、`BONUS` 等過短或 generic 單詞不單獨產生 shortlist
- shortlist candidate 提供 `searchScore` 與 debug `searchMatchReasons`
- debug reason 支援 exact official title / exact alias / partial official title / romanized alias / token match / manufacturer boost
- debug match reasons 隨 shortlist 傳入 AI verification prompt
- 保留既有 identity safety rules；無唯一 Catalog 對應仍維持 uncertain / unknown 流程
- 未修改 Machine Profile、Setting Estimator、Session、P-WORLD parser 或 Catalog JSON 資料

Regression QA：
- `BIG DREAM` → `スマスロ ビッグドリーム THE GOLDEN PUSHER` ✅
- `Tokyo Ghoul` → `L 東京喰種` ✅
- `GOD` 單獨不形成唯一 shortlist ✅
- `Bullet of Bullets` 無唯一 Catalog 對應時不產生 shortlist，既有 uncertain safety rule 保留 ✅
- lint ✅
- typecheck ✅
- tests：**44 / 44 passed** ✅
- production build：Next.js webpack build ✅

- localhost `/identify`：HTTP 200 ✅

Status：**Completed；等待使用者驗收，尚未核准**

### v0.2.3 – Machine Catalog Library UI
Status：**Completed；等待人工驗收，尚未核准**

- 首頁新增主要入口：`📚 機種資料庫`
- 新增一般使用者唯讀 route：`/catalog`
- 新增 Catalog detail route：`/catalog/[id]`
- 首頁原「內建機種」改為「已建立攻略 Profile」，保留三台 Machine Profile
- Catalog summary 全部由 runtime Catalog 與 Profile `catalogId` 即時計算
- 目前摘要：187 Catalog、3 Profile ready、184 Catalog only、184 imported、3 reviewed、0 verified
- 搜尋支援 officialNameJa、displayNameZh、aliases、manufacturer 與 normalized name
- 篩選支援目前資料實際存在的 manufacturer、machineType、catalogStatus、Profile status 與導入年月
- 排序支援導入日新舊、名稱與メーカー；預設導入日新到舊
- 搜尋／篩選／排序後再 pagination，每頁 25 筆
- Catalog item 明確區分「攻略 Profile 已建立」與「Catalog only」
- Detail 顯示 identity 欄位、source metadata 與 optional sourceImageUrl
- 有 Profile 時連到既有 Machine Card；無 Profile 時「建立攻略 Profile」按鈕 disabled 並標示下一版本開放
- 空搜尋提供清除篩選與拍機台辨識；Catalog 空資料有安全 fallback
- 一般 Library 不顯示 Import、Merge、Approve、raw debug 或 internal score
- 未自動建立 Profile，未將完整 Catalog 塞入現有 `/machines` Profile Library
- 未修改 Session、Smart Counter、Setting Estimator、P-WORLD importer、AI identification 核心、benchmark 或 Catalog JSON schema

Regression QA：
- Catalog summary / Profile ready / Catalog only ✅
- 名稱 / alias / manufacturer 搜尋 ✅
- introducedAt / machineType / catalogStatus / Profile status 篩選 ✅
- 排序 / pagination ✅
- Catalog detail / Profile linking / no-profile disabled state ✅
- 空結果 / Catalog empty fallback ✅
- lint ✅
- typecheck ✅
- tests：**68 / 68 passed** ✅
- production build：Next.js webpack build ✅
- localhost `/catalog` 與 `/catalog/machine-1ryjocr`：HTTP 200 ✅

### v0.2.3.1 – Catalog Search Parity
Status：**Approved；已通過人工驗收，為目前核准穩定版本**

- `/catalog` 改為共用既有 server-side Catalog search 與 derived recognition index，不再維護第二套較弱的前台搜尋邏輯
- Library search 使用共用搜尋核心的 `library` context；AI Identification 維持預設 `identity` context 與既有安全規則
- `BIG DREAM`、`big-dream` 與 `ビッグドリーム` 均可召回 `スマスロ ビッグドリーム THE GOLDEN PUSHER`
- `Tokyo Ghoul` 可召回 `L 東京喰種`
- 英文搜尋忽略大小寫、空白與 dash
- aliases、normalized official title、displayNameZh 與 manufacturer 仍可搜尋
- `GOD`、`DREAM` 等 generic term 在 Library 可回傳相關候選，但不提升為 AI 唯一 exact match
- 搜尋結果可繼續搭配 manufacturer、machineType、catalogStatus、Profile status、導入年月、排序與 pagination
- derived recognition aliases 僅在 server-side runtime index 產生，未寫回 `data/machine-catalog.json`
- 修正 Library token compare 將兩字元 title token 誤配到長英文 token 的 false positive；AI identity context 行為不變
- 未修改 Machine Profile、Session、Setting Estimator、P-WORLD importer、benchmark 或 AI Identification safety policy

Regression QA：
- `BIG DREAM` ✅
- `Tokyo Ghoul` ✅
- `big-dream` ✅
- `ビッグドリーム` ✅
- generic `GOD` 可回傳多筆相關候選但不視為 identity exact ✅
- 搜尋與篩選／排序／pagination 組合 ✅
- AI identity safety regression（generic GOD、版本衝突、完整 pipeline）✅
- lint ✅
- typecheck ✅
- tests：**74 / 74 passed** ✅
- production build：Next.js webpack build ✅

### v0.2.4 – Verified Profile Builder
Status：**Completed；等待人工驗收，尚未核准**

- Machine Profile 狀態支援 `placeholder / draft / reviewed / verified`
- 東京喰種、機關馬戲團 2、GOD 既有 Profile 明確標為 `placeholder`，未刪除或覆寫
- 現有 benchmark 仍明確標示 TEST DATA，不視為真實機種資料
- Catalog Detail 啟用「建立攻略 Profile」；既有 placeholder 顯示「重建／升級攻略 Profile」且不建立重複 identity
- 新增 development admin route：`/admin/profile-builder/[catalogId]`
- 新增 API route：`/api/admin/profile-builder/[catalogId]`
- 新增 server-side JSON storage：`data/profile-drafts.json`，與 Catalog、Session localStorage 分離
- Profile Builder 顯示 Catalog Identity、既有 Profile 狀態、placeholder 提醒、來源、Draft metrics、Evidence、Conflict、Smart Counter 建議與 Approve / Reject
- 支援人工貼入公開 HTTP / HTTPS URL；拒絕 localhost 與私人網路 URL
- 建立 `ProfileSourceProvider` abstraction；第一版通用公開頁 provider 可辨識官方／メーカー、なな徹、DMMぱちタウン、一撃與其他來源 URL
- 只保存結構化 Source Evidence，不保存攻略文章全文
- Evidence 包含 sourceName、sourceUrl、retrievedAt、metricKey / sectionKey、extractedValue、rawLabel、confidence、reviewStatus
- 結構化 extraction 支援 game flow、CZ / AT 初當、小役設定差、契機成功率、天井、Zone、Reset、結束畫面、Trophy／設定示唆、打ち方；看不到的欄位維持 null，不補猜
- 多來源相同值標為 `agree`，不同值標為 `conflict`
- unresolved conflict、未 review evidence、未 verified Profile、TEST DATA 均不得作為 real Setting Estimator benchmark 供應來源
- 未修改 Setting Estimator 數學；現有 TEST estimator 行為維持不變
- verified setting-difference metric 可產生 count、trial/outcome、choice 類 Smart Counter 建議，但預設未核准，必須人工 Review
- Draft 核准前不影響既有 Machine Profile 或 Session；Approve 後 Draft status 更新為 `verified`
- 未進行全站 crawler、批次建立 Profile、自動 Verified、自動 Approve、AI Chat、GitHub push 或 deploy

Golden Test：
- `L 東京喰種`：Catalog → placeholder-based Draft → 加入測試來源 URL → partial Extraction → Evidence Review → Smart Counter Review → Approve → verified ✅
- Golden Test 使用 TEST fixture，未抓取或寫入任何真實攻略數值 ✅

Regression QA：
- Catalog only / placeholder 建立 Draft、不重複 Profile ✅
- Source URL、partial extraction、missing metric null ✅
- two sources agree / conflict ✅
- conflict、TEST DATA、未 verified／未 review 不進 real estimator supply ✅
- Approve status、Profile link / Catalog link ✅
- lint ✅
- typecheck ✅
- tests：**88 / 88 passed** ✅
- production build：Next.js webpack build ✅
- localhost Catalog Detail / Profile Builder：HTTP 200 ✅

Source Extraction QA 修正（等待重新 Golden Test）：
- 修正一撃頁面被 navigation、SEO、相關文章、索引與廣告文字污染的 blocker
- Fetch 後先進行 deterministic HTML content parsing，不再把整頁扁平文字直接做 regex mapping
- 先排除 header、nav、footer、aside、sidebar、related、ranking、recommendation、breadcrumb、ads、TOC 等非正文結構
- 優先解析 h1 / h2 / h3、table headers、rows / cells 與緊鄰 heading 的 paragraph
- Evidence 新增結構化 `sectionTitle / tableHeaders[] / rows[] / note / extractedFrom`，舊 Draft evidence 保持向後相容
- table parser 支援 colspan / rowspan；設定 1～6 的原始 `1/X` 與 `%` 數值不轉成摘要
- 一撃東京喰種真實 HTML 結構 regression fixture 可抽出：AT 初當、CZ 出現率、弱チェリー CZ 當選率、100G 內當選率、AT 直擊、AT 引き戻し、下段リプレイ、AT 結束畫面
- 無可靠 table 或明確正文的 section 不建立 evidence，不從 navigation / SEO / related title 推測
- 未將整頁垃圾文字交給 LLM；目前流程完全 deterministic，未新增 LLM 寫入 verified 的路徑
- Profile schema 與 Approve 流程未修改；既有 Golden Test Draft 仍為 `draft`，updatedAt 未變，未自動重新抽取或 Approve
- lint ✅
- typecheck ✅
- tests：**95 / 95 passed** ✅
- production build：Next.js webpack build ✅

### v0.2.4.2 – Multi-source Extraction & Comparison Hardening
Status：**Completed；等待人工驗收，尚未核准**

- 保留 deterministic generic parser，新增 `ProfileSourceProvider` 分流：一撃、なな徹與 generic fallback 各自處理正文 container、heading 與 table 結構
- 修正なな徹頁面因 DOM 結構與 metric 標題命名不同而產生 `Evidence = 0` 的問題
- なな徹東京喰種 Golden Test 頁可可靠抽出 9 筆結構化 Evidence：AT 初當、CZ 初當、100G 內當選、AT 直擊、AT 引き戻し、CZ 結束畫面、AT 結束畫面、下段リプレイ、弱チェリー CZ 當選率
- Source extraction status 支援 `extracted / partial / no_evidence / failed`，並記錄與顯示實際 evidence count；0 筆不再標示為 extracted
- Multi-source comparison 改以 canonical hostname + canonical URL 作穩定 source identity，不只依 `sourceName`
- 同來源的重複 metric 不得形成 multi-source agree，會標記 `duplicate_source` 供人工處理
- 比較狀態支援 `single / agree / conflict / duplicate_source / incomparable`
- 新增 metric-aware canonicalization：比例斜線與空白、百分比格式、全半形符號、JSON property order、設定表 row order 差異不再造成 false conflict
- canonical value 僅供比較；rawLabel、原始 extracted value、structured rows 與 source metadata 均完整保留
- UI 顯示每個 Draft metric 的 source count、source names 與 comparison status
- unresolved `conflict`、`duplicate_source`、`incomparable` 均不得進入 real estimator benchmark supply；`single` 不會被誤稱為多來源 verified
- 未修改 Machine Profile schema、Approve 流程、Session、Setting Estimator 數學、Catalog 或既有 TEST DATA 定義
- 未自動重新抽取、覆寫或 Approve 現有東京喰種 Draft；使用者可自行重新建立 Golden Test 驗收

Golden Test dry-run（僅記憶體合併，未寫入 Draft）：
- `agree · 2 sources`：AT 初當、CZ 初當、100G 內當選、AT 直擊、AT 引き戻し、下段リプレイ
- `incomparable · 2 sources`：弱チェリー CZ 當選率（來源表格欄位結構不同，保守交人工 review）
- `conflict · 2 sources`：AT 結束畫面（來源文字／結構不一致，未自動解決）
- `single · なな徹`：CZ 結束畫面

Regression QA：
- なな徹真實 DOM 結構 fixture extraction ✅
- 0 evidence → `no_evidence` ✅
- 同來源重複 metric 不得 agree ✅
- 不同來源同值 / 不同值 → agree / conflict ✅
- `1/394.4`、`1 / 394.4`、`1／394.4` normalization ✅
- 百分比 formatting normalization ✅
- 設定表 row order normalization ✅
- unresolved conflict 不進 estimator ✅
- lint ✅
- typecheck ✅
- tests：**104 / 104 passed** ✅
- production build：Next.js webpack build ✅

### v0.2.4.3 – Evidence Conflict Resolution
Status：**Completed；等待人工驗收，尚未核准**

- 保留既有 extraction、Machine Profile schema、Approve 寫入流程、Session、Catalog、Smart Counter 與 Setting Estimator 數學
- `conflict / incomparable / duplicate_source` Draft metric 新增 `Review / Resolve` 入口
- 手機優先的 Resolution drawer 顯示每筆來源 Evidence：sourceName、sourceUrl、rawLabel、structured table / value、note、confidence
- 人工動作支援：採用單一來源、Merge / Combine、排除 Evidence、保持 unresolved
- Resolution status 支援 `unresolved / source_selected / merged / rejected`
- Audit 保存 `resolvedAt / resolutionType / selectedEvidenceIds / rejectedEvidenceIds / mergedFromEvidenceIds / resolutionNote`
- Merge 結果另存 merged value、headers 與 rows，不覆寫原始 Evidence
- Merge 僅允許可安全對齊的 table；設定表可按設定 row 合併互補欄位，重疊數值衝突時拒絕 Merge
- 排除 Evidence 後若仍存在 conflict / incomparable / duplicate，不允許誤標為 resolved
- Draft metric 完成後顯示 `RESOLVED · SOURCE_SELECTED / MERGED / REJECTED`
- `agree` 不要求 Resolution；`single` 維持單來源 reviewed evidence，不標示為 multi-source verified
- UI 與 server-side Approve 雙重阻擋 unresolved conflict / incomparable / duplicate_source，顯示「尚有 X 個未解決資料衝突」
- resolved benchmark supply 僅接受人工保留／合併且已 approved 的 Evidence；rejected resolution 不供應 estimator
- 重新 extraction 時只有 resolution 所引用 Evidence 仍存在才保留 resolution，避免 stale audit 誤套用新資料

東京喰種 Golden Test dry-run（未寫入 Draft）：
- `endScreenIndications`：一撃 + なな徹可 Merge，保存 2 個 Evidence IDs 與 16 筆原始合併 rows ✅
- `weakCherryCzSuccessRate`：一撃 3 欄 + なな徹 4 欄可安全對齊為 4 欄、6 個設定 rows；未補猜缺失值 ✅
- dry-run 前 Draft unresolved count = 2；測試未修改或核准實際 Draft ✅

Regression QA：
- conflict blocks profile approval ✅
- incomparable blocks profile approval ✅
- select source resolves conflict ✅
- merge resolves conflict ✅
- reject evidence ✅
- unresolved remains blocked ✅
- original evidence preserved ✅
- resolved metric does not alter unrelated metrics ✅
- lint ✅
- typecheck ✅
- tests：**112 / 112 passed** ✅
- production build：Next.js webpack build ✅
- localhost Profile Builder：HTTP 200 ✅

### v0.2.5 – Verified Draft Promotion to Machine Profile
Status：**Completed；等待人工驗收，尚未核准**

- Builder 將原本容易誤解的 `Approve Profile` 改名為 `Verify Draft`
- verified Draft 才顯示獨立的 `Publish Profile`，Publish 前必須建立 Preview / Diff 並再次人工確認
- Preview 顯示現有／下一版狀態、替換 placeholder 欄位、停用 TEST benchmarks、新增 real benchmarks、新增／移除 Counters 與 dependency blockers
- 新增版本化 server-side storage：`data/published-machine-profiles.json`
- 每版保存 `profileVersion / previousProfileVersion / publishedAt / sourceDraftId` 與完整 Machine snapshot
- 首次 Publish 同時保存 version 0 placeholder baseline，因此可 rollback 至發布前 Profile
- Publish 以 temporary file + rename 原子寫入；dependency validation 失敗時不寫入任何版本
- 第一版 real benchmark conversion 僅開放可由 Session 明確觀測、雙來源 agree 且 Evidence approved 的 AT 初當與 CZ 初當
- 東京喰種 AT／CZ real benchmark 均使用 `rate`、`observedNormalGame` denominator，保存設定 1～6、Evidence IDs、source count、reviewed timestamp、`verified=true / testData=false`
- AT 引き戻し、下段リプレイ、弱チェリー CZ 當選率目前因缺少獨立可靠 observation dependency，不自動轉為 benchmark
- 已人工核准的 `endScreenIndications` recommendation 會 promotion 為 choice Smart Counter，選項由人工採用的結構化 Evidence 建立
- 正式 Profile 不包含 TEST benchmark 或 TEST Counter；TEST DATA 仍保留在 placeholder／開發 fixture，不刪除歷史
- Machine Card server-side 讀取 active published version；verified Profile 顯示版本、來源與 Verified Data
- 新 Session 保存完整 `profileSnapshot`；既有 Session 不修改、不重算，仍向後相容使用原 Machine Profile
- development/admin 提供 `Rollback to Previous Profile`，只切換 active version，不改寫 Session 歷史
- 未修改 Setting Estimator likelihood 數學；verified Profile 使用 real benchmarks，placeholder Profile 繼續使用明確標示的 TEST DATA
- 東京喰種人工 Golden Test 已完成 Publish：active Profile 為 `verified` v1，保留 version 0 placeholder baseline 可供 rollback

Golden Test dry-run（未寫入發布資料）：
- verified 東京喰種 Draft → Preview `canPublish=true`、0 blockers ✅
- real benchmarks：`atInitialRate`、`czInitialRate`，denominator 均為 `observedNormalGame` ✅
- promoted Counter：`endScreenIndications` choice ✅
- 移除 production Profile placeholder Counters：`focusRole / specialCue / sceneMemo / testSettingEvidence` ✅
- resulting Profile status：`verified`；TEST DATA 不在 production Profile 使用路徑 ✅

Regression QA：
- only verified Draft can publish ✅
- publish preview diff ✅
- unresolved conflict blocks publish ✅
- benchmark dependency validation ✅
- TEST DATA not active after publish ✅
- approved Smart Counter promoted ✅
- placeholder replaced by verified Profile ✅
- existing Session preserved ✅
- new Session uses new Profile snapshot ✅
- rollback works ✅
- failed publish does not partially modify Profile ✅
- lint ✅
- typecheck ✅
- tests：**123 / 123 passed** ✅
- production build：Next.js webpack build ✅
- localhost Profile Builder：HTTP 200 ✅

### v0.2.5.1 – Verified Machine Card Presentation
Status：**Completed；等待人工驗收，尚未核准**

- 僅修改 Machine Card presentation layer；未修改 publish storage、benchmarks、Setting Estimator 數學、Smart Counter、Session snapshot 或 Evidence resolution
- Verified Profile 不再顯示 placeholder 專用說明；尚無 Verified Data 的區塊統一顯示「此項目前尚無已驗證資料」
- 正式 Machine Card 使用繁體中文 metric label，不顯示 `atInitialRate` 等 internal metric key
- Verified Data 依已發布 Profile 的 `sourceDraftId` 讀取對應 Evidence audit，只呈現最終 resolution 狀態
- `source_selected` 顯示「已人工核准 · 採用來源」；原始 conflict / incomparable history 仍完整保留於 Draft / admin audit
- single source 顯示「單一來源 · 來源名稱」，不誤標為 multi-source verified
- multi-source agree 顯示「2 個來源一致 · 一撃 + なな徹」
- 設定 1～6與終了畫面資料改為結構化 HTML table，不再 flatten 成工程用長字串
- 東京喰種 active published Profile 維持 `verified` v1，未改寫任何發布資料

Regression QA：
- human-readable metric labels ✅
- resolved conflict 顯示最終採用來源 ✅
- selected Evidence 保留 structured table ✅
- single-source 標示不冒充多來源 ✅
- multi-source agree 顯示來源數與來源名稱 ✅
- lint ✅
- typecheck ✅
- tests：**128 / 128 passed** ✅
- production build：Next.js webpack build ✅

### v0.2.2.3 – Identity Precision & Debug
- Phase 1 evidence schema 分離正式 title、franchise / IP、mode / stage 與 manufacturer mark
- `visibleOfficialTitleCandidates` 包含文字與信心值；高信心正式 title 會啟用程式端 precision gate
- 正式 title 與 Catalog officialName / alias 一致度不足時禁止 `identified`
- 阿拉伯數字、Roman numeral、RE:2 / RE:3、V / V-30、-30 等版本 token 衝突時至少降為 `uncertain`
- 版本一致性納入 shortlist 排序，BIOHAZARD RE:3 優先於其他 BIOHAZARD 版本
- evidence 優先順序：正式 title → 版本一致 → Catalog title / alias → manufacturer → cabinet → franchise → generic mode / stage
- 低順位 evidence 不可覆蓋正式 title 或版本衝突
- Catalog match 與 Machine Profile exists 在 UI 分開顯示
- 只有 Catalog 時顯示：`已匹配 Machine Catalog｜尚未建立攻略 Profile`
- development identification debug 顯示 Phase 1 evidence、search query、Top 20 shortlist、score、match reasons 與 Phase 2 decision reason
- production response 不附加 development debug
- BIG DREAM 完整 pipeline 會同時使用 official title、search terms、franchise 與 visible text 召回；Phase 2 未選取時提供明確 reject reason
- derived recognition terms 仍只存在 server-side search index，未寫回 Catalog JSON
- 保留 generic GOD / Bullet safety rule，不為 recall 犧牲 precision
- 未修改 Session、Setting Estimator、P-WORLD importer、Machine Profile 或 benchmark

Regression QA：
- 東京喰種 → correct ✅
- BIOHAZARD RE:3 → correct，版本候選排序正確 ✅
- 戰國乙女5 → Catalog match，無 Profile 狀態文字正確 ✅
- とある魔術の禁書目録2 ≠ 一方通行；版本衝突降為 uncertain ✅
- BIG DREAM complete pipeline 進 shortlist，Phase 2 reject 有原因 ✅
- GOD generic token 不硬判 ✅
- Bullet of Bullets 不唯一時維持 uncertain ✅
- V-30 與 V suffix conflict 可偵測 ✅
- lint ✅
- typecheck ✅
- tests：**52 / 52 passed** ✅
- production build：Next.js webpack build ✅
- localhost `/identify`：HTTP 200 ✅

## Verified QA

### Session / Measurement
- Baseline 100 → Current 200 = observed 100G ✅
- 坐下 280 → Current 430 = observed 150G ✅
- 3 events / 150G = 1/50 ✅
- AT 2 / 150G = 1/75 ✅
- Trial 2/3 = 66.7% ✅

### Setting Estimator
以下全部為 **TEST DATA fixture，只用於驗證計算邏輯，不是真實東京喰種或任何真實機種資料**。

TEST CZ benchmark：
- S1 1/180
- S2 1/160
- S3 1/142
- S4 1/125
- S5 1/108
- S6 1/92

Low-setting test：
600G / CZ 3 次 → 1/200 → 低設定側上升 ✅

High-setting test：
600G / CZ 7 次 → 1/85.7 → 高設定側上升 ✅

Conflicting evidence：
CZ 偏高設定 + Trial 1/10 偏低設定 → 分布拉回中間，多證據正常合併 ✅

### AI Identification
- 東京喰種：Catalog match 後可正確匹配 L 東京喰種 ✅
- GOD：Catalog 內辨識明顯較準 ✅
- Catalog 外：回 uncertain / unknown，不再過度自信自由建立正式機種名 ✅

## Important Findings
1. Current Machine G ≠ Observed Session G
2. 不同機種不能使用固定 Counter
3. Smart Counter 必須 Machine Profile driven
4. Machine Identity 錯誤會污染 Profile / Counter / benchmark / Setting Estimator
5. Catalog-first 明顯比 AI 自由猜機種穩定
6. unknown / uncertain 優於錯接 Machine Profile
7. 正式名稱 / IP / 演出名稱必須分離
8. manufacturer 不可自行猜測
9. AI 搜到資料 ≠ Verified
10. Approval API 不得 silent truncate；前端 batching 後仍須以 API processed count 驗證完整性
11. Git 日常開發固定使用 `dev`；未經使用者明確驗收，不得 merge 回 `main`

## Current Work
**v0.2.5.1 – Verified Machine Card Presentation（Completed；等待人工驗收）**

核准穩定基準：**v0.2.3.1**

Repository workflow：目前 `main` 僅為 v0.2.5.1 的 **current working snapshot** 初始基準，不代表已通過完整人工驗收；後續日常開發使用 `dev`，未經明確驗收不得 merge 回 `main`。

v0.2.2.2：**Completed；等待使用者驗收，尚未核准**

v0.2.2.3：**Completed；等待使用者驗收，尚未核准**

Catalog 目前只負責：
**這是哪一台**

暫不混入：
- CZ / AT 機率
- 天井
- Zone
- 設定差
- Setting Estimator benchmark
- 攻略文章全文

## Next Step
### 等待 v0.2.5.1 人工驗收

Status：**不自行開始下一版本。**

v0.2.5.1 已完成並等待使用者驗收；不自行開始下一版本。v0.2.3.1 維持核准穩定基準。

## Machine Catalog Schema Direction
v0.2.2 目前實際保存：
- id
- officialNameJa
- displayNameZh
- manufacturer
- brand
- aliases[]
- seriesName
- machineType
- introducedAt
- sourceName
- sourceUrl
- sourceImageUrl（optional；只保存來源圖片 URL）
- retrievedAt
- catalogStatus
- verified
- sources[]（多來源 metadata）

不保存來源圖片檔案、攻略全文、天井、Zone、設定差或 benchmark。

## Future Roadmap

### v0.2.3 – Verified Machine Data
建議來源：
1. メーカー官方
2. なな徹
3. DMMぱちタウン
4. 一撃
5. ちょんぼりすた
6. 其他可信日文解析來源

資料：
- CZ 初當
- AT 初當
- 小役設定差
- 特定契機當選率
- 引き戻し
- 終了畫面
- Trophy
- 設定示唆
- Reset
- 天井
- Zone
- やめ時
- 打ち方

### Manual / QR
輸入優先順序：
1. 掃說明書 QR / URL
2. 說明書 / 網頁截圖
3. 拍機台本體

有 URL 時優先直接解析網址，不必先 OCR。

## Hard Rules
1. AI 搜到資料 ≠ Verified
2. Setting Estimator 只吃 verified benchmark
3. 有來源衝突時不得直接進 estimator
4. 不把攻略文章全文存進自己的資料庫
5. Catalog 與 Machine Profile 分離
6. 確定數字由程式計算
7. AI 負責辨識、理解、解釋
8. 不知道時直接 unknown / uncertain
9. manufacturer 不可自行猜測
10. 正式 Machine Identity 優先於 IP / 演出名稱
11. 不因演出熱度預測「快中了」
12. 寧可辨識失敗，也不要錯接 Machine Profile
13. 使用者確認後才正式載入辨識結果
14. API Key 只保存在 server-side environment variable
15. `.env.local` 不得 push 到 GitHub

## Recommended Project Workflow
每完成一個正式版本，Codex 應同步更新本檔：
`Slot_Companion_Project_Status.md`

新的 Codex 對話第一步：
> 先閱讀 `Slot_Companion_Project_Status.md`、`AGENTS.md`、`CLAUDE.md` 與目前專案。確認目前版本、已完成、已知問題與 Next Step。先不要修改程式，先回報你理解的專案狀態。

新的 ChatGPT 對話：
> 上傳最新版 `Slot_Companion_Project_Status.md`，並以此檔作為專案進度主要依據。

## Immediate Next Action
**驗收 v0.2.5.1 Verified Machine Card Presentation；v0.2.3.1 仍為核准穩定基準，不自行開始下一版本。**

目前不要開始 Verified Machine Data，不要修改 Setting Estimator，也不要將 TEST DATA benchmark 描述為真實機種資料。
