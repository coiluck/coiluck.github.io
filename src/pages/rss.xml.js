import rss from '@astrojs/rss';

export async function GET(context) {
  const postImportResult = import.meta.glob('../content/posts/*.md', { eager: true });
  const posts = Object.values(postImportResult);

  const publishedPosts = posts.filter(post => post.frontmatter.published !== false);
  const sortedPosts = publishedPosts.sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date));

  return rss({
    title: '革命学舎 | blog',
    description: 'こいらっくのwebサイト（coiluck.moe）',
    site: context.site,
    items: await Promise.all(sortedPosts.map(async (post) => {
      let description = '';
      try {
        if (post.frontmatter?.custom_excerpt) {
          description = post.frontmatter.custom_excerpt;
        } else {
          let content = '';
          if (post.rawContent) {
            if (typeof post.rawContent === 'function') {
              content = await post.rawContent();
            } else {
              content = post.rawContent;
            }
          }

          if (content) {
            // Markdown記法やHTMLタグを除去
            const plainText = content
              .replace(/#+\s/g, '')
              .replace(/<br\s*\/?>/gi, ' ')
              .replace(/\r\n|\n|\r/g, ' ')
              .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
              .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
              .replace(/`/g, '')
              .replace(/\*|_/g, '')
              .replace(/\s+/g, ' ')
              .replace(/\{:\s*\.blog-link\s*\}/g, '')
              .replace(/<[^>]+>/g, '')
              .trim();
            
            // 50文字でカット
            description = plainText.slice(0, 50) + (plainText.length > 50 ? '…' : '');

          } else {
            description = '抜粋がありません。';
          }
        }
      } catch (error) {
        console.error(`RSS抜粋処理エラー (${post.frontmatter?.title}):`, error.message);
        description = '抜粋の取得に失敗しました。';
      }

      return {
        title: post.frontmatter.title,
        pubDate: new Date(post.frontmatter.date),
        description: description,
        link: post.url || `/blog/${post.file.split('/').pop().replace('.md', '')}/`,
        customData: `<category>${post.frontmatter.tags?.join(', ') || ''}</category>`,
      };
    })),
    customData: `<language>ja</language>`,
  });
}