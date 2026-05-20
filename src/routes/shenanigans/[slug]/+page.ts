import { error } from '@sveltejs/kit';
import { getCollection, getItem } from '$lib/content';

export function entries() {
	return getCollection('shenanigans').map((item) => ({ slug: item.slug }));
}

export function load({ params }) {
	const item = getItem('shenanigans', params.slug);
	if (!item) error(404, 'Shenanigan not found');
	return { item };
}
