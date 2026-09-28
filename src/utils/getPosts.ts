// getPosts.ts
import { getCollection } from 'astro:content';
import type { BlogPost } from './type';

// 1ページのpost数
export const POSTS_PER_PAGE = 5;

// slug生成用
export async function getSortedPosts(): Promise<BlogPost[]> {
  const posts: BlogPost[] = await getCollection('posts', ({ data }) => {
    return data.status !== 'unpublished';
  });

  return posts.sort((a, b) => {
    const dateA = new Date(a.data.date).getTime();
    const dateB = new Date(b.data.date).getTime();
    return dateB - dateA;
  });
}

// 一覧表示用
export function getListedPosts(posts: BlogPost[]): BlogPost[] {
  return posts.filter((post) => post.data.status === 'public');
}