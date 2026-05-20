import { error } from '@sveltejs/kit';
import { getCollection, getItem } from '$lib/content';

export function entries() {
	return getCollection('writing').map((item) => ({ slug: item.slug }));
}

export function load({ params }) {
	const item = getItem('writing', params.slug);
	if (!item) error(404, 'Writing not found');
	return { item };
}
