import rss from '@astrojs/rss';
import { getSortedPosts } from '../utils/getPosts.js';
import { generateExcerpt } from '../utils/generateExcerpt.js';
import getPostMetadata from '../utils/postMetadata.js';

export async function GET(context) {
  // Content Collectionから取得
  const posts = await getSortedPosts();

  return rss({
    title: '革命学舎',
    description: 'こいらっくのwebサイト（coiluck.moe）',
    site: context.site,
    items: posts.map((post) => {
      const description = generateExcerpt(post, 50); // rssは短いexcerpt
      const { title, date, slug, tags } = getPostMetadata(post);
      return {
        title: title,
        pubDate: new Date(date),
        description: description,
        link: `/blog/${slug}/`,
        customData: `<category>${tags?.join(', ') || ''}</category>`,
      };
    }),
    customData: `<language>ja</language>`,
  });
}