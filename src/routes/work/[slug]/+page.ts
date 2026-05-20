import { error } from '@sveltejs/kit';
import { getCollection, getItem } from '$lib/content';

export function entries() {
	return getCollection('work').map((item) => ({ slug: item.slug }));
}

export function load({ params }) {
	const item = getItem('work', params.slug);
	if (!item) error(404, 'Work item not found');
	return { item };
}
