// postMetadata.js
import type { BlogPostWithExcerpt, PostMetadata } from './type';

function getPostMetadata(post: BlogPostWithExcerpt): PostMetadata {
  return {
    title: post.data.title || '無題の投稿',
    date: post.data.date,
    tags: post.data.tags ?? [],
    slug: post.id.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''),
    excerpt: post.excerpt,
  };
}

export default getPostMetadata;