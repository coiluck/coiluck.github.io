---
title: "Aboutページに音楽情報を載せる"
tags:
  - tech
  - blog
date: "2026-05-25"
custom_excerpt: "普段の音楽再生履歴をCloudflare Workers経由でD1に保存し、AboutページにTop TracksとRecent Tracksを表示できるようにした。 "
---
<!-- headings -->

### まえがき
Spotifyを使っているだろうか。
Spotifyだと最近のstatsなどをWebページに埋め込むことが出来る。公式のAPIもサードパーティー製のAPIも充実している。学生は月額580円でPremiumが使用出来る点も嬉しいだろう。

私は使っていない。……使っていない。

そのため、個人サイトにSpotifyのリンクを埋め込んでいるやつらを羨ましく思っていた。

さて、私が普段何で音楽をきいているかと言うと~~改造パッチを当てた~~YouTubeかAndroid用のMP3プレヤーだった。前者にメインのGoogleアカウントで入るのは怖いし、後者にそんな機能はついていない。

しかし先日、後者の役割を代替できる音楽プレーヤーを作成した。

今回はこれを使って[Aboutページ](/about)のMusicの項目で過去30日間の再生回数の多い順と、聞いた時間が新しい順にそれぞれ表示できるようにする。

### 全体の図
Mermaidを入れていないツケがここで回ってくるとは……。仕方がないので人間の温かみがある図を描いてみる。

```typescript
// 再生時
　　　　HTTPリクエスト　　DBアクセス
Player App -> Cloudflare Workers -> Cloudflare D1

// サイトアクセス時
Cloudflare Workers ⇔ Your Browser
         ↓　↑　SQLから集計　
Cloudflare D1              
```

### 再生プレーヤー
まず、再生履歴を送信する必要がある。今回は[自作の音楽再生アプリ](https://github.com/coiluck/kokone-music-for-mobile/releases/)にCloudflare D1かFirebaseに履歴を送信する機能を追加した。

曲の再生時に、設定に従ってFirebaseかCloudflare Workers経由でD1へ保存するだけだ。送る内容は曲のタイトル、アーティスト名、送信時間の3つで十分だろう。

### Cloudflare D1
保存先としてFirebaseを使うことも出来るが、今回はCloudflare Workers + D1構成を採用した。理由は

1. Workers側でAPI Tokenを検証することで権限の制御ができる
2. WorkersにHTTPリクエストを受け取った時の処理を自分で書ける

あたり。特に 2はありがたい。今回はYouTubeのリンクと共に表示したいのだが、サイトアクセス時に毎回YouTube検索を実行するのは大変だ。YouTubeのAPIでは1日10,000ユニットの制限があり、検索は1回100ユニット消費するため実質100回が上限になる。そのため、履歴送信時に検索を実行して、曲ごとにYouTube IDを保存しておくほうが賢明だ。同じ曲に対して検索APIをたたかずに済むのだから。

また、ユーザーのIP（正しくはCF-Connecting-IP）ごとにレートリミットをかけることも可能だ。Aboutページ からのリクエストは1分間に40回の制限を設定している。どうせ500万回 / a dayのクエリなんて使い切らないからAboutページでDevToolsを開きながらF5を連打するといい。結構早く制限が来るはずだ。

2026/05/26追記: キャッシュを有効化したため、完全無欠になった

### Astro内
`DOMContentLoaded` 時にCloudflare Workersにリクエストを送る。Top tracksとRecent tracksは別々に受け取り、それぞれDOMに追加する。……正直ここは書くことないな。