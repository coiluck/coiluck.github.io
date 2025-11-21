import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/posts"
  }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    tags: z.array(z.string()).optional(),
    published: z.boolean().optional().default(true),
    custom_excerpt: z.string().optional(),
  }),
});

const creates = defineCollection({
  loader: glob({
    pattern: "**/*.{yaml,yml}",
    base: "./src/content/creates"
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    published_date: z.date(),
    updated_date: z.date().optional(),
    tags: z.array(z.string()).default([]),
    url: z.string(),
  }),
});

export const collections = { posts, creates };