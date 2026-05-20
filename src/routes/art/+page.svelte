<script lang="ts">
	import { formatDate } from '$lib/content';

	let { data } = $props();
</script>

<svelte:head>
	<title>Art / Prahlad's Workshop</title>
</svelte:head>

<main class="collection-page">
	<section class="collection-hero">
		<p class="eyebrow">Art</p>
		<h1>Music, cinema, books, recommendations, and things I make.</h1>
	</section>

	<div class="filter-rail" aria-label="Art categories">
		<span>made by me</span>
		<span>music</span>
		<span>cinema</span>
		<span>books</span>
		<span>recommendations</span>
	</div>

	<div class="note-grid art-grid">
		{#each data.items as item}
			<a class="note-card art-card" href={`/art/${item.slug}`}>
				<span>{item.kind ?? 'entry'}</span>
				<time>{formatDate(item.date)}</time>
				<h2>{item.title}</h2>
				<p>{item.summary}</p>
				{#if item.creator || item.rating}
					<div class="card-meta">
						{#if item.creator}<small>{item.creator}</small>{/if}
						{#if item.rating}<small>{item.rating}</small>{/if}
					</div>
				{/if}
			</a>
		{/each}
	</div>
</main>
