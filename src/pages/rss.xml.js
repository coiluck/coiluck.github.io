import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { generateExcerpt } from '../utils/generateExcerpt.js';

export async function GET(context) {
  // Content Collectionから取得
  const posts = await getCollection('posts', ({ data }) => {
    return data.published !== false;
  });

  // 日付でソート
  const sortedPosts = posts.sort((a, b) => {
    const dateA = new Date(a.data.date).getTime();
    const dateB = new Date(b.data.date).getTime();
    return dateB - dateA;
  });

  return rss({
    title: '革命学舎',
    description: 'こいらっくのwebサイト（coiluck.moe）',
    site: context.site,
    items: sortedPosts.map((post) => {
      const description = generateExcerpt(post, 50);
      const slug = post.id.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');

      return {
        title: post.data.title,
        pubDate: new Date(post.data.date),
        description: description,
        link: `/blog/${slug}/`,
        customData: `<category>${post.data.tags?.join(', ') || ''}</category>`,
      };
    }),
    customData: `<language>ja</language>`,
  });
}