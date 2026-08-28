# Slot Companion

手機優先的 Pachislot PWA 遊玩助手：拍照辨識陌生機台、查看繁體中文公開資料指南、建立本機 Session，並以實際紀錄做設定可能性的參考推測。

目前開發版本：**v0.2.6.2 – Session Capability Contract**（`dev`，等待人工驗收）。

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
5. 指南保存在目前瀏覽器 localStorage，並可立即建立 Session。
6. Setting Estimator 只採用有完整設定值、明確分母且 Session 可觀測的來源資料；無樣本時顯示「尚未開始推測」。

## 資料與限制

- Session、今日紀錄與 Machine Guide 只存在目前瀏覽器 localStorage，不是雲端同步。
- v1 Guide cache 不會冒充 v2；需從 Catalog Detail 重新取得來源並編譯。
- Session 開始時會保存當下的 capability、狀態與 Machine snapshot；日後指南更新不會靜默改寫既有 Session。
- Capability contract 只代表資料依賴已定義；Set、週期、點數、CZ 失敗、雙 G 等 Adaptive Session UI 尚未完成的項目仍明確標為 read-only／unavailable。
- P-WORLD `調査中`、未公開、空白或無法確認的值維持缺失，不補猜、不當成 0。
- 指南整理結構化事實、數值、自行撰寫的中文提示、來源 URL 與擷取時間；不保存完整攻略文章或來源圖片。
- 設定可能性僅供參考，不是準確設定判定或獲利保證。
- 既有三台 placeholder Profile 與其中的 **TEST DATA** 只供既有流程／測試使用，不得視為真實機種資料。
- API key 只可放在 server-side `.env.local`，不得提交 Git。

完整版本與 QA 狀態請見 `Slot_Companion_Project_Status.md`。
