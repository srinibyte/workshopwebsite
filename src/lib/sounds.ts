let audioContext: AudioContext | undefined;

function context() {
	audioContext ??= new AudioContext();
	return audioContext;
}

export function playClickSound() {
	const ctx = context();
	const now = ctx.currentTime;
	const gain = ctx.createGain();
	const first = ctx.createOscillator();
	const second = ctx.createOscillator();

	first.type = 'square';
	second.type = 'triangle';
	first.frequency.setValueAtTime(880, now);
	first.frequency.exponentialRampToValueAtTime(520, now + 0.055);
	second.frequency.setValueAtTime(1320, now + 0.035);
	second.frequency.exponentialRampToValueAtTime(760, now + 0.09);

	gain.gain.setValueAtTime(0.0001, now);
	gain.gain.exponentialRampToValueAtTime(0.045, now + 0.01);
	gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

	first.connect(gain);
	second.connect(gain);
	gain.connect(ctx.destination);

	first.start(now);
	second.start(now + 0.03);
	first.stop(now + 0.1);
	second.stop(now + 0.13);
}
