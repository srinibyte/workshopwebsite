import { watch } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const root = fileURLToPath(new URL('..', import.meta.url));
const watchedPaths = ['src/content', 'public/uploads'];

let debounceTimer;
let running = false;
let pending = false;

const commitMessage = () => `Sync content ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`;

const runSync = async () => {
	if (running) {
		pending = true;
		return;
	}

	running = true;
	pending = false;

	try {
		const { stdout } = await execFileAsync(
			'git',
			['status', '--porcelain', '--', ...watchedPaths],
			{ cwd: root }
		);

		if (!stdout.trim()) {
			return;
		}

		await execFileAsync('git', ['add', ...watchedPaths], { cwd: root });

		try {
			await execFileAsync('git', ['commit', '-m', commitMessage()], { cwd: root });
		} catch (error) {
			const stderr = String(error?.stderr || '');
			if (!stderr.includes('nothing to commit')) {
				throw error;
			}
			return;
		}

		await execFileAsync('git', ['push', 'origin', 'main'], { cwd: root });
		console.log('[sync] pushed content changes');
	} catch (error) {
		console.error('[sync] failed:', error?.stderr || error?.message || error);
	} finally {
		running = false;
		if (pending) {
			runSync();
		}
	}
};

const scheduleSync = () => {
	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(runSync, 1200);
};

for (const relativePath of watchedPaths) {
	watch(new URL(`../${relativePath}`, import.meta.url), { recursive: true }, scheduleSync);
}

console.log('[sync] watching content and uploads for auto-push');
