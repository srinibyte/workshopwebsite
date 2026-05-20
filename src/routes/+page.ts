import { content, getCollection } from '$lib/content';

export function load() {
	return {
		featured: content.filter((item) => item.featured).slice(0, 4),
		recent: content.slice(0, 8),
		work: getCollection('work').slice(0, 3),
		notes: getCollection('notes').slice(0, 5)
	};
}
