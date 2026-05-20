<script lang="ts">
	import { formatDate } from '$lib/content';

	let { data } = $props();
</script>

<svelte:head>
	<title>Work / Prahlad's Workshop</title>
</svelte:head>

<main class="collection-page">
	<section class="collection-hero">
		<p class="eyebrow">Work</p>
		<h1>Built things, prototypes, experiments.</h1>
	</section>

	<div class="collection-list">
		{#each data.items as item}
			<a class="collection-item" href={`/work/${item.slug}`}>
				<span style={`--accent:${item.accent ?? '#2f7f72'}`}></span>
				<time>{formatDate(item.date)}</time>
				<h2>{item.title}</h2>
				<p>{item.summary}</p>
			</a>
		{/each}
	</div>
</main>
