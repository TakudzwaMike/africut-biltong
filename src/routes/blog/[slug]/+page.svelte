<script>
	let { data } = $props();
	const { post } = data;

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
	<title>{post.title} | Vision AI Tech Blog</title>
	<!--todo: add seo optimisation function -->
</svelte:head>

<div class="relative z-10">
	<div class="mx-auto max-w-4xl px-8 py-20 sm:py-24">
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">{post.title}</h1>
			<p class="mt-6 text-lg leading-8 text-main/70">
				By {post.author.username} on {new Date(post.publishedAt).toLocaleDateString()}
			</p>
		</div>

		{#if post.featuredImage}
			<div class="mt-16">
				<Image
					src={post.featuredImage.url}
					alt={post.featuredImage.altText}
					class="aspect-video w-full rounded-xl shadow-lg"
				/>
			</div>
		{/if}

		<article class="prose prose-lg mx-auto mt-16 text-main/80">
			{@html renderRichTextToHtml(post.contentJson)}
		</article>

		<div class="mt-16 border-t border-main/10 pt-8 text-center">
			<a href="/blog" class="font-bold text-accent transition hover:drop-shadow-accent-glow"
				>← Back to All Posts</a
			>
		</div>
	</div>
</div>
