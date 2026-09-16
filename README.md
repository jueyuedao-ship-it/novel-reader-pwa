# 小説リーダー PWA

元の単一HTML版を、GitHub Pages で公開しやすいPWA構成へ分割したものです。

## 構成

```text
novel-reader-pwa/
├─ index.html
├─ styles.css
├─ app.js
├─ pwa.js
├─ manifest.webmanifest
├─ sw.js
├─ .nojekyll
└─ icons/
   ├─ icon-192.png
   └─ icon-512.png
```

## GitHub Pages向け

すべての参照は `./` 基準の相対パスです。そのため、`https://<user>.github.io/<repo>/` のようなプロジェクトサイトでも、リポジトリ名をコードへ埋め込まずに利用できます。

GitHub Pages では HTTPS で配信されるため、Service Worker と PWA インストール要件を満たせます。

## オフライン動作

初回アクセス時にアプリ本体をキャッシュします。以後はネットワークを優先し、通信できない場合にキャッシュへフォールバックします。

## ローカル確認

```powershell
cd novel-reader-pwa
python -m http.server 8000
```

ブラウザで `http://localhost:8000/` を開いて確認できます。

## データ

小説データは元アプリと同じく、画面の「小説取り込み」から JSON ファイルを選択して読み込みます。テーマと文字サイズは `localStorage` に保存されます。
