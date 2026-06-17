export function formatDate(date: Date) {
	return new Intl.DateTimeFormat('en', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	}).format(date);
}

export function slugToId(value: string) {
	return value.replace(/[^\w-]+/g, '-').toLowerCase();
}

type ContentImage = {
	src: string;
	alt: string;
};

export function extractMarkdownImages(markdown: string): ContentImage[] {
	const images: ContentImage[] = [];
	const seen = new Set<string>();

	const markdownImagePattern = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
	for (const match of markdown.matchAll(markdownImagePattern)) {
		const alt = match[1]?.trim() || 'Image';
		const src = match[2]?.trim();
		if (!src || seen.has(src)) continue;
		seen.add(src);
		images.push({ src, alt });
	}

	const htmlImagePattern = /<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/g;
	for (const match of markdown.matchAll(htmlImagePattern)) {
		const src = match[1]?.trim();
		const alt = match[2]?.trim() || 'Image';
		if (!src || seen.has(src)) continue;
		seen.add(src);
		images.push({ src, alt });
	}

	return images;
}
