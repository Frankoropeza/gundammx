import { defineCollection, z } from 'astro:content';

const kits = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    grade: z.enum(['HG', 'MG', 'RG', 'PG', 'SD']),
    series: z.string(),
    scale: z.string(),
    price: z.number(),
    difficulty: z.number().min(1).max(5),
    description: z.string(),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const noticias = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default('Gundam MX'),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const guias = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    difficulty: z.number().min(1).max(5),
    tools: z.array(z.string()),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { kits, noticias, guias };
