import { error } from '@sveltejs/kit';
import { getCollection, getItem } from '$lib/content';

export function entries() {
	return getCollection('notes').map((item) => ({ slug: item.slug }));
}

export function load({ params }) {
	const item = getItem('notes', params.slug);
	if (!item) error(404, 'Note not found');
	return { item };
}
