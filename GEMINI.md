# AtCoder Test Editor

## 概要

このプロジェクトは、AtCoderのコンテスト問題を解く際のテストケースを管理するためのWebアプリケーションです。

## 技術スタック

*   **フロントエンド:** React (Create React App), Material-UI, react-transition-group
*   **バックエンド:** Node.js, Express
*   **データストレージ:** ローカルファイルシステム

## 機能

*   コンテスト名と問題名を指定して、関連するテストケースの一覧を**すべて一度に表示**します。
*   テストケースの入力・出力の内容を直接編集できます。
*   **5秒ごとに自動保存**されます（変更があった場合のみ）。
*   `Ctrl+S` / `Cmd+S` で、変更されたすべてのサンプルを保存します。
*   入力・出力の末尾に改行がない場合、自動的に追加されます。
*   新しいテストケースを作成できます。**既存のサンプル名と重複する場合は警告が表示されます。**
*   **サンプル名の変更**ができます。
*   **サンプルの削除**ができます。
*   **サンプルの複製**ができます。
*   サンプルの追加・複製・削除時にスムーズなアニメーションが表示されます。

## ディレクトリ構造

*   `client/`: フロントエンドのReactアプリケーション
*   `server/`: バックエンドのExpressサーバー
*   `start.sh`: 開発サーバーを起動するためのスクリプト

## APIエンドポイント

*   `GET /api/tests?contest=<contest>&problem=<problem>`: 指定されたコンテストと問題のテストケース一覧を取得します。
*   `GET /api/test/:filename(*)`: 指定されたテストケースのファイルの内容を取得します。
*   `POST /api/test/:filename(*)`: 指定されたテストケースのファイルに内容を書き込みます。
*   `POST /api/rename`: サンプル名を変更します。リクエストボディ: `{ contest, problem, oldName, newName }`
*   `DELETE /api/sample?contest=<contest>&problem=<problem>&name=<name>`: 指定されたサンプルを削除します。
*   `POST /api/duplicate`: 指定されたサンプルを複製します。リクエストボディ: `{ contest, problem, originalName, newName? }`

## 実行方法

```bash
./start.sh
```

これにより、フロントエンド（`http://localhost:3000`）とバックエンド（`http://localhost:3001`）が起動します。