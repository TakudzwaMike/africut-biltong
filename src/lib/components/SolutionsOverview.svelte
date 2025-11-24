<script>
	import { viewport } from '$lib/actions/viewport.js';
	import Image from './Image.svelte';
	import Icon from '@iconify/svelte';

	let { solutions = [], content } = $props();
	let isVisible = $state(false);
</script>

<section id="solutions-overview" class="relative z-10 bg-slate-50">
	<div class="mx-auto max-w-7xl px-8 py-24 sm:py-32">
		<div
			class="fade-in"
			class:is-visible={isVisible}
			use:viewport={{ onEnter: () => (isVisible = true), threshold: 0.1 }}
		> 
			<div class="text-center max-w-3xl mx-auto mb-16">
				<h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
					{content?.title || 'Our Solutions'}
				</h2>
				<p class="mt-6 text-lg leading-8 text-slate-600">
					{content?.text || 'Comprehensive AI modules designed for the unique challenges of mining and construction.'}
				</p>
			</div>

			{#if solutions.length > 0}
				<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
					{#each solutions as solution}
						<a href={`/solutions/${solution.slug}`} class="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
							<!-- Image Container -->
							<div class="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
								{#if solution.featuredImage}
									<Image
										src={solution.featuredImage.displayUrl || solution.featuredImage.originalUrl}
										alt={solution.featuredImage.altText}
										aspectRatio="16/10"
										class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
									/>
								{:else}
									<div class="flex h-full w-full items-center justify-center">
										<Icon icon="mdi:cube-scan" class="text-slate-300" width="64" />
									</div>
								{/if}
								
								<!-- Tech Scan Overlay (Appears on Hover) -->
								<div class="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
									<!-- Subtle Grid Pattern -->
									<div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
									<!-- Darken slightly so scan lines pop -->
									<div class="absolute inset-0 bg-main/10"></div>
								</div>

								<!-- Animated Tech Brackets (The "Techlines") -->
								<!-- Top Left -->
								<div class="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-white/70 transition-all duration-300 group-hover:h-12 group-hover:w-12 group-hover:border-accent"></div>
								<!-- Bottom Right -->
								<div class="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-white/70 transition-all duration-300 group-hover:h-12 group-hover:w-12 group-hover:border-accent"></div>
								
								<!-- Center Crosshair (Fades in) -->
								<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
									<Icon icon="mdi:plus" class="text-accent/80" width="32" />
								</div>
							</div>

							<!-- Content -->
							<div class="flex flex-1 flex-col p-8">
								<h3 class="text-xl font-bold text-slate-900 group-hover:text-accent transition-colors">
									{solution.solutionName}
								</h3>
								<p class="mt-3 flex-1 text-base leading-relaxed text-slate-600">
									{solution.shortDescription}
								</p>
								<div class="mt-6 flex items-center gap-2 text-sm font-bold text-accent uppercase tracking-wide">
									<span>Explore Solution</span>
									<Icon icon="mdi:arrow-right" width="16" class="transition-transform group-hover:translate-x-1" />
								</div>
							</div>
						</a>
					{/each}
				</div>

				<div class="mt-16 text-center">
					<a
						href="/solutions"
						class="inline-flex items-center gap-2 rounded-md border-2 border-slate-900 px-8 py-3 font-bold text-slate-900 transition hover:bg-slate-900 hover:text-white"
					>
						View All Solutions
						<Icon icon="mdi:grid" width="20" />
					</a>
				</div>
			{/if}
		</div>
	</div>
</section>