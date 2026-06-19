import { connectLambda, getStore } from '@netlify/blobs';

const visitorCookie = 'workshop_like_visitor';

const response = (statusCode, body, headers = {}) => ({
	statusCode,
	headers: {
		'Content-Type': 'application/json',
		'Cache-Control': 'no-store',
		...headers
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

const parseCookies = (cookieHeader = '') =>
	Object.fromEntries(
		cookieHeader
			.split(';')
			.map((cookie) => cookie.trim().split('='))
			.filter(([key, value]) => key && value)
	);

const getVisitor = (event) => {
	const cookies = parseCookies(event.headers.cookie || event.headers.Cookie || '');
	const existing = cookies[visitorCookie];
	if (validPart(existing, 80)) return { visitor: existing, created: false };

	const visitor = crypto.randomUUID();
	return { visitor, created: true };
};

const visitorHeaders = (visitor, created) => {
	if (!created) return {};

	return {
		'Set-Cookie': `${visitorCookie}=${visitor}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`
	};
};

export const handler = async (event) => {
	connectLambda(event);
	const store = getStore('workshop-likes');
	const { visitor, created } = getVisitor(event);
	const headers = visitorHeaders(visitor, created);

	if (event.httpMethod === 'GET') {
		const contentId = event.queryStringParameters?.id;
		if (!validPart(contentId, 180)) {
			return response(400, { error: 'Invalid like request.' }, headers);
		}

		const liked = (await store.get(`${contentId}/${visitor}`)) !== null;
		const count = await countLikes(store, contentId);
		return response(200, { count, liked }, headers);
	}

	if (event.httpMethod === 'POST') {
		let payload;
		try {
			payload = JSON.parse(event.body || '{}');
		} catch {
			return response(400, { error: 'Invalid JSON.' }, headers);
		}

		const { id: contentId, liked = true } = payload;
		if (!validPart(contentId, 180)) {
			return response(400, { error: 'Invalid like request.' }, headers);
		}

		const key = `${contentId}/${visitor}`;
		if (liked === true) {
			await store.setJSON(key, { createdAt: new Date().toISOString() });
		} else if (liked === false) {
			await store.delete(key);
		} else {
			return response(400, { error: 'Invalid like state.' }, headers);
		}

		const count = await countLikes(store, contentId);
		return response(200, { count, liked }, headers);
	}

	return response(405, { error: 'Method not allowed.' }, headers);
};
