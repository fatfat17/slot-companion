# Slot Companion Project Status

Last Updated: 2026-08-30

## Current Version
**Nearby Halls Area Search & Inventory**

Status：**功能、本機工程 QA 與固定 dev Preview 自動 QA 已完成；等待手機人工驗收**

目前核准穩定基準：**v0.2.3.1**

Git repository 初始 `main` 基準：**v0.2.5.1 current working snapshot（等待人工驗收，不代表 fully approved stable）**

## Product Goal
手機優先的日本 Pachislot / Smart Slot 輔助工具。

核心流程：
**Scan → Understand → Track → Estimate**

- Scan：QR、說明書、截圖、機台照片
- Understand：依已配對 Catalog 的公開 P-WORLD 資料建立繁體中文機台指南
- Track：依既有 Machine Profile 或機台指南 Session snapshot 建立 Counter
- Estimate：只用來源確實提供、可完整解析且能由 Session 觀測的機率做參考推測

Catalog-only 辨識後目前可部署的 Production 流程：
1. AI 辨識成功後，使用者確認該機台符合既有 Machine Catalog record
2. 若已有 Verified Profile，直接載入正式攻略並開始 Session
3. 若尚無 Profile，只前往 Machine Catalog Detail，不直接進入 production 不可達的 development Builder
4. Catalog Detail 清楚顯示「攻略 Profile 尚未建立」與「Profile Lab 雲端建立功能準備中」
5. localhost development 仍保留既有 Profile Builder，供 extraction／Evidence 流程測試

## Completed

### Nearby Halls Area Search & Inventory（2026-08-30）
- 手機 QA 發現完整英文地址會被整串交給 P-WORLD，導致「地址越完整反而越難找到」。本輪新增日本郵便官方 `KEN_ALL_ROME` 郵遞資料索引：**124,788 筆**，以約 **1.3 MiB Brotli** 檔案只供 server route 使用，不把完整地址庫送進 browser。
- 地址搜尋現在會先解析 `〒`／7 碼郵遞區號或官方羅馬拼音行政區，移除門牌後產生「都道府縣＋市區町 → 市區町 → 市區 → 區」的循序 P-WORLD 查詢；不並發大量 request、不使用付費 Google Maps API，也不宣稱精確距離。
- 實際範例 `1 Chome-6-5 Nanbanaka, Naniwa Ward, Osaka, 556-0011日本` 可辨識為 `大阪府大阪市浪速区難波中`；runtime 依序放寬後以 `大阪市浪速区` 取得 **6 間** P-WORLD 店家。`Nanbanaka / Nambanaka` 的羅馬拼音差異亦已正規化。
- 日本郵便索引可由 `scripts/build-japan-postal-index.ts` 重建，來源網址、擷取日期與解析原因會隨 API response 保留；Next.js output trace 已確認包含索引檔。
- 本輪工程 QA：lint 通過、typecheck 通過、完整 automated tests **345 / 345 passed**、Next.js 16.3.2 webpack production build通過；localhost production `/halls` HTTP 200、完整大阪英文地址 API 實頁 smoke 通過。預設 Turbopack build 仍受目前 sandbox port binding 限制，沿用專案既有 webpack production QA 路徑。
- 尚有限制：只有飯店／餐廳羅馬拼音名稱而沒有地址、行政區或郵遞區號時，仍無法普遍可靠定位；系統不會為了產生結果硬猜位置。
- 附近店家移除預設東京與都道府縣必填，改為單一地點輸入，可接受日文地區／車站／地址、有限繁中／英文日本地址與已知地標名稱；找不到時會依安全的市區／車站候選逐步放寬，不使用付費 Google Maps API，也不宣稱距離排序。
- 新增 P-WORLD 店家詳細頁 Slot 設置 parser 與 `/api/halls/detail`：使用者選定店家後可在 App 內查看目前登錄的 Slot 清單，並依 P-WORLD machine database ID 對應 Machine Catalog；已對應項目可直接進中文指南，未對應項目保留 P-WORLD 來源連結。
- Google Maps 從搜尋資料來源降為選定店家後的外部導航；App 不要求 GPS、不保存座標。來源失敗時保留 P-WORLD 店家資料，不影響 Catalog、Guide、Session、Estimator 或 AI。
- 指定輸入 runtime smoke：`VIA INN 名古屋新幹線口 / ヴィアイン名古屋新幹線口` 與 `Yamamotoya Honten Esukaten` 均安全轉為 `名古屋駅`，取得 `キング観光サウザンド名古屋駅柳橋店`；`7-4 Tsubakicho, Nakamura Ward, Nagoya, Aichi 453-0015日本` 轉為 `愛知県名古屋市中村区椿町`，取得 `ウイングレット`、`太陽`。
- P-WORLD 實頁店內機種 smoke：柳橋店讀取 **91 台 Slot**；Catalog ID 對應可產生中文指南連結。此處是來源當下結果，不保存為長期設置事實。
- 390 × 844 localhost 自動瀏覽器 QA：三組指定輸入、店家結果、店內機種展開與 Catalog 連結正常，console error 0。此為自動 QA，不冒充實體手機人工驗收。
- 工程 QA：lint **0 errors／0 warnings**、typecheck 通過、完整 automated tests **342 / 342 passed**、Next.js 16.3.2 webpack production build 通過。production server 的 `/`、`/halls`、`/catalog`、`/identify`、`/records` 均為 HTTP 200；餐廳名稱搜尋與店內機種 API smoke 通過。
- 產品 commit `4f9379d` 已 push 至 `origin/dev`。固定 dev Preview 已切換至本次版本；390 × 844 自動 QA 再次通過三組指定輸入、91 台店內 Slot 清單與 Catalog 中文指南連結，頁面寬度 390 / 390、console error 0。
- 尚待完成：使用者實體手機抽查。以上自動 QA 不冒充手機人工驗收。

### Nearby Halls Search Polish & Session Scene AI（2026-08-30）
- iPhone Safari 的「附近店家」不再於非同步 GPS callback 開新視窗，改以正常連結直接交給 Google Maps 處理目前位置；App 不取得、保存或上傳座標。
- P-WORLD 店家搜尋新增常用日本地區快捷項目，以及繁體中文／英文地名至日文查詢詞的有限別名轉換，例如 `豐州／Toyosu → 豊洲`、`澀谷／Shibuya → 渋谷`。轉換後會明確顯示實際搜尋詞，0 結果時提供可操作的替代方向。
- AI Companion 回答新增安全文字格式化：支援短段落、條列與強調，不再把 `**` Markdown 符號原樣顯示；server prompt 同時要求不輸出 Markdown 表格或符號。
- Session AI Companion 新增「拍現在畫面」與「從相簿選擇」。沿用既有 client-side 圖片壓縮、Vercel 相容上限與 server-only `OPENAI_API_KEY`；模型可由 `OPENAI_SESSION_SCENE_MODEL` 集中設定。
- 場景辨識只能在該 Session snapshot 的 `operational` controls 內提出候選；AI 自創、read-only、unavailable 或其他機台 control ID 會被 server sanitizer 移除。低資訊／模糊／不唯一畫面維持 uncertain／unknown。
- 辨識結果不會自動改狀態或計數。使用者必須按「確認並記錄」或「只切換狀態」才會寫入既有 Session；Choice 只會開啟既有選項。原始與壓縮圖片只作暫時 preview，不進 localStorage、Session、Catalog 或雲端圖片庫。
- 回歸 QA 覆蓋地名轉換、Google Maps direct handoff、AI answer formatting、operational-only context、invented control rejection、人工確認與圖片不保存。lint **0 errors／0 warnings**、typecheck 通過、完整 automated tests **337 / 337 passed**；Next.js 16.3.2 webpack production build通過。預設 Turbopack build 在受限 host 因 CSS worker 無法 bind port，沿用專案既有 webpack production QA 路徑完成。
- 尚未完成：固定 dev Preview deployment／自動瀏覽器 QA、實體手機 GPS／店家搜尋與真實場景照片辨識。不得把本機 automated QA 標成實體手機驗收。

### Nearby Halls & Session AI Companion MVP（2026-08-30）
- 首頁移除「晚上撿台」主要入口，以「附近店家」取代；舊 `/hunter` route 暫時保留相容，不刪除歷史功能。
- 新增 `/halls` 玩家頁與 `/api/halls/search` server route。可依日本都道府縣、店名／車站／地址及機種名稱查詢 P-WORLD 公開店家列表，顯示店名、地址、Slot 費率、P-WORLD 店家資料與 Google Maps 導航。
- Catalog Detail 新增「附近哪裡有這台」，會把 Catalog 的 `officialNameJa` 帶入 P-WORLD `machine_name` 查詢；不另建或猜測設置店家資料。
- 裝置定位只在使用者點擊「使用目前位置」時由瀏覽器要求，定位結果交給 Google Maps 搜尋，不寫入 localStorage／Session／Catalog，也不宣稱 App 內精確距離排序。
- P-WORLD 實頁 smoke 已確認目前東京搜尋頁可解析候選店家：八王子關鍵字取得 **19 筆**，先前機種搜尋取得 **50 筆**；店名、地址、Slot 費率、更新時間、來源頁與周邊連結均可解析。已處理實頁未加引號 href 與巢狀周邊連結；來源失敗時回傳明確錯誤並保留原始搜尋入口，不繞過來源限制。
- Session「問 AI」由 mock drawer 升級為 server-side OpenAI Responses API。只送出 bounded Session snapshot、可操作紀錄與 Machine Guide 結構化資料；`store:false`，Key 不進 browser bundle／localStorage。
- AI 陪玩使用集中設定 `OPENAI_SESSION_COMPANION_MODEL`，未設定時沿用 Guide／Identification model；缺少 Key、請求失敗或無答案時顯示明確錯誤，不 fallback 假回答。
- AI 陪玩不可修改 Session，禁止編造機率、天井、Zone、設定差與獲利保證；對來源缺失項目必須說明目前指南沒有資料。
- 新增 P-WORLD hall parser／reverse lookup 與 AI input bounding／grounding regression tests；既有 Catalog、Guide、Session、Control Manifest、Estimator 與圖片辨識程式未改動。
- 本機工程 QA：lint、typecheck、完整 tests **330 / 330 passed**、Next.js 16.3.2 webpack production build均通過。production server smoke 的 `/`、`/halls`、`/catalog`、Catalog Detail 均為 HTTP 200；AI 空問題正確回 400，店家 API 實頁查詢回 200 與 19 筆八王子候選。
- 產品 commit `9ea1a54` 已 push 至 `origin/dev`。固定 dev Preview 390 × 844 自動 QA：首頁顯示「附近店家」且不再顯示「晚上撿台」；八王子查詢取得 19 間店家；RE:3 Catalog Detail 可把 `officialNameJa` 帶入機種反查；既有 Session 的 AI Companion drawer 可正常開啟並顯示該 Session 摘要與提問入口。上述頁面 scroll width 390px，console error／warning 0。此項是自動 QA，不冒充實體手機人工驗收；為避免未經確認傳送使用者真實 Session，本輪未自動送出真實 AI 問題。

### Player Readiness & Travel Pack（2026-08-30）
- 依使用者決策，本輪不修改 Setting Estimator 的可信度曲線、公式、minimum sample 或安全閘門；現有結果仍明確定位為參考推測。
- Catalog Detail 與完整 Machine Guide 在建立 Session 前新增 Estimator 支援提示：只有既有 eligible metric 與 observation contract 完整時顯示「支援設定參考」，其餘顯示「遊玩紀錄模式」與實際缺口，不用進 Session 才發現無法計算。
- Machine Catalog 將同一份可重現 Control Audit 接到玩家卡片：102 台標示「支援設定參考」、100 台標示「僅遊玩紀錄」，並提供三段式篩選「全部／支援設定參考／僅遊玩紀錄」。標籤不依機種名稱猜測，也不要求先建立 browser-local Guide cache；搜尋、收藏／最近、年份、排序與 pagination 可繼續組合使用。
- Machine Catalog 新增收藏／最近機台的批次 Guide 更新。來源請求依序執行、不並發；進度保存於 browser localStorage，單台失敗不清除舊 Guide，且可從未完成項目續傳。
- 新增旅行離線包：先更新選定 Guide，再將 Guide JSON 保存在既有 IndexedDB／localStorage fallback，並把 Catalog／Guide 頁面、核心 routes、Next.js 靜態資產及同源指南圖片保存於 Cache Storage。離線包只屬目前瀏覽器，不是跨裝置雲端同步。
- Service Worker shell cache 更新為 `slot-companion-shell-v2026-08-30`，核心玩家 routes 納入版本化預快取；升級時保留 `slot-companion-trip-pack-*` 離線包，不清除 Session、Guide JSON、自訂記錄或其他使用者資料。
- `/machines` 玩家入口改導向 `/catalog`；Catalog Detail 的舊 Machine Card 入口移入「舊版相容資料」，直接舊網址仍保留相容提示與回到機台指南的主要操作，既有 Session 不受影響。
- 新增 estimator preflight、Catalog estimator coverage／filter、批次循序／續傳／partial failure、離線 URL／圖片 route、Service Worker cache preservation 與 legacy route regression tests；完整 automated tests **324 / 324 passed**，lint、typecheck 與 Next.js 16.3.2 webpack production build通過。
- localhost 390 × 844 自動 QA：支援篩選顯示 102 台且當頁 24 張卡片全為支援標籤；僅遊玩紀錄顯示 100 台且當頁全為不支援標籤；再搜尋 `マクロスフロンティア4` 正確縮小為 1 台並保留「僅遊玩紀錄」。console error 0。此為自動瀏覽器 QA，不冒充實體手機人工驗收。
- Estimator Catalog 可見性產品 commit `7603a56` 已 push 至 `origin/dev`；固定 dev Preview 已顯示兩個篩選且線上計數為 102／100，console error 0。
- localhost production smoke 已確認 `/catalog` 顯示批次更新與旅行離線包，收藏狀態可切換且不影響既有 Guide／Session；`/machines` 相容入口導向玩家 Catalog。產品 commit `5bd631f` 已 push 至 `origin/dev`，GitHub／Vercel status 顯示本 commit `success / Deployment has completed`，固定 dev Preview 已更新；實體手機離線切換仍待使用者驗收，不冒充人工驗收通過。
- 資料保存位置：Guide JSON 為 browser IndexedDB（localStorage fallback）；批次進度與離線包 manifest 為 localStorage；頁面、共用資產與圖片為 Cache Storage。來源更新失敗時保留上一份有效 Guide，離線包會列出失敗素材。

### Setting Estimator Coverage Expansion（2026-08-30）
- 在全 202 台 Machine Guide 資料完成後，新增共用 `small_role` observation module：只有完整設定 1～6 表格且角色名稱可由玩家直接觀察時，才建立來源可追溯的 Counter 與 `observedTotalGame` denominator。
- 具名 CZ／AT／ART／Bonus metric 改用正規化後的精確 event identity；僅無事件名的通用初當／出現率表頭可在唯一同類 capability 時採有限 context fallback，不逐機硬編碼。
- `合成`、條件式當選率、狀態內機率、成功期待度與無可靠 denominator 的表格仍維持 blocked；Estimator 數學、minimum sample、完整設定值與重複／衝突 benchmark 防護均未放寬。
- 修正 token 判斷：`BATTLE BONUS` 不再因字串中含 `AT` 而誤分類成 AT。
- 兩次完整節流 audit 均為 **202 / 202 成功**且 JSON 完全一致（SHA-256 `ce367ffd471c27b32752b4ea6a596836dae5ce8be12b49615b2abdc654328db0`）。Estimator eligible 由 **79 台／118 metrics** 提升為 **102 台／225 metrics**；generic CZ／AT fallback 維持 0。
- 其餘 100 台安全停用：67 台來源無完整設定 1～6 metric，33 台缺唯一 canonical numerator；沒有把缺失值當 0 或產生推測數值。
- Machine Guide cache revision 更新為 `2026-08-30-estimator-observation-coverage-16`；既有 Session snapshot、G 數、事件、Choice、自訂記錄與歷史均不改寫，新結果只套用重新建立 Guide 後的新 Session。
- 工程 QA：lint 通過；typecheck 通過；完整 automated tests **314 / 314 passed**；Next.js 16.3.2 webpack production build 通過。預設 Turbopack build 在受限 host 因 CSS worker 無法 bind port，沿用專案既有 webpack production QA 路徑完成。
- localhost production smoke：`/`、`/catalog`、`/guides/machine-1y0erql`、`/identify`、`/records`、legacy Session fallback route 均 HTTP 200。
- 產品 commit `5d6a620` 已 push 至 `origin/dev`；Vercel deployment 顯示本 commit `Ready`，固定 dev Preview 已指向本次版本。
- 固定 Preview 390 × 844 自動 QA 抽查本輪新增小役 observation coverage 的 `吉宗RISING`（`machine-1gnkhdb`）：Catalog Detail 與 Guide route 均正常、scroll width 390px、console error／warning 0。尚未建立 Guide 時正確顯示建立入口，沒有偷偷改寫 Session 或生成推測結果。此項是自動 QA，不冒充實體手機人工驗收。
- 可重現逐機報告：`reports/machine-catalog-control-audit.json`。

### P-WORLD 圖文中文攻略 Full Catalog Expansion（2026-08-30）
- 取消歷史 50 台 registry 的功能 gate；Catalog 目前 **202 / 202 台**均使用相同的 official-section、evidence-gated 圖文 parser／compiler／materializer，沒有逐台新增 UI 或 parser 特例。
- Machine Guide compiler revision 更新為 `2026-08-30-visual-guide-all-catalog-15`，visual asset revision 更新為 `visual-assets-4`。只使舊 Guide cache 失效；既有 Session snapshot、G 數、事件、Choice、自訂記錄與歷史均不改寫。
- 完整 Machine Guide JSON 由 localStorage 遷移到 browser IndexedDB `slot-companion-machine-guides`；成功遷移後只移除該 Guide 的舊大型 cache，保留小型狀態 marker。Session、今日紀錄、Catalog 與其他 localStorage key 不受影響；無 IndexedDB 時保留安全 localStorage fallback。
- 全量節流真實來源 audit：**202 / 202 成功、0 來源失敗、3,140 張合規候選、2 台基本記錄模式、79 台具至少一個既有安全 estimator metric**。
- 全量 source-only materialization audit：**202 / 202 Guide 成功、3,133 張可用圖片、7 張來源／格式失敗而安全排除、403,968,676 bytes（約 385.3 MiB）、0 capacity warning**。未保存來源 HTML 或圖片；本輪 audit 不寫入雲端。
- 所有機台在 Vercel 以使用者建立／重新整理 Guide 時按需 materialize 到既有 private Supabase bucket；沒有假裝 3,133 張已全部預先上傳。來源失敗時維持既有 fallback 與安全排除。
- 新增全 202 台共用 visual pipeline regression、IndexedDB 遷移與 Session key 不受影響測試；完整 automated tests **312 / 312 passed**。
- 最終工程 QA：lint 通過；typecheck 通過；Next.js 16.3.2 webpack production build 通過。localhost production smoke 的 `/`、`/catalog`、`/guides/machine-1y0erql`、`/records` 均 HTTP 200。
- 產品 commit `4947e6b` 已 push 至 `origin/dev`，固定 dev Preview 已更新。390 × 844 自動 QA 以歷史 50 台 registry 外的 `machine-frx2z3`（パチスロ武装神姫）建立新版指南：16 個 figure、首屏圖片 590px 正常載入、scroll width 390px、console error／warning 0，並顯示「此瀏覽器 IndexedDB」及「私人雲端資產」。
- 固定 Preview 亦確認既有東京喰種 Session 可正常載入原 snapshot、控制項與既有計數；新版 Guide／compiler 沒有重寫舊 Session。上述是自動瀏覽器 QA，不冒充實體手機人工驗收。
- 可重現報告：`reports/visual-guide-catalog-source-audit.json`、`reports/visual-guide-catalog-materialization-audit.json`。

### P-WORLD 圖文中文攻略 Scale Pilot — 第三批 25 台（2026-08-30）
- 第二批手機快速抽查已由使用者確認通過：A-type／Bonus 與複雜 CZ／AT／ART 代表頁的圖片載入、中文區段順序及 Session 內指南入口均可用；第二批正式完成手機驗收。
- 第三批固定選取 25 台跨導入月份、廠商與機型代表樣本，涵蓋 A-type、Bonus loop、cycle／point AT、multi-zone AT、set-based AT 與 low-confidence generic；沒有逐機新增 parser、UI、Control 或 Estimator 特例。
- 圖文 registry 擴為 **50 / 202 台**；asset revision 更新為 `visual-assets-3`，Guide compiler revision 更新為 `2026-08-30-visual-guide-scale-pilot-14`。只失效 Guide cache，既有 Session snapshot、G 數、事件、Choice、自訂記錄與歷史不改寫。
- Audit 新增 `--pilot third` 與 `--source-only`；後者即使本機已有 Supabase 設定，也只下載量測來源資產，不寫入雲端。
- 第三批兩次節流、只讀 runtime audit 結果（排除 `generatedAt`）完全一致：**25 / 25 成功、388 張、49,707,828 bytes（約 47.4 MiB）、0 容量 warning、6 台具至少一個既有安全 estimator metric**。
- 工程 QA：lint 通過；typecheck 通過；完整 tests **310 / 310 passed**；Next.js 16.3.2 webpack production build通過。
- localhost production smoke：`/`、`/catalog`、第三批 `machine-xdvn75` Guide 均 HTTP 200；Guide API status `usable`、18 張圖片、2,368,245 bytes、0 warning，雲端未設定時正確使用 source fallback。
- 產品 commit `335a7ad` 已 push 至 `origin/dev`，Vercel 顯示 Deployment completed，固定 dev Preview 已指向本次版本。
- 第三批 **25 / 25 台**均由固定 Preview 成功取得最新 Guide response 並執行 server-side 圖文 materialization；其中目前測試瀏覽器可保存並直接呈現前 23 台，皆顯示「私人雲端資產」、console error 0。Runtime 共保留 **387 張**，較 source-only audit 的 388 張少 1 張；`machine-pa662a` 實頁本輪為 10 張而 audit 時為 11 張，依安全規則保留實際可用圖片，不補猜或補圖。
- 390 × 844 自動 UI QA 抽查 A-type `machine-1jurstr`、複雜 AT `machine-5ilch3`、low-confidence generic `machine-v47drd`：分別呈現 11／18／16 個 figure，首兩張同源圖片皆成功載入，scroll width 均為 390px，console error 0。1280 × 900 桌面抽查 `machine-1m0hi5t` 呈現 18 個 figure、無水平溢出、console error 0。
- 自動擴張測試也確認 browser-local Guide JSON 的容量邊界：同一瀏覽器累積大量完整指南後，最後兩台雖已收到成功 Guide response，localStorage 因空間不足而拒絕保存。既有 Session、Catalog、Guide cache 與使用者資料均未清除；這不影響 server-side 圖片 materialization，但代表後續擴張前需將 Guide JSON 移至 IndexedDB 或雲端持久層，不能把 localStorage 當全量 202 台快取。
- 上述為固定 Preview 自動 QA，不等同實體手機人工驗收；第三批仍等待使用者快速抽查。

### P-WORLD 圖文中文攻略 Scale Pilot — 資產治理與第二批 20 台（2026-08-30）
- 既有五台人工驗收基準不變；相同共用 pipeline 新增第二批 20 台 registry，涵蓋 A-type、Bonus、ART、CZ→AT、多 Zone、Set／loop 與不同資料完整度，沒有新增逐機 parser、Machine Family、Session UI 或 Estimator 特例。
- 新增 `VisualGuideAssetReport`、資產 revision、versioned manifest、per-machine bytes／最大檔案／去重／拒絕／cleanup 統計與容量 warning。Manifest 只保存 object path、來源 URL、bytes、content type 與 compiler revision，不保存來源 HTML。
- 雲端重建採安全 reconcile：只有同一台本輪全部圖片成功後，才刪除該 Catalog ID 下不在新 manifest 的舊檔；部分失敗會保留上一版資產且跳過 cleanup，不會跨機台刪除或污染。
- Machine Guide cache revision 更新為 `2026-08-30-visual-guide-scale-pilot-13`；只使舊 Guide cache 失效，既有 Session snapshot、G 數、事件、Choice、自訂記錄與歷史不改寫。
- 第二批真實 P-WORLD runtime **20 / 20 成功**；官方區段候選 284 張，合規保留 **283 張／38,452,833 bytes（約 36.67 MiB）**，所有單機低於 12 MB warning threshold。
- Hyper Rush 有 1 張來源圖片 **1,281,108 bytes**，超過 1 MB 單圖硬上限而被安全排除；warning 可追溯，未以其他圖片或猜測內容補齊。
- 兩次獨立、節流、不下載圖片的 audit 結果（排除生成時間）完全一致：20 / 20 成功、284 張候選、11 台具至少一個既有安全 observation contract 可用的 estimator metric。
- 可重現工具：`scripts/audit-visual-guide-pilot.ts`；輸出 `reports/visual-guide-scale-pilot.json`。報告保存 Catalog ID、名稱、來源 URL、family、controls、estimator eligibility、圖片容量與 warning，不保存來源頁或圖片內容。
- 工程 QA：lint 通過；typecheck 通過；完整 tests **310 / 310 passed**；Next.js 16.3.2 webpack production build 通過。預設 Turbopack build 在受限 host 因 PostCSS worker 無法 bind port，沿用專案既有 webpack production QA 路徑完成。
- localhost production smoke：`/`、`/catalog`、第二批 LB Triple Crown Guide 均 HTTP 200；Guide API 為 `usable`、圖片 9 張、無 warning，Session controls 僅 BIG BONUS／REG BONUS；同源圖片 route 回傳 JPEG 200。
- 固定 dev Preview 已部署產品 commit `4474dff`，第二批 **20 / 20 台**均透過 Catalog Detail 重新建立最新指南，全部顯示「私人雲端資產」；畫面合計呈現 **283 個 figure**，與本機 materialization audit 的合規保留數量一致，console error 為 0。
- 固定 Preview 390 × 844 自動 QA 抽查 LB Triple Crown、戰國乙女5、Street Fighter 6、Hyper Rush：四頁均無水平溢出、雲端圖文狀態正常；首屏圖片完成同源載入。1280 × 900 桌面抽查 Street Fighter 6 顯示 16 個 figure、首兩張圖片 natural width 590、無水平溢出與 console error。此為自動 QA，不等同實體手機人工驗收。
- 手機快速抽查（使用者確認，2026-08-30）：A-type／Bonus 與複雜 CZ／AT／ART 代表機種均通過，圖片載入、中文區段順序及 Session 內指南入口可用；第二批 20 台驗收完成。
- 第二批完成時範圍為 **25 / 202 台**；後續第三批另列於上方。任何批次均不代表全量 Catalog 的長期容量、流量或來源權利已核准。

### P-WORLD 圖文中文攻略 Five-Machine Pilot（2026-08-30）
- 使用者確認 RE:3 單機圖文指南與 Session 內圖文 drawer 可用後，將相同 pipeline 擴張到五台代表機種：`スマスロ バイオハザードRE:3`、`スマスロ やじきた道中記参る!`、`Lパチスロ 喰霊‐零‐Re`、`L 東京喰種`、`L ULTRAMAN 最終決戦`。
- 以明確 Pilot registry 限定範圍；五台共用同一套 P-WORLD official scope、heading ownership、圖片 host／格式／尺寸／大小 gate 與 Supabase materializer，沒有新增逐台 parser、Machine Family 或 Session UI 特例。
- 內建 Choice、Control Manifest、Estimator observation contract、Session snapshot 與既有遊玩紀錄均未改動；Guide cache revision 更新為 `2026-08-30-visual-guide-five-machine-pilot-12`，只使舊 Machine Guide cache 失效。
- 真實 P-WORLD runtime 五台全部 HTTP 200，每台 parser 均選出 18 張可靠來源圖片。90 張 materialization 全部通過，總量 **12,609,164 bytes（約 12.03 MB）**，最大單張 **784,525 bytes**，五台皆為 0 warning。
- 自動 UI QA 發現やじきた的中文摘要未包含其中一個有圖片的來源區段，造成 18 張中只呈現 14 張；已新增共用 visual section selector。中文摘要缺少某 source section 時會顯示簡短「先查看來源圖解」fallback，保留可靠圖片且不猜測內容，完整 Guide 與 Session drawer 共用相同結果。
- Regression tests 新增五台 registry、試點外隔離、每機 Supabase object path ownership、跨機圖片不污染、逐來源 section 圖片不可被中文摘要漏掉等案例。
- 工程 QA：lint 通過；typecheck 通過；完整 tests **306 / 306 passed**；Next.js 16.3.2 webpack production build通過。
- localhost 390 × 844 最終 UI QA：五台 Guide 均顯示「圖文指南」及 18 個 figure，scroll width 均為 390px，console 0 errors／warnings；同源圖片 API 可正常回傳 JPEG。這是自動 QA，不等同實體手機人工驗收。
- 固定 dev Preview 已部署 commit `a4d669f`。五台均重新建立為新版 cache、各顯示 18 張圖與「私人雲端資產」，やじきた先前因摘要缺 section 而只顯示 14 張的情況已複驗為 18 張；五台頁面未見 alert 或 console error。Pilot 新增的やじきた同源圖片 API 已從舊版 404 變為正常圖片回應，確認固定網址指向本次部署。此項是自動 QA，不等同實體手機人工驗收。
- 實體手機人工驗收（使用者確認，2026-08-30）：五台 Pilot 的圖文中文指南、圖片載入與使用流程均無誤，驗收成功。此結果只核准本次五台 Pilot，不代表其餘 197 台已完成圖文資產建立或容量／權利評估。
- 容量邊界仍維持每台 18 張、單張 1 MB；本輪沒有批次處理其餘 197 台，也沒有宣稱已取得來源轉載授權或已完成完整 Catalog 的長期容量／流量方案。

### P-WORLD 圖文中文攻略 Golden Test（2026-08-30）
- 本輪只校準 `スマスロ バイオハザードRE:3`（Catalog `machine-1y0erql`／P-WORLD database 10440），未批次處理其餘 201 台，也未改寫 Catalog identity、Session、Control Manifest 或 Setting Estimator。
- P-WORLD parser 在官方 `#spec` 範圍內依 heading 分類圖片，只接受 P-WORLD 機台素材 host，排除掲示板、玩家投稿、廣告、外站圖片、過小圖片與重複 URL；不保存完整來源頁或攻略文章。
- 完整 Guide 將圖片依流程、CZ、AT／ART、Bonus 與打法區段配回繁中內容；首頁新增「快速中文攻略」入口，玩家仍先搜尋 Catalog，再進入相同 Guide-first 流程。
- Golden Test 圖片上限為 18 張、每張 1 MB。真實 P-WORLD runtime 取得 **18 / 18** 張，總量 **2,704,314 bytes（約 2.58 MB）**，最大單張 **784,525 bytes**，無下載 warning。
- Vercel 有 server-only Supabase 設定時，圖片以 upsert 寫入 private `machine-guide-assets` bucket，瀏覽器透過同源 `/api/machine-guide-assets/[catalogId]` 讀取，不取得 secret；未設定 Supabase 時回退來源即時讀取。Guide JSON 仍保存在 browser localStorage，不宣稱跨裝置同步。
- Machine Guide cache revision 更新為 `2026-08-30-visual-guide-golden-test-11`，只失效舊 Guide cache；既有 Session snapshot、G 數、事件、Choice、自訂記錄與歷史不改寫。
- 最小整理 **TEST DATA** fixture 覆蓋：官方圖片選取、URL 去重、section ownership、BBS／外站／小圖排除、Golden Catalog 限制、無雲端 fallback 與 Supabase private upload。
- 本機 QA：lint 通過；typecheck 通過；完整 tests **300 / 300 passed**；Next.js 16.3.2 webpack production build通過。預設 Turbopack build 在受限 host 因 PostCSS worker 無法 bind port，沿用專案既有 webpack production QA 路徑完成。
- localhost production smoke：`/`、`/catalog`、RE:3 Catalog Detail、RE:3 Guide 均 HTTP 200；Guide API HTTP 200、status `usable`、11 個內容區段、18 張圖、warnings 0；圖片 API 回傳 JPEG 200。
- 390 × 844 localhost 瀏覽器自動 QA：無水平溢出，18 個圖文 figure 全部成功載入，console 0 errors／warnings。此項是自動 QA，不等同實體手機人工驗收。
- 固定 dev Preview 已部署 commit `0bb74fc`。390 × 844 自動 QA 從 Catalog Detail 重新建立 RE:3 指南成功，顯示 18 張／2.6 MB 圖文素材與「私人雲端資產」，同源圖片 route 可正常開啟；首頁「快速中文攻略」入口與完整 Guide route 正常。此項仍是自動 QA，不等同實體手機人工驗收。
- Session Guide presentation follow-up：drawer 會從該機台目前有效的 Guide cache 讀取同一份圖文素材，依 Session state 優先顯示對應流程／CZ／AT／ART／Bonus 圖片，並可在不離開 Session route 的情況下延遲展開完整圖文；沒有圖文 cache 時維持精簡文字 fallback。
- Session 主操作 follow-up：狀態區改為 capability 驅動的一鍵分段按鈕，只顯示該 Session 支援的通常／CZ／AT／ART／Bonus 等通用狀態；不再顯示具名場景或開啟第二層「修正」視窗。具名事件仍留在快速記錄，按下後沿用 capability state effect 自動切換，回到通常只需一次點擊。
- Follow-up QA：lint、typecheck 通過；完整 tests **303 / 303 passed**；Next.js 16.3.2 webpack production build通過。390 × 844 localhost 自動 QA 確認分段狀態列單手可點、具名 CZ 記錄後自動切換、直接點通常可返回、reload 後狀態與計數保留；1280 × 800 無水平溢出，console 0 errors／warnings。固定 dev Preview 已部署 commit `b84d794`；RE:3 Session 顯示 `通常／CZ／AT`，無第二層修正入口、無水平溢出且 console 0 errors／warnings。此項是自動 QA，不等同實體手機人工驗收。
- 著作權／營運限制：這是使用者要求的個人 Golden Test，來源與擷取時間仍保留；未取得來源的轉載授權，不應在未重新確認權利與容量／流量方案前擴張到完整 Catalog 或 Production。
- 使用者已完成單機版面與 Session drawer 操作確認，並同意以此結果作為五台 Pilot 的擴張基準。

### Multi-source Machine Guide Pilot（2026-08-30）
- 架構決策：P-WORLD 繼續負責 Machine Catalog identity、導入資訊與日後店鋪／設置資料；ちょんぼりすた只作可選的指南補充來源。使用者不需重新輸入網址，五台試點由 server-side registry 配對來源。
- 五台試點：`スマスロ バイオハザードRE:3`、`スマスロ やじきた道中記参る!`、`Lパチスロ 喰霊‐零‐Re`、`L 東京喰種`、`L ULTRAMAN 最終決戦`。未列入 registry 的機種維持 P-WORLD 單一來源，不會被全站自動爬取。
- 新增 `Machine Guide Source Provider` 相容層、ちょんぼりすた deterministic parser、依序補充來源取得與 field-level merge。Parser 僅讀取正文 container 的 heading／paragraph／table，排除 comments、使用者留言、導覽、推薦、廣告與圖片；測試只保存最小整理 **TEST DATA** fixture。
- 多來源相同資料以 canonical value 去重並保留來源追溯；來源格式、全半形與設定列順序差異不會製造假衝突。不同來源同一設定表的數值衝突會留下 unresolved conflict，且只停用受影響的 estimator metric，不阻擋其他指南內容。
- 補充來源 request failure 採安全隔離：P-WORLD 成功時仍可建立指南，UI 在底部來源區集中顯示失敗來源與擷取狀態；重新整理失敗仍保留瀏覽器上一份有效指南。
- Family classification 固定以 P-WORLD primary facts 為主，補充頁的攻略用語不會把 A-type／Bonus+ART／multi-zone 等 family 誤改；每個 operational control 仍需通過既有 Control Evidence Gate。
- Event compiler 新增雙語／片假名 canonical identity，避免 `NEMESIS BATTLE／ネメシスバトル`、`喰霊CHANCE／喰霊チャンス` 重複建立按鈕；不完整括號與句子碎片仍被排除。
- Estimator 安全補強：相同 numerator／denominator／設定 1～6 理論值的重複表格只建立一個 benchmark 並合併 evidence；`AT中／CZ中` 等缺乏 Session denominator 的狀態內率不會冒充初當率。Setting Estimator 數學與 minimum sample 未修改。
- Machine Guide cache revision 更新為 `2026-08-30-multi-source-guide-pilot-10`；只使舊 Guide cache 失效，既有 Session snapshot、G 數、事件、Choice、自訂記錄與歷史完全不改寫。新指南只套用下一個 Session。
- 五台公開實頁 smoke 全部可取得 P-WORLD 與ちょんぼりすた，且合併後 unresolved conflicts 為 0；RE:3=`multi_zone_at`、やじきた=`multi_zone_at`、喰霊=`bonus_art`、東京喰種=`multi_zone_at`、ULTRAMAN=`multi_zone_at`，未被補充來源誤分類。
- 最終工程 QA：lint **0 errors／0 warnings**；typecheck 通過；完整 tests **295 / 295 passed**；Next.js 16.3.2 webpack production build 通過。localhost production smoke 的 `/`、`/catalog`、RE:3 Catalog Detail／Guide、`/identify`、`/records` 均 HTTP 200。
- RE:3 localhost API 實際多來源 smoke：P-WORLD 與ちょんぼりすた皆為 available、conflicts 0；相同 AT 初當表去重後只保留 **1 個** `AT初当り` benchmark，numerator 正確綁定主要 `HAZARD RUSH`，`AT中／上位AT中` 的狀態內率因缺可靠 Session denominator 不參與 estimator。
- 固定 dev Preview 自動 QA（390 × 844）：RE:3 舊 Guide cache 正確失效，重建後顯示可使用的繁中指南，底部來源同時列出 P-WORLD 與ちょんぼりすた；第一次玩／快速開始／完整記錄三個 Session 入口正常，頁面 scroll width 390px，console 0 errors／warnings。這是自動 QA，不冒充實體手機人工驗收。
- Status：實作、本機 parser／compiler、公開實頁、完整工程 QA 與固定 Preview 自動 QA 完成；等待手機人工驗收。此項尚未標記人工驗收通過。

### Estimator Primary／Upper Event Mapping Hotfix
- 手機 QA 發現 `スマスロ バイオハザードRE:3` 已記錄 1,100G、具名 CZ／AT 後，Estimator 仍顯示「目前沒有可計算的設定資料」。根因不是缺少 P-WORLD 設定表或樣本不足，而是同機同時存在主要 `HAZARD RUSH` 與上位 `HAZARD RUSH INFERNO`，舊 compiler 因兩個 AT numerator 候選而安全阻擋 `AT初当り`。
- Compiler 新增來源驅動的主要／上位事件層級判定：只有來源明確把事件標成 `上位／最上位／プレミアム AT・ART・CZ` 時才視為 secondary；一般初當 metric 優先使用唯一非 secondary control。兩個同層級事件仍保持 blocked，不會為了顯示結果任意選一個。
- Machine Guide cache revision 更新為 `2026-08-29-estimator-primary-event-9`；舊 Guide cache 需重新整理，新 mapping 只套用之後建立的新 Session，既有 Session snapshot、G 數與事件紀錄不改寫。
- 真實 P-WORLD runtime smoke（Catalog `machine-1y0erql`／database 10440）：`AT初当り` 正確綁定 `event:hazard-rush-ハザード-ラッシュ` 與 `observedNormalGame`；1,100G／主要 AT 1 次時 readiness 為 ready，設定 1～6 參考分布正常產生。上位 AT 未被誤用為 numerator。
- QA：lint 通過；typecheck 通過；完整 tests **286 / 286 passed**；Next.js 16.3.2 webpack production build通過；localhost `/`、`/catalog` 均 HTTP 200，RE:3 Guide API HTTP 200。
- 固定 dev Preview 已部署 commit `f137eeb27e7c87888e4e0efc7e7d2ec5c3c8632b`；Vercel GitHub status 為 `success / Deployment has completed`。390 × 844 自動 smoke 驗證 RE:3 Catalog Detail HTTP 正常、scroll width 390px、無 console error／warning。
- Status：修正、本機 QA 與固定 Preview 自動 smoke 完成，等待手機建立新指南／新 Session 複驗；不冒充人工驗收通過。

### Player Library & Quick Reference
- Machine Catalog Library 改為手機優先的兩欄視覺卡片；卡面色彩與圖示由既有 Catalog metadata 衍生，不下載、代理或轉載 P-WORLD／第三方機台圖片。
- 新增玩家顯示分頁：全部機種、我的收藏、最近遊玩；收藏、最近瀏覽／遊玩與本機 Guide 狀態均保存於 browser-local storage，並清楚維持「非跨裝置同步」限制。
- Catalog 搜尋、manufacturer／type／introduced month 進階篩選、年份快捷篩選、排序與 pagination 可共同使用；既有 Cloud Importer 入口與 Catalog Detail 流程保留。
- Catalog Detail 新增收藏操作並記錄最近瀏覽，不改變 Machine Catalog identity schema。
- 新增共用 `/glossary` 新手術語頁，以繁體中文解釋通常、前兆、CZ、AT、ART、Bonus、G 數、初當率、小役、機械割、Zone、天井、終了畫面與設定示唆；日文術語保留小字對照。
- 完整 Machine Guide 新增快速目錄，Session Guide drawer 與首頁新增術語入口；原始日文、sourceUrl、retrievedAt、evidence 與 missingSections 仍保留，不因玩家呈現精簡而刪除。
- `/records` 升級為 Session 自動記帳：支援今天、近 7 天、全部範圍，彙整實際觀測 G、投入與最終持枚；紀錄摘要依 Session capability snapshot 顯示，不把 unavailable control 補成固定 CZ／AT。
- 新增 player library／records／glossary／navigation regression tests；完整 automated tests **284 / 284 passed**。
- 本機 production build 以 Next.js 16.3.2 webpack 完成；390 × 844 與 1280 × 900 browser smoke 均無橫向溢出或 console error。
- 固定 dev Preview `https://slot-companion-git-dev-ben-liu.vercel.app` 已切換至本次 dev commit；390 × 844 自動瀏覽器 QA 驗證年份篩選、收藏切換、新手術語與今天／近 7 天／全部記帳範圍正常，console 無 error。此項是自動 QA，不等同實體手機人工驗收。

### Catalog Cloud Foundation – Phase 1–5
- Estimator observation governance：相同 numerator／denominator／value mode 且理論值一致的重複 benchmark 只計算一次；若同一 Session observation 被映射到不同設定理論值，整組不啟用，避免重複或互相矛盾的 posterior-like 加權。
- Estimator Evidence 與 readiness 標籤優先使用實際 operational control 名稱，例如具名 AT／ART／Bonus，而不是重複顯示泛用「AT 確率」。既有 estimator 公式、minimum sample 與 capability gate 未修改。
- 完整 Machine Guide 新增 browser-local 品質回報：資料有誤、中文不清楚、內容重複、缺少重要資料；依 Catalog 隔離，不上傳來源文章或圖片。
- Catalog storage 新增 `MachineCatalogRepository` abstraction、既有 JSON fallback 與 Supabase REST adapter；未設定 Supabase 時仍讀寫既有 repo JSON，不影響目前 Preview。
- 新增 Supabase migration：`machine_catalog_records` 使用 JSONB 保存完整 Catalog record，另預留 `catalog_import_jobs` audit 表；兩表均啟用 RLS，service role 僅限 Next.js server-side。
- Vercel Marketplace Supabase Free Plan 已連接 `slot-companion` Preview；migration 已成功建立 `machine_catalog_records` 與 `catalog_import_jobs`，RLS 保持啟用。
- 既有 `data/machine-catalog.json` 已安全 seed 至 Supabase；SQL count 驗證為 **202 records**，repo JSON 繼續作為未設定雲端環境的 fallback。
- Supabase REST adapter 支援 Vercel 提供的 `SUPABASE_SECRET_KEY`，新式 opaque secret 只使用 `apikey` header；legacy `SUPABASE_SERVICE_ROLE_KEY` 仍相容。Secret 不進 browser bundle、localStorage 或 Git。
- `/admin/catalog-import` 已改為可部署的私人管理入口：Production 必須同時具備 Supabase server-side 設定與 `CATALOG_ADMIN_TOKEN`；Preview、Batch Preview 與 Approve API 都驗證管理密碼，密碼只保存在當前 component memory。
- 線上 Approve 保留每批 100 筆、循序提交、processed count mismatch 防護與 partial retry safety；成功寫入 Catalog 後嘗試新增 `catalog_import_jobs` audit，不因 audit logging 失敗誤報 Catalog 未寫入。
- Importer 新增資料庫狀態摘要，顯示目前 Catalog 數量、雲端／fallback 狀態，以及既有可重現 coverage audit 的 operational、basic record、estimator 與 evidence gate 統計。
- `.env.example` 新增 `SUPABASE_SECRET_KEY` 並保留 legacy key 說明；沒有提交任何 Secret。
- Vercel 已新增 sensitive `CATALOG_ADMIN_TOKEN`，範圍限定 `dev` Preview branch；沒有套用 Production，也沒有將值寫入 Git、程式碼或 localStorage。
- 固定 dev Preview 自動 QA：`/catalog` 從 Supabase 顯示 **202 台**並提供「更新機種資料庫」連結；Importer 顯示「雲端儲存已連線」、202 筆 Catalog 與 coverage 摘要，無 console error。
- 固定 dev Preview auth QA：錯誤管理密碼正確顯示 401 拒絕；正確密碼可從 P-WORLD 建立 **4 筆** Import Preview。
- 固定 dev Preview Approve smoke：4 筆全部選為 Skip，結果 **4/4 processed、0 imported、0 merged、4 skipped**，沒有改變 Catalog identity records；Supabase `catalog_import_jobs` 查詢確認留下 `approved / received 4 / processed 4 / skipped 4` audit record。
- 本輪結果屬自動瀏覽器與資料庫 QA，不冒充實體手機人工驗收；沒有部署或修改 Production。
- 本輪工程 QA：lint 通過；typecheck 通過；完整 tests **278 / 278 passed**；Next.js 16.3.2 webpack production build 通過；localhost production smoke `/`、`/catalog`、`/identify`、`/records` 均 HTTP 200，未設定管理 Secret 時 `/admin/catalog-import` 正確 404。
- 尚未完成：`CATALOG_ADMIN_TOKEN` 尚未設定到 Vercel Preview，因此固定 Preview 尚未顯示私人 Importer；dev deployment 與線上 Preview／Approve 實測待完成。Session、Guide cache、自訂記錄與 feedback 仍未雲端同步。

### v0.2.9.3 – Estimator Readiness & Catalog Update Guidance
- Setting Estimator 不再用單一「再記錄遊玩 G 與有效事件」涵蓋所有未啟動情況。新的 readiness selector 只讀既有 active benchmarks、Session numerator、denominator 與 minimum sample，不修改 posterior-like 數學、benchmark eligibility 或安全門檻。
- 沒有 active benchmark 時顯示「目前沒有可計算的設定資料」，並說明可能是來源缺完整設定 1～6 數值，或無法安全對應至 Session 按鈕；不再讓使用者誤以為只要繼續輸入 G 就一定會出現推測。
- 有可用 benchmark 但尚未達條件時，逐項顯示目前 G／最低樣本、事件或 trial 次數，以及下一步，例如先設定 baseline、還需多少 G、或尚未記錄對應事件。最多顯示三項，避免重新堆滿說明文字。
- 達到完整 observation 條件時仍由原有 estimator 即時顯示設定 1～6 相對分布；自訂 Counter／Choice、blocked metric、缺失值與不完整設定表仍不參與。
- Vercel Preview／Production 的「更新機種資料庫」由 disabled 改為可點開說明 modal，列出 localhost Catalog Importer → P-WORLD Preview → Approve → commit／push dev → Vercel redeploy 的既有流程。它仍不輸出 `/admin/catalog-import` link、不執行雲端寫入，也不把 repo JSON 誤稱為永久儲存。
- QA：lint 通過；typecheck 通過；完整 tests **268 / 268 passed**；Next.js 16.3.2 webpack production build 通過；localhost production smoke 首頁、Catalog、LB Catalog Detail／Guide、Records 與 Session fallback route 均 HTTP 200。
- Status：功能與本機自動 QA 完成，**等待固定 dev Preview 與手機人工驗收**；未開始下一版本。

### v0.2.9.2 – Home & Catalog Maintenance Entry
- 首頁移除三台「已建立攻略 Profile」展示與重複風險註記，改以 Active Session、拍照辨識、Machine Catalog、今日紀錄及晚上撿台作為現場玩家入口；沒有 Active Session 時，黃色主操作直接進入拍照辨識，再走 Guide-first Session 流程。
- 舊三台 Machine Profile、Published Profile、TEST DATA 歷史與既有 Session snapshot 均未刪除或改寫，只從首頁玩家主路徑移除，維持舊流程相容性。
- Machine Catalog 頁新增「更新機種資料庫」管理入口與目前收錄數。localhost development 可連至既有 `/admin/catalog-import`；Vercel Preview／Production 顯示 disabled 狀態「目前僅能在本機管理環境執行」，不輸出會進 404 的連結，也不假裝 server-side JSON 可作雲端永久儲存。
- Catalog UI 將舊 Profile 狀態降為相容資訊；Catalog-only 機種改以「可建立機台指南」呈現，玩家流程不再以 Verified Profile 作為使用門檻。
- Catalog Detail 與完整 Machine Guide 原有的單台 Guide refresh 保持；Session Guide drawer 新增「重新整理機台指南」，直接更新該機 browser-local Guide cache。成功或失敗均清楚回報，失敗保留上一份指南；目前 Session snapshot 與紀錄不改寫，新控制項只在下一個 Session 套用。
- QA：lint 通過；typecheck 通過；完整 tests **267 / 267 passed**；Next.js 16.3.2 webpack production build 通過；localhost production smoke `/`、`/identify`、`/catalog`、東京喰種 Catalog Detail／Guide、`/records` 均 HTTP 200。
- 固定 dev Preview 390 × 844 自動 QA：首頁不再出現「已建立攻略 Profile」，無 Active Session 的主操作與 Catalog 卡片均使用 Guide-first 文案；頁面 scroll width 390px，無水平溢出或 console error／warning。
- 固定 dev Preview Catalog 自動 QA：顯示目前收錄 202 台；「更新機種資料庫」在 production build 正確 disabled，顯示「目前僅能在本機管理環境執行」，DOM 不含 `/admin/catalog-import` href，無 404 或假持久化入口。
- Session drawer refresh 的成功覆寫、失敗保留有效 cache、只影響下一個 Session 與 snapshot 不改寫由 automated tests 覆蓋；自動驗收分頁沒有使用者目前 Session 的 browser-local record，因此未偽造或清除 Session 來觸發真實 P-WORLD refresh。
- Status：功能、本機工程 QA 與固定 dev Preview 自動 QA 完成，**等待手機人工驗收**；自動 QA 不等同實體手機驗收，未開始下一版本。

### v0.2.9.1 – Session Legibility & Progressive Disclosure
- Session 遊戲狀態改為手機兩欄大按鈕：主名稱 16px、日文對照 10px、最小高度 68px；長名稱可換行，不再為塞進五欄而縮成難讀小字。
- 快速記錄按鈕最小高度提升至 112px，事件名稱與目前次數均為 17px；類型、修正按鈕、更多記錄與 Choice 選項同步提高字級與觸控尺寸。
- Estimator 預設只顯示「設定參考」、目前判斷力與下一步；無樣本時不再重複顯示 Evidence 空狀態。來源、風險與計算說明收進「資料與計算說明」，有 Evidence 時另以「查看判斷依據」按需展開。
- Session Guide 預設只保留「現在看什麼」與「今天先記住這些」；基本流程、更多事件與名詞收進「基本玩法與更多說明」，來源、更新時間、缺失欄位與 evidence 收進「資料來源與更新」。所有可追溯資料仍保留。
- 不修改 Machine Guide、Control Manifest、Session snapshot、Estimator 數學、來源資料或既有紀錄；本版本只調整 presentation hierarchy。
- QA：lint 通過；typecheck 通過；完整 tests **264 / 264 passed**；Next.js 16.3.2 webpack production build 通過。
- 固定 dev Preview 390 × 844 自動 QA：頁面寬度與 scroll width 均為 390px，沒有水平溢出；遊戲狀態維持兩欄，按鈕實測 173 × 82px、主文字 16px；快速記錄按鈕實測約 170 × 130px、名稱與次數 17px。
- 固定 dev Preview 自動 QA：Session Guide 預設只顯示操作重點，「基本玩法與更多說明」及「資料來源與更新」均預設收合；Estimator 無樣本時只顯示簡短狀態，計算說明預設收合；console 無 error／warning。
- Status：功能、本機工程 QA 與固定 dev Preview 自動 QA 完成，**等待實體手機人工驗收**；自動瀏覽器結果不得視為手機人工驗收。

### v0.2.9.0 – 中文機台指南
- Machine Guide 新增來源受限的繁體中文玩家指南：預設以「60 秒看懂這台」、最多三個跨類型重點、玩法摘要與明確記錄時機呈現；原始日文段落與表格集中於預設收合的查證區。
- 中文指南輸入只使用既有 P-WORLD 結構化 facts、可靠 operational controls、Machine Family 與來源 section；不得以 family、derived metric 或未通過 gate 的資料生成可操作事件。
- OpenAI 呼叫維持 server-side，模型集中於 `AI_CONFIG.openAIGuideModel`；支援 `OPENAI_MACHINE_GUIDE_MODEL`，未設定時沿用辨識模型。API key 缺失、請求失敗、結構錯誤、未知 section／control 或未受來源支持的數字均安全回退規則式繁中指南，不阻擋 Guide 建立。
- 新 Session 的精簡 Guide snapshot 使用相同的繁中 overview 與 highlights；既有 Session snapshot 不重新編譯或改寫。
- Machine Guide cache compiler revision 更新為 `2026-08-29-chinese-player-guide-8`；舊 Guide cache 需重新建立，僅影響指南快取及之後的新 Session，不清除既有 Session、Catalog 或自訂記錄。
- 代表回歸：A-type 只解釋 BIG／REG、不補 CZ／AT；rate-only／資料不足機台顯示基本記錄模式；具名 CZ／AT／ART／Bonus 保持獨立；derived control 不會冒充玩家記錄重點；原始日文仍可追溯。
- Preview 自動 QA 發現 AI 曾把可操作事件的按鈕說明寫成「按一般打點方式處理」，且可能把三個重點全選為同類 Bonus；已改由 control manifest 的共用跨類型優先規則決定 highlights 與 Counter／Choice 最終操作文案，AI 只整理 overview 與 section 摘要。
- 手機人工驗收發現完整 Machine Guide 已中文化，但 Session drawer 的 `flow` 與事件辨認仍優先讀取舊日文 snapshot 欄位。修正後，新 Session snapshot 保存同一份繁中 section 摘要；既有 Session 不改寫資料，但呈現層會優先使用已保存的繁中 overview，並將日文辨認句安全轉為「機台顯示什麼／代表什麼」的繁中提示。
- 固定 dev Preview 以使用者原有 `Lすーぱぁびん娘` Session 直接 reload 複驗：drawer 的「現在看什麼／基本遊戲流程／今天先記住這些／記錄」均改為繁中玩家文案，正式事件名稱仍保留日文；未再顯示 `左リール／適当打ち／狙う` 等日文操作句，Session route 與既有紀錄未重建，console 無錯誤。此為自動瀏覽器 QA，仍待使用者手機複驗。
- QA：lint 通過；typecheck 通過；完整 tests **261 / 261 passed**；Next.js 16.3.2 webpack production build 通過。
- Local production API smoke 使用實際 server route 成功產生 `generator: openai` 的繁中指南；只有 BIG／REG operational control 成為重點，Bonus 合成等 derived metric 未混入。
- 固定 dev Preview 390 × 844 自動 QA：LB Triple Crown 顯示繁中 60 秒摘要與 BIG／REG，沒有 CZ／AT control；ULTRAMAN 無可靠 operational event 時維持基本記錄提示；やじきた保留具名 CZ／AT／終了畫面；喰霊三個重點依共用規則跨 CZ／ART／Bonus，且每項明確指出正確記錄按鈕。原始日文與表格均預設收合，代表頁面未見 console error。
- Preview QA 過程發現的自由操作文案與同類重點集中問題均已完成最小修正、完整工程 QA 與部署後重測；這是自動瀏覽器 QA，**不等同實體手機人工驗收**。
- 手機人工複驗通過：進入遊戲前的完整指南與 Session drawer 繁中呈現均可接受；目前部分事件在不同區塊仍會重複顯示，但列為非阻擋觀察，後續應依真實遊玩案例逐步精簡，不在本版本進一步壓縮或猜測資料。
- Status：功能、本機自動 QA、固定 dev Preview 與手機人工驗收完成，**v0.2.9.0 驗收通過**；未開始下一版本。

### v0.2.8.2 – Estimator Observation Contract
- 每個 Machine Guide estimator metric 新增正式 observation contract：保存 eligibility、canonical numerator、唯一 operational control、denominator、denominator observation、minimum sample 與 blocker reason。
- Setting Estimator 數學未修改；只有完整設定 1～6、唯一 operational numerator、operational denominator 與有效 minimum sample 全部成立時才產生 benchmark。
- Audit report 升級為 `estimator-observation-contract-v2`，逐 Catalog／metric 輸出 observation ownership 與阻擋原因，不再只保留一段聚合錯誤文字。
- Machine Guide compiler cache revision 更新為 `2026-08-29-estimator-observation-contract-5`；舊 Guide cache 需重建且只影響新 Session，既有 Session snapshot、G、Counter、Choice、自訂記錄與歷史不改寫。
- 代表回歸：LB Triple Crown 的 BIG／REG 綁定總遊玩 G 與 600G minimum sample；ULTRAMAN rate-only 因缺唯一 numerator 維持 blocked；duplicate numerator 會被阻擋；ART 不寫入 AT；自訂項目仍不進 Estimator。
- 全 Catalog Audit 連續兩輪 202/202 成功且輸出一致，SHA-256 `3952488d8912d305c4f583537cad3c0c0833a160e7e64f1f6f421ada74635d09`。60 台／153 metrics eligible；1658 metrics blocked；generic CZ／AT fallback 仍為 0；basic mode 維持 6 台。
- QA：lint **0 errors / 0 warnings**；typecheck 通過；完整 tests **250 / 250 passed**；Next.js 16.3.2 webpack production build通過。
- 固定 dev Preview smoke：首頁、辨識、Catalog、LB Triple Crown Catalog Detail／Guide、Records 均正常開啟，未見 Application Error 或 404。
- 固定 dev Preview 390 × 844 自動驗收：四台舊 Guide cache 均正確失效並可重建；LB 新指南只有 BIG／REG；ULTRAMAN 新指南只有總 G／通常 G，沒有 CZ／AT control；Yajikita 保留兩個具名 CZ、兩個具名 AT 與終了畫面；喰霊保留具名 CZ／ART、BIG／REG／EPISODE BONUS 與終了畫面。沒有 Application Error 或 404。
- 為避免改變使用者當時仍 active 的 ULTRAMAN Session，本輪未強制結束它來建立第二個 Preview Session；600G minimum sample、numerator ownership、新 Session snapshot 與 reload 行為由 250/250 automated tests 覆蓋。此結果是自動 QA，**不等同實體手機人工驗收**。
- Status：功能、自動 QA、全 Catalog Audit 與固定 dev Preview 自動驗收完成，**等待人工驗收**；未開始 numeric controls 或下一版本。

### v0.2.8.1 – Control Evidence Gate & Audit Tooling
- 明確分離 `familyEvidence`、逐 control 的 `controlEvidence` 與 `estimatorEvidence`；family／機率表不再直接授權 Session control 或 numerator。
- Control Evidence Gate 要求具名事件／選項、明確 control type、可追溯 official section／table、Session write target；Estimator 另驗證唯一 canonical numerator、operational denominator 與 minimum sample。
- 移除 family-derived generic CZ／AT state／counter fallback；資料不足時保留基本記錄模式與 browser-local 自訂 Counter／Choice，且不修改舊 Session snapshot。
- deterministic P-WORLD parser 新增官方 `articleBox-content` 支援，使具名官方玩法正文可作 control evidence；仍限制在官方 section scope，不保存全文或圖片。
- Machine Guide compiler cache revision 更新為 `2026-08-29-choice-evidence-gate-4`；舊 Guide cache 需重建，只影響之後的新 Session。
- 新增可重跑的 `audit:controls` 工具與逐機 JSON report，包含 Catalog ID、機種名、來源 URL、family confidence、operational／blocked controls、basic mode 與 estimator eligibility。
- 全 Catalog bounded-retry audit 連續兩次 202/202 成功，輸出 SHA-256 完全一致：`8f4648c8d01d26fce878a94419dbeab7453dc7e7b7c5cc02494e5343e67b0eaf`。
- 修正前後：generic CZ／AT fallback **64 → 0**；basic mode **22 → 6**；operational machines **180 → 196**（新增皆須具名正文／表格證據）；Estimator eligible **69 → 60**；64 個 metrics／28 台被 gate 明確阻擋。
- 代表回歸：LB Triple Crown BIG／REG、やじきた具名 CZ／AT／Choice、ULTRAMAN basic mode、喰霊具名 CZ／ART／Bonus／Choice 均通過自動測試。
- QA：lint **0 errors / 0 warnings**；typecheck 通過；完整 tests **243 / 243 passed**；Next.js 16.3.2 webpack production build 通過。預設 Turbopack 在受限 host 無法建立 PostCSS worker port，沿用專案既有 webpack production QA 路徑。
- Localhost production smoke：`/`、`/identify`、`/catalog`、`/catalog/machine-1xl2y3d`、`/guides/machine-1xl2y3d` 均 HTTP 200。
- 自動瀏覽器回歸發現 Yajikita 終了畫面 Choice 曾跨 Guide section 混入無法由該 Choice 來源追溯的通用牌色；根因是選項產生器在 Choice 容器通過 gate 後仍掃描所有 section 的 `設定示唆／プレート` 表格。
- Choice Evidence Gate hotfix：內建 Choice 現只接受 `special_events` 可靠表格逐項支持的選項；每個選項保存 source URL、section、table 與 evidence ownership。不同機台／來源不共用選項；自訂 Choice 維持使用者自訂且不進 Estimator。
- 舊 `control-evidence-gate-3` Guide cache 會失效；既有 Session snapshot、G、Counter、Choice 與自訂資料均不改寫。
- Hotfix QA：lint **0 errors / 0 warnings**；typecheck 通過；完整 tests **246 / 246 passed**；Next.js 16.3.2 webpack production build 通過；localhost `/`、Yajikita Catalog／Guide 與 Session fallback routes 均 HTTP 200。
- 固定 dev Preview 自動手機尺寸回歸：舊 Guide cache 正確失效；重新建立 Yajikita 指南並建立全新完整模式 Session 後，終了畫面僅顯示 `街道／茶屋／茜ちゃん`。選擇 `街道` 後 reload 與 Summary 保留正確，新 Session 回到尚未選擇；此結果是自動瀏覽器 QA，不代表實體手機人工驗收。
- 固定 dev Preview 完整自動回歸（390 × 844 與桌面視窗）：LB Triple Crown 僅有 BIG／REG，無 CZ／AT，並在 600G minimum sample 與有效 numerator 後才啟動 Estimator；Yajikita 保留具名 CZ／AT 且 Choice 僅有 `街道／茶屋／茜ちゃん`；ULTRAMAN 維持基本記錄模式，無推測 CZ／AT，自訂 Counter／Choice 可新增、修改、刪除、reload 與跨新 Session 沿用定義，數值歸零且不進 Estimator；喰霊的具名 CZ／ART／BIG／REG／Choice 保持獨立，8 個 Choice 無重複，Guide／模式入口、reload 與 Summary 均正常。
- 本輪自動 QA 亦確認 per-machine 自訂項目不會跨機台污染、既有 Session snapshot 未被重新編譯、無小樣本過度推測；固定 Preview 的首頁、辨識、Catalog、Catalog Detail、Guide、Records 均可正常開啟，未見畫面崩潰或可見 4xx／5xx。這是自動瀏覽器 QA，**不等同實體手機人工驗收**。
- 本輪重跑工程 QA：lint **0 errors / 0 warnings**；typecheck 通過；完整 tests **246 / 246 passed**；Next.js 16.3.2 webpack production build 通過；localhost `/`、`/identify`、`/catalog`、Yajikita Catalog Detail／Guide、`/records` 均 HTTP 200。未發現新 blocker，因此沒有修改產品程式。
- 實體手機人工複驗通過：Yajikita 重新建立指南與全新 Session 後，終了畫面只顯示來源支持的 `街道／茶屋／茜ちゃん`；ULTRAMAN 維持基本記錄模式且無 CZ／AT，可新增並使用自訂 Counter／Choice，reload 後保存正常且自訂資料不進 Setting Estimator。
- Status：Choice blocker 修正、自動 QA、固定 dev Preview 與實體手機人工複驗均完成，**v0.2.8.1 手機人工驗收通過**。

### Machine Catalog 自動分類與操作涵蓋率健檢（文件／調查，不變更產品版本）

- 以 v0.2.8.0 production parser／compiler 對正式 Catalog 全部 **202 / 202** 台做依序、節流 runtime audit；202 台 canonical P-WORLD URL 本次均成功取得，未保存完整 HTML 或來源圖片。
- Family confidence：High **51**、Medium／Probable **69**、Generic／Low／Unknown **82**；Medium 不冒充 confirmed，generic 有明確 Bonus／Choice 也不等於 family 已知。
- 180 台有至少一個 compiler operational candidate；其中較保守的 116 台不依賴 generic CZ／AT fallback，64 台仍含 generic `CZ`／`AT 次數`，22 台正確進入基本記錄模式。
- 全量 candidate controls 共 456（Counter 345、Choice 111、Numeric input 0）；發現 cycle／points／set／zone 的 numeric operational coverage 仍為 0。
- Setting Estimator：69 台至少一項 compiler-eligible benchmark；133 台不可用，其中 67 台沒有可解析設定 metric、66 台缺唯一 canonical numerator。eligible 仍須實際 numerator、denominator 與 600G minimum sample。
- 以 21 台跨 family／成功與失敗案例做人工作業檢查；LB、やじきた、ULTRAMAN、喰靈四個既有手機驗收案例在本次 runtime interpretation 中均不退化。
- 完整口徑、family 統計、代表矩陣、缺口與分階段建議已更新於 `Machine_Catalog_Coverage_Audit.md`；本階段沒有修改產品程式、Catalog、Profile、Session、localStorage 或 estimator。

### v0.2.8.0 – Machine Control Foundation
Status：**Completed；手機人工驗收通過**

- Machine Guide family 分類新增 confidence、source evidence 與 unsupported reasons；新增共用 `cz_at` family，來源不足時安全回退 generic，不用機種名稱逐台 hardcode。
- 新增統一 Control Manifest：保存 id、label、event/control type、玩家何時按、observation key、state effect、estimator usability、numerator／denominator、source evidence、availability／reason 與 quick priority。
- 既有 Session capability contract 保留為相容 snapshot，並同步 manifest presentation metadata；Session UI 的 operational filtering、具名 CZ／AT／ART／BIG／REG 分離、choice 安全與 quick/full/first-time 共用規則不退化。
- `LBトリプルクラウンX‐300`（P-WORLD 10542）由 BB／RB 設定表分類為 high-confidence A-type：新 Session 有獨立 BIG／REG，Bonus 合成只做 derived metric；沒有來源的 CZ／AT 不會出現。
- `スマスロ やじきた道中記参る!`（P-WORLD 10489）由多 CZ 與 AT 結構分類為 multi-zone AT；CZ、AT、有效終了畫面 choice operational，規定里程／Zone 說明不冒充可操作按鈕。
- generic／unknown 沒有可靠事件時顯示「基本記錄模式」，仍保留總 G，且不自動補 generic CZ／AT。手機 QA 發現僅有 CZ／AT 機率表的 `L ULTRAMAN 最終決戰` 仍被 compiler 建立 generic controls；已修正為「機率表只證明參考數值，不證明玩家可可靠辨認事件」，不再產生 CZ／AT Counter、state 或第一次玩教學項目。
- 開始 Session 與進行中 Session 均提供 per-machine 自訂 Counter／Choice；Choice 至少需要 2 個選項，可選是否進快速記錄，支援修改／刪除並保存在 localStorage。新增或修改後目前 Session 立即取得 control；刪除定義不改寫既有 Session snapshot／歷史。自訂 observation 固定 `estimatorUsable=false`，不會進 Setting Estimator。
- Estimator rate evidence 現要求 operational numerator／denominator、numerator 已觀測且 denominator 達 benchmark minimum sample；不足時維持「尚未開始推測」。Derived Bonus 合成不建立重複輸入，也不重複餵 estimator。
- Machine Guide compiler cache revision 更新為 `2026-08-29-control-manifest-2`，使 QA 前錯誤 generic controls 的快取失效；重新整理只影響下一個 Session。舊 Session profile snapshot 不重編譯、不改寫，若指南已更新只顯示下次套用提示。
- `StartSession 2.tsx` 調查：未被任何 import／route／測試引用，是 2026-08-27 的舊副本；依使用者要求保留原狀、未刪除且不納入本次 commit。
- 新增 P-WORLD 10542／10489 與 10514 資料不足案例的最小整理 **TEST DATA** fixtures；回歸涵蓋基本記錄模式、自訂 Counter／Choice 保存與 estimator 隔離，以及既有 A-type／multi-zone／set-based 行為；完整 tests：**239 / 239 passed** ✅
- lint ✅（0 errors／0 warnings）；typecheck ✅；Next.js 16.3.2 webpack production build ✅。Turbopack 在受限 host 因 PostCSS worker 無法 bind port 失敗，改用專案既有 webpack production QA 路徑完成。
- QA blocker 修正後 localhost production smoke：`/`、`/identify`、`/catalog`、`/catalog/machine-1xl2y3d`、`/records` 均 HTTP 200 ✅
- 固定 dev Preview 已以 `L ULTRAMAN 最終決戰`（P-WORLD 10514）重新建立最新指南：Session Template 不再含 CZ／AT state 或 Counter，Setting Estimator 顯示無可安全參與資料；開始入口可找到 per-machine 自訂記錄編輯器 ✅。為保護瀏覽器中既有 active Session，本次未自動結束舊 Session，基本記錄模式與自訂項目實際計數／reload 留待手機人工複驗。
- localhost production routes `/`、`/identify`、`/catalog`、10542 Catalog Detail／Guide、records 均 HTTP 200 ✅
- 固定 dev Preview 已實際以 P-WORLD 10542 建立 A-type 指南：只顯示 BIG／REG、設定表保留 Bonus 合成、無 CZ／AT；模式入口顯示 per-machine「新增自訂記錄」✅
- 固定 dev Preview 已實際以 P-WORLD 10489 建立 multi-zone AT 指南：CZ、AT、終了畫面可記錄，里程／Zone 表格只留指南參考；browser console 0 errors ✅

v0.2.8.0 手機人工複驗（2026-08-29）：
- `LBトリプルクラウンX-300` 的全新 Session 只顯示 BIG BONUS／REG BONUS，沒有錯誤產生 CZ／AT，狀態正確 ✅
- `スマスロ やじきた道中記参る！` 的全新 Session 保留可操作 CZ、AT 與終了畫面／設定示唆 ✅
- `L ULTRAMAN 最終決戰` 的新指南與全新 Session 正確進入基本記錄模式，不再出現缺乏可靠證據的 CZ／AT ✅
- ULTRAMAN 可建立並立即使用自訂 Counter／Choice；reload 後定義與目前 Session 紀錄均保留 ✅
- 同機種新 Session 會沿用自訂項目定義，但各項計數從 0 開始；已結束 Session 仍保留當次自訂 Counter／Choice 結果 ✅
- 不同 Catalog 機台的自訂項目彼此隔離，未發生跨機台污染；所有自訂項目均未進入 Setting Estimator ✅
- capability-driven controls、安全基本記錄與 per-machine browser-local custom records 手機人工驗收通過 ✅

Coverage 更新：正式 Catalog 202 筆；Confirmed **19**、Probable **14**、Unknown **169**。各 family 的 operational／read-only coverage 只計已驗證代表案例，未把 TEST DATA 或名稱推測冒充正式支援。

### v0.2.7.1 – Session 使用模式入口
Status：**Completed；等待手機人工驗收**

- Machine Guide 的「開始玩」不再直接建立 Session，先以手機友善 modal 顯示「第一次玩這台／快速開始／完整記錄」三個大型選項
- 「第一次玩這台」先顯示基本流程、CZ、AT／ART／Bonus、最多三個注意事項與操作提示；內容只來自既有 Machine Guide／operational controls，缺失顯示「目前沒有這項說明」，可完成或略過後開始
- 快速開始與第一次玩進入後沿用 v0.2.7.0 精簡 UI：最多直接顯示 4 個主要 controls，其餘收進「更多記錄」
- 完整記錄直接顯示全部 operational record controls；read-only、unavailable 與空 choice 仍由既有共用 presentation model 排除
- 三種模式共用同一個 `Session`、profile snapshot、capability contract、counter、Timeline 與 estimator；只新增 optional `mode` snapshot，不建立互不相容的資料結構
- Session header 新增小型「模式」入口；中途切換只更新 presentation mode，不改寫 capability snapshot 或 G 數、投入、持枚、事件、choice 與 estimator observation
- 每台機器以獨立 localStorage preference 記住最近一次模式；再次按「開始玩」仍顯示全部三項，並在最近選擇旁標示「上次使用」，不永久分類使用者
- 舊 v0.2.7.0 Session 沒有 mode 時由 storage compatibility layer 安全回退為 `quick`；重新載入後 mode 與既有紀錄均保留
- Session 指南入口在三種模式中共用且持續可用；未加入 P-WORLD 圖片、照片保存、雲端同步或下一版本功能

Representative regression：
- 三種模式建立相同 Session shape，具名 CZ、AT、ART、BIG、REG、choice 維持獨立 ✅
- 快速／第一次玩最多 4 個主要 controls；完整模式顯示全部 operational controls 且無 overflow ✅
- 每機種模式 preference 分離；中途切換與 JSON reload 不會清除 Session observation ✅
- 舊 Session fallback、第一次玩教學與 guide snapshot 共用均通過 ✅

v0.2.7.1 QA：
- lint ✅；typecheck ✅；完整 tests：**228 / 228 passed** ✅
- production build：Next.js 16.3.2 webpack build ✅
- localhost production smoke：`/`、`/identify`、`/catalog`、Catalog Detail、Guide、records、Session、Summary route 均 HTTP 200 ✅
- localhost 10530 實際流程：三入口與教學正常；第一次玩進入精簡 Session，完整模式直接顯示 6 個 operational controls，切回快速並 reload 後 CZ 計數仍保存，指南可開啟 ✅
- 同機種再次開啟模式入口，最近使用的「快速開始」正確標示「上次使用」✅
- 固定 dev Preview source commit `0386f8b`：Ready；10530 Guide 顯示三種入口與完整第一次玩教學，無 parser／compiler／capability 內部術語 ✅
- Preview 直接開啟既有 v0.2.7.0 Session：安全回退快速模式、既有 CZ 計數保持 1 次，模式與指南入口均正常 ✅

v0.2.7.1 第一次玩教學／指南 QA polish（2026-08-29）：
- 手機人工驗收確認原第一次玩教學把相同事件分別完整列於 CZ、AT／ART／Bonus、注意事項與記錄時機，閱讀過長；本次只調整共用 presentation selector 與 UI，未修改來源資料、compiler、capability、Session snapshot 或 estimator
- 第一次玩預設改為約 60 秒的「今天先記住這三件事」：最多 3 個 operational 重點，每張卡一次整合事件名稱、代表意義與記錄時機；其他事件及通用名詞收進預設關閉的「更多名詞與事件」
- 基本流程缺失時只顯示「目前沒有完整流程說明，可先依下方三個重點遊玩。」，不再建立大型空白區塊
- Session Guide drawer 共用相同重點 selector；目前狀態已顯示的事件不在後續重點／更多事件重複，辨認、注意與記錄三個完整重複區塊已合併
- 日中事件名稱完全相同時只顯示一次；底部「看完了，開始記錄」與「略過教學」、三模式入口、模式切換、Session 保存及指南入口均保留
- 新增 2 項 regression tests；lint ✅；typecheck ✅；完整 tests：**230 / 230 passed** ✅；production build ✅
- localhost 390 × 844 smoke：具名事件機台首屏直接顯示 3 個實際重點，「更多名詞與事件」預設收合，缺失流程只佔一行 ✅
- 固定 dev Preview source commit `4de8a02`：Ready；10530 線上教學顯示 `60-SECOND GUIDE` 與 3 個整合重點，舊 CZ／AT／注意／記錄重複區塊不再出現，更多內容維持收合 ✅

### v0.2.7.0 – Session Quick Guide & Compact Controls
Status：**Completed；手機人工驗收通過**

- 本版只完成單一模式的 Session 精簡操作與 Session 內機台指南；未開始第一次玩／快速開始／完整記錄模式、照片保存或下一版本
- operational record controls 使用共用 presentation model；穩定優先順序為具名 CZ → AT／ART → Bonus → 其他 operational event／choice，同級保留 capability contract 原始順序，不依名稱猜測或建立單機例外
- Session 直接顯示最多 4 個兩欄大型快速記錄 controls；其餘收進可展開／收合的「更多記錄（N）」；不足 4 個時不補假按鈕
- 具名 CZ、AT、ART、BIG、REG 與其他事件仍保存獨立 observation；choice 開啟專用選單，數字事件提供 `−1 修正`
- read-only、unavailable 與空 choices 不進快速或更多記錄；Set、cycle、points、CZ failures、dual games、role streak 等既有 Guide 參考項目不會冒充 control
- 新 Guide Session snapshot 保存精簡結構化 `sessionGuide`：基本流程、事件、值得注意項目、名詞、來源 URL 與擷取時間；不保存、下載、代理或嵌入 P-WORLD 圖片
- Session header 提供固定「指南」入口；drawer 不離開 route，依目前 state 優先顯示對應 CZ／AT／ART／Bonus／示唆事件，關閉後保留 Session 畫面與所有紀錄
- 指南的「何時按記錄」只使用 snapshot capability、Counter recognition 與既有 guide event counting rule；缺失一律顯示「尚無資料」，不補猜
- 舊 Session 沒有 capability snapshot 時保留完整 legacy Counter fallback；有 capability、但沒有新版 `sessionGuide` 的既有 Session 仍可記錄與結算，指南缺失欄位安全顯示「尚無資料」

Representative regression：
- 喰靈：operational controls 超過 4 個，穩定分成快速記錄與更多記錄；具名 CZ、ART、Bonus、choice 保持獨立 ✅
- 戰國乙女5：只有 operational 具名 CZ／AT；cycle、points、CZ failures 與 unavailable 終了畫面不進 controls ✅
- GOD：operational AT 與終了畫面 choice 保留；Set／role streak 不進 controls ✅
- 事件不足 4 個的機台不補假按鈕；目前 state 的指南事件 selection、Session snapshot reload 與 legacy fallback 均通過 ✅

v0.2.7.0 QA：
- lint ✅；typecheck ✅；完整 tests：**215 / 215 passed** ✅
- production build：Next.js 16.3.2 webpack build ✅
- localhost production smoke：`/`、`/identify`、`/catalog`、Catalog Detail、Guide、Session、Summary route 均 HTTP 200 ✅
- 固定 dev Preview 已確認載入 product commit `976127d`，首頁、辨識、Catalog、Catalog Detail、Guide、Session 與 Summary routes 均可正常開啟，console 無 error ✅
- 固定 dev Preview 以 P-WORLD 10530（喰靈）重新建立指南並開始 Session 成功；畫面直接顯示 4 個快速 controls，另外 2 個收進「更多記錄（2）」✅
- Preview 實測具名 CZ 計數後，展開更多記錄、開啟／關閉指南 drawer 與重新載入 Session，計數仍維持 1 次，route 與 Session state 未遺失 ✅
- Session 內指南依目前「超自然災害モード」狀態顯示相關內容，並可查看基本流程、辨認方式、注意項目、按鈕時機、名詞、P-WORLD 來源與擷取時間 ✅

v0.2.7.0 Session drawer copy polish（手機驗收追加）：
- 新增共用 player-guide selector；主要內容不再顯示「公開資料中的事件」、結構化表格數量、parser／compiler 說明、重複來源聲明或內部 section path
- 有可靠事件時只顯示「這是什麼／看到什麼／何時記錄」；操作提示統一為「機台明確顯示『事件名』時記錄 1 次」，choice 則提示選擇對應項目，不補猜玩法
- 沒有可靠玩法／辨認資料時分別顯示「目前尚無玩法說明」與「目前尚無辨認說明」
- P-WORLD 來源與更新時間只在 drawer 底部集中顯示一次；「來源與資料狀態」可展開查看缺失 section、evidence 數與來源連結
- Session snapshot 新增 optional `missingSections`／`evidence` 相容欄位；原始 sourceUrl、retrievedAt、evidence 與缺失資料未刪除，Catalog Detail／完整 Machine Guide 未改動
- 新增 3 項 selector／UI regression；完整 tests：**218 / 218 passed**，lint、typecheck、production build 均通過 ✅
- localhost 實際建立 10530 指南與 Session：主要 drawer 無技術文字，來源／時間／資料狀態位於底部；切換到具名 CZ 後「現在看什麼」正確更新，計數仍保存 ✅
- 固定 dev Preview source commit `120f9bf`：Ready；直接重開既有 10530 Session 後原 CZ 計數仍保存，drawer 無 parser／compiler／結構化表格技術文字，底部來源、更新時間與「來源與資料狀態」均正常 ✅

v0.2.7.0 手機人工複驗（使用者確認，2026-08-29）：
- Session 指南已移除 parser、compiler、結構化表格數量與內部 section path；玩家主要內容不再重複來源聲明 ✅
- 缺少內容時以「目前尚無玩法說明」等一致短句呈現；事件辨認與記錄文字已改為玩家可理解的顯示時機與「明確出現時記錄 1 次」✅
- P-WORLD 來源與更新時間只集中顯示一次；詳細來源資訊收進「來源與資料狀態」✅
- 關閉指南後，Session G 數、目前狀態與事件計數均保持正常 ✅
- **v0.2.7.0 Session Quick Guide & Compact Controls 手機人工驗收通過** ✅

### v0.2.6.3 – Adaptive Session UI Foundation
Status：**Completed；手機人工驗收通過**

- v0.2.6.2 capability contract 已通過產品／架構驗收；本版將 contract 接到既有單一模式 SessionScreen，未開始完整新手／老手模式
- 有 capability snapshot 的 Session 只由 snapshot 產生 operational controls；不再無條件顯示固定 CZ、AT、特殊畫面與全部 Machine smartCounters
- dynamic game-state buttons 由 operational state effects 與 guide states 產生；支援 normal、CZ、AT、ART、Bonus 等實際適用狀態
- generic CZ／AT 只在 snapshot 提供無 eventId fallback capability 時顯示；具名 CZ／AT／ART／BIG／REG 各自維持獨立 event counter，不合併、不重複 ownership
- 具名 event 記錄會依 capability 自動切換對應 state；ART 寫入獨立 counter 並切換 ART，不寫入 AT count
- Smart Counter 同時要求 matching operational capability；choice 另要求至少一個可靠 choice，read-only／unavailable／空 choices 均不渲染
- Set、cycle、points、CZ failures、dual games、role streak 仍保留於 Machine Guide 參考，但不偽裝成 Session 可操作控制項
- generic capability control 與 Smart Counter 都提供操作說明；資料持續透過既有 `saveSession` 寫入 localStorage
- 舊 Session／既有 Profile 沒有 capability snapshot 時使用安全 legacy fallback，保留原有固定狀態、CZ／AT 與有效 Smart Counter；空 choice 仍不顯示
- Setting Estimator runtime 新增 snapshot capability gate：numerator control 與 denominator 必須仍為 operational 才讀取 benchmark

Representative UI regression：
- 10530：BIG、REG、具名 CZ、具名 ART 與可靠終了畫面 choice 可操作；ART／Bonus 狀態可獨立呈現 ✅
- 10473：具名 AT 可操作；cycle、points、CZ failures 不顯示為 control ✅
- 10508：具名 BIG 可操作 ✅
- 10485：多個具名 CZ 與具名 AT 各自保留；dual games 不顯示為 control ✅
- 10424：具名 AT 可操作；Set、role streak 不顯示為 control ✅
- 無 choices 的終了畫面不顯示空 choice card；舊 Session fallback 與 JSON reload snapshot 均通過 ✅

v0.2.6.3 QA：
- 新增 adaptive Session UI、representative machine、estimator capability gate 與 persistence regression tests
- lint ✅；typecheck ✅；完整 tests：**205 / 205 passed** ✅
- production build：Next.js 16.3.2 webpack build ✅（沿用專案既有、可在受限執行環境穩定執行的 production QA 路徑）
- localhost production smoke：`/`、`/identify`、`/catalog`、Catalog Detail、Guide、Session route 均 HTTP 200 ✅
- Vercel Preview source commit `1678247`：Ready ✅
- 固定 dev Preview `/`、`/identify`、`/catalog`、Catalog Detail、Guide route smoke 通過，無 console error ✅
- 固定 Preview：`https://slot-companion-git-dev-ben-liu.vercel.app` ✅

v0.2.6.3 手機驗收 hotfix（2026-08-29）：
- 手機驗收確認戰國乙女的 capability 過濾、GOD 的 AT／終了畫面 controls、喰靈具名事件與 BIG／REG 分離，以及 Session 到結算的保存均正常 ✅
- 喰靈終了畫面來源在多個 indication table 重複列出相同選項；compiler 現以 NFKC 正規化後的穩定 choice value 去重，保留第一次出現順序，不只在 UI 隱藏
- Summary 改為共用該 Session `profileSnapshot` 的 capability UI model；只列出 operational Smart Counter／choice，read-only、unavailable 與空 choices 不再出現
- Summary 固定 CZ／AT 欄位改依 generic operational capability 決定；只有具名 CZ／AT／ART 的 Session 不再顯示誤導性的 `CZ 0`／`AT 0`，也不把具名事件合併為 generic total
- 無 capability snapshot 的舊 Session 維持安全 legacy fallback，原有 CZ／AT 與有效 Smart Counter 繼續可開啟
- 新增最小 duplicate ending-choice **TEST DATA** fixture；涵蓋去重與順序、戰國乙女 unavailable end evidence、喰靈 generic totals 隱藏、GOD AT／choice、snapshot reload／summary 與 legacy Session 回歸
- lint ✅；typecheck ✅；完整 tests：**209 / 209 passed** ✅；production build ✅
- localhost production smoke：`/`、`/catalog`、Catalog Detail、Guide、Session、Summary route 均 HTTP 200 ✅
- Vercel Preview source commit `d110870`：Ready ✅
- 固定 dev Preview `/`、`/catalog`、Catalog Detail、Guide、Session、Summary route smoke 通過，無 console error ✅

v0.2.6.3 手機人工複驗（使用者確認，2026-08-29）：
- 喰靈終了畫面 choices 已完成去重，共顯示 **8 個**不重複選項 ✅
- 喰靈 Summary 不再顯示不適用的固定 `CZ 0`／`AT 0` ✅
- 喰靈具名事件、BIG、REG 與終了畫面 choice 均正確保存 ✅
- 戰國乙女 unavailable 終了畫面不再出現在 Session 或 Summary ✅
- 戰國乙女具名 CZ／AT 計數與 Summary 顯示一致 ✅
- G 數、通常狀態 G、Smart Counter 與 choice 均正確保存至結算頁 ✅
- capability-driven Session 與 Summary 手機人工驗收通過 ✅
- **v0.2.6.3 手機人工驗收通過**；完整新手／老手模式與其他下一版本仍未開始

### v0.2.6.2 – Session Capability Contract
Status：**Completed；產品／架構驗收通過**

- 新增集中式、exhaustive 的 14 種 `SessionModuleKind` capability contract；新 module 未加入 mapping 時會明確失敗，不能靜默落入 generic control
- 每個實際 module capability 保存 control type、日中 label、canonical observation key、Session write target、state effect、operational／read-only／unavailable 狀態與原因、estimator usability、choice 與 numerator／denominator dependency
- Machine Guide compiler 現在產生 `sessionCapabilities` 與 `denominatorCapabilities`；`machineFromGuide` 將 capabilities、guide states 與來源當下 Machine 一起保存於 Session `profileSnapshot`
- 既有 Session 沒有 capability snapshot 仍可載入；新指南或 cache 更新不會回頭改寫、重算或刪除既有 Session
- Game State 資料模型補齊 `art / bonus / other`；本版只完成 snapshot／contract，不宣稱固定手機狀態列或 Adaptive Session UI 已完成
- 具名 CZ／AT 使用 stable event observation；只有沒有可靠具名 CZ 時才保留 generic CZ fallback contract；ART 維持獨立 observation 與 `art` state，絕不寫入 AT
- BIG／REG／其他 Bonus 各自保存具名 counter observation；Bonus total 定義為 derived，不另做會重複計數的按鈕
- 終了畫面只有來源存在可靠 option table 才建立 operational choice；choices 保存 stable id、日中 label、來源說明與 reference flag，沒有 choices 時保持 unavailable
- estimator dependency validator 同時檢查完整設定 1～6、唯一 operational numerator、operational denominator、最小樣本及重複記錄路徑；完整 table 仍可顯示，但 dependency 不完整者不進 estimator
- audit 的三個錯誤 eligible sample 已修正：`bigBonus` 綁到具名 BIG event 後可安全使用；沒有 ART control 的 `art` 與沒有弱チェリー control 的 `guide-弱チェリー` 共 **2 個**被 validator 阻擋
- denominator contract 已涵蓋 total games、normal games、bonus interval、cycle arrivals、point arrivals、CZ trials、AT／ART ends 與 specific trials；目前只有有實際 control 的 denominator 為 operational，其餘維持 planned／unavailable
- 本版沒有重做 SessionScreen、沒有宣稱 Set／cycle／points／CZ failures／dual games／role streak 手機 UI 可用，也沒有開始 Adaptive Session UI

Representative source analysis（2026-08-28）：
- 依 audit 選定範圍，17 個正式 Catalog canonical P-WORLD detail URL 各依序讀取一次：17 success、0 blocked；10513 只使用最小 **TEST DATA** fixture，不冒充正式 Catalog runtime
- coverage 最新分級：Confirmed **17**、Probable **14**、Unknown／Needs Source Analysis **171**
- 未新增 archetype 或 module kind；六個 Probable A-type／BT 案例雖來源成功，多數仍落入 `generic`，記錄為日後跨案例 classifier signature 改善候選，不做單機 hardcode
- 完整結果：`Machine_Catalog_Representative_Source_Analysis.md`；`Machine_Catalog_Coverage_Audit.md` 已同步更新 confirmed finding

v0.2.6.2 QA：
- capability contract、legacy Session、snapshot isolation、canonical CZ／AT／ART／Bonus、end choice、denominator 與 estimator dependency regression 已加入
- TEST DATA fixtures 仍只用於測試，不代表真實機種資料
- lint ✅；typecheck ✅；完整 tests：**195 / 195 passed** ✅
- production build：Next.js 16.3.2 webpack build ✅（Turbopack 在受限執行環境無法綁定內部 CSS worker port，因此沿用專案既有 webpack production QA 路徑）
- localhost production smoke：`/`、`/identify`、`/catalog`、Catalog Detail、Guide、legacy Session route 均 HTTP 200 ✅
- Vercel Preview source commit `aaef54e`：Ready ✅
- 固定 dev Preview `/`、`/identify`、`/catalog`、Catalog Detail、Guide route smoke 通過，console 無 error；舊 capability revision guide 會明確標為 stale 並提供重建入口，不影響既有 Session ✅
- 固定 Preview：`https://slot-companion-git-dev-ben-liu.vercel.app` ✅

### Machine Catalog Coverage Audit（只讀分析，2026-08-28）

- 以 v0.2.6.1 手機驗收通過基準，完成 repository-local Catalog／Guide／Profile／Session／Estimator coverage audit；未請求 202 個 P-WORLD 頁面、未批次建立指南、未修改產品程式或資料
- 正式 Catalog：202；Confirmed：5（2.5%）；Probable：20（9.9%，全部仍屬推測）；Unknown／Needs Source Analysis：177（87.6%）
- 202 / 202 Catalog 均有 canonical P-WORLD detail URL；已有 Profile 3、Catalog-only 199；primary source URL duplicate 與 normalized official identity duplicate 均為 0
- 現有七種 GuideMachineType 已由正式 Catalog 證明 5 種；`a_type` 目前只有 TEST DATA fixture，`generic` 是安全 fallback，不代表玩法已被確認
- 發現主要架構斷點：compiler `sessionModules` 會顯示於 Guide，但尚未完整轉成 Session controls；Set、cycle、points、CZ failures、dual games、role streak 等不能因資料存在就宣稱 UI 已可操作
- 發現 guide benchmark dependency 風險：TEST DATA sample 中 `bigBonus`、`art`、`guide-弱チェリー` 雖被標為 eligible，但目前 Session 沒有同 key numerator counter；需在未來產品修改前先建立 module/control 與 benchmark dependency contract
- 建議後續以 18 個代表案例做受控來源分析，不對全部 Catalog 進行人工或網路批次驗證；Adaptive Session UI 與 v0.2.6.2 均尚未開始
- 完整報告：`Machine_Catalog_Coverage_Audit.md`

### v0.2.6.1 – Adaptive Machine Guide Schema & Compiler
Status：**Completed；手機人工驗收通過**

- Machine Guide 升級為 schema v2；parser 只整理來源 facts，獨立 compiler 才決定機型、狀態、事件、Session 模組與 estimator eligibility
- 支援 `a_type / bonus_art / cycle_point_at / bonus_loop / multi_zone_at / set_based_at / generic`；資料不足時安全回 `generic`
- guide、Session template、Setting Estimator 各自保存 `available / partial / unavailable` 與原因，不再用單一 Verified 門檻代表全部能力
- 新手指南保存核心玩法、最多 5 個關鍵事件、何時記錄與日中術語；缺失欄位顯示「尚無資料」
- 動態狀態保留 stable id、顯示名、來源原文與 `normal / chance_zone / at / art / bonus / special` 等類型；AT 與 ART 分離
- recordable events 依來源建立，不再無條件加入 generic Bonus 或特殊演出
- 新增固定受控 Session module library：總 G、通常 G、BIG／REG／Bonus、具名 CZ、AT、ART、Set、週期、點數、CZ 失敗、雙 G、小役／圖示連續、終了畫面／示唆與自訂事件
- estimator metric 明確保存 numerator、denominator、適用狀態、最低樣本、設定值、來源與不可用原因；無可靠分母或無可記錄事件時只作參考，不進 estimator
- 無 Session 樣本時 UI 顯示「尚未開始推測」，不再顯示六個 16.7% 造成假精準
- guide Session compatibility snapshot 改用 `profileStatus: reviewed`，不再把單一來源指南誤稱為 Verified Profile；既有 Profile lifecycle 不變
- localStorage key 升級為 `slot-companion-machine-guide-v2:`；v1 cache 不會被當成 v2 使用，需重新取得來源；既有 Session snapshot 不修改、不重算
- 六個最小整理 fixture 均明確標示 TEST DATA，不保存完整 P-WORLD 頁面：10530、10473、10513、10508、10485、10424

Reference coverage：
- 10530 Bonus + ART：Bonus 與 ART 分離
- 10473 週期／點數／具名 CZ → AT：選擇 cycle、points、CZ failure 模組
- 10513 A-type：BIG／REG；不產生 CZ／AT／ART
- 10508 擬似 Bonus loop：不套用 generic CZ／AT
- 10485 多 CZ／AT／雙 G：優先具名 CZ 並選擇 dual-games
- 10424 Set 管理 AT／小役連續：選擇 set 與 role-streak 模組

v0.2.6.1 QA：
- lint ✅
- typecheck ✅
- tests：**165 / 165 passed** ✅
- production build：Next.js 16.3.2 webpack build ✅
- localhost `/`、`/identify`、`/catalog`、Catalog Detail、Guide route：HTTP 200 ✅
- parser / compiler fixtures：13 / 13 passed；包含六種機型、AT／ART 分離、可靠 denominator、missing data 與 v1 cache invalidation ✅
- Catalog 真實來源 integration smoke：10530=`bonus_art`、10473=`cycle_point_at`、10508=`bonus_loop`、10485=`multi_zone_at`、10424=`set_based_at`，均 schema v2 / usable ✅
- 10513 目前不在本機 Catalog，因此只用最小整理 TEST DATA fixture 驗證 A-type；尚未聲稱完成 Catalog runtime 實頁驗證
- 固定 Vercel dev Preview 已載入 schema v2 UI；舊 v1 cache 明確要求重建，未冒充 v2 ✅
- Preview 由 Catalog 建立 10530 v2 guide 成功，可見新手指南、動態 Session template 與「開始玩」✅
- Preview 建立 10473 guide 成功，依機型顯示週期到達、點數到達、CZ 失敗模組；console 無 error ✅
- 固定 Preview：`https://slot-companion-git-dev-ben-liu.vercel.app` ✅

v0.2.6.1 手機 QA hotfix（2026-08-28）：
- 手機驗收發現戰國乙女5 將 `期待度`、`当選時に`、`本前兆中は` 等日文句子碎片誤建為 event／Smart Counter；已改為只從引號中的正式模式名與結構化 `名稱(CZ/AT/ART)について` 標題建立事件
- 新增通用候選語意檢查：排除助詞／語法片段開頭或結尾，以及期待度、當選時、非當選時、本前兆、突入、濃厚等不可獨立觀測／計數文字；無可靠事件時允許 events 與 counters 為空
- 戰國乙女5 真實 runtime 已確認上述七類錯誤碎片不再出現；週期、點數、CZ 失敗、AT、終了畫面模組仍保留 ✅
- 手機驗收發現ミリオンゴッド指南混入 `#bbs` 玩家留言與投稿日期；parser 現在只解析 `#spec` 起至 `#bbs` 前的官方資料範圍，並排除留言、評論、廣告、導覽與頁尾
- 圖片 alt 不再轉成表格值；完全相同列、完全相同表格、無有效欄名及只含重複頁名的破碎表格會被排除，不猜測空值
- `missingSections` 改依清理後可靠 table facts 補足 AT／ART、小役、Bonus、終了畫面／設定示唆／Plate；污染內容不計入 completeness
- 喰霊-零-Re 正向 runtime regression 保留：超自然災害モード、解放の刻、喰霊CHANCE、BIG BONUS、REG BONUS、終了畫面／設定示唆 ✅
- ミリオンゴッド真實 runtime 不再含留言／投稿日期，且 `at_art`、`small_roles`、`special_events` 不再誤列缺失；保留 AT、Set、小役連續、終了畫面／示唆模組 ✅
- 新增最小 TEST DATA DOM fixture；不保存完整 P-WORLD 頁面或來源圖片
- lint ✅；typecheck ✅；tests：**170 / 170 passed** ✅；Machine Guide regression：**18 / 18 passed** ✅；production build ✅
- localhost `/`、`/identify`、`/catalog`、Catalog Detail、Guide route：HTTP 200 ✅
- 五個既有 P-WORLD runtime smoke 均為 schema v2 / usable，且指定留言污染檢查皆為 false ✅
- 固定 Vercel dev Preview 已完成 hotfix deployment；線上重建ミリオンゴッド指南後顯示 AT、Set、小役連續、終了畫面／示唆模組，無指定留言污染，missing 僅為實際未取得的 features／CZ／Bonus，console 無 error ✅
- 本 hotfix 未修改 SessionScreen 固定狀態列、Adaptive Session UI、照片辨識、雲端儲存或 Profile／Estimator 數學

v0.2.6.1 第二次手機 QA blocker 修正（2026-08-28）：
- 第二次手機驗收確認裝置仍載入 parser hotfix 前已保存的 schema v2 localStorage guide；戰國乙女5 舊句子碎片與ミリオンゴッド舊留言污染因此仍出現。此現象屬快取 revision 缺口，不是新鮮 runtime parser regression
- MachineGuide schemaVersion 維持 2；新增獨立 `compilerRevision = 2026-08-28-data-quality-1`。缺少 revision 或 revision 不一致的舊 schema v2 cache、以及既有 v1 cache，讀取時均標為 stale 並拒絕載入
- cache invalidation 只檢查 `slot-companion-machine-guide-v2:{catalogId}` 與既有 v1 guide key；不清除、不重寫 Session、遊玩紀錄、Catalog 或任何其他 localStorage 資料
- Catalog Detail 對 stale guide 顯示清楚原因與「重新建立 P-WORLD 機台指南」；有效 guide 顯示「重新整理 P-WORLD 機台指南」與最新擷取時間
- Machine Guide 頁同樣提供重新建立／重新整理；刷新成功才以最新 compiler 結果覆蓋該機 guide cache，失敗則保留上一份有效 guide 並顯示錯誤
- cache revision、v1 拒絕、Session snapshot 隔離、refresh success overwrite、refresh failure preservation 與 UI rebuild/refresh actions 均有 regression coverage
- parser/compiler pollution、sentence-fragment、喰霊正向與 schema v2 Session snapshot regression 持續通過；此次未重新修改 production parser/compiler，僅補齊最小 TEST DATA fixture 中原測試要求但缺漏的「解放の刻」內容
- lint ✅；typecheck ✅；tests：**176 / 176 passed** ✅；production build：Next.js 16.3.2 webpack build ✅
- localhost smoke：Catalog 建立 guide 成功；Guide 頁手動 refresh 後擷取時間更新，console 無 error ✅
- 固定 Vercel dev Preview 已載入本次 cache revision：裝置原有舊 v2 guide 被明確標為失效並顯示重建入口；重建後可看到乾淨的喰霊具名事件與手動 refresh 按鈕 ✅
- Preview 手動 refresh 後擷取時間由 20:40:51 更新為 20:41:01，route 維持正確且 console 無 error ✅
- 此項修正完成時先維持等待手機複驗；後續實際結果記錄於下方「手機人工複驗」段落

v0.2.6.1 手機人工複驗（使用者確認，2026-08-28）：
- 戰國乙女5 不再將日文句子碎片建立為 Smart Counter ✅
- GOD 機台指南不再混入掲示板或玩家留言 ✅
- GOD 正確提供 AT、Set、小役／圖示連續及終了畫面模組 ✅
- Setting Estimator 在沒有 Session 樣本時正確顯示「尚未開始推測」✅
- `compilerRevision` 快取失效與「重新整理 P-WORLD 機台指南」在手機端正常運作 ✅
- 既有 Session 未受影響 ✅
- **v0.2.6.1 手機人工驗收通過**；本紀錄不代表 v0.2.6.2 或 Adaptive Session UI 已開始

v0.2.6 手機人工 QA（使用者確認，2026-08-28）：
- 可由 Catalog 使用既有 P-WORLD sourceUrl 建立機台指南 ✅
- 可從 Catalog 進入並閱讀機台指南 ✅
- 可從指南開始 Session ✅
- 手機直向流程可操作 ✅
- 本紀錄只代表上述實際驗證項目；不推定未測項目

### v0.2.6 – P-WORLD 機台指南 MVP
Status：**Completed；等待人工驗收，尚未核准**

- Catalog Detail 直接使用既有 P-WORLD machine detail `sourceUrl`，使用者不需重新搜尋或貼 URL
- 新增專用 `PWorldMachineGuideProvider` 與 deterministic detail parser；只允許 P-WORLD canonical machine detail URL，不繞過登入、反爬蟲或存取限制
- 新增結構化機台指南資料模型：`usable / partial / no_data`、section、table、missing section、source evidence、source URL、retrievedAt、可觀測 Counter 與安全 benchmark
- parser 整理基本特色、玩法、通常流程、CZ、AT／ART、Bonus、天井、設定機率、出玉率／機械割、小役與特殊演出；不同頁面允許部分欄位缺失
- `調査中`、未公開、空白與格式無法確認的數值維持缺失，不當成 0、不建立 benchmark、不補猜
- Catalog-only 頁新增「從 P-WORLD 建立機台指南」；建立成功後直接進入 `/guides/[catalogId]`
- 已有此裝置快取時顯示「查看機台指南」；指南頁保留 P-WORLD 來源與最後擷取時間
- 機台指南 UI 使用 `可使用 / 部分資料 / 尚無資料`，不要求雙來源、Profile Verified 或人工核准才能查看與開始 Session
- 指南建立安全 Session snapshot，支援觀測 G、CZ、AT／ART、Bonus、特殊演出及來源中完整可解析的額外計數項目
- 只有完整設定 1～6 數值、現場可觀測 numerator 與明確 denominator 的資料才轉成 estimator benchmark
- 指南型 Setting Estimator 明確標示 `參考推測 / PUBLIC SOURCE`，並提示不是準確設定判定或獲利保證
- 既有 Profile、Published Profile、Session snapshot、TEST DATA、圖片壓縮與 AI identity pipeline 均保留
- 今日紀錄改用 Session `profileSnapshot` 顯示 Catalog-only 指南機種，避免顯示為未知機種
- runtime 不寫入 repository JSON 或 `data/profile-drafts.json`；指南僅保存於使用者目前瀏覽器的 localStorage
- P-WORLD 取得失敗時顯示來源錯誤、保留 Catalog 與 Session，並保留「開啟 P-WORLD 來源」；若已有成功快取仍可繼續查看與開始 Session

Storage limitation：
- 目前不是雲端持久化或跨裝置同步；清除瀏覽器資料、換裝置或換瀏覽器後需重新建立指南
- Vercel runtime 不進行本機檔案持久寫入；未建立外部付費資料庫、帳號或管理者系統

P-WORLD 10530 integration smoke（2026-08-28）：
- 成功使用 Catalog 內既有 `https://www.p-world.co.jp/machine/database/10530` 建立 `usable` guide ✅
- 實頁抽出 features / play / flow / CZ / AT-ART / Bonus / setting rates / payout / special events ✅
- 真實頁面可安全產生 3 個完整公開機率 benchmark；重複表格已去重 ✅
- 實頁中無可靠正文／完整表格的 ceiling、small role section 維持 missing，不補猜 ✅
- API response：HTTP 200，來源 URL 與 Catalog record 一致 ✅

Regression QA：
- minimal curated P-WORLD fixture，不保存完整來源頁或來源圖片 ✅
- Catalog-only → 建立 guide data → Session snapshot ✅
- `調査中` 不建立數值或 benchmark ✅
- request failure 回傳明確錯誤 ✅
- localStorage 成功快取與讀回 fallback ✅
- Existing Profile、Machine Identity、Toaru false-uncertain、Catalog search、Session、Estimator 舊流程回歸 ✅
- lint ✅
- typecheck ✅
- tests：**159 / 159 passed** ✅
- production build：Next.js webpack build ✅
- localhost `/`、`/identify`、`/catalog`、Catalog Detail、Guide route：HTTP 200 ✅
- localhost guide API：HTTP 200、status `usable`、3 benchmarks ✅

Vercel Preview QA（2026-08-28）：
- product commit `ca65269` 已 push 至 `origin/dev`，固定 Preview 已切換到 v0.2.6 UI ✅
- 固定網址：`https://slot-companion-git-dev-ben-liu.vercel.app` ✅
- Catalog `machine-u0ht3u` 顯示「從 P-WORLD 建立機台指南」，舊 Profile Lab production notice 不再出現 ✅
- 線上呼叫 P-WORLD 成功，建立後導向 `/guides/machine-u0ht3u` ✅
- Preview guide 狀態 `可使用`，顯示 P-WORLD 來源、缺失資料、免責提示與「開始玩」✅
- browser console 無 error；未上傳或重測任何 AI 辨識照片 ✅
- 尚待使用者以手機驗收實際觸控、閱讀與開始 Session 流程

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

### v0.2.5.2 – Client Image Compression for Vercel
Status：**穩定化修正完成；等待人工驗收，尚未核准**

- AI 機種辨識選圖後先在 browser client-side 解碼與壓縮，原始圖片不送往 API route
- 最大長邊 1920px，維持直向／橫向與原始長寬比例；使用 orientation-aware browser decode
- 輸出統一為 JPEG，初始 quality 0.82，必要時最低降至 0.75 並逐步縮小尺寸
- 壓縮目標小於 1.9 MiB；硬上限小於 3.8 MiB，超過時阻擋辨識
- HEIC / HEIF 若瀏覽器可解碼則轉成 JPEG；無法解碼時明確提示改用 JPEG / PNG 或先轉存
- UI 顯示原始大小、壓縮後大小、原始尺寸、輸出尺寸與 JPEG 格式
- client race protection：快速重選照片時，舊壓縮結果不會覆蓋新選擇
- server-side image 上限由 8 MiB 降為 3.8 MiB，並在 `formData()` 前以 4.2 MiB request guard 檢查 Content-Length
- 上限保留 multipart overhead，低於 Vercel Functions 官方 4.5 MB request payload ceiling
- 未修改 AI prompt、Catalog matching、Machine Profile、Session、Setting Estimator 或既有 identity safety rules

Known limitation：
- HEIC / HEIF 支援取決於使用者瀏覽器是否具備原生解碼能力；本版本不加入大型第三方 decoder

Regression QA：
- landscape / portrait 1920px resize 與 orientation ratio ✅
- 小圖不放大 ✅
- HEIC / HEIF extension eligibility ✅
- target / hard max / request ceiling boundary ✅
- 原始與壓縮大小格式化 ✅
- lint ✅
- typecheck ✅
- tests：**134 / 134 passed** ✅
- production build：Next.js webpack build ✅

Vercel Preview 桌面人工驗收（2026-08-27）：
- `dev` commit `e269740` 建立全新 Preview Deployment，Preview 環境變數確認完整 ✅
- 實測原始圖片 6.21 MB（4284 × 5712）成功壓縮為 1.02 MB（1440 × 1920 JPEG）✅
- `/api/ai/identify-machine` 不再出現 `FUNCTION_PAYLOAD_TOO_LARGE` / HTTP 413 ✅
- OpenAI 真實辨識請求成功，圖片正確辨識為 `L 東京喰種`，狀態 `identified` ✅
- 本次 request User Agent 為 Macintosh；手機相機／相簿實機流程尚未驗收
- `main` / Production 尚未合併或更新 ✅

Vercel Preview 手機實機驗收（2026-08-27）：
- 手機「直接拍照」成功取得 2.26 MB、3024 × 4032 圖片 ✅
- client-side 成功壓縮為 804.1 KB、1440 × 1920 JPEG ✅
- OpenAI 真實辨識成功，正確匹配 `スマスロ とある魔術の禁書目録2` Catalog record，狀態 `identified` ✅
- 未再出現 HTTP 413 或 Preview API Key 錯誤 ✅
- 發現 Catalog-only 辨識結果只有「尚未建立攻略 Profile」狀態，沒有連至 Catalog Detail／「建立攻略 Profile」的確認後續入口

Catalog-only 後續流程修正：
- 僅在 `identified + matchedCatalogId + 無 matchedMachineId` 時顯示確認後續操作
- 主要入口「✓ 就是這台 · 建立攻略 Profile」連至 `/admin/profile-builder/{matchedCatalogId}`
- 次要入口「查看 Machine Catalog 資料」連至 `/catalog/{matchedCatalogId}`
- 不自動跳轉；必須由使用者點擊確認後才進入 Profile Builder 或 Catalog Detail
- uncertain、unknown 或沒有可靠 Catalog ID 時不顯示建立 Profile 入口
- 已有 Machine Profile 時維持「✓ 就是這台 · 載入現有 Profile」，不顯示重複建立入口
- Catalog ID 經 URL encoding 後傳入兩個 dynamic routes
- 未修改 AI prompt、Catalog matching / identity safety、Profile Builder 寫入核准、Session、Setting Estimator、benchmark 或圖片壓縮參數
- lint ✅
- typecheck ✅
- tests：**139 / 139 passed** ✅
- production build：Next.js webpack build ✅

人工驗收前架構檢查發現 blocker：
- 主要入口目前連至 `/admin/profile-builder/{catalogId}`，但該 route 在 `NODE_ENV === "production"` 時直接 `notFound()`
- Vercel Preview 使用 production build，因此「建立攻略 Profile」在 Preview 預期會回 404；現有 automated test 只驗證 href，未驗證實際 route 可達性
- Profile Draft 目前保存於 server-side `data/profile-drafts.json`；Vercel Serverless 不應視為可靠持久寫入位置
- 在決定 Preview／Production 權限與持久儲存方案前，不得把此入口視為通過人工驗收，也不得合併 `main`

v0.2.5.2 穩定化修正（2026-08-28）：
- Identify 的 Catalog-only 結果移除 `/admin/profile-builder/{catalogId}` 入口
- Catalog-only 只顯示單一主要按鈕「✓ 就是這台 · 查看機種資料」，連至 `/catalog/{matchedCatalogId}`
- 已有 Profile 仍只顯示「✓ 就是這台 · 載入現有 Profile」
- uncertain、unknown 或沒有可靠 Catalog ID 時不顯示 Catalog-only 確認入口
- Catalog Detail 在 production 顯示「攻略 Profile 尚未建立」與「Profile Lab 雲端建立功能準備中」，不輸出不可達 Builder href
- Catalog Detail 在 localhost development 保留既有 Profile Builder 開發入口
- 未修改圖片壓縮參數、AI prompt、Catalog matching、identity safety、Profile Builder 核心、Session、Setting Estimator、benchmark、Catalog JSON 或 Published Profile
- lint ✅
- typecheck ✅
- tests：**142 / 142 passed** ✅
- production build：Next.js webpack build ✅
- production localhost `/identify`：HTTP 200 ✅
- production Catalog-only Detail：HTTP 200、Profile Builder href = 0、準備中 notice 顯示 ✅

Machine Identity false-uncertain 修正（2026-08-28）：
- identity title comparison 將開頭的 `L`、`スマスロ`、`パチスロ` 視為機種類型前綴差異；不修改 Catalog JSON
- deterministic recovery 僅在高信心正式 title、移除前綴後核心名稱完整相等、Catalog 唯一匹配、版本無衝突時成立
- `L とある魔術の禁書目録2` 與 `スマスロ とある魔術の禁書目録2` 均唯一匹配 `machine-th4uhu`
- 圖片未顯示 manufacturer，或抽取結果為「メーカー：不明」，視為缺少證據，不再誤判為 manufacturer 衝突
- Preview QA 發現 Phase 1 亦可能將 `PACHISLOT`／`INDEX` 等非廠商文字放入 manufacturer marks；只有可對應 shortlist 已知 manufacturer／brand 的 mark 才具備衝突效力
- 圖片明確顯示不同 manufacturer 時仍降為 `uncertain`
- `一方通行`、續作數字、RE:2／RE:3、Roman numeral、V／V-30 與 generic GOD／DREAM／BONUS 的安全規則保持
- 既有 AI response failure shape 與 deterministic pipeline regression：`identified`、`matchedCatalogId=machine-th4uhu`、正式名稱 `スマスロ とある魔術の禁書目録2`、manufacturer `藤商事` ✅
- `/identify` localhost smoke test：HTTP 200 ✅
- Catalog-only follow-up regression：`/catalog/machine-th4uhu` ✅
- lint ✅
- typecheck ✅
- tests：**152 / 152 passed** ✅
- production build：Next.js webpack build ✅
- Vercel Preview `9acd7c9`：Deployment Ready 且 source commit 正確；線上 QA 顯示非廠商 mark 仍可能造成 false manufacturer conflict，因此完成第二輪 deterministic hardening
- Vercel Preview `fdbe255`：Deployment Ready，source commit 確認為 `fdbe255`，immutable URL `https://slot-companion-olak61exj-ben-liu.vercel.app` ✅
- 原指定路徑 `/Users/juicheliu/Downloads/Slot Companion 2.jpeg` 已由使用者更正為不存在；停止自動重試，不以其他照片冒充本案例
- 真實手機原始照片 Vercel Preview 人工驗收通過：原始 3.52 MB（3024 × 4032）成功壓縮為 1.12 MB（1440 × 1920 JPEG）✅
- 線上辨識結果為 `IDENTIFIED`，正確辨識 `スマスロ とある魔術の禁書目録2`，manufacturer `藤商事`、信心高 ✅
- 成功配對 Machine Catalog，顯示並可使用「✓ 就是這台 · 查看機種資料」✅
- 成功進入正確 Catalog Detail，資料來源顯示 P-WORLD ✅
- 本次 false-uncertain 問題已由真實手機照片 Preview QA 確認解決 ✅

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

### Full Product Regression（2026-08-30，自動 QA）
- `dev` 與 `origin/dev` 同步於 `b67fec9149d2033b4924afbc8583b232f3147a9d`；`main`／`origin/main` 維持 `3e6c5f4e1de6fa3448b3a0e046854ad37e8dc400`，未修改、未 merge。未追蹤的 `src/components/StartSession 2.tsx` 未碰觸。
- 工程檢查：lint 通過、typecheck 通過、完整 tests **314 / 314 passed**、Next.js 16.3.2 webpack production build 通過。
- localhost 390 × 844：首頁、Catalog、Catalog Detail、Guide empty state、AI 圖片入口、術語、今日紀錄、晚上撿台均正常且無水平溢出；Production build 的 development admin route 正確維持 404。
- Catalog search regression：`BIG DREAM`、`big-dream` 均召回 `スマスロ ビッグドリーム THE GOLDEN PUSHER`；`Tokyo Ghoul` 召回 `L 東京喰種`。
- 隔離 localhost Session 實測：模式選擇、baseline 100、`+10` 累積至 100 observed G、CZ／AT 各 1 次、終了畫面 Choice、Guide drawer、reload persistence、Summary 與 Records 全部一致；沒有清除或改寫使用者 Preview 資料。
- 固定 dev Preview 390 × 844 與 1280 × 900：`/`、`/catalog`、`/identify`、`/glossary`、`/records`、`/guides/machine-1ar2ivp` 均可開啟、無水平溢出、console error／warning 0；manifest 可正常取得。本項為自動瀏覽器 QA，不冒充實體手機、相機或日本現場驗收。
- QA 發現：東京喰種相容 Session 在最低 100G 門檻、CZ 1 次與 AT 1 次時即顯示「判斷力高 89%」。計算符合目前 `minimumSample` 與 confidence weight 實作，但產品呈現對小樣本過度樂觀，應在下一輪優先重新校準樣本可信度，不應把本次結果視為設定判定。
- QA 發現：`public/sw.js` 的 cache namespace 仍為 `slot-companion-v0.2.2.1`，預快取路由仍是早期首頁／machines／identify／records／hunter，尚未覆蓋目前 Catalog／Guide 主流程與旅行前離線指南需求。

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

### v0.2.9.3 Fixed dev Preview automated QA
- 固定 dev Preview、390 × 844：Catalog「更新機種資料庫」說明可正常開啟與關閉 ✅
- 線上說明清楚交代 localhost Importer → Preview → Approve → push dev → Vercel 更新流程 ✅
- Production／Preview 未輸出不可達的 `/admin/catalog-import` 連結 ✅
- Modal 無橫向溢出，console 無 error／warning ✅
- 此項為自動瀏覽器 QA，不等同實體手機人工驗收；Estimator readiness 仍等待使用者手機抽查

### Estimator primary／upper event mapping QA
- `スマスロ バイオハザードRE:3` 的 P-WORLD 設定 1～6 `AT初当り` 表可正確轉為 real benchmark ✅
- 一般 `AT初当り` 只綁定主要 `HAZARD RUSH`，不使用來源明確標示的上位 `HAZARD RUSH INFERNO` ✅
- 兩個無主從證據的同層級 AT 仍 blocked，不任意猜測 numerator ✅
- 1,100 通常 G／主要 AT 1 次可進入 estimator；完整 tests 286 / 286 passed ✅
- 固定 dev Preview 已指向本次 commit；RE:3 Catalog Detail 在 390 × 844 無溢出或 console error ✅

### Nearby Halls Search Polish & Session Scene AI（2026-08-30，自動 QA）
- 工程檢查：lint **0 errors / 0 warnings**、typecheck 通過、完整 tests **337 / 337 passed**、Next.js 16.3.2 webpack production build 通過。
- localhost production smoke：`/`、`/halls`、`/catalog`、`/identify`、`/records` 均 HTTP 200；空白 Scene API request 正確回 HTTP 400。
- localhost 390 × 844：`豐州` 可正規化為 `豊洲`，常用地區捷徑與 Google Maps 直接搜尋連結正常；頁面寬度 390 / 390，無水平溢出，console error／warning 0。
- AI 回答排版、場景候選白名單、未知 control rejection、人工確認後才記錄等 regression tests 均通過。場景照片的真實相機／手機 AI 辨識仍待固定 Preview 人工抽查，本項不冒充實體手機驗收。
- 固定 dev Preview 已更新至產品 commit `e0ba649`；390 × 844 的 `/halls` 可正規化 `豐州` → `豊洲`、直接開啟 Google Maps，無水平溢出且 console error／warning 0。新 Scene API 與 Session UI 已隨同一 build 部署；未使用使用者照片做自動辨識。

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
12. Vercel Function request payload 上限為 4.5 MB；辨識圖片必須在 client-side 壓縮並為 multipart overhead 保留空間
13. AI identified 且已匹配 Catalog、但尚無 Machine Profile 時，Production 只允許使用者確認後前往 Catalog Detail；不得自動跳轉或對 uncertain / unknown 顯示入口
14. Profile Builder 是 development admin route，production build 會回 404；Production UI 不得輸出該 route 的操作連結
15. 若未來要提供 Cloud Profile Lab，必須先完成管理者存取與可靠雲端持久儲存，不能沿用 server-side JSON 寫入假裝可用
16. 已修正手機實測 `L とある魔術の禁書目録2` 的 false uncertain：型態前綴差異可在唯一完整 core title match 時 deterministic 對應；manufacturer 缺席／不明不視為衝突，明確衝突仍維持安全降級
17. P-WORLD 官方解析必須以官方 DOM section 邊界為準；頁面關鍵字不足以證明是機台資料，`#bbs`、玩家留言與投稿日期不得進入 facts
18. Machine Guide event 只有在可確認為玩家可觀察、可計數的正式模式／Bonus 名稱時才建立；寧可無 event，也不把日文句子碎片補成 Counter
19. MachineGuide schema version 不足以代表 parser/compiler 資料品質 revision；資料清理規則變更時必須獨立失效 guide cache，且不得連帶清除 Session 或其他 localStorage
20. Catalog URL coverage（202 / 202）不等於玩法 coverage；v0.2.8.0 目前只有 19 筆 Confirmed，169 筆仍需來源分析，14 筆 Probable 不得冒充 confirmed
21. `sessionModules` 存在或顯示於 Guide 不等於 Session UI 已可操作；必須分別標示 schema、compiler、Guide UI、Session control 與人工驗收層級
22. Setting benchmark 除了完整設定值與 denominator，還必須驗證 numerator key 確實綁定可操作的 Session counter／relationship
23. v0.2.7.1 手機 QA 已處理同一事件在辨認、注意與記錄區重複的問題：首次教學與 Session drawer 共用單一重點 selector，前三項直接顯示，其餘預設收合；不修改來源或 capability
24. Session 使用模式只能是 presentation snapshot；切換模式不得複製或重建 capability、counter、Timeline 或 estimator observation，舊 Session 必須以 quick 安全回退
25. Family 只能由來源結構化事實建立，機種名稱僅能作輔助；Control Manifest 才是新 Session control 的共同來源，來源不足時保留總 G 並安全降級
26. 自訂記錄屬 browser-local 個人 observation，預設且固定不得進 Setting Estimator；Guide refresh 只影響新 Session，舊 snapshot 不重新編譯
27. CZ／AT 設定別機率表不等於可觀測事件證據；若沒有具名事件、可靠辨認時機或已確認 family 語意，新 Session 必須安全降級，不能沿用 generic CZ／AT template
28. 全量 audit 顯示 raw operational coverage（180/202）會高估可信度；64 台仍含 family fallback generic CZ／AT，應把「family evidence」與「control evidence／record timing」分開建模
29. Numeric operational control 在 202 台目前為 0；cycle、points、set、zone 不可只因來源提及就升為可操作，必須先定義單位、更新時機與 reset contract
30. 69 台 compiler-eligible estimator 中有 40 台的 Manifest 同時含 generic CZ／AT fallback；下一步需逐 metric 驗證 numerator ownership，不能把 family-level control 當成 benchmark 已安全綁定
31. v0.2.8.1 已將 generic CZ／AT fallback 由 64 台降為 0；官方具名 `articleBox-content` 可提供獨立 control evidence，但設定表／family evidence 仍只作分類或 metric evidence
32. Evidence gate 後 Estimator eligible 由 69 降為 60；這是移除未能證明 canonical numerator ownership 的安全收斂，不是公式變更
33. Choice 容器通過 evidence gate 不代表所有候選選項都可信；內建 Choice 必須逐項保存同一機台來源的 section／table ownership，不能跨 section 或跨機台補入常見牌色
34. 中文指南是結構化來源的玩家顯示層，不是新的事實來源；任何 OpenAI 產出若引用未知 control／section 或新增來源未支持的數字，必須整份回退 deterministic guide。
35. 原始日文與表格需要保留可追溯性，但不應占據玩家預設閱讀路徑；預設顯示簡短繁中，原文集中於單一收合區。
36. 中文指南同一事件目前可能在狀態提示、流程與重點區重複出現；手機驗收認定為非阻擋。後續應以實際遊玩回饋調整資訊層級，不應只為去重而刪除必要的辨認或記錄說明。
37. 資料安全規則應由系統持續執行，但不必在玩家主畫面反覆說明；主畫面優先呈現當下操作，來源、限制與 Evidence 以 progressive disclosure 保持可查而不搶占空間。
38. Catalog 更新與單台 Guide 更新是兩件不同工作：前者是 development-only 的 P-WORLD Machine Catalog Importer，後者是 browser-local 單台指南 refresh；UI 必須使用不同入口與文案，且不得在 Vercel 上假裝 repo JSON 可以永久寫入。
39. Estimator 沒有輸出可能代表資料根本不可安全計算，也可能只是尚未達最低樣本；UI 必須區分 schema／mapping blocker 與 Session observation progress，不能只顯示泛用「繼續記錄」。
40. 玩家資料庫的主要價值是「快速找到、看懂、開始記錄」，不是管理 Catalog schema；收藏、最近遊玩、Guide 狀態與術語應位於玩家路徑，Importer 與 evidence 細節維持次要或管理入口。
41. 未取得授權的機台圖片不應因競品視覺效果而直接複製；目前以 Catalog metadata 衍生的視覺卡片提供辨識層級，保留未來接入可授權圖片資產的空間。
42. 遊玩記帳應直接重用 Session 的 observed game 與 snapshot，避免使用者結算後再手動抄寫；跨裝置同步仍需後續資料模型與隱私決策。
43. 同一機台存在主要 AT 與上位 AT 時，完整設定表仍可能因 numerator 不唯一而被安全阻擋；只有來源明確證明事件層級時才能把一般初當 metric 綁定主要事件。若同層級仍歧義，必須繼續 blocked，不能為了產生設定分布任意挑選。
44. 圖文攻略的主要容量成本是圖片而非 Catalog JSON。既有五台共 90 張約 12.03 MB，第二批 20 台共 283 張約 36.67 MiB；兩批合計約 48.7 MiB。這仍不足以推定全量 202 台的長期容量、版本與流量方案已足夠。
45. 圖片來源容器本身不等於可保存內容；visual parser 必須沿用官方 section boundary，排除 BBS／玩家投稿／廣告，並保存 source page、source image URL、caption、section ownership 與擷取時間。
46. 第三批 Scale Pilot 使圖文 registry 達 50 / 202 台；第三批 source-only audit 為 388 張約 47.4 MiB，固定 Preview runtime 實際保留 387 張。來源圖片可用性可能隨時間變動，runtime 應以安全取得結果為準，不為追求 audit 數量補猜內容。
47. 同一瀏覽器累積大量完整 Machine Guide JSON 會觸及 localStorage quota；圖片使用 private Supabase Storage 並不能解決 Guide JSON 本身的 browser-local 容量。後續擴張應優先採 IndexedDB 或雲端 Guide persistence，且不得清除既有 Session／Guide 資料作為日常解法。
48. 全 Catalog source-only audit 顯示 202 台合計約 385.3 MiB 圖片；適合採「使用者建立／重新整理時按需 materialize」，不應把全部圖片預先下載到 browser，也不能把 source-only audit 誤稱為雲端預熱完成。
49. Machine Guide JSON 已移至 IndexedDB；這解決同瀏覽器大量 Guide 的 localStorage quota blocker，但仍不是跨裝置同步或雲端 Guide persistence。
50. 完整設定 1～6 表格仍不等於一定可計算；只有具體可觀察小役或能唯一對應 operational event 的 metric 才能建立 canonical numerator。合成值、條件式機率與狀態內率必須繼續 blocked。
51. Estimator coverage 應同時報告「來源有完整設定值」與「Session 有安全 observation contract」；本輪 102 / 202 可用，另外 67 台缺完整設定值、33 台缺唯一 numerator，不應用猜測追求 100%。
52. Estimator 的 `minimumSample` 只代表 metric 可開始計算，不應直接等同「判斷力高」；多個剛達最低門檻的 observation 目前會快速累加 confidence weight，實測 100G／CZ 1／AT 1 即達 89%，需要另設總樣本可信度曲線與更保守的玩家文案。
53. PWA manifest 可用不等於核心旅途流程可離線；現有 service worker 仍使用 v0.2.2.1 cache namespace，且未預快取 Catalog／Guide。赴日實測前應建立可驗證的離線指南包與版本化快取策略。
54. 上述離線缺口已由 Player Readiness & Travel Pack 補上：service worker 使用新版 shell namespace，旅行包依收藏／最近機台保存頁面與指南圖片；仍必須先在線上準備，且不等於跨裝置同步。
55. Profile 資料仍保留供舊 Session 與歷史相容，但玩家主要入口統一為 Machine Catalog → Machine Guide → Session；不應再把三台 legacy Profile 當成新的內容建立流程。
56. P-WORLD 可可靠提供公開店家候選、地址與設置機種搜尋，但目前沒有在 App 內使用可驗證的公開 GPS 距離 API；因此 MVP 不假算距離，由 Google Maps 接手裝置定位與導航。
57. 店家設置資料具有時效性，Catalog → 店家反查只代表本次 P-WORLD 搜尋結果；不可保存成長期事實或取代現場確認。
58. Session AI 陪玩是現有結構化指南的問答顯示層，不是新攻略來源；送出的 context 有長度與筆數上限，且 AI 無權改寫 Session 或 Estimator。
59. Session 場景照片辨識只可比對當前 snapshot 已存在的 operational controls；AI 候選不是操作指令，必須由使用者確認才可記錄或切換狀態，圖片不得長期保存。
60. iPhone Safari 可能阻擋由 GPS callback 非同步開啟的新分頁；附近店家應以正常使用者點擊連結把位置處理交給 Google Maps，不需要 App 自行取得座標。
61. Google Maps 外部搜尋本身無法形成 App 內的店家／設置機種流程；附近店家應先由 P-WORLD 地區查詢與店家詳細頁建立可追溯候選，地圖只負責選定後導航。
62. 任意英文飯店／餐廳名稱不能在沒有地理資料服務時可靠定位；目前只支援可安全解析的日本地址、常用地名與有限已知地標，無法辨識時必須請使用者改貼地址／區／車站，不得硬猜。
63. 完整英文地址不應原樣當成 P-WORLD 店名關鍵字；日本郵便官方郵遞／羅馬拼音地址資料可先把門牌降解為行政區，再用循序放寬查詢提高召回。純 POI 名稱仍不是地址資料，兩者不可混為同等可信。

## Current Work
**附近店家已完成日本郵便官方郵遞／羅馬拼音地址解析 hotfix；完整英文地址會先轉成行政區並循序放寬 P-WORLD 查詢。本機實頁 smoke、345 tests 與 production build 已通過；等待 dev Preview 部署與手機人工複驗。既有 Session、Estimator、AI、Guide 與自訂記錄未修改。**

核准穩定基準：**v0.2.3.1**

Repository workflow：目前 `main` 僅為 v0.2.5.1 的 **current working snapshot** 初始基準，不代表已通過完整人工驗收；後續日常開發使用 `dev`，未經明確驗收不得 merge 回 `main`。

v0.2.2.2：**Completed；等待使用者驗收，尚未核准**

v0.2.2.3：**Completed；等待使用者驗收，尚未核准**

Catalog 仍只負責 Machine Identity；Machine Guide JSON 是獨立 browser-local IndexedDB cache，不把攻略欄位寫入 Catalog JSON。全 202 台均可按需建立圖文 Guide；圖片資產使用 private Supabase Storage 或來源 fallback。Guide JSON 仍未跨裝置同步。

## Next Step
### 完成 Nearby Halls Area Search & Inventory QA，等待手機驗收

Status：**日本郵便地址解析、本機 runtime、完整工程 QA 與 production build 已通過；等待 dev push／固定 Preview 更新後由使用者手機抽查。**

1. 固定 Preview 以完整英文地址（含／不含郵遞區號）抽查同區候選；確認顯示辨識後行政區且預設不鎖定東京。
2. 選定店家後展開店內 Slot 清單，抽查已收錄 Catalog 的機種可前往中文指南，Google Maps 僅在點擊「地圖導航」後開啟。
3. 實體手機確認輸入、展開清單與長機種名稱的單手操作；設置資料與營業狀況仍以現場為準。
4. 不部署 Production、不 merge `main`，不自行開始下一版本。
5. 純羅馬拼音飯店／餐廳名稱若沒有地址線索仍需貼上地址、郵遞區號或最近車站；是否接入通用 POI geocoder 留待後續產品／成本討論。

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

### Cloud Profile Lab（規劃中，尚未實作）
- 管理者存取控制
- 雲端持久儲存；不再依賴 Vercel Serverless 本機 JSON 寫入
- Profile lifecycle 分級：Draft／Usable／Verified
- 兩來源 URL 輸入／候選預填與既有 Evidence review 流程整合
- 本節僅為後續規劃，不代表任何雲端功能、資料庫或 production Builder 已完成

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
1. AI 搜到資料不等於來源已提供可解析數值
2. Setting Estimator 只使用實際來源提供、完整且可由 Session 可靠觀測的 benchmark；TEST DATA 永遠明確分離
3. 單一 P-WORLD 來源足以建立可使用指南；第二來源未來只作補充，不是使用門檻
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
**完成固定 dev Preview 自動 QA 後，等待使用者驗收附近店家與 Session 場景拍照；不自行開始下一版本。**

目前不要擴張 Estimator 數學、不要用缺失資料補值，也不要將 TEST DATA benchmark 描述為真實機種資料。
