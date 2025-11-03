<script>
	import { viewport } from '$lib/actions/viewport.js';
	import Image from './Image.svelte';

	let { solutions = [], content } = $props();
	let isVisible = $state(false);
</script>

<section id="solutions-overview" class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<div
			class="fade-in"
			class:is-visible={isVisible}
			use:viewport={{ onEnter: () => (isVisible = true), threshold: 0.1 }}
		>

			<h2 class="text-3xl font-bold tracking-tight text-main sm:text-4xl">Our Solutions</h2>
			{#if content}
				<h2 class="text-center text-3xl font-bold tracking-tight text-main sm:text-4xl">
					{content.title}
				</h2>
				<p class="mx-auto mt-4 max-w-3xl text-center text-lg leading-8 text-main/70">
					{content.text}
				</p>
			{/if}

			{#if solutions.length > 0}
				<div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
					{#each solutions as solution}
						<a href={`/solutions/${solution.slug}`} class="corner-border group block">
							{#if solution.featuredImage}
								<Image
									src={solution.featuredImage.displayUrl || solution.featuredImage.originalUrl}
									alt={solution.featuredImage.altText}
									aspectRatio="16/9"
									class="mb-6 rounded-md transition-transform duration-300 group-hover:scale-105"
								/>
							{/if}
							<h3 class="text-xl font-bold">{solution.solutionName}</h3>
							<p class="mt-2 text-main/70">
								{solution.shortDescription}
							</p>
						</a>
					{/each}
				</div>
				<div class="mt-16 text-center">
					<a
						href="/solutions"
						class="rounded-md bg-main px-6 py-3 font-bold text-light shadow-lg transition hover:-translate-y-1"
					>
						Explore All Solutions
					</a>
				</div>
			{/if}
		</div>
	</div>
</section>