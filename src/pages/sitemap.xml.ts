import type { APIContext } from 'astro';
import { getSortedPosts, getListedPosts, POSTS_PER_PAGE } from '../utils/getPosts.js';
import getPostMetadata from '../utils/postMetadata.js';

// 1ページ目は `/blog/`、2ページ目以降は `/blog/2/`
function paginatedPaths(basePath: string, postCount: number): string[] {
  const lastPage = Math.max(1, Math.ceil(postCount / POSTS_PER_PAGE));
  return Array.from(
    { length: lastPage },
    (_, i) => (i === 0 ? basePath : `${basePath}${i + 1}/`)
  );
}

export async function GET(context: APIContext) {
  if (!context.site) throw new Error('site is not configured in astro.config.ts');

  const posts = await getSortedPosts();
  const publicPosts = getListedPosts(posts);

  const tags = [...new Set(publicPosts.flatMap((post) => post.data.tags ?? []))];

  const paths = [
    '/',
    '/about/',
    '/content/',
    ...paginatedPaths('/blog/', publicPosts.length),
    ...tags.flatMap((tag) => {
      const taggedCount = publicPosts.filter((post) => post.data.tags?.includes(tag)).length;
      return paginatedPaths(`/blog/tag/${encodeURIComponent(tag)}/`, taggedCount);
    }),
    ...publicPosts.map((post) => `/blog/${getPostMetadata(post).slug}/`),
  ];

  const urls = paths
    .map((path) => `<url><loc>${new URL(path, context.site).href}</loc></url>`)
    .join('');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    }
  );
}
