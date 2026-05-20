<script lang="ts">
	import { formatDate } from '$lib/content';

	let { data } = $props();
</script>

<svelte:head>
	<title>Projects / Prahlad's Workshop</title>
</svelte:head>

<main class="collection-page">
	<section class="collection-hero">
		<p class="eyebrow">Projects</p>
		<h1>Things made, fixed, tested, and shipped.</h1>
	</section>

	<div class="collection-list">
		{#each data.items as item}
			<a class="collection-item" href={`/projects/${item.slug}`}>
				<span style={`--accent:${item.accent ?? '#2f7f72'}`}></span>
				<time>{formatDate(item.date)}</time>
				<h2>{item.title}</h2>
				<p>{item.summary}</p>
			</a>
		{/each}
	</div>
</main>
