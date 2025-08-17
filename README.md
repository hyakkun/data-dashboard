# Log Analysis Dashboard

[![Backend Tests](https://github.com/hyakkun/data-dashboard/actions/workflows/backend-tests.yml/badge.svg)](https://github.com/hyakkun/data-dashboard/actions/workflows/backend-tests.yml)
[![End 2 End Tests with Playwright](https://github.com/hyakkun/data-dashboard/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/hyakkun/data-dashboard/actions/workflows/e2e-tests.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](/LICENSE)

ログファイルをアップロードし、カテゴリ別の件数推移をグラフで可視化するシステムです。
フロントエンド（Next.js）、バックエンド（FastAPI）、データベース（PostgreSQL）を Docker Compose で構成しています。

## 機能

* CSVログファイルのアップロード、ダウンロード
  * 対応スキーマについては添付の[sample_network_logs.csv](/sample_network_logs.csv)を参照
* DB への保存
* 集計（カテゴリ別・時間粒度指定）
* 折れ線グラフによる可視化（Recharts）

## 技術スタック

* Frontend: [Next.js](https://nextjs.org/) + [TailwindCSS](https://tailwindcss.com/) + [Recharts](https://recharts.org/)
* Backend: [FastAPI](https://fastapi.tiangolo.com/)
* Database: [PostgreSQL](https://www.postgresql.org/)
* Infrastructure: [Docker Compose](https://docs.docker.com/compose/)

## セットアップ

```bash
git clone https://github.com/hyakkun/data-dashboard.git
cd data-dashboard

cp .env.example .env
# 必要に応じて環境変数を編集

docker compose up -d --build
```

アクセス： http://localhost:3000