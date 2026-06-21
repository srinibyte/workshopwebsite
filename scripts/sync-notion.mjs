import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const contentRoot = join(root, 'src', 'content');
const uploadRoot = join(root, 'public', 'uploads', 'notion');
const envPath = join(root, '.env');
const loadLocalEnv = async () => {
	try {
		const env = await readFile(envPath, 'utf8');
		for (const line of env.split(/\r?\n/)) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;
			const separatorIndex = trimmed.indexOf('=');
			if (separatorIndex === -1) continue;
			const key = trimmed.slice(0, separatorIndex).trim();
			const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
			if (key && process.env[key] === undefined) process.env[key] = value;
		}
	} catch {
		// .env is optional; Netlify/GitHub should provide real secrets via environment variables.
	}
};

await loadLocalEnv();

const notionToken = process.env.NOTION_TOKEN;
const notionVersion = process.env.NOTION_VERSION || '2022-06-28';
const prune = process.argv.includes('--prune');
const optional = process.argv.includes('--optional');

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

if (!notionToken && optional) {
	console.log('[notion] NOTION_TOKEN not set; skipping optional Notion sync');
	process.exit(0);
}

if (!notionToken) {
	throw new Error('NOTION_TOKEN is required.');
}

const enabledSources = [];

for (const source of sources) {
	if (!source.databaseId) {
		const message = `Missing database ID for ${source.collection}. Set NOTION_${source.collection.toUpperCase()}_DATABASE_ID.`;
		if (optional) {
			console.log(`[notion] ${message} Skipping ${source.collection}.`);
			continue;
		}
		throw new Error(message);
	}

	enabledSources.push(source);
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

const escapeHtml = (value) =>
	String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');

const escapeAttribute = (value) => escapeHtml(value).replace(/`/g, '&#96;');

const preserveLineBreaks = (value, transform) =>
	String(value)
		.split(/(\r?\n+)/)
		.map((part) => (/^\r?\n+$/.test(part) || part === '' ? part : transform(part)))
		.join('');

const wrapInlineMarkdown = (value, transform) =>
	preserveLineBreaks(value, (part) => {
		const [, leading = '', core = '', trailing = ''] = part.match(/^(\s*)(.*?)(\s*)$/s) || [];
		return core ? `${leading}${transform(core)}${trailing}` : part;
	});

const textValue = (richText = []) =>
	richText
		.map((part) => {
			const text = part.plain_text || '';
			const href = part.href || part.text?.link?.url;
			const annotations = part.annotations || {};
			let output = text;

			if (annotations.code) output = wrapInlineMarkdown(output, (value) => `\`${value}\``);
			if (annotations.bold) output = wrapInlineMarkdown(output, (value) => `**${value}**`);
			if (annotations.italic) output = wrapInlineMarkdown(output, (value) => `*${value}*`);
			if (annotations.strikethrough) output = wrapInlineMarkdown(output, (value) => `~~${value}~~`);
			if (annotations.underline) output = wrapInlineMarkdown(output, (value) => `<u>${value}</u>`);
			if (href) output = wrapInlineMarkdown(output, (value) => `[${value}](${href})`);

			return output;
		})
		.join('');

const plainTextValue = (richText = []) => richText.map((part) => part.plain_text || '').join('');

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

const getEditedTime = (page) => page.last_edited_time;

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

const shouldPublish = (page) => {
	const draftProperty = getProperty(page.properties, ['Draft', 'draft']);
	if (draftProperty?.type === 'checkbox' && draftProperty.checkbox) return false;

	const published = getProperty(page.properties, ['Published', 'published']);
	if (published?.type === 'checkbox') return Boolean(published.checkbox);

	const status = getProperty(page.properties, ['Status', 'status']);
	if (status?.type === 'status' || status?.type === 'select') {
		const value = (status.status?.name || status.select?.name || '').toLowerCase();
		return ['published', 'live', 'public'].includes(value);
	}

	if (draftProperty?.type === 'checkbox') return !draftProperty.checkbox;

	return false;
};

const getNoteKind = (page) => {
	const prop = getProperty(page.properties, ['Type', 'Kind', 'type', 'kind']);
	const value = prop?.select?.name?.toLowerCase();
	return ['bookmark', 'photo', 'note'].includes(value) ? value : 'note';
};

const getUrl = (page) => {
	const prop = getProperty(page.properties, ['External URL', 'External Url', 'externalUrl']);
	return prop?.url || '';
};

const getFiles = (page, names) => {
	const prop = getProperty(page.properties, names);
	return prop?.files || [];
};

const getFileUrl = (file) => {
	if (!file) return '';
	if (file.type === 'external') return file.external?.url || '';
	return file.file?.url || '';
};

const getPageCoverUrl = (page) => {
	if (!page.cover) return '';
	if (page.cover.type === 'external') return page.cover.external?.url || '';
	return page.cover.file?.url || '';
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

const renderTableCell = (value) => {
	const text = value?.text || '';
	const url = value?.url || '';
	if (url) {
		return `<a href="${escapeAttribute(url)}">${escapeHtml(text || url)}</a>`;
	}
	return escapeHtml(text);
};

const renderInteractiveTable = ({ title = '', columns = [], rows = [] }) => {
	if (!columns.length || !rows.length) return '';

	const heading = title ? `<p class="notion-table-title">${escapeHtml(title)}</p>` : '';
	const headers = columns
		.map((column, index) => (
			`<th scope="col"><button type="button" data-table-sort="${index}">${escapeHtml(column)}</button></th>`
		))
		.join('');
	const body = rows
		.map((row) => {
			const searchText = row.map((cell) => cell?.text || '').join(' ').toLowerCase();
			const cells = columns
				.map((_, index) => {
					const cell = row[index] || { text: '' };
					return `<td data-sort-value="${escapeAttribute(cell.text || '')}">${renderTableCell(cell)}</td>`;
				})
				.join('');
			return `<tr data-table-row data-search-text="${escapeAttribute(searchText)}">${cells}</tr>`;
		})
		.join('');

	return `<section class="notion-table-block" data-notion-table>
${heading}
<div class="notion-table-tools">
<label>
<span>Filter table</span>
<input type="search" placeholder="Type to filter rows" data-table-filter>
</label>
</div>
<div class="notion-table-scroll">
<table>
<thead><tr>${headers}</tr></thead>
<tbody>${body}</tbody>
</table>
</div>
</section>`;
};

const databasePropertyValue = (property) => {
	if (!property) return { text: '' };

	switch (property.type) {
		case 'string':
			return { text: property.string || '' };
		case 'boolean':
			return { text: property.boolean ? 'Yes' : 'No' };
		case 'title':
			return { text: plainTextValue(property.title || []) };
		case 'rich_text':
			return { text: plainTextValue(property.rich_text || []) };
		case 'number':
			return { text: property.number === null || property.number === undefined ? '' : String(property.number) };
		case 'select':
			return { text: property.select?.name || '' };
		case 'multi_select':
			return { text: (property.multi_select || []).map((item) => item.name).filter(Boolean).join(', ') };
		case 'status':
			return { text: property.status?.name || '' };
		case 'date': {
			const start = property.date?.start || '';
			const end = property.date?.end || '';
			return { text: end ? `${start} - ${end}` : start };
		}
		case 'checkbox':
			return { text: property.checkbox ? 'Yes' : 'No' };
		case 'url':
			return { text: property.url || '', url: property.url || '' };
		case 'email':
			return { text: property.email || '', url: property.email ? `mailto:${property.email}` : '' };
		case 'phone_number':
			return { text: property.phone_number || '' };
		case 'unique_id': {
			const prefix = property.unique_id?.prefix ? `${property.unique_id.prefix}-` : '';
			return { text: property.unique_id?.number ? `${prefix}${property.unique_id.number}` : '' };
		}
		case 'people':
			return { text: (property.people || []).map((person) => person.name || person.id).join(', ') };
		case 'files':
			return { text: (property.files || []).map((file) => file.name || getFileUrl(file)).filter(Boolean).join(', ') };
		case 'relation':
			return { text: (property.relation || []).map((item) => item.id).join(', ') };
		case 'formula':
			return databasePropertyValue(property.formula);
		case 'rollup': {
			const rollup = property.rollup;
			if (!rollup) return { text: '' };
			if (rollup.type === 'array') return { text: rollup.array.map((item) => databasePropertyValue(item).text).filter(Boolean).join(', ') };
			return databasePropertyValue(rollup);
		}
		case 'created_time':
			return { text: property.created_time || '' };
		case 'last_edited_time':
			return { text: property.last_edited_time || '' };
		case 'created_by':
			return { text: property.created_by?.name || property.created_by?.id || '' };
		case 'last_edited_by':
			return { text: property.last_edited_by?.name || property.last_edited_by?.id || '' };
		default:
			return { text: '' };
	}
};

const renderChildDatabase = async (block) => {
	const database = await notionRequest(`/databases/${block.id}`);
	const pages = await fetchDatabasePages(block.id);
	const columns = Object.entries(database.properties || {})
		.filter(([, property]) => property.type !== 'created_by' && property.type !== 'last_edited_by')
		.map(([name]) => name);
	const rows = pages.map((page) => columns.map((column) => databasePropertyValue(page.properties[column])));

	return renderInteractiveTable({
		title: block.child_database?.title || database.title?.map((part) => part.plain_text || '').join('') || '',
		columns,
		rows
	});
};

const loadTableRows = async (block, context) => {
	const rows = [];
	let cursor = null;

	do {
		const params = new URLSearchParams({ page_size: '100' });
		if (cursor) params.set('start_cursor', cursor);
		const data = await notionRequest(`/blocks/${block.id}/children?${params.toString()}`);
		for (const child of data.results) {
			if (child.type !== 'table_row') continue;
			rows.push((child.table_row?.cells || []).map((cell) => ({ text: plainTextValue(cell || []) })));
		}
		cursor = data.has_more ? data.next_cursor : null;
	} while (cursor);

	const firstRow = rows[0] || [];
	const hasHeader = Boolean(block.table?.has_column_header);
	const columns = hasHeader
		? firstRow.map((cell, index) => cell.text || `Column ${index + 1}`)
		: firstRow.map((_, index) => `Column ${index + 1}`);
	const bodyRows = hasHeader ? rows.slice(1) : rows;

	return renderInteractiveTable({
		title: '',
		columns,
		rows: bodyRows
	});
};

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
			return `![${alt}](${downloaded})${children ? `\n\n${children}` : ''}`;
		}
		case 'child_database':
			return renderChildDatabase(block);
		case 'table':
			return loadTableRows(block, context);
		case 'table_row':
			return '';
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
			page_size: 100
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
	const pages = (await fetchDatabasePages(source.databaseId)).sort(
		(a, b) => new Date(getDate(b)).valueOf() - new Date(getDate(a)).valueOf()
	);
	const keptFiles = new Set();
	let syncedCount = 0;

	for (const page of pages) {
		if (!shouldPublish(page)) continue;

		const title = getTitle(page);
		const slug = getSlug(page, title);
		const date = getDate(page);
		const notionId = page.id;
		const notionEditedTime = getEditedTime(page);
		const draft = getCheckbox(page, ['Draft', 'draft']);
		const tags = getTags(page);
		const coverFile = getFiles(page, ['Cover Image', 'coverImage'])?.[0];
		const pageCoverUrl = getPageCoverUrl(page);
		const coverImage = coverFile
			? await downloadAsset(getFileUrl(coverFile), `${source.collection}-${slug}-cover`)
			: pageCoverUrl
				? await downloadAsset(pageCoverUrl, `${source.collection}-${slug}-cover`)
				: '';
		const coverImageAlt =
			getText(page, ['Cover Image Alt', 'coverImageAlt']) ||
			coverFile?.name ||
			title;
		const authorNote = getText(page, ['Author Note', 'authorNote']);
		const context = { collection: source.collection, slug };
		const body = await loadChildren(page.id, context);

		const frontmatter = {
			title,
			date,
			draft,
			tags,
			coverImage,
			coverImageAlt,
			notionId,
			notionEditedTime
		};

		if (source.kind === 'blog') {
			const description = getText(page, ['Subtitle / Dek', 'Description', 'description']) || title;
			frontmatter.description = description;
			if (authorNote) frontmatter.authorNote = authorNote;
		}

		if (source.kind === 'projects') {
			frontmatter.description = getText(page, ['Description', 'description']) || title;
			frontmatter.status = getStatus(page);
			if (authorNote) frontmatter.authorNote = authorNote;
			const externalUrl = getUrl(page);
			if (externalUrl) frontmatter.externalUrl = externalUrl;
		}

		if (source.kind === 'notes') {
			frontmatter.kind = getNoteKind(page);
			frontmatter.summary = getText(page, ['Summary', 'summary']) || title;
			const images = [];
			const additionalPhotos = getFiles(page, ['Additional Photos', 'Photos', 'Images', 'images']);
			for (const [index, photo] of additionalPhotos.entries()) {
				const image = await downloadAsset(getFileUrl(photo), `${source.collection}-${slug}-photo-${index + 1}`);
				if (image) {
					images.push({
						image,
						alt: photo.name || title
					});
				}
			}
			if (images.length) frontmatter.images = images;
			const externalUrl = getUrl(page);
			if (externalUrl) frontmatter.externalUrl = externalUrl;
		}

		const filePath = join(source.folder, `${slug}.md`);
		const content = `${buildFrontmatter(frontmatter)}\n\n${body.trim()}\n`;
		await writeFile(filePath, content);
		keptFiles.add(filePath);
		syncedCount += 1;
	}

	if (prune) {
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
	}

	console.log(`[notion] synced ${source.collection}: ${syncedCount}/${pages.length} published entries${prune ? ' (pruned)' : ''}`);
};

for (const source of enabledSources) {
	await writeCollection(source);
}

console.log('[notion] sync complete');
