<script lang="ts">
	import '../styles.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Prahlad's Workshop</title>
	<meta
		name="description"
		content="Prahlad's Workshop is a static Svelte site for notes, projects, experiments, and field logs."
	/>
</svelte:head>

<div class="site-shell">
	<header class="site-header">
		<a class="brand" href="/" aria-label="Prahlad's Workshop home">
			<span class="brand-mark" aria-hidden="true">PW</span>
			<span>
				<strong>Prahlad's Workshop</strong>
				<small>notes, builds, field logs</small>
			</span>
		</a>

		<nav aria-label="Primary navigation">
			<a href="/work">Work</a>
			<a href="/notes">Notes</a>
			<a href="/writing">Writing</a>
			<a href="/admin/">CMS</a>
		</nav>
	</header>

	{@render children()}
</div>
