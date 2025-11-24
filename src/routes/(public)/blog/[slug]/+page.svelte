<script>
	import Seo from '$lib/components/Seo.svelte';
	import RichTextRenderer from '$lib/components/RichTextRenderer.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Icon from '@iconify/svelte';

	let { data } = $props();
	const { post } = data;

	/**
	 * Extracts the first paragraph of text from TipTap JSON to use as a meta description.
	 */
	function getExcerpt(richText) {
		if (!richText?.content) return '';
		const paragraph = richText.content.find((node) => node.type === 'paragraph');
		const text = paragraph?.content?.map(c => c.text).join('') || '';
		return text.substring(0, 155) || '';
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

<!-- Cinematic Header using the Featured Image -->
<PageHeader 
	title={post.title}
	subtitle={seoDescription}
	backgroundImage={post.featuredImage}
/>

<div class="relative z-10 bg-light py-20">
	<div class="mx-auto max-w-3xl px-8">
		
		<!-- Metadata Bar -->
		<div class="mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-main/10 pb-8 text-sm text-main/60">
			<div class="flex items-center gap-6">
				<div class="flex items-center gap-2">
					<div class="flex h-8 w-8 items-center justify-center rounded-full bg-main/5">
						<Icon icon="mdi:account" class="text-main/60" />
					</div>
					<span class="font-bold text-main">{post.author.username}</span>
				</div>
				<div class="flex items-center gap-2">
					<Icon icon="mdi:calendar" />
					<span>{new Date(post.publishedAt).toLocaleDateString()}</span>
				</div>
			</div>

			{#if post.categories.length > 0}
				<div class="flex gap-2">
					{#each post.categories as postCategory}
						<a
							href={`/blog/category/${postCategory.category.slug}`}
							class="rounded-full bg-accent/10 px-3 py-1 font-bold text-accent hover:bg-accent/20 transition-colors"
						>
							{postCategory.category.name}
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Main Content -->
		<article class="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-main prose-p:text-main/80 prose-a:text-accent prose-img:rounded-xl prose-img:shadow-lg">
			<RichTextRenderer content={post.contentJson} />
		</article>

		<!-- Article Footer -->
		<div class="mt-16 border-t border-main/10 pt-8">
			<div class="flex flex-col items-center justify-between gap-6 sm:flex-row">
				<div class="text-center sm:text-left">
					<p class="text-xs font-bold uppercase tracking-widest text-main/40">Share this article</p>
					<div class="mt-2 flex gap-4">
						<!-- Mock Share Buttons -->
						<button class="text-main/60 hover:text-[#0A66C2] transition-colors" aria-label="Share on LinkedIn">
							<Icon icon="mdi:linkedin" width="24" />
						</button>
						<button class="text-main/60 hover:text-black transition-colors" aria-label="Share on X">
							<Icon icon="mdi:twitter" width="24" />
						</button>
						<button class="text-main/60 hover:text-[#1877F2] transition-colors" aria-label="Share on Facebook">
							<Icon icon="mdi:facebook" width="24" />
						</button>
						<button 
							class="text-main/60 hover:text-main transition-colors" 
							aria-label="Copy Link"
							onclick={() => navigator.clipboard.writeText(window.location.href)}
						>
							<Icon icon="mdi:link-variant" width="24" />
						</button>
					</div>
				</div>

				<a
					href="/blog"
					class="group inline-flex items-center gap-2 rounded-md border border-main/10 px-6 py-3 text-sm font-bold text-main transition hover:border-accent hover:text-accent"
				>
					<Icon icon="mdi:arrow-left" class="transition-transform group-hover:-translate-x-1" />
					Back to Blog
				</a>
			</div>
		</div>

	</div>
</div>