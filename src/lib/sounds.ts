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
	const filter = ctx.createBiquadFilter();

	first.type = 'triangle';
	second.type = 'sine';
	first.frequency.setValueAtTime(240, now);
	first.frequency.exponentialRampToValueAtTime(160, now + 0.045);
	second.frequency.setValueAtTime(520, now + 0.018);
	second.frequency.exponentialRampToValueAtTime(300, now + 0.07);
	filter.type = 'lowpass';
	filter.frequency.setValueAtTime(1200, now);

	gain.gain.setValueAtTime(0.0001, now);
	gain.gain.exponentialRampToValueAtTime(0.032, now + 0.006);
	gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

	first.connect(filter);
	second.connect(filter);
	filter.connect(gain);
	gain.connect(ctx.destination);

	first.start(now);
	second.start(now + 0.016);
	first.stop(now + 0.075);
	second.stop(now + 0.085);
}
