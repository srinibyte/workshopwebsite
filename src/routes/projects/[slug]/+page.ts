import { error } from '@sveltejs/kit';
import { getCollection, getItem } from '$lib/content';

export function entries() {
	return getCollection('projects').map((item) => ({ slug: item.slug }));
}

export function load({ params }) {
	const item = getItem('projects', params.slug);
	if (!item) error(404, 'Project not found');
	return { item };
}
