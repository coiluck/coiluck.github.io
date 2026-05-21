import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getSortedPosts } from '../utils/getPosts.js';
import { generateExcerpt } from '../utils/generateExcerpt.js';
import getPostMetadata from '../utils/postMetadata.js';

export async function GET(context: APIContext) {
  if (!context.site) throw new Error('site is not configured in astro.config.ts');
  
  const posts = await getSortedPosts();

  return rss({
    title: '革命学舎',
    description: 'こいらっくのwebサイト',
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