# Frontend

本ディレクトリは Next.js (App Router) を利用したフロントエンドです。  
アップロード済みCSVファイルの一覧表示・詳細表示・可視化を行います。

## 必要要件

- Node.js (推奨: v20 以上)
- npm または yarn

## セットアップ

```bash
# 依存パッケージをインストール
npm install
# または
yarn install

# 環境変数ファイルを作成（必要に応じて編集）
cp .env.local.example .env.local
```

## 開発用サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開くと動作確認できます。  
バックエンド API (FastAPI) が必要なため、基本的には Docker Compose 全体を起動することを推奨します。

## ビルド

```bash
npm run build
npm run start
```

## ディレクトリ構成（抜粋）

```
frontend/
  ├─ src/
  │   └─app/            # Next.js App Router ページ群
  │     ├─ api/         # APIルート
  │     └─ components/  # UIコンポーネント
  ├─ tests/             # PlaywrightによるE2Eテスト
  └─ ...
```