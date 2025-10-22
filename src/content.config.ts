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

export const collections = { posts };