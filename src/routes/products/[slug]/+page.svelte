<script>
	import Image from '$lib/components/Image.svelte';
	import JsonLD from '$lib/components/JsonLD.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import edjsHTML from 'editorjs-html';

	let { data } = $props();
	const { product } = data;

	const edjsParser = edjsHTML();

	const productSchema = {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: product.name,
		description: product.shortDescription,
		image: product.featuredImage?.displayUrl || product.featuredImage?.originalUrl
	};

	/**
	 * Renders Editor.js's JSON output to an HTML string.
	 * @param {object | null | undefined} richText
	 * @returns {string}
	 */
	function renderRichTextToHtml(richText) {
		if (!richText?.blocks) return '';
		const htmlParts = edjsParser.parse(richText);
		return htmlParts.join('');
	}
</script>

<JsonLD data={productSchema} />

<Seo
	title={`${product.name} | Vision AI Tech Products`}
	description={product.shortDescription}
	imageUrl={product.featuredImage?.displayUrl || product.featuredImage?.originalUrl}
	ogType="product"
/>

<div class="relative z-10">
	<div class="mx-auto max-w-4xl px-8 py-20 sm:py-24">
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">{product.name}</h1>
			<p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-main/70">
				{product.shortDescription}
			</p>
		</div>

		{#if product.featuredImage}
			<div class="mt-16">
				<Image
					src={product.featuredImage.displayUrl || product.featuredImage.originalUrl}
					alt={product.featuredImage.altText}
					class="aspect-video w-full rounded-xl shadow-lg"
				/>
			</div>
		{/if}

		<article class="prose prose-lg mx-auto mt-16 text-main/80">
			{@html renderRichTextToHtml(product.longDescription)}
		</article>

		<div class="mt-16 text-center">
			<a
				href={product.ctaLink || `/contact?product=${product.slug}`}
				class="rounded-md bg-accent px-6 py-3 font-bold text-main shadow-lg shadow-accent/30 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/40"
			>
				{product.ctaText || 'Inquire About This Product'}
			</a>
		</div>
	</div>
</div>