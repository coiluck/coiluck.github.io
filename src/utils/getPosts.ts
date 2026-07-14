// getPosts.js
import { getCollection } from 'astro:content';
import { addExcerpts } from './generateExcerpt.js';
import type { BlogPost, BlogPostWithExcerpt } from './type';

// 1ページのpost数
export const POSTS_PER_PAGE = 5;

// slug生成用
export async function getSortedPosts(): Promise<BlogPostWithExcerpt[]> {
  const posts: BlogPost[] = await getCollection('posts', ({ data }) => {
    return data.status !== 'unpublished';
  });

  const postsWithExcerpt: BlogPostWithExcerpt[] = addExcerpts(posts);

  return postsWithExcerpt.sort((a, b) => {
    const dateA = new Date(a.data.date).getTime();
    const dateB = new Date(b.data.date).getTime();
    return dateB - dateA;
  });
}

// 一覧表示用
export function getListedPosts(posts: BlogPostWithExcerpt[]): BlogPostWithExcerpt[] {
  return posts.filter((post) => post.data.status === 'public');
}