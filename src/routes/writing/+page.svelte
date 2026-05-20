<script lang="ts">
	import { formatDate } from '$lib/content';

	let { data } = $props();
</script>

<svelte:head>
	<title>Writing / Prahlad's Workshop</title>
</svelte:head>

<main class="collection-page">
	<section class="collection-hero">
		<p class="eyebrow">Writing</p>
		<h1>Longer notes from the workbench.</h1>
	</section>

	<div class="collection-list">
		{#each data.items as item}
			<a class="collection-item" href={`/writing/${item.slug}`}>
				<span style={`--accent:${item.accent ?? '#c19a32'}`}></span>
				<time>{formatDate(item.date)}</time>
				<h2>{item.title}</h2>
				<p>{item.summary}</p>
			</a>
		{/each}
	</div>
</main>
