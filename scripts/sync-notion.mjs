import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const contentRoot = join(root, 'src', 'content');
const uploadRoot = join(root, 'public', 'uploads', 'notion');
const notionToken = process.env.NOTION_TOKEN;
const notionVersion = process.env.NOTION_VERSION || '2022-06-28';

const sources = [
	{
		collection: 'blog',
		databaseId: process.env.NOTION_BLOG_DATABASE_ID,
		folder: join(contentRoot, 'blog'),
		kind: 'blog'
	},
	{
		collection: 'projects',
		databaseId: process.env.NOTION_PROJECTS_DATABASE_ID,
		folder: join(contentRoot, 'projects'),
		kind: 'projects'
	},
	{
		collection: 'notes',
		databaseId: process.env.NOTION_NOTES_DATABASE_ID,
		folder: join(contentRoot, 'notes'),
		kind: 'notes'
	}
];

if (!notionToken) {
	throw new Error('NOTION_TOKEN is required.');
}

for (const source of sources) {
	if (!source.databaseId) {
		throw new Error(`Missing database ID for ${source.collection}. Set NOTION_${source.collection.toUpperCase()}_DATABASE_ID.`);
	}
}

const notionRequest = async (path, options = {}) => {
	const response = await fetch(`https://api.notion.com/v1${path}`, {
		...options,
		headers: {
			Authorization: `Bearer ${notionToken}`,
			'Notion-Version': notionVersion,
			'Content-Type': 'application/json',
			...(options.headers || {})
		}
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(`Notion request failed (${response.status}): ${body}`);
	}

	return response.json();
};

const slugify = (value) =>
	value
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-zA-Z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.toLowerCase();

const yamlQuote = (value) => `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, ' ')}"`;

const textValue = (richText = []) =>
	richText
		.map((part) => {
			const text = part.plain_text || '';
			const href = part.href || part.text?.link?.url;
			const annotations = part.annotations || {};
			let output = text;

			if (annotations.code) output = `\`${output}\``;
			if (annotations.bold) output = `**${output}**`;
			if (annotations.italic) output = `*${output}*`;
			if (annotations.strikethrough) output = `~~${output}~~`;
			if (annotations.underline) output = `<u>${output}</u>`;
			if (href) output = `[${output}](${href})`;

			return output;
		})
		.join('');

const getProperty = (properties, names) => {
	for (const name of names) {
		if (properties[name]) return properties[name];
	}

	return null;
};

const getTitle = (page) => {
	const titleProperty = Object.values(page.properties).find((property) => property.type === 'title');
	return textValue(titleProperty?.title || []) || 'Untitled';
};

const getSlug = (page, fallbackTitle) => {
	const prop = getProperty(page.properties, ['Slug', 'slug']);
	const explicit = prop?.rich_text?.length ? textValue(prop.rich_text) : '';
	return slugify(explicit || fallbackTitle);
};

const getDate = (page) => {
	const prop = getProperty(page.properties, ['Date', 'Publish Date', 'date']);
	return prop?.date?.start || page.created_time.slice(0, 10);
};

const getCheckbox = (page, names) => {
	const prop = getProperty(page.properties, names);
	return Boolean(prop?.checkbox);
};

const getText = (page, names) => {
	const prop = getProperty(page.properties, names);
	return textValue(prop?.rich_text || []);
};

const getTags = (page) => {
	const prop = getProperty(page.properties, ['Tags', 'tags']);
	return (prop?.multi_select || []).map((item) => item.name).filter(Boolean);
};

const getStatus = (page) => {
	const prop = getProperty(page.properties, ['Status', 'status']);
	return prop?.select?.name || 'active';
};

const getUrl = (page) => {
	const prop = getProperty(page.properties, ['External URL', 'External Url', 'externalUrl']);
	return prop?.url || '';
};

const getFileUrl = (file) => {
	if (!file) return '';
	if (file.type === 'external') return file.external?.url || '';
	return file.file?.url || '';
};

const downloadAsset = async (url, prefix, fallbackExt = '.jpg') => {
	if (!url) return '';

	await mkdir(uploadRoot, { recursive: true });
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to download asset: ${url}`);
	}

	const contentType = response.headers.get('content-type') || '';
	const typeExt =
		contentType.includes('png') ? '.png' :
		contentType.includes('webp') ? '.webp' :
		contentType.includes('gif') ? '.gif' :
		contentType.includes('svg') ? '.svg' :
		contentType.includes('jpeg') || contentType.includes('jpg') ? '.jpg' :
		fallbackExt;
	const urlExt = extname(new URL(url).pathname);
	const ext = urlExt && urlExt.length <= 5 ? urlExt : typeExt;
	const filename = `${prefix}${ext}`;
	const localPath = join(uploadRoot, filename);
	const buffer = Buffer.from(await response.arrayBuffer());
	await writeFile(localPath, buffer);
	return `/uploads/notion/${filename}`;
};

const renderRichText = (richText = []) => textValue(richText).trim();

const renderBlock = async (block, context, depth = 0) => {
	const indent = '  '.repeat(depth);
	const richText = block[block.type]?.rich_text || [];
	const text = renderRichText(richText);
	const children = block.has_children ? await loadChildren(block.id, context, depth + 1) : '';

	switch (block.type) {
		case 'paragraph':
			return [text, children].filter(Boolean).join('\n\n');
		case 'heading_1':
			return `# ${text}${children ? `\n\n${children}` : ''}`;
		case 'heading_2':
			return `## ${text}${children ? `\n\n${children}` : ''}`;
		case 'heading_3':
			return `### ${text}${children ? `\n\n${children}` : ''}`;
		case 'bulleted_list_item':
			return `${indent}- ${text}${children ? `\n${children}` : ''}`;
		case 'numbered_list_item':
			return `${indent}1. ${text}${children ? `\n${children}` : ''}`;
		case 'quote':
			return `> ${text}${children ? `\n${children}` : ''}`;
		case 'to_do':
			return `${indent}- [${block.to_do.checked ? 'x' : ' '}] ${text}${children ? `\n${children}` : ''}`;
		case 'code': {
			const language = block.code.language || '';
			return `\`\`\`${language}\n${block.code.rich_text?.map((part) => part.plain_text || '').join('') || ''}\n\`\`\`${children ? `\n\n${children}` : ''}`;
		}
		case 'divider':
			return `---${children ? `\n\n${children}` : ''}`;
		case 'callout': {
			const emoji = block.callout.icon?.emoji || 'Note';
			return `> ${emoji} ${text}${children ? `\n${children}` : ''}`;
		}
		case 'image': {
			const caption = renderRichText(block.image.caption || []);
			const alt = caption || block.image.alt || 'Image';
			const imageUrl = block.image.type === 'external' ? block.image.external.url : block.image.file.url;
			const downloaded = await downloadAsset(
				imageUrl,
				`${context.slug}-${block.id}`,
				extname(new URL(imageUrl).pathname) || '.jpg'
			);
			if (context.collection === 'notes') {
				context.images.push({ src: downloaded, alt, caption: caption || undefined });
			}
			return `![${alt}](${downloaded})${children ? `\n\n${children}` : ''}`;
		}
		case 'bookmark':
		case 'embed':
		case 'link_preview':
			return block[block.type]?.url ? `[${block[block.type].url}](${block[block.type].url})` : '';
		default:
			return text ? `${text}${children ? `\n\n${children}` : ''}` : children;
	}
};

const loadChildren = async (blockId, context, depth = 0) => {
	let cursor = null;
	const rendered = [];

	do {
		const params = new URLSearchParams({ page_size: '100' });
		if (cursor) params.set('start_cursor', cursor);
		const data = await notionRequest(`/blocks/${blockId}/children?${params.toString()}`);
		for (const block of data.results) {
			const value = await renderBlock(block, context, depth);
			if (value) rendered.push(value);
		}
		cursor = data.has_more ? data.next_cursor : null;
	} while (cursor);

	return rendered.filter(Boolean).join('\n\n');
};

const fetchDatabasePages = async (databaseId) => {
	let cursor = null;
	const pages = [];

	do {
		const payload = {
			page_size: 100,
			sorts: [{ property: 'Date', direction: 'descending' }]
		};
		if (cursor) payload.start_cursor = cursor;
		const data = await notionRequest(`/databases/${databaseId}/query`, {
			method: 'POST',
			body: JSON.stringify(payload)
		});
		pages.push(...data.results);
		cursor = data.has_more ? data.next_cursor : null;
	} while (cursor);

	return pages;
};

const buildFrontmatter = (fields) => {
	const lines = ['---'];
	for (const [key, value] of Object.entries(fields)) {
		if (value === undefined || value === null || value === '') continue;
		if (Array.isArray(value)) {
			if (value.length === 0) continue;
			lines.push(`${key}:`);
			for (const item of value) {
				if (typeof item === 'string') {
					lines.push(`  - ${yamlQuote(item)}`);
				} else if (item && typeof item === 'object') {
					lines.push('  -');
					for (const [nestedKey, nestedValue] of Object.entries(item)) {
						if (nestedValue === undefined || nestedValue === null || nestedValue === '') continue;
						lines.push(`    ${nestedKey}: ${typeof nestedValue === 'string' ? yamlQuote(nestedValue) : nestedValue}`);
					}
				}
			}
			continue;
		}

		if (typeof value === 'boolean' || typeof value === 'number') {
			lines.push(`${key}: ${value}`);
			continue;
		}

		lines.push(`${key}: ${yamlQuote(value)}`);
	}
	lines.push('---');
	return lines.join('\n');
};

const writeCollection = async (source) => {
	await mkdir(source.folder, { recursive: true });
	const pages = await fetchDatabasePages(source.databaseId);
	const keptFiles = new Set();

	for (const page of pages) {
		const title = getTitle(page);
		const slug = getSlug(page, title);
		const date = getDate(page);
		const draft = getCheckbox(page, ['Draft', 'draft']);
		const tags = getTags(page);
		const coverFile = getProperty(page.properties, ['Cover Image', 'coverImage'])?.files?.[0];
		const coverImage = coverFile ? await downloadAsset(getFileUrl(coverFile), `${source.collection}-${slug}-cover`) : '';
		const coverImageAlt =
			getText(page, ['Cover Image Alt', 'coverImageAlt']) ||
			coverFile?.name ||
			title;
		const authorNote = getText(page, ['Author Note', 'authorNote']);
		const context = { collection: source.collection, slug, images: [] };
		const body = await loadChildren(page.id, context);

		const frontmatter = {
			title,
			date,
			draft,
			tags,
			coverImage,
			coverImageAlt,
			authorNote
		};

		if (source.kind === 'blog') {
			const description = getText(page, ['Subtitle / Dek', 'Description', 'description']) || title;
			frontmatter.description = description;
		}

		if (source.kind === 'projects') {
			frontmatter.description = getText(page, ['Description', 'description']) || title;
			frontmatter.status = getStatus(page);
			const externalUrl = getUrl(page);
			if (externalUrl) frontmatter.externalUrl = externalUrl;
		}

		if (source.kind === 'notes') {
			frontmatter.summary = getText(page, ['Summary', 'summary']) || title;
			const externalUrl = getUrl(page);
			if (externalUrl) frontmatter.externalUrl = externalUrl;
			if (context.images.length) frontmatter.images = context.images;
		}

		const filePath = join(source.folder, `${slug}.md`);
		const content = `${buildFrontmatter(frontmatter)}\n\n${body.trim()}\n`;
		await writeFile(filePath, content);
		keptFiles.add(filePath);
	}

	const existing = await (async () => {
		try {
			const files = await readdir(source.folder);
			return files.filter((file) => file.endsWith('.md')).map((file) => join(source.folder, file));
		} catch {
			return [];
		}
	})();

	for (const file of existing) {
		if (!keptFiles.has(file)) {
			await rm(file, { force: true });
		}
	}

	console.log(`[notion] synced ${source.collection}: ${pages.length} entries`);
};

for (const source of sources) {
	await writeCollection(source);
}

console.log('[notion] sync complete');
