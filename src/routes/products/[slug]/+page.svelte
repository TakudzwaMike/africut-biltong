<script>
	import Image from '$lib/components/Image.svelte';
	import JsonLD from '$lib/components/JsonLD.svelte';
	let { data } = $props();
	const { product } = data;

	const productSchema = {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: product.name,
		description: product.shortDescription,
		image: product.featuredImage?.url,
		// If you had a brand and offers (price), you would add them here.
		// "brand": { "@type": "Brand", "name": "Vision AI Tech" },
		// "offers": {
		//   "@type": "Offer",
		//   "priceCurrency": "USD",
		//   "price": "Contact for price"
		// }
	};

	/**
	 * Renders TipTap's JSON output to a basic HTML string.
	 */
	function renderRichTextToHtml(richText) {
		if (!richText?.content) return '';

		const renderNode = (node) => {
			let textContent = node.content?.map(renderNode).join('') || '';

			switch (node.type) {
				case 'paragraph':
					return `<p>${textContent || '<br>'}</p>`;
				case 'heading':
					const level = node.attrs?.level || 1;
					return `<h${level}>${textContent}</h${level}>`;
				case 'bold':
					return `<strong>${textContent}</strong>`;
				case 'italic':
					return `<em>${textContent}</em>`;
				case 'text':
					return node.text;
				default:
					return textContent;
			}
		};

		return richText.content.map(renderNode).join('');
	}
</script>

<JsonLD data={productSchema} />

<svelte:head>
	<title>{product.name} | Vision AI Tech Products</title>
	<meta name="description" content={product.shortDescription} />
</svelte:head>

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
					src={product.featuredImage.url}
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