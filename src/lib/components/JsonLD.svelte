<script>
	let { data } = $props();
</script>

<svelte:head>
	<script type="application/ld+json">
		{@html JSON.stringify(data, null, 2)}
	</script>
</svelte:head>