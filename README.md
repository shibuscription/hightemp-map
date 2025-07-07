# 🌡️ HighTemp Map

日本の高温・低温ランキングを地図にプロットして表示する静的サイトです。

## 📁 ディレクトリ構成（例）

```
/ (ルート)
├─ public/
│   ├─ amedas.json         # 地点マスタ
│   └─ hightemp-map/
│       └─ data/
│           ├─ high/
│           │   ├─ latest.json
│           │   ├─ yyyyMMdd-HHmm.json
│           ├─ low/
│           │   ├─ latest.json
│           │   ├─ yyyyMMdd-HHmm.json
│           ├─ history-high.json
│           ├─ history-low.json
├─ components/            # React コンポーネント
│   ├─ Header.tsx
│   ├─ HistorySelect.tsx
│   ├─ Map.tsx
│   ├─ TempList.tsx
├─ app/
│   ├─ page.tsx           # メインページ
├─ next.config.js
└─ scrape.py              # スクレイピングスクリプト（Python2 + BeautifulSoup3）
```

## 🔗 データ更新

* Python2 で `scrape.py` を cron 等で 10分ごとに実行
* `/public/hightemp-map/data/` 以下に `latest.json` と履歴JSONを保存
* Nodeサーバー等は無し、静的に `fetch` して地図とリストを描画

## ✅ cron例

```cron
*/10 * * * * /usr/local/bin/python /home/USERNAME/scripts/scrape.py
```

## 📌 Next.js の basePath

このプロジェクトでは `next.config.js` に `basePath` を設定しています。

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/hightemp-map', // ← サブディレクトリ公開用
}

module.exports = nextConfig;
```

### ⚠️ 注意ポイント

* サイトはサブディレクトリ（例: `https://example.com/hightemp-map/`）に公開される前提です。
* `fetch` でJSONを読むときなどは `/hightemp-map/` を含める必要があります。
* `basePath` を変えた場合、パスを忘れずに調整！

## 🗂️ 履歴の仕様

* `history-high.json` と `history-low.json` を生成し、直近10件 + 日付別リストを保持
* `HistorySelect` コンポーネントで `/hightemp-map/data/history-high.json` を直接読みに行く

## 🗒️ その他メモ

* 今後ドメインや公開パスを変える場合は `basePath` を書き換える
* `Map.tsx` は Google Maps API を使用（APIキーなどは別途管理）
* スタイルは TailwindCSS を使用

---

💡 必要があれば好きに追記してください！
