import { setTimeout as delay } from 'node:timers/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const root = fileURLToPath(new URL('..', import.meta.url));
const intervalMs = Number.parseInt(process.env.NOTION_POLL_INTERVAL_MS || '300000', 10);

const pull = async () => {
	try {
		await execFileAsync('node', ['scripts/sync-notion.mjs'], {
			cwd: root,
			env: process.env
		});
	} catch (error) {
		console.error('[notion-watch] pull failed:', error?.stderr || error?.message || error);
	}
};

console.log(`[notion-watch] polling every ${intervalMs}ms`);

while (true) {
	await pull();
	await delay(intervalMs);
}
