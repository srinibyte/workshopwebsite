import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = new URL('..', import.meta.url).pathname;
const watchedPaths = ['src/content', 'public/uploads'];

let running = false;
let lastSignature = '';

const commitMessage = () => `Sync content ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`;

const runSync = async () => {
	if (running) return;

	running = true;

	try {
		const { stdout } = await execFileAsync(
			'git',
			['status', '--porcelain', '--', ...watchedPaths],
			{ cwd: root }
		);

		const signature = stdout.trim();
		if (!signature || signature === lastSignature) {
			return;
		}

		lastSignature = signature;
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
	}
};

console.log('[sync] polling content and uploads for auto-push');
setInterval(() => {
	void runSync();
}, 2500);
