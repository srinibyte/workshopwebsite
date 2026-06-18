export function formatDate(date: Date) {
	return new Intl.DateTimeFormat('en', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	}).format(date);
}

export function slugToId(value: string) {
	return value.replace(/[^\w-]+/g, '-').toLowerCase();
}
