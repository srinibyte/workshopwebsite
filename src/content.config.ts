import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		tags: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
		coverImage: z.string().optional(),
		coverImageAlt: z.string().optional(),
		authorNote: z.string().optional(),
		notionId: z.string().optional(),
		notionEditedTime: z.string().optional()
	})
});

const notes = defineCollection({
	loader: glob({ base: './src/content/notes', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		date: z.coerce.date(),
		draft: z.boolean().default(false),
		tags: z.array(z.string()).default([]),
		externalUrl: z.url().optional(),
		coverImage: z.string().optional(),
		coverImageAlt: z.string().optional(),
		authorNote: z.string().optional(),
		notionId: z.string().optional(),
		notionEditedTime: z.string().optional(),
		images: z
			.array(
				z.object({
					src: z.string(),
					alt: z.string(),
					caption: z.string().optional()
				})
			)
			.default([])
	})
});

const gallery = defineCollection({
	loader: glob({ base: './src/content/gallery', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		image: z.string(),
		alt: z.string(),
		noteSlug: z.string().optional()
	})
});

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		draft: z.boolean().default(false),
		status: z.enum(['idea', 'active', 'paused', 'shipped']).default('active'),
		tags: z.array(z.string()).default([]),
		externalUrl: z.url().optional(),
		coverImage: z.string().optional(),
		coverImageAlt: z.string().optional(),
		authorNote: z.string().optional(),
		notionId: z.string().optional(),
		notionEditedTime: z.string().optional()
	})
});

const about = defineCollection({
	loader: glob({ base: './src/content/about', pattern: 'about.md' }),
	schema: z.object({
		writeup: z.string()
	})
});

export const collections = { blog, notes, gallery, projects, about };
