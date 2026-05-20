<script lang="ts">
	import { formatDate } from '$lib/content';

	let { data } = $props();
</script>

<svelte:head>
	<title>Prahlad's Workshop</title>
</svelte:head>

<main>
	<section class="hero workshop-panel">
		<div class="eyebrow">Static Svelte archive / Git-backed CMS</div>
		<div class="hero-grid">
			<div>
				<h1>Prahlad's Workshop</h1>
				<p class="lede">
					A tinkerer-style home for builds, notes, essays, experiments, and useful scraps from
					the bench.
				</p>
			</div>
			<div class="bench-card" aria-label="Workshop status">
				<div class="gauge">
					<span>Current state</span>
					<strong>Open bench</strong>
				</div>
				<div class="tool-row">
					<span>file</span>
					<span>solder</span>
					<span>ship</span>
				</div>
				<div class="meter"><span></span></div>
			</div>
		</div>
	</section>

	<section class="ticker" aria-label="Workshop index">
		<span>Projects</span>
		<span>Notes</span>
		<span>Essays</span>
		<span>Field logs</span>
		<span>Sketches</span>
		<span>CMS-ready</span>
	</section>

	<section class="layout-grid">
		<div class="main-column">
			<div class="section-heading">
				<p>Featured from the bench</p>
				<a href="/work">All work</a>
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
				<p>Fresh shavings</p>
				<a href="/notes">Notes</a>
			</div>
			<div class="note-stack">
				{#each data.notes as note}
					<a href={`/notes/${note.slug}`}>
						<time>{formatDate(note.date)}</time>
						<strong>{note.title}</strong>
					</a>
				{/each}
			</div>
		</aside>
	</section>

	<section class="archive-strip">
		<div class="section-heading">
			<p>Recent logbook</p>
			<a href="/writing">Writing</a>
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
