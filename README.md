# Slot Companion

手機優先的 Pachislot PWA 遊玩助手：拍照辨識陌生機台、查看繁體中文公開資料指南、建立本機 Session，並以實際紀錄做設定可能性的參考推測。

目前開發版本：**v0.2.7.0 – Session Quick Guide & Compact Controls**（`dev`，等待手機人工驗收）。

## 本機啟動

```bash
pnpm install
pnpm dev
```

開啟 `http://localhost:3000`。正式檢查可執行 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`。

## 目前流程

1. 拍照／選擇圖片並在瀏覽器端壓縮。
2. AI 辨識後由使用者確認 Machine Catalog record。
3. Catalog Detail 使用既有 P-WORLD source URL 建立 Machine Guide v2。
4. compiler 依機型與實際公開資料選擇 Session 模組，並建立可驗證的 control／observation／denominator capability contract。
5. 指南保存在目前瀏覽器 localStorage，並可立即建立 Session；Session 以兩欄快速記錄顯示最多 4 個優先 operational controls，其餘收進「更多記錄」。
6. Session header 可隨時開啟機台指南 drawer，依目前狀態查看既有結構化玩法、事件、操作提示與來源，關閉後留在原 Session。
7. Setting Estimator 只採用有完整設定值、明確分母且 Session 可觀測的來源資料；無樣本時顯示「尚未開始推測」。

## 資料與限制

- Session、今日紀錄與 Machine Guide 只存在目前瀏覽器 localStorage，不是雲端同步。
- v1 Guide cache 不會冒充 v2；需從 Catalog Detail 重新取得來源並編譯。
- Session 開始時會保存當下的 capability、狀態與 Machine snapshot；日後指南更新不會靜默改寫既有 Session。
- Session UI 與 Summary 已由 capability snapshot 產生；read-only／unavailable 項目只留在指南參考，不顯示空白或無作用控制項。
- 快速記錄優先順序固定使用 capability 種類與來源 contract 順序：具名 CZ → AT／ART → Bonus → 其他 operational event／choice，不依機台名稱猜測。
- 新建立的 Session snapshot 會保存精簡結構化指南，不包含 P-WORLD 圖片；舊 Session 沒有此 snapshot 時安全顯示「尚無資料」。
- 本版仍是單一操作模式；完整新手／老手模式尚未開始。
- P-WORLD `調査中`、未公開、空白或無法確認的值維持缺失，不補猜、不當成 0。
- 指南整理結構化事實、數值、自行撰寫的中文提示、來源 URL 與擷取時間；不保存完整攻略文章或來源圖片。
- 設定可能性僅供參考，不是準確設定判定或獲利保證。
- 既有三台 placeholder Profile 與其中的 **TEST DATA** 只供既有流程／測試使用，不得視為真實機種資料。
- API key 只可放在 server-side `.env.local`，不得提交 Git。

完整版本與 QA 狀態請見 `Slot_Companion_Project_Status.md`。
