# Backend

本ディレクトリは FastAPI を利用したバックエンドです。  
CSVファイルのアップロード・保存・集計 API を提供します。

## 必要要件

- Python 3.11+
- pip または poetry
- PostgreSQL (開発時は Docker Compose を推奨)

## セットアップ

```bash
# 仮想環境を作成し依存関係をインストールします
python -m venv venv
source venv/bin/activate   # Windows は venv\Scripts\activate
pip install -r requirements.txt

# 環境変数を設定
# Docker Composeを利用する際は.envにより設定
export DATABASE_URL=sqlite:///./test.db
```

## 開発サーバーの起動

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API ドキュメントは http://localhost:8000/docs にアクセスしてください。

## ディレクトリ構成（抜粋）

```
backend/
  ├─ app/
  │   ├─ main.py              # FastAPI エントリーポイント
  │   ├─ api/                 # 各APIルートの定義
  │   ├─ models.py            # DB モデル
  │   ├─ database.py          # DB接続の定義
  │   └─ storage_services.py  # ストレージクラス
  ├─ tests/               # pytestによるテスト
  └─ requirements.txt
```

## データベース

Docker Compose で`db`サービスを起動するのが推奨です。  
上記ではPostgreSQLを利用していますが、開発環境などSQLiteを用いることも可能です。