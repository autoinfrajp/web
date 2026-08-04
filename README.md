# web

## LiveAligned legal pages

LiveAlignedの法務・サポートページは、各公開ディレクトリの`index.md`を原稿として管理し、静的な
`index.html`を生成して配信します。Jekyllは使用しません。

```sh
deno run --allow-read --allow-write tools/render_legal_pages.ts
```

`status: draft`の文書は生成HTMLが`noindex,nofollow`になります。内容を法務・運用確認し、公開可能に
なった文書だけ`status: published`へ変更して再生成してください。版固定URLの公開済み文書は上書きせず、
改定時は新しい版のディレクトリを追加します。

プライバシーポリシー、利用規約、コミュニティガイドラインは、版固定ページに加えて親URLの
`index.html`も生成します。親URLは常に現在の版への入口とし、改定時にリンク先だけを更新します。
