import { connectLambda, getStore } from '@netlify/blobs';

const visitorCookie = 'workshop_like_visitor';
const storeName = 'workshop-likes';

const getLikesStore = (event) => {
	const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN;
	const siteID = process.env.SITE_ID || process.env.NETLIFY_SITE_ID;

	if (token && siteID) {
		return getStore({
			name: storeName,
			siteID,
			token
		});
	}

	connectLambda(event);
	return getStore(storeName);
};

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

const likeKey = (contentId, visitor) => `likes/${contentId}/${visitor}`;
const countKey = (contentId) => `counts/${contentId}`;

const readCount = async (store, contentId) => {
	const value = await store.get(countKey(contentId), { type: 'json' });
	return Number.isInteger(value?.count) && value.count > 0 ? value.count : 0;
};

const writeCount = async (store, contentId, count) => {
	const safeCount = Math.max(0, count);
	await store.setJSON(countKey(contentId), {
		count: safeCount,
		updatedAt: new Date().toISOString()
	});
	return safeCount;
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
	const store = getLikesStore(event);
	const { visitor, created } = getVisitor(event);
	const headers = visitorHeaders(visitor, created);

	if (event.httpMethod === 'GET') {
		const contentId = event.queryStringParameters?.id;
		if (!validPart(contentId, 180)) {
			return response(400, { error: 'Invalid like request.' }, headers);
		}

		const liked = (await store.get(likeKey(contentId, visitor))) !== null;
		const count = await readCount(store, contentId);
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

		const key = likeKey(contentId, visitor);
		const existing = await store.get(key);
		let count = await readCount(store, contentId);

		if (liked === true) {
			if (existing === null) {
				await store.setJSON(key, { createdAt: new Date().toISOString() });
				count = await writeCount(store, contentId, count + 1);
			}
		} else if (liked === false) {
			if (existing !== null) {
				await store.delete(key);
				count = await writeCount(store, contentId, count - 1);
			}
		} else {
			return response(400, { error: 'Invalid like state.' }, headers);
		}

		return response(200, { count, liked }, headers);
	}

	return response(405, { error: 'Method not allowed.' }, headers);
};
