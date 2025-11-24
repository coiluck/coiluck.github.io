// getPosts.js
import { getCollection } from 'astro:content';
import { addExcerpts } from './generateExcerpt.js';

export async function getSortedPosts() {
  const posts = await getCollection('posts', ({ data }) => {
    if (data.published === false) {
      return false;
    }
    return true;
  });

  // excerptを生成
  const postsWithExcerpt = addExcerpts(posts);

  // 新しい順にソートして返す
  return postsWithExcerpt.sort((a, b) => {
    const dateA = new Date(a.data.date).getTime();
    const dateB = new Date(b.data.date).getTime();
    return dateB - dateA;
  });
}