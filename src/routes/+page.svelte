<script lang="ts">
	import { formatDate } from '$lib/content';

	let { data } = $props();
</script>

<svelte:head>
	<title>Prahlad's Workshop</title>
</svelte:head>

<main>
	<section class="hero workshop-panel">
		<div class="eyebrow">A digital bench for tinkering in public</div>
		<div class="hero-grid">
			<div>
				<h1>Prahlad's Workshop</h1>
				<p class="lede">
					Projects, essays, art, music, film notes, and the strange little obsessions currently
					scattered across the desk.
				</p>
			</div>
			<div class="bench-card" aria-label="Workshop status">
				<div class="gauge">
					<span>Workbench</span>
					<strong>Powered on</strong>
				</div>
				<div class="tool-row">
					<span>write</span>
					<span>make</span>
					<span>play</span>
				</div>
				<div class="meter"><span></span></div>
			</div>
		</div>
	</section>

	<section class="ticker interests-ticker" aria-label="Current interests">
		<div>
			{#each [...data.interests, ...data.interests] as interest}
				<span>{interest.title}</span>
			{/each}
		</div>
	</section>

	<section class="layout-grid">
		<div class="main-column">
			<div class="section-heading">
				<p>Featured from the bench</p>
				<a href="/projects">All projects</a>
			</div>

			<div class="feature-grid">
				{#each data.featured as item}
					<a class="feature-card" href={`/${item.collection}/${item.slug}`}>
						<span class="pin" style={`--accent:${item.accent ?? '#d6632d'}`}></span>
						<small>{item.collection} / {formatDate(item.date)}</small>
						<h2>{item.title}</h2>
						<p>{item.summary}</p>
						<div class="tags">
							{#each item.tags as tag}
								<span>{tag}</span>
							{/each}
						</div>
					</a>
				{/each}
			</div>
		</div>

		<aside class="side-column workshop-panel">
			<div class="section-heading compact">
				<p>Business card</p>
				<a href="mailto:prahlad@example.com">Email</a>
			</div>
			<div class="business-card">
				<div class="pixel-avatar" aria-hidden="true">
					<span></span><span></span><span></span><span></span>
				</div>
				<strong>Prahlad Srinivasan</strong>
				<p>Builder, writer, listener, film-maker in progress.</p>
				<div class="social-buttons">
					<a href="https://github.com/prahladsrini">GitHub</a>
					<a href="https://x.com/">X / Twitter</a>
					<a href="https://www.linkedin.com/">LinkedIn</a>
					<a href="mailto:prahlad@example.com">Email</a>
				</div>
			</div>
		</aside>
	</section>

	<section class="workbench-bays">
		<a class="bay sound-tile" href="/projects">
			<span class="bay-icon project-icon" aria-hidden="true"></span>
			<small>01</small>
			<h2>Projects</h2>
			<p>Build logs, prototypes, websites, experiments, and tools.</p>
		</a>
		<a class="bay sound-tile" href="/blog">
			<span class="bay-icon blog-icon" aria-hidden="true"></span>
			<small>02</small>
			<h2>Blog</h2>
			<p>Longer writing from the bench: process, taste, systems, notes.</p>
		</a>
		<a class="bay sound-tile" href="/art">
			<span class="bay-icon art-icon" aria-hidden="true"></span>
			<small>03</small>
			<h2>Art</h2>
			<p>Music I love, music I make, film sketches, and future screenings.</p>
		</a>
	</section>

	<section class="archive-strip">
		<div class="section-heading">
			<p>Recent logbook</p>
			<a href="/blog">Blog</a>
		</div>
		<div class="logbook">
			{#each data.recent as item}
				<a href={`/${item.collection}/${item.slug}`}>
					<time>{formatDate(item.date)}</time>
					<span>{item.collection}</span>
					<strong>{item.title}</strong>
				</a>
			{/each}
		</div>
	</section>
</main>
