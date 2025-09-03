<script>
	import Hero from '$lib/components/Hero.svelte';
	import CaseStudyHighlights from '$lib/components/CaseStudyHighlights.svelte';
	import SolutionsOverview from '$lib/components/SolutionsOverview.svelte';
	import Image from '$lib/components/Image.svelte';

	let { data } = $props();

	// Correct Svelte 5 syntax for a derived reactive value
	let technology = $derived(data.content?.technology);
	let heroContent = $derived(data.content?.hero);

	/**
	 * Extracts the first paragraph of text from a TipTap JSON object.
	 * @param {object | null | undefined} richText
	 * @returns {string}
	 */
	function getExcerpt(richText) {
		if (!richText?.content) return '';
		const paragraph = richText.content.find((node) => node.type === 'paragraph');
		if (!paragraph?.content) return '';
		return paragraph.content.map((node) => node.text).join('') + '...';
	}
</script>

<!-- Section 1: Hero -->
{#if heroContent}
	<Hero content={heroContent} videoUrl={data.settings?.heroVideoUrl} />
{/if}

<!-- Section 2: Trust Bar (Dynamic) -->
{#if data.clients.length > 0}
	<div class="bg-light py-16 text-center">
		<div class="mx-auto max-w-6xl px-8">
			<h3 class="text-sm font-bold uppercase tracking-widest text-main/60">
				Trusted by Industry Leaders
			</h3>
			<div class="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
				{#each data.clients as client}
					{#if client.logo}
						<img
							src={client.logo.thumbnailUrl || client.logo.originalUrl}
							alt={client.logo.altText}
							title={client.name}
							class="h-10 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0 sm:h-12"
						/>
					{/if}
				{/each}
			</div>
		</div>
	</div>
{/if}

<!-- Section 3: Solutions Overview -->
<SolutionsOverview solutions={data.solutions} content={data.content?.solutions_overview} />

<!-- Section 4: Proven Results (Dynamic) -->
<CaseStudyHighlights caseStudies={data.caseStudies} />

<!-- Section 5: Technology Section -->
<section class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		{#if technology}
			<div class="grid items-center gap-12 md:grid-cols-2">
				<div class="text-center md:text-left">
					<h2 class="text-3xl font-bold tracking-tight text-main sm:text-4xl">
						{technology.title}
					</h2>
					<p class="mx-auto mt-6 max-w-3xl text-lg leading-8 text-main/70">
						{technology.text}
					</p>
					<div class="mt-10">
						<a
							href="/about"
							class="font-bold text-accent transition hover:drop-shadow-accent-glow"
							>Discover Our Technology →</a
						>
					</div>
				</div>
				{#if technology.media}
					<Image
						src={technology.media.displayUrl || technology.media.originalUrl}
						alt={technology.media.altText}
						aspectRatio="1/1"
						class="rounded-xl"
					/>
				{/if}
			</div>
		{/if}
	</div>
</section>

<!-- Section 6: Blog Highlights -->
<section id="blog-highlights" class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<div class="text-center">
			<h2 class="text-3xl font-bold tracking-tight text-main sm:text-4xl">Latest Insights</h2>
			<p class="mx-auto mt-4 max-w-2xl text-lg leading-8 text-main/70">
				Explore our latest articles and findings on the intersection of AI and heavy industry.
			</p>
		</div>
		<div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
			{#each data.posts as post}
				<a href={`/blog/${post.slug}`} class="corner-border group block">
					{#if post.featuredImage}
						<Image
							src={post.featuredImage.displayUrl || post.featuredImage.originalUrl}
							alt={post.featuredImage.altText}
							aspectRatio="16/9"
							class="mb-6 rounded-md transition-transform duration-300 group-hover:scale-105"
						/>
					{/if}
					<h3 class="text-xl font-bold">{post.title}</h3>
					<p class="mt-2 text-sm text-main/70">
						{getExcerpt(post.contentJson)}
					</p>
					<cite class="mt-4 block text-sm font-bold not-italic text-accent drop-shadow-accent-glow">
						Read More →
					</cite>
				</a>
			{/each}
		</div>
		<div class="mt-16 text-center">
			<a href="/blog" class="font-bold text-accent transition hover:drop-shadow-accent-glow"
				>Visit The Blog →</a
			>
		</div>
	</div>
</section>

<!-- Section 7: Final CTA -->
<section class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 pb-20 sm:pb-24">
		<div class="rounded-xl bg-main p-8 text-center sm:p-16">
			<h2 class="text-3xl font-bold tracking-tight text-light sm:text-4xl">
				Ready to See Your Data in a New Light?
			</h2>
			<p class="mx-auto mt-4 max-w-2xl text-center text-lg text-light/70">
				Let's schedule a brief call to discuss your operation's unique challenges. We can provide a
				personalized demo to show you exactly how Vision AI Tech can drive value for your business.
			</p>
			<div class="mt-10">
				<a
					href="/contact"
					class="rounded-md bg-accent px-6 py-3 font-bold text-main shadow-lg shadow-accent/30 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/40"
				>
					Book a Consultation
				</a>
			</div>
		</div>
	</div>
</section>