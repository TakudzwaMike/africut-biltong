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
			<p class="font-bold text-accent drop-shadow-accent-glow">Blog Category</p>
			<h1 class="mt-2 text-4xl font-bold tracking-tight text-main sm:text-5xl">
				{data.category.name}
			</h1>
		</div>
		<div class="mt-16 space-y-12">
			{#each data.posts as post}
				<a href={`/blog/${post.slug}`} class="corner-border block">
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
					<p class="text-main/70">No posts found in this category.</p>
				</div>
			{/each}
		</div>

		<div class="mt-16 border-t border-main/10 pt-8 text-center">
			<a href="/blog" class="font-bold text-accent transition hover:drop-shadow-accent-glow"
				>← Back to All Posts</a
			>
		</div>
	</div>
</div>