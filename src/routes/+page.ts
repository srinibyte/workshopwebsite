import { content, getCollection } from '$lib/content';

export function load() {
	return {
		featured: content
			.filter((item) => item.featured && item.collection !== 'interests')
			.slice(0, 4),
		recent: content.filter((item) => item.collection !== 'interests').slice(0, 8),
		projects: getCollection('projects').slice(0, 3),
		blog: getCollection('blog').slice(0, 3),
		art: getCollection('art').slice(0, 3),
		interests: getCollection('interests')
	};
}
