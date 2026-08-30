# Machine Catalog Representative Source Analysis

Analysis date：2026-08-28  
Scope：v0.2.6.2 Session Capability Contract 受控來源分析  
Network rule：只讀取下表 17 個正式 Catalog canonical P-WORLD detail URL，各一次、依序且有 pacing；10513 只使用最小 **TEST DATA** fixture。沒有 crawler、圖片下載、完整頁面保存或 Catalog 寫入。

## 結果摘要

- 正式 Catalog source success：17 / 17；blocked：0；正式 Catalog unverified：0。
- Fixture-only：10513（1）；不是正式 Catalog runtime 證據。
- Coverage 分級因此更新為 Confirmed 17、Probable 14、Unknown 171。
- 沒有證據支持新增 Session module kind；現有 14 種 contract 足以描述本輪資料依賴。
- 未核准新 archetype。A-type／BT 六例的來源可取得，但目前多數仍落入 `generic`，代表 classifier signature 需要日後以多例共同規則改善，不代表需要建立單機 hardcode。
- Capability mapping 不等於 Adaptive Session UI 已呈現。`read_only`／`unavailable` 項目仍不得宣稱可由手機操作。

## 18 個代表案例

| P-WORLD ID | 機種／來源狀態 | compiler class | 主要 modules 與 control dependency | estimator dependency | generic fallback／候選 | 不確定性 |
|---:|---|---|---|---|---|---|
| 10530 | Lパチスロ 喰霊‐零‐Re／success | `bonus_art`（符合預期） | total、normal、BIG、REG、具名 CZ、具名 ART、終了畫面均 operational | 弱／強チェリー與出玉率無可靠完整 observation contract，不啟用 | 否；無新 module | features／ceiling 缺失 |
| 10473 | L戦国乙女5／success | `cycle_point_at`（符合預期） | total、normal、AT operational；cycle／points／CZ failures read-only；終了畫面無可靠 choices，unavailable | AT 指標可用；其他 numerator 不明者停用 | 否；無新 module | features／CZ／ceiling 缺失 |
| 10513 | **TEST DATA fixture** 喰霊 A-type 範例／非 Catalog runtime | `a_type` | total、normal、BIG、REG；無 CZ／AT／ART | BIG 可由具名 counter + total G；其他依 dependency 判定 | 不計入 coverage | 正式 Catalog record 缺失，禁止宣稱 runtime verified |
| 10508 | ヤバチバ／success | `bonus_loop`（符合預期） | total、normal、BIG operational | 無完整可用設定 metric | 否；無新 module | features／CZ／AT-ART／ceiling／special 缺失 |
| 10485 | L からくりサーカス2／success | `multi_zone_at`（符合預期） | total、normal、4 個具名 CZ、AT、終了 choices operational；dual-games read-only | 多具名 CZ 的 generic CZ metric 不可任選第一項；唯一 dependency 才可用 | 否；無新 module | features／play／bonus／ceiling 缺失 |
| 10424 | スマスロ ミリオンゴッド／success | `set_based_at`（符合預期） | total、normal、AT、終了 choices operational；Set／role streak read-only | generic 初當／狀態 metric 缺唯一 numerator，停用 | 否；無新 module | features／CZ／bonus 缺失 |
| 10009 | ジャグラーガールズSS／success | `generic`（與 Probable A-type 不一致） | total、normal、BIG、REG operational | BIG／REG 可用；合成機率不可借用單一 Bonus numerator | generic；A-type signature 改善候選 | 來源缺明確 A-type signature；不新建 archetype |
| 9998 | ドラゴンハナハナ~閃光~／success | `generic`（與 Probable A-type 不一致） | total、normal、BIG、REG operational | 同上 | generic；A-type signature 改善候選 | 同上 |
| 10164 | A-SLOT+ ディスクアップ ULTRAREMIX／success | `generic`（與 Probable A-type 不一致） | 目前僅 total、normal operational | 無可用 metric | generic；parser／signature 改善候選 | 名稱線索不足以代表正文可觀測 Bonus |
| 10254 | スマスロニューパルサーBT／success | `generic`（與 Probable A-type 不一致） | total、normal、BIG、REG operational | 無完整可用 metric | generic；BT signature 改善候選 | 不新建單機規則 |
| 10318 | マジカルハロウィン ボーナストリガー／success | `generic`（與 Probable A-type 不一致） | total、normal、BIG、REG operational | 無完整可用 metric | generic；BT signature 改善候選 | 不新建單機規則 |
| 10383 | L不二子BT／success | `generic`（與 Probable A-type 不一致） | total、normal、BIG、REG、終了 choices operational | 無完整可用 metric | generic；BT signature 改善候選 | 不新建單機規則 |
| 10207 | L 東京喰種／success | `multi_zone_at` | total、normal、EP Bonus、AT、終了 choices operational；來源未形成可靠具名 CZ control | AT metric dependency 可用；CZ 因 numerator 不可操作停用 | 原 Unknown → Confirmed；無新 module | features 缺失；CZ mapping 待來源規則改善 |
| 10516 | とある魔術の禁書目録2／success | `generic` | total、normal、AT operational；終了畫面無 reliable choices，unavailable | AT 可用；CZ numerator 不可操作而停用 | 原 Unknown → Confirmed；generic | features／play／bonus／ceiling 缺失 |
| 10446 | BIG DREAM THE GOLDEN PUSHER／success | `multi_zone_at` | total、normal、具名 CZ、具名 AT、終了 choices operational | 唯一具名 CZ／AT dependency 可用；其他欄位停用 | 原 Unknown → Confirmed | features／CZ section 缺失 |
| 10368 | 沖ドキ!DUO アンコール／success | `generic` | total、normal、BIG、具名 CZ、AT、終了 choices operational | 無完整可用 metric | 原 Unknown → Confirmed；generic | features／CZ／AT-ART section 缺失；不據此新建 archetype |
| 10471 | 戦国コレクション6／success | `cycle_point_at` | total、normal、具名 CZ、AT、終了 choices operational；cycle／points／CZ failures read-only | AT 可用；其他 numerator 不明者停用 | 原 Unknown → Confirmed | features／play／CZ／bonus／ceiling 缺失 |
| 10531 | ストリートファイター6／success | `set_based_at` | total、normal、AT、終了 choices operational；Set／role streak read-only | Bonus／FB 等缺唯一可操作 numerator，停用 | 原 Unknown → Confirmed | features／play／CZ 缺失 |

## Architecture conclusions

1. `total_games`、`normal_games`、既有固定 AT、可靠具名 event counter 與具 choices 的終了示唆可形成 operational dependency。
2. Set、cycle、points、CZ failure、dual games、role streak 目前只有資料 contract，狀態為 read-only／planned；Adaptive Session UI 尚未實作。
3. ART 若只有 state 而沒有具名 event control，保持 read-only；絕不寫入 AT。
4. `bonus_interval_games`、cycle／point arrivals、CZ trials、AT／ART ends、specific trials 均有 denominator contract，但沒有實際 control／relationship 時不得投入 estimator。
5. 多個具名 CZ／AT 時，generic metric 不可任意綁定第一個 event；複合 Bonus 機率也不可假裝等於 BIG 或 REG。
6. 本輪沒有新增 archetype 或 module。A-type／BT 與部分 generic 的分類改善應待下一次架構討論，不在本版擴張。
