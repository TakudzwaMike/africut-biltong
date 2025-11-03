<script>
	let { data } = $props();

	function getExcerpt(richText) {
		if (!richText?.content) return '';
		const paragraph = richText.content.find((node) => node.type === 'paragraph');
		if (!paragraph?.content) return '';
		return paragraph.content.map((node) => node.text).join('') + '...';
	}
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-4xl px-8 py-20 sm:py-24">
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Our Blog</h1>
			<p class="mx-auto mt-4 max-w-2xl text-lg leading-8 text-main/70">
				Insights, articles, and updates on AI in the heavy industry sector.
			</p>
		</div>
		<div class="mt-16 space-y-12">
			{#each data.posts as post}
				<a href={`/blog/${post.slug}`} class="corner-border block">
					{#if post.categories.length > 0}
						<div class="mb-4 flex flex-wrap gap-2">
							{#each post.categories as postCategory}
								<a
									href={`/blog/category/${postCategory.category.slug}`}
									class="rounded-full bg-main/10 px-2 py-0.5 text-xs font-semibold text-main/80 transition hover:bg-main/20"
								>
									{postCategory.category.name}
								</a>
							{/each}
						</div>
					{/if}
					<div class="flex items-center justify-between text-sm text-main/60">
						<span>By {post.author.username}</span>
						<span>{new Date(post.publishedAt).toLocaleDateString()}</span>
					</div>
					<h2 class="mt-4 text-2xl font-bold text-main">{post.title}</h2>
					<p class="mt-2 text-main/80">
						{getExcerpt(post.contentJson)}
					</p>
					<span class="mt-4 block font-bold text-accent transition hover:drop-shadow-accent-glow"
						>Read More →</span
					>
				</a>
			{:else}
				<div class="rounded-xl border border-dashed border-main/20 p-12 text-center">
					<p class="text-main/70">No blog posts have been published yet. Check back soon!</p>
				</div>
			{/each}
		</div>
	</div>
</div>