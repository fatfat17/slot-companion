# Slot Companion

手機優先的 Pachislot PWA 遊玩助手：拍照辨識陌生機台、查看繁體中文公開資料指南、建立本機 Session，並以實際紀錄做設定可能性的參考推測。

目前開發版本：**Player Readiness & Travel Pack（等待 Preview 人工驗收）**（`dev`）。

## 本機啟動

```bash
pnpm install
pnpm dev
```

開啟 `http://localhost:3000`。正式檢查可執行 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`。

## 目前流程

1. 拍照／選擇圖片並在瀏覽器端壓縮。
2. AI 辨識後由使用者確認 Machine Catalog record。
3. Catalog Detail 使用既有 P-WORLD source URL 建立 Machine Guide v2；五台試點機種會再依 server-side registry 讀取ちょんぼりすた公開頁作補充來源。
4. compiler 將 `familyEvidence`、每個按鈕自己的 `controlEvidence` 與 `estimatorEvidence` 分層；Machine Family 不再直接授權 Session 按鈕，只有具名且可追溯的事件／選項才能通過 Control Evidence Gate。
5. Guide 預設顯示「60 秒看懂這台」、三個跨類型重點與繁中分區說明；日文段落和表格集中在預設收合的查證區。
6. 按下「開始玩」後選擇「第一次玩這台／快速開始／完整記錄」；第一次玩會先顯示既有指南產生的重點教學，三種模式都建立相同資料結構的 Session。
7. 快速與第一次玩模式以兩欄顯示最多 4 個優先 operational controls，其餘收進「更多記錄」；完整模式直接顯示全部 operational controls。
8. Session header 可隨時開啟機台指南 drawer 或切換使用模式；有圖文 Guide 時會先依目前狀態顯示相關圖片，並可在 drawer 內原地展開完整圖文，不離開 Session。切換只改變畫面資訊量，不清除既有紀錄。
9. Setting Estimator 只採用有完整設定值、唯一 operational numerator、明確 operational denominator 與 minimum sample 的來源資料；具完整設定 1～6 表格的可觀測小役會建立自己的來源 evidence Counter，合成值、條件式機率與狀態內機率仍不會冒充可記錄分子。每個 metric 保存可追溯 observation contract，無樣本時顯示「尚未開始推測」。
10. 首頁只保留現場玩家入口，不再展示三台舊 Profile；底層 Profile 仍保留供既有 Session 與相容流程使用。
11. Machine Catalog 頁提供「更新機種資料庫」入口：localhost development 可直接使用；Vercel Preview 在 Supabase 與 `CATALOG_ADMIN_TOKEN` 設定完成時，會開啟需管理密碼的私人 P-WORLD Importer。
12. Catalog Detail、完整 Guide 與 Session Guide 均可重新整理單台 P-WORLD 機台指南；Session 內更新只寫入 Guide cache，新記錄項目於下一個 Session 套用。
13. Setting Estimator 在尚未計算時會區分「沒有可安全計算資料」與「正在累積樣本」，逐 metric 顯示實際 G、事件／trial 次數、最低樣本與下一步；不改變既有公式或安全門檻。
14. 私人線上 Importer 仍維持 Fetch → Preview → 人工勾選 → Approve；每批最多 100 筆、依序提交，資料寫入 Supabase，並留下 import job audit。未設定雲端環境時安全回退 repo JSON／本機管理說明。
15. Machine Catalog 改為玩家導向的視覺資料庫：以 Catalog metadata 產生不侵權的識別卡片，支援年份快速篩選、收藏、最近瀏覽／遊玩與本機指南狀態；不下載或轉載來源機台圖片。
16. 新增共用「新手術語」頁，並在完整指南、Session 指南與首頁提供入口；完整指南上方提供快速目錄，日文原始資料仍保留在查證區。
17. 「遊玩記帳」可切換今天、近 7 天與全部紀錄，直接彙整 Session 的實際觀測 G、投入與最終持枚；不要求使用者重複抄寫 Session 結果。
18. 首頁新增「快速中文攻略」入口。全 202 台 Catalog 均可按需將 P-WORLD 官方資料區的流程、CZ、AT／ART、Bonus 與打法圖片配進完整繁中指南；掲示板、留言、廣告、外站圖片與過小／過大圖片不會收錄。
19. Machine Catalog 卡片會依可重現 Control Audit 標示「支援設定參考」或「僅遊玩紀錄」，並可直接篩選目前 102 台支援／100 台不支援機種；Catalog Detail 與完整 Guide 在開始 Session 前仍會顯示對應提示。這只反映既有安全 observation contract，不改變 Estimator 公式或判斷門檻。
20. Machine Catalog 可依「收藏」或「最近」循序更新多台指南；中斷或單台來源失敗時保留已完成進度，可從上次未完成項目繼續。
21. 「旅行離線包」會把選定機台的 Guide JSON、Catalog／Guide 頁面、共用頁面資產與指南圖片保存到目前裝置，供旅途中重新開啟；舊版 Profile 玩家入口已從主要流程移至相容區。

## 資料與限制

- Session 與今日紀錄保存在目前瀏覽器 localStorage；完整 Machine Guide JSON 改存 IndexedDB，並保留 localStorage 安全 fallback。兩者都不是跨裝置雲端同步。
- 收藏、最近瀏覽／遊玩與每台機種的玩家資料庫偏好也只存在目前瀏覽器；清除瀏覽器資料或換裝置不會自動同步。
- 旅行離線包使用目前瀏覽器的 IndexedDB 與 Cache Storage，不是帳號雲端同步；需先在線上完成準備。來源更新失敗時會保留上一份仍有效的 Guide，並列出未能離線保存的素材。
- 多台指南更新採循序請求，不同時大量抓取來源；失敗項目可安全重試，已成功機台不會在同一批續傳時重做。
- Catalog 視覺卡片使用本機 metadata 衍生的色彩與圖示，不使用 P-WORLD 或第三方機台圖片；日後若要加入正式圖片資產，需另行確認來源與授權。
- v1 Guide cache 不會冒充 v2；需從 Catalog Detail 重新取得來源並編譯。
- Session 開始時會保存當下的 capability、狀態與 Machine snapshot；日後指南更新不會靜默改寫既有 Session。
- Control Manifest 統一定義 control type、玩家操作時機、observation、state effect、estimator dependency、來源 evidence、availability 與快速模式優先序；Session 仍保存相容 capability snapshot，舊 Session 不重新編譯。
- `pnpm audit:controls -- --output reports/machine-catalog-control-audit.json` 可依序重跑全 Catalog audit；工具只保存衍生統計與 Catalog traceability，不保存來源 HTML 或圖片，並對短暫來源失敗做有限重試。
- Audit 的每個 estimator metric 會列出 eligibility、numerator key、對應 control、denominator observation、minimum sample、evidence 與 blocker；公開機率表本身不會自動建立 Session numerator。
- 202 台最新重跑中有 **102 台／225 metrics** 可安全參與 Estimator；其餘 100 台維持停用（67 台沒有完整設定 1～6 metric、33 台缺少唯一 canonical numerator）。這是來源與觀測契約的實際邊界，不以猜測補齊。
- 無可靠 operational control 時使用「基本記錄模式」，只保留總 G，不補 generic CZ／AT；使用者可建立 per-machine Counter／Choice 自訂記錄，自訂項目只存 localStorage 且永不參與 Setting Estimator。
- 指南 cache compiler revision 已更新；重新整理指南後只影響下一個新 Session。既有 Session 若偵測到更新，僅顯示提示，不會改寫按鈕或紀錄。
- Session UI 與 Summary 已由 capability snapshot 產生；read-only／unavailable 項目只留在指南參考，不顯示空白或無作用控制項。
- 快速記錄優先順序固定使用 capability 種類與來源 contract 順序：具名 CZ → AT／ART → Bonus → 其他 operational event／choice，不依機台名稱猜測。
- 新建立的 Session snapshot 會保存精簡結構化指南與可追溯 evidence，不複製 P-WORLD 圖片；Session drawer 會從同機台現有 Guide cache 讀取圖文素材，依目前狀態優先顯示相關圖片並可原地展開完整圖文。沒有有效圖文 cache 時安全回退精簡文字；parser、compiler 與內部 section path 不進入玩家主要內容。
- Session 保存所選模式 snapshot，並在每台機器各自記住上次使用模式；這不是永久的新手／老手分類。舊 Session 沒有 mode 時安全回退為快速模式。
- Session 主操作將版面優先留給 G 數與快速記錄；目前狀態以 capability 驅動的一鍵分段按鈕顯示，只提供該 Session 支援的通常／CZ／AT／ART／Bonus 等通用狀態。記錄具名事件時會自動切換，回到通常可直接點一次；具名場景只保留在快速記錄，不會冒充目前狀態。
- P-WORLD `調査中`、未公開、空白或無法確認的值維持缺失，不補猜、不當成 0。
- P-WORLD 仍是 Machine Catalog identity、導入資訊與日後店鋪資料的主要來源；ちょんぼりすた目前只補充五台試點機種的玩法、具名事件與設定表，不會取代 Catalog，也不作全站爬取。
- 多來源採欄位級合併：格式相同的數值會去重並保留來源；不同來源同一設定值衝突時，只停用該 estimator metric，不阻擋其餘指南。補充來源失敗時仍可使用 P-WORLD 指南。
- 指南整理結構化事實、數值、自行撰寫的中文提示、來源 URL 與擷取時間；不保存完整攻略文章、留言、導覽或推薦內容。全 Catalog audit 在 3,140 張候選中保留 3,133 張合規圖片、約 385.3 MiB；每台仍受 18 張、單張 1 MB 的上限約束，7 張失敗／不合格圖片被排除，不補猜。此技術支援不代表已取得轉載授權。
- 圖片在 Vercel 有 `SUPABASE_URL` 與 server-only Supabase secret 時按需寫入 private `machine-guide-assets` bucket，並依 Catalog ID 隔離；瀏覽器只透過同源圖片 route 讀取。每次完整成功重建會寫入 versioned manifest 並只清理同機台的過期圖片；若重建有任何圖片失敗，保留上一版資產且不做破壞性清理。沒有雲端設定時暫時回退來源即時讀取。Guide 本體仍是 browser-local IndexedDB cache，尚未跨裝置同步。
- 目前多來源試點：`スマスロ バイオハザードRE:3`、`スマスロ やじきた道中記参る!`、`Lパチスロ 喰霊‐零‐Re`、`L 東京喰種`、`L ULTRAMAN 最終決戦`。其他 Catalog 機種仍沿用 P-WORLD 單一來源。
- 設定可能性僅供參考，不是準確設定判定或獲利保證。
- Session 前的 Estimator 支援提示只說明「目前是否有安全可用資料」；不表示樣本充足，也不改變 Session 內既有可信度曲線。
- `/machines` 會導向玩家使用的 `/catalog`；舊 Machine Card 只保留直接網址、既有 Session 與歷史資料相容性。
- 既有三台 placeholder Profile 與其中的 **TEST DATA** 只供既有流程／測試使用，不得視為真實機種資料。
- API key 只可放在 server-side `.env.local`，不得提交 Git。
- 繁中摘要可選擇設定 `OPENAI_MACHINE_GUIDE_MODEL`；未設定時沿用辨識模型。沒有 API key、服務失敗或輸出未通過來源驗證時，自動使用規則式繁中指南，不阻擋 P-WORLD Guide。
- Estimator 對相同 numerator／denominator／value mode 的重複 benchmark 只採用一次；若同一觀測被映射到互相衝突的設定理論值，整組停用，不重複加權。Evidence 標籤優先顯示實際具名 Session control。
- 完整 Machine Guide 可將「資料有誤／中文不清楚／內容重複／缺少重要資料」保存為 per-machine browser-local 回報；目前尚未雲端同步。
- Catalog repository 已提供 JSON fallback 與 Supabase REST adapter。Vercel Marketplace 可使用 server-side `SUPABASE_URL` + `SUPABASE_SECRET_KEY`；legacy `SUPABASE_SERVICE_ROLE_KEY` 仍相容。兩種 elevated key 都絕不可使用 `NEXT_PUBLIC_`。
- Supabase 目前保存 Machine Catalog identity records、import job audit，以及按需建立的 private guide image assets；Session、Guide JSON cache、自訂記錄與回報仍是 browser-local，尚無跨裝置同步。
- `pnpm audit:visual-guides -- --pilot catalog --materialize --source-only --output reports/visual-guide-catalog-materialization-audit.json` 可重跑全 Catalog 圖文容量健檢；`--source-only` 保證不寫入 Supabase。報告只保留 Catalog traceability、衍生 controls、圖片數量／bytes 與 warning，不保存來源 HTML 或圖片內容。

完整版本與 QA 狀態請見 `Slot_Companion_Project_Status.md`。
