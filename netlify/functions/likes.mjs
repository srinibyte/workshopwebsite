import { connectLambda, getStore } from '@netlify/blobs';

const response = (statusCode, body) => ({
	statusCode,
	headers: {
		'Content-Type': 'application/json',
		'Cache-Control': 'no-store'
	},
	body: JSON.stringify(body)
});

const validPart = (value, maxLength) =>
	typeof value === 'string' &&
	value.length > 0 &&
	value.length <= maxLength &&
	/^[a-zA-Z0-9:_-]+$/.test(value);

const countLikes = async (store, contentId) => {
	const { blobs } = await store.list({ prefix: `${contentId}/` });
	return blobs.length;
};

export const handler = async (event) => {
	connectLambda(event);
	const store = getStore('workshop-likes');

	if (event.httpMethod === 'GET') {
		const contentId = event.queryStringParameters?.id;
		const visitor = event.queryStringParameters?.visitor;
		if (!validPart(contentId, 180) || !validPart(visitor, 80)) {
			return response(400, { error: 'Invalid like request.' });
		}

		const liked = (await store.get(`${contentId}/${visitor}`)) !== null;
		const count = await countLikes(store, contentId);
		return response(200, { count, liked });
	}

	if (event.httpMethod === 'POST') {
		let payload;
		try {
			payload = JSON.parse(event.body || '{}');
		} catch {
			return response(400, { error: 'Invalid JSON.' });
		}

		const { id: contentId, visitor } = payload;
		if (!validPart(contentId, 180) || !validPart(visitor, 80)) {
			return response(400, { error: 'Invalid like request.' });
		}

		const key = `${contentId}/${visitor}`;
		const existing = await store.get(key);
		if (existing === null) {
			await store.setJSON(key, { createdAt: new Date().toISOString() });
		}

		const count = await countLikes(store, contentId);
		return response(200, { count, liked: true });
	}

	return response(405, { error: 'Method not allowed.' });
};
