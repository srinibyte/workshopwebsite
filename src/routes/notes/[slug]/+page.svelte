<script lang="ts">
	import { formatDate } from '$lib/content';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.item.title} / Prahlad's Workshop</title>
</svelte:head>

<article class="article-page compact-article">
	<a class="back-link" href="/notes">Back to notes</a>
	<header>
		<p class="eyebrow">Note / {formatDate(data.item.date)}</p>
		<h1>{data.item.title}</h1>
		<p>{data.item.summary}</p>
	</header>
	<div class="article-body">{@html data.item.html}</div>
</article>
