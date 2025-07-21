# AtCoder Test Editor

## 概要

このプロジェクトは、AtCoderのコンテスト問題を解く際のテストケースを管理するためのWebアプリケーションです。

## 技術スタック

*   **フロントエンド:** React (Create React App), Material-UI
*   **バックエンド:** Node.js, Express
*   **データストレージ:** ローカルファイルシステム

## 機能

*   コンテスト名と問題名を指定して、関連するテストケースの一覧を取得します。
*   テストケースを選択すると、入力と出力の内容が表示され、編集できます。
*   編集内容はファイルに保存されます。
*   新しいテストケースを作成できます。

## ディレクトリ構造

*   `client/`: フロントエンドのReactアプリケーション
*   `server/`: バックエンドのExpressサーバー
*   `start.sh`: 開発サーバーを起動するためのスクリプト

## APIエンドポイント

*   `GET /api/tests?contest=<contest>&problem=<problem>`: 指定されたコンテストと問題のテストケース一覧を取得します。
*   `GET /api/test/:filename(*)`: 指定されたテストケースのファイルの内容を取得します。
*   `POST /api/test/:filename(*)`: 指定されたテストケースのファイルに内容を書き込みます。

## 実行方法

```bash
./start.sh
```

これにより、フロントエンド（`http://localhost:3000`）とバックエンド（`http://localhost:3001`）が起動します。
