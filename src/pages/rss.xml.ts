import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getSortedPosts, getListedPosts } from '../utils/getPosts';
import { generateExcerpt } from '../utils/generateExcerpt';
import getPostMetadata from '../utils/postMetadata';

export async function GET(context: APIContext) {
  if (!context.site) throw new Error('site is not configured in astro.config.ts');
  
  const posts = await getSortedPosts();
  const publicPosts = getListedPosts(posts);

  return rss({
    title: import.meta.env.SITE_TITLE,
    description: 'こいらっくのwebサイト',
    site: context.site,
    items: publicPosts.map((post) => {
      const description = generateExcerpt(post, 50); // rssは短いexcerpt
      const { title, date, slug, tags } = getPostMetadata(post);
      return {
        title: title,
        pubDate: new Date(date),
        description: description,
        link: `/blog/${slug}/`,
        categories: tags,
      };
    }),
    customData: `<language>ja</language>`,
  });
}