import { defineCollection } from 'astro:content';
import { z } from 'astro/zod'
import { glob } from 'astro/loaders';
import { basename } from 'node:path';

const posts = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/posts",
    generateId: ({ entry }) => basename(entry, '.md'),
  }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    tags: z.array(z.string()).default([]),
    status: z.enum(['public', 'unlisted', 'unpublished']).optional().default('public'),
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

const links = defineCollection({
  loader: glob({
    pattern: "**/*.{yaml,yml}",
    base: "./src/content/links"
  }),
  schema: z.array(z.object({
    name: z.string(),
    link: z.url(),
    banner: z.string().optional(),
  })),
});

export const collections = { posts, creates, links };