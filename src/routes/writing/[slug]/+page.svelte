<script lang="ts">
	import { formatDate } from '$lib/content';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.item.title} / Prahlad's Workshop</title>
</svelte:head>

<article class="article-page">
	<a class="back-link" href="/writing">Back to writing</a>
	<header>
		<p class="eyebrow">Writing / {formatDate(data.item.date)}</p>
		<h1>{data.item.title}</h1>
		<p>{data.item.summary}</p>
	</header>
	<div class="article-body">{@html data.item.html}</div>
</article>
