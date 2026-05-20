<script lang="ts">
	import { formatDate } from '$lib/content';

	let { data } = $props();
	const featured = $derived(data.items.find((item) => item.featured) ?? data.items[0]);
	const rest = $derived(data.items.filter((item) => item.slug !== featured?.slug));
</script>

<svelte:head>
	<title>Shenanigans / Prahlad's Workshop</title>
</svelte:head>

<main class="collection-page shenanigans-page">
	<section class="collection-hero">
		<p class="eyebrow">Shenanigans</p>
		<h1>Loose screws, snack reviews, tiny theories, and useful nonsense.</h1>
	</section>

	{#if featured}
		<a class="veg-puff-feature" href={`/shenanigans/${featured.slug}`}>
			<span class="veg-puff-icon" aria-hidden="true"></span>
			<div>
				<time>{formatDate(featured.date)}</time>
				<h2>{featured.title}</h2>
				<p>{featured.summary}</p>
			</div>
		</a>
	{/if}

	{#if rest.length}
		<div class="note-grid">
			{#each rest as item}
				<a class="note-card" href={`/shenanigans/${item.slug}`}>
					<time>{formatDate(item.date)}</time>
					<h2>{item.title}</h2>
					<p>{item.summary}</p>
				</a>
			{/each}
		</div>
	{/if}
</main>
