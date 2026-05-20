export type Collection = 'projects' | 'blog' | 'art' | 'notes' | 'interests';

export type ContentItem = {
	slug: string;
	collection: Collection;
	title: string;
	date: string;
	summary: string;
	tags: string[];
	status?: string;
	accent?: string;
	kind?: string;
	url?: string;
	featured?: boolean;
	body: string;
	html: string;
};

const modules = import.meta.glob('/src/content/**/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

export const collections: Collection[] = ['projects', 'blog', 'art', 'notes', 'interests'];

function parseFrontmatter(source: string) {
	const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(source);

	if (!match) {
		return { meta: {}, body: source };
	}

	const meta: Record<string, string | boolean | string[]> = {};

	for (const line of match[1].split('\n')) {
		const separator = line.indexOf(':');
		if (separator === -1) continue;

		const key = line.slice(0, separator).trim();
		const rawValue = line.slice(separator + 1).trim();

		if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
			meta[key] = rawValue
				.slice(1, -1)
				.split(',')
				.map((item) => item.trim().replace(/^["']|["']$/g, ''))
				.filter(Boolean);
		} else if (rawValue === 'true' || rawValue === 'false') {
			meta[key] = rawValue === 'true';
		} else {
			meta[key] = rawValue.replace(/^["']|["']$/g, '');
		}
	}

	return { meta, body: match[2].trim() };
}

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

function inlineMarkdown(value: string) {
	return escapeHtml(value)
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/`([^`]+)`/g, '<code>$1</code>')
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

export function markdownToHtml(markdown: string) {
	const lines = markdown.split('\n');
	const html: string[] = [];
	let listOpen = false;

	function closeList() {
		if (listOpen) {
			html.push('</ul>');
			listOpen = false;
		}
	}

	for (const line of lines) {
		const trimmed = line.trim();

		if (!trimmed) {
			closeList();
			continue;
		}

		if (trimmed.startsWith('### ')) {
			closeList();
			html.push(`<h3>${inlineMarkdown(trimmed.slice(4))}</h3>`);
		} else if (trimmed.startsWith('## ')) {
			closeList();
			html.push(`<h2>${inlineMarkdown(trimmed.slice(3))}</h2>`);
		} else if (trimmed.startsWith('# ')) {
			closeList();
			html.push(`<h1>${inlineMarkdown(trimmed.slice(2))}</h1>`);
		} else if (trimmed.startsWith('- ')) {
			if (!listOpen) {
				html.push('<ul>');
				listOpen = true;
			}
			html.push(`<li>${inlineMarkdown(trimmed.slice(2))}</li>`);
		} else {
			closeList();
			html.push(`<p>${inlineMarkdown(trimmed)}</p>`);
		}
	}

	closeList();
	return html.join('\n');
}

const parsedContent: ContentItem[] = [];

for (const [path, source] of Object.entries(modules)) {
	const match = /\/src\/content\/([^/]+)\/([^/]+)\.md$/.exec(path);
	if (!match) continue;

	const collection = match[1] as Collection;
	const slug = match[2];
	const { meta, body } = parseFrontmatter(source);

	parsedContent.push({
		slug,
		collection,
		title: String(meta.title ?? slug),
		date: String(meta.date ?? ''),
		summary: String(meta.summary ?? ''),
		tags: Array.isArray(meta.tags) ? meta.tags : [],
		...(meta.status ? { status: String(meta.status) } : {}),
		...(meta.accent ? { accent: String(meta.accent) } : {}),
		...(meta.kind ? { kind: String(meta.kind) } : {}),
		...(meta.url ? { url: String(meta.url) } : {}),
		featured: Boolean(meta.featured),
		body,
		html: markdownToHtml(body)
	});
}

export const content = parsedContent.sort((a, b) => b.date.localeCompare(a.date));

export function getCollection(collection: Collection) {
	return content.filter((item) => item.collection === collection);
}

export function getItem(collection: Collection, slug: string) {
	return content.find((item) => item.collection === collection && item.slug === slug);
}

export function formatDate(value: string) {
	return new Intl.DateTimeFormat('en', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	}).format(new Date(`${value}T00:00:00`));
}
