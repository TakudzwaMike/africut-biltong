<script>
	import edjsHTML from 'editorjs-html';
	import Image from '$lib/components/Image.svelte';
	import Seo from '$lib/components/Seo.svelte';

	let { data } = $props();
	const { post } = data;

	const edjsParser = edjsHTML();

	/**
	 * Extracts the first paragraph of text from Editor.js JSON to use as a meta description.
	 * @param {object | null | undefined} richText
	 * @returns {string}
	 */
	function getExcerpt(richText) {
		if (!richText?.blocks) return '';
		const firstParagraph = richText.blocks.find((block) => block.type === 'paragraph');
		return firstParagraph?.data?.text?.substring(0, 155) || ''; // Truncate to standard meta description length
	}

	const seoDescription = getExcerpt(post.contentJson);
	const seoImageUrl = post.featuredImage?.displayUrl || post.featuredImage?.originalUrl;
</script>

<Seo
	title={`${post.title} | Vision AI Tech Blog`}
	description={seoDescription}
	imageUrl={seoImageUrl}
	ogType="article"
/>

<div class="relative z-10">
	<div class="mx-auto max-w-4xl px-8 py-20 sm:py-24">
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">{post.title}</h1>
			<p class="mt-6 text-lg leading-8 text-main/70">
				By {post.author.username} on {new Date(post.publishedAt).toLocaleDateString()}
			</p>
			{#if post.categories.length > 0}
				<div class="mt-4 flex flex-wrap items-center justify-center gap-2">
					{#each post.categories as postCategory}
						<a
							href={`/blog/category/${postCategory.category.slug}`}
							class="rounded-full bg-main/10 px-3 py-1 text-sm font-semibold text-main/80 transition hover:bg-main/20"
						>
							{postCategory.category.name}
						</a>
					{/each}
				</div>
			{/if}
		</div>

		{#if post.featuredImage}
			<div class="mt-16">
				<Image
					src={post.featuredImage.displayUrl || post.featuredImage.originalUrl}
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
