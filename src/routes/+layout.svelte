<script lang="ts">
	import { playClickSound } from '$lib/sounds';
	import '../styles.css';

	let { children } = $props();
	let soundEnabled = $state(true);

	function handlePointerUp(event: PointerEvent) {
		const target = event.target;
		if (!(target instanceof Element)) return;
		if (soundEnabled && target.closest('a, button, .sound-tile')) {
			playClickSound();
		}
	}
</script>

<svelte:head>
	<title>Prahlad's Workshop</title>
	<meta
		name="description"
		content="Prahlad's Workshop is a static Svelte site for projects, blog posts, art, links, and current interests."
	/>
</svelte:head>

<svelte:body onpointerup={handlePointerUp} />

<div class="site-shell">
	<header class="site-header">
		<a class="brand" href="/" aria-label="Prahlad's Workshop home">
			<span class="brand-mark" aria-hidden="true">PW</span>
			<span>
				<strong>Prahlad's Workshop</strong>
				<small>projects, art, blog, curiosities</small>
			</span>
		</a>

		<nav aria-label="Primary navigation">
			<a href="/projects">Projects</a>
			<a href="/blog">Blog</a>
			<a href="/art">Art</a>
			<a href="/shenanigans">Shenanigans</a>
		</nav>
	</header>

	{@render children()}

	<section class="footer-card-wrap" aria-label="Contact card">
		<div class="footer-business-card">
			<p class="card-kicker">Prahlad Srinivasan</p>
			<h2>Prahlad's Workshop</h2>
			<p class="card-quote">"oh, the subtle off white colouring of it"</p>
			<div class="card-links">
				<a href="https://www.instagram.com/">Instagram</a>
				<a href="https://www.linkedin.com/">LinkedIn</a>
				<a href="mailto:prahlad@example.com">Email</a>
			</div>
		</div>
	</section>

	<footer class="status-strip">
		<span>Prahlad's Workshop</span>
		<span>static system fonts / cms-ready / off-white mode</span>
		<a href="/admin/">CMS</a>
		<button
			type="button"
			class:enabled={soundEnabled}
			aria-pressed={soundEnabled}
			onclick={() => (soundEnabled = !soundEnabled)}
		>
			Sound {soundEnabled ? 'on' : 'off'}
		</button>
	</footer>
</div>
