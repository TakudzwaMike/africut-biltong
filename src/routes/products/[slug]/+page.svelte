<script>
	let { data } = $props();
	const { product } = data;

	/**
	 * Renders TipTap's JSON output to a basic HTML string.
	 * NOTE: This is a simplified renderer. For a production app, you might use a more robust
	 * library or extend this function to handle all desired node types (lists, blockquotes, etc.).
	 * @param {object | null | undefined} richText
	 * @returns {string}
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

		{#if product.imageUrl}
			<img
				src={product.imageUrl}
				alt={product.name}
				class="mt-16 aspect-video w-full rounded-xl bg-main/5 object-cover shadow-lg"
			/>
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