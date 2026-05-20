import { getCollection } from '$lib/content';

export function load() {
	return {
		items: getCollection('blog')
	};
}
