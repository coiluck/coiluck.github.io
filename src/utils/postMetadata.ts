// postMetadata.ts
import type { BlogPost, PostMetadata } from './type';

function getPostMetadata(post: BlogPost): PostMetadata {
  return {
    title: post.data.title || '無題の投稿',
    date: post.data.date,
    tags: post.data.tags,
    slug: post.id,
  };
}

export default getPostMetadata;