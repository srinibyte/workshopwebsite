<script lang="ts">
	import { formatDate } from '$lib/content';

	let { data } = $props();
</script>

<svelte:head>
	<title>Notes / Prahlad's Workshop</title>
</svelte:head>

<main class="collection-page">
	<section class="collection-hero">
		<p class="eyebrow">Notes</p>
		<h1>Small observations, links, bench scraps.</h1>
	</section>

	<div class="note-grid">
		{#each data.items as item}
			<a class="note-card" href={`/notes/${item.slug}`}>
				<time>{formatDate(item.date)}</time>
				<h2>{item.title}</h2>
				<p>{item.summary}</p>
			</a>
		{/each}
	</div>
</main>
