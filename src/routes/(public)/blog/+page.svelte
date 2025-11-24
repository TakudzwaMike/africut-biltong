<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Image from '$lib/components/Image.svelte';
	import Icon from '@iconify/svelte';

	let { data } = $props();

	function getExcerpt(richText) {
		if (!richText?.content) return '';
		const paragraph = richText.content.find((node) => node.type === 'paragraph');
		if (!paragraph?.content) return '';
		return paragraph.content.map((node) => node.text).join('').substring(0, 120) + '...';
	}
</script>

<PageHeader 
	title="Latest Insights"
	subtitle="Trends, analysis, and news from the heavy industry tech sector."
/>

<div class="relative z-10 bg-slate-50 py-24">
	<div class="mx-auto max-w-7xl px-8">
		{#if data.posts.length > 0}
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each data.posts as post}
					<a href={`/blog/${post.slug}`} class="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
						<!-- Image -->
						<div class="aspect-[16/9] overflow-hidden bg-main/5 relative">
							{#if post.featuredImage}
								<Image
									src={post.featuredImage.displayUrl || post.featuredImage.originalUrl}
									alt={post.featuredImage.altText}
									aspectRatio="16/9"
									class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
								/>
							{/if}
							<div class="absolute top-4 left-4">
								{#if post.categories.length > 0}
									<span class="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-main backdrop-blur-md shadow-sm">
										{post.categories[0].category.name}
									</span>
								{/if}
							</div>
						</div>

						<!-- Content -->
						<div class="p-6 flex flex-1 flex-col">
							<div class="flex items-center gap-2 text-xs font-medium text-main/50 mb-3">
								<Icon icon="mdi:calendar" />
								<span>{new Date(post.publishedAt).toLocaleDateString()}</span>
								<span>•</span>
								<span>{post.author.username}</span>
							</div>
							
							<h3 class="text-xl font-bold text-main mb-3 group-hover:text-accent transition-colors line-clamp-2">
								{post.title}
							</h3>
							
							<p class="text-sm text-main/70 line-clamp-3 mb-6 flex-1 leading-relaxed">
								{getExcerpt(post.contentJson)}
							</p>
							
							<div class="flex items-center gap-2 text-sm font-bold text-main group-hover:text-accent transition-colors">
								Read Article <Icon icon="mdi:arrow-right" class="transition-transform group-hover:translate-x-1" />
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center py-20 text-center">
				<div class="rounded-full bg-main/5 p-6 mb-4">
					<Icon icon="mdi:newspaper-variant-outline" width="48" class="text-main/40" />
				</div>
				<h3 class="text-lg font-bold text-main">No posts found</h3>
				<p class="text-main/60 mt-2">Check back later for updates.</p>
			</div>
		{/if}
	</div>
</div>