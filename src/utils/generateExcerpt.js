// generateExcerpt.js
export function generateExcerpt(entry, cut_length = 150) {
  // custom_excerptが設定されている場合はそれを優先
  if (entry.data.custom_excerpt) {
    return entry.data.custom_excerpt;
  }

  const content = entry.body || '';
  if (!content) return '';

  const moreTag = '<!--more-->';
  const moreIndex = content.indexOf(moreTag);
  
  // <!--more-->がある場合はそこまで、ない場合は全文を対象
  const textToProcess = moreIndex !== -1 
    ? content.substring(0, moreIndex) 
    : content;

  // マークダウン記法を除去してプレーンテキスト化
  const plainText = textToProcess
    .replace(/#{2,}[\s\S]*?\{\:\s*\.toc-heading\}/g, '') // 目次用
    .replace(/#+\s/g, '')                           // 見出し
    .replace(/<rt>.*?<\/rt>/gi, '')                 // ルビタグ
    .replace(/<br\s*\/?>/gi, ' ')                   // 改行タグ
    .replace(/\r\n|\n|\r/g, ' ')                    // 改行
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')       // リンク
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')        // 画像
    .replace(/`/g, '')                              // コード
    .replace(/\*|_/g, '')                           // 強調
    .replace(/\s+/g, ' ')                           // 連続空白
    .replace(/\{:\s*\.blog-link\s*\}/g, '')         // カスタムクラス
    .replace(/<[^>]+>/g, '')                        // HTMLタグ
    .replace(/\[\^\d+\]/g, '')                      // footnote用ラベル
    .trim();

  // <!--more-->がある場合はそこまでの全文、ない場合は指定文字数で切る
  if (moreIndex !== -1) {
    return plainText;
  }
  
  return plainText.length > cut_length 
    ? plainText.substring(0, cut_length) + '...'
    : plainText;
}

// 複数の投稿にexcerptを追加
export function addExcerpts(posts) {
  return posts.map(post => ({
    ...post,
    excerpt: generateExcerpt(post)
  }));
}