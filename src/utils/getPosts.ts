// getPosts.js
import { getCollection } from 'astro:content';
import { addExcerpts } from './generateExcerpt.js';
import type { BlogPost, BlogPostWithExcerpt } from './type';

export async function getSortedPosts(): Promise<BlogPostWithExcerpt[]> {
  const posts: BlogPost[] = await getCollection('posts', ({ data }) => {
    return data.published !== false;
  });

  // excerptを生成
  const postsWithExcerpt: BlogPostWithExcerpt[] = addExcerpts(posts);

  // 新しい順にソートして返す
  return postsWithExcerpt.sort((a, b) => {
    const dateA = new Date(a.data.date).getTime();
    const dateB = new Date(b.data.date).getTime();
    return dateB - dateA;
  });
}