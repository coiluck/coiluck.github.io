// types.ts
import type { CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'posts'>;

export type BlogPostWithExcerpt = BlogPost & {
  excerpt: string;
};

// 表示用
export interface PostMetadata {
  title: string;
  date: string;
  tags: string[];
  slug: string;
  excerpt: string;
}