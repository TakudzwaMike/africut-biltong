<script>
	import Image from '$lib/components/Image.svelte';
	import edjsHTML from 'editorjs-html';

	let { data } = $props();
	const { solution } = data;

	const edjsParser = edjsHTML();

	function renderRichText(richText) {
		if (!richText?.blocks) return '';
		const htmlParts = edjsParser.parse(richText);
		return htmlParts
	}
</script>

<svelte:head>
	<title>{solution.solutionName} | Vision AI Tech Solutions</title>
	<meta name="description" content={solution.shortDescription} />
</svelte:head>

<div class="relative z-10">
	<div class="mx-auto max-w-4xl px-8 py-20 sm:py-24">
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">
				{solution.solutionName}
			</h1>
			<p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-main/70">
				{solution.shortDescription}
			</p>
		</div>

		{#if solution.featuredImage}
			<div class="mt-16">
				<Image
					src={solution.featuredImage.displayUrl || solution.featuredImage.originalUrl}
					alt={solution.featuredImage.altText}
					class="aspect-video w-full rounded-xl shadow-lg"
				/>
			</div>
		{/if}

		<div class="prose prose-lg break-words mx-auto mt-16 text-main/80">
			{@html renderRichText(solution.longDescription)}
		</div>

		<div class="mt-16 text-center">
			<a
				href={solution.ctaLink || `/contact?solution=${solution.slug}`}
				class="rounded-md bg-accent px-6 py-3 font-bold text-main shadow-lg shadow-accent/30 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/40"
			>
				{solution.ctaText || 'Discuss this Solution'}
			</a>
		</div>
	</div>
</div>
