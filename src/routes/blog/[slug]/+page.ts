import { error } from '@sveltejs/kit';
import { getCollection, getItem } from '$lib/content';

export function entries() {
	return getCollection('blog').map((item) => ({ slug: item.slug }));
}

export function load({ params }) {
	const item = getItem('blog', params.slug);
	if (!item) error(404, 'Blog post not found');
	return { item };
}
