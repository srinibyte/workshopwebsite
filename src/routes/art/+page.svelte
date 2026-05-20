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
		<h1>Music, films, sketches, and things worth saving.</h1>
	</section>

	<div class="note-grid art-grid">
		{#each data.items as item}
			<a class="note-card art-card" href={`/art/${item.slug}`}>
				<span>{item.kind ?? 'entry'}</span>
				<time>{formatDate(item.date)}</time>
				<h2>{item.title}</h2>
				<p>{item.summary}</p>
			</a>
		{/each}
	</div>
</main>
