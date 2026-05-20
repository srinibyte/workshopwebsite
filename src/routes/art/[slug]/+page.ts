import { error } from '@sveltejs/kit';
import { getCollection, getItem } from '$lib/content';

export function entries() {
	return getCollection('art').map((item) => ({ slug: item.slug }));
}

export function load({ params }) {
	const item = getItem('art', params.slug);
	if (!item) error(404, 'Art entry not found');
	return { item };
}
