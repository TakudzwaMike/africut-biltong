<script>
	import Hero from '$lib/components/Hero.svelte';
	import CaseStudyHighlights from '$lib/components/CaseStudyHighlights.svelte';
	import SolutionsOverview from '$lib/components/SolutionsOverview.svelte';
	import Image from '$lib/components/Image.svelte';
	import Icon from '@iconify/svelte';

	let { data } = $props();

	let technology = $derived(data.content?.technology);
	let heroContent = $derived(data.content?.hero);

	function getExcerpt(richText) {
		if (!richText?.content) return '';
		const paragraph = richText.content.find((node) => node.type === 'paragraph');
		if (!paragraph?.content) return '';
		return paragraph.content.map((node) => node.text).join('').substring(0, 120) + '...';
	}
</script>

{#if heroContent}
	<Hero content={heroContent} videoUrl={data.settings?.heroVideoUrl} />
{/if}

<!-- Client Strip -->
{#if data.clients.length > 0}
	<div class="relative z-20 -mt-8 mx-auto max-w-6xl px-4">
		<div class="rounded-xl bg-light shadow-xl border-t-4 border-accent p-8 md:p-10">
			<p class="text-center text-xs font-bold uppercase tracking-widest text-main/40 mb-6">
				Trusted by Industry Leaders
			</p>
			<div class="flex flex-wrap items-center justify-center gap-x-16 gap-y-10 opacity-80">
				{#each data.clients as client}
					{#if client.logo}
						<img
							src={client.logo.thumbnailUrl || client.logo.originalUrl}
							alt={client.logo.altText}
							title={client.name}
							class="h-8 w-auto object-contain grayscale transition hover:grayscale-0 sm:h-10"
						/>
					{/if}
				{/each}
			</div>
		</div>
	</div>
{/if}

<SolutionsOverview solutions={data.solutions} content={data.content?.solutions_overview} />

<!-- Technology Section -->
<section class="relative z-10 overflow-hidden bg-main text-light py-24 sm:py-32">
	<!-- Background pattern -->
	<div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#C0D532 1px, transparent 1px); background-size: 24px 24px;"></div>
	
	<div class="relative mx-auto max-w-7xl px-8">
		{#if technology}
			<div class="grid items-center gap-16 lg:grid-cols-2">
				<div class="order-2 lg:order-1">
					<div class="inline-block rounded-full bg-accent/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-accent mb-6">
						Our Technology
					</div>
					<h2 class="text-3xl font-bold tracking-tight sm:text-5xl mb-6">
						{technology.title}
					</h2>
					<p class="text-lg leading-relaxed text-light/70 mb-8">
						{technology.text}
					</p>
					
					<div class="flex flex-col gap-4 sm:flex-row">
						<div class="flex items-center gap-3 rounded-lg bg-white/5 p-4 backdrop-blur-sm">
							<Icon icon="mdi:shield-check" class="text-accent" width="32" />
							<div>
								<p class="font-bold">Safety First</p>
								<p class="text-xs text-light/60">ISO Compliant</p>
							</div>
						</div>
						<div class="flex items-center gap-3 rounded-lg bg-white/5 p-4 backdrop-blur-sm">
							<Icon icon="mdi:server-network" class="text-accent" width="32" />
							<div>
								<p class="font-bold">Edge Computing</p>
								<p class="text-xs text-light/60">Low Latency</p>
							</div>
						</div>
					</div>

					<div class="mt-10">
						<a href="/about" class="font-bold text-accent hover:text-white transition-colors flex items-center gap-2">
							Discover Our Approach <Icon icon="mdi:arrow-right" />
						</a>
					</div>
				</div>
				
				<div class="order-1 lg:order-2 relative">
					<div class="absolute -inset-4 bg-accent/20 blur-2xl rounded-full"></div>
					{#if technology.media}
						<div class="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
							<Image
								src={technology.media.displayUrl || technology.media.originalUrl}
								alt={technology.media.altText}
								aspectRatio="4/3"
								class="w-full"
							/>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</section>

<CaseStudyHighlights caseStudies={data.caseStudies} />

<!-- Blog Highlights -->
<section id="blog-highlights" class="relative z-10 bg-light/50 py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-8">
		<div class="flex items-end justify-between mb-12">
			<div class="max-w-2xl">
				<h2 class="text-3xl font-bold tracking-tight text-main sm:text-4xl">Latest Insights</h2>
				<p class="mt-4 text-lg text-main/70">
					Trends, analysis, and news from the heavy industry tech sector.
				</p>
			</div>
			<a href="/blog" class="hidden md:flex items-center gap-2 font-bold text-accent hover:text-main transition-colors">
				View All Posts <Icon icon="mdi:arrow-right" />
			</a>
		</div>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			{#each data.posts as post}
				<a href={`/blog/${post.slug}`} class="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
					<div class="aspect-[16/9] overflow-hidden bg-main/5">
						{#if post.featuredImage}
							<Image
								src={post.featuredImage.displayUrl || post.featuredImage.originalUrl}
								alt={post.featuredImage.altText}
								aspectRatio="16/9"
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>
						{/if}
					</div>
					<div class="p-6 flex flex-1 flex-col">
						<p class="text-xs font-bold text-accent mb-2">{new Date(post.publishedAt).toLocaleDateString()}</p>
						<h3 class="text-lg font-bold text-main mb-3 group-hover:text-accent transition-colors line-clamp-2">
							{post.title}
						</h3>
						<p class="text-sm text-main/70 line-clamp-3 mb-4 flex-1">
							{getExcerpt(post.contentJson)}
						</p>
						<span class="text-sm font-bold text-main group-hover:text-accent">Read Article →</span>
					</div>
				</a>
			{/each}
		</div>
		
		<div class="mt-8 text-center md:hidden">
			<a href="/blog" class="font-bold text-accent">View All Posts →</a>
		</div>
	</div>
</section>

<!-- CTA -->
<section class="relative z-10 py-24">
	<div class="mx-auto max-w-5xl px-8">
		<div class="relative overflow-hidden rounded-2xl bg-main px-6 py-16 shadow-2xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
			<!-- Decorative Background -->
			<div class="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
			<div class="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>

			<div class="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-24 lg:text-left relative z-10">
				<h2 class="text-3xl font-bold tracking-tight text-light sm:text-4xl">
					Ready to optimize your operations?
				</h2>
				<p class="mt-6 text-lg leading-8 text-light/80">
					Schedule a consultation with our engineering team. We'll demonstrate how Vision AI can reduce costs and improve safety on your site.
				</p>
				<div class="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
					<a
						href="/contact"
						class="rounded-md bg-accent px-6 py-3 font-bold text-main shadow-lg hover:bg-white transition-colors"
					>
						Book Consultation
					</a>
					<a href="/solutions" class="text-sm font-bold leading-6 text-white hover:text-accent transition-colors">
						Explore Solutions <span aria-hidden="true">→</span>
					</a>
				</div>
			</div>
		</div>
	</div>
</section>