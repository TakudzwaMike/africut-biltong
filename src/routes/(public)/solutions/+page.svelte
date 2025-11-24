<script>
	import Image from '$lib/components/Image.svelte';
	export let data;
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<div class="text-center mb-20">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Our Solutions</h1>
			<p class="mx-auto mt-4 max-w-2xl text-lg leading-8 text-main/70">
				A suite of AI-powered modules designed to tackle your most critical operational challenges.
			</p>
		</div>

		<div class="space-y-24">
			{#each data.solutions as solution, i}
				<div class="flex flex-col gap-12 md:items-center {i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'}">
					<!-- Image Side -->
					<div class="flex-1">
						<a href={`/solutions/${solution.slug}`} class="block group overflow-hidden rounded-xl shadow-xl">
							{#if solution.featuredImage}
								<Image
									src={solution.featuredImage.displayUrl || solution.featuredImage.originalUrl}
									alt={solution.featuredImage.altText}
									aspectRatio="4/3"
									class="w-full transition-transform duration-700 group-hover:scale-105"
								/>
							{:else}
								<div class="flex aspect-[4/3] w-full items-center justify-center bg-main/5">
									<span class="text-main/40">No Image Available</span>
								</div>
							{/if}
						</a>
					</div>

					<!-- Content Side -->
					<div class="flex-1">
						<h2 class="text-3xl font-bold text-main">{solution.solutionName}</h2>
						<p class="mt-4 text-lg leading-relaxed text-main/70">
							{solution.shortDescription}
						</p>
						<div class="mt-8">
							<a 
								href={`/solutions/${solution.slug}`} 
								class="inline-flex items-center font-bold text-accent text-lg transition-all hover:gap-2 hover:drop-shadow-accent-glow"
							>
								Explore Solution
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>