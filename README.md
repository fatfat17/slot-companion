# Slot Companion

手機優先的 PWA Web App MVP，用於快速查看 mock Machine Card、記錄角子機 Session、小役與今日實戰。

目前版本：v0.1.4。Session 會保存 tracker baseline，統計分母改用明確的觀測 metric；事件成功率只由逐次 trial outcome 計算。Setting Estimator benchmark 結構仍為空陣列。

## 本機啟動

```bash
pnpm install
pnpm dev
```

瀏覽器開啟 `http://localhost:3000`。

## 資料與限制

- Session 與今日紀錄只存在瀏覽器 localStorage。
- 機種資料均為 placeholder，不含真實機率、天井、Zone、期待值或設定差。
- 拍照辨識與 AI 陪玩均為 mock UI，不會上傳圖片，也未串接任何 API。
