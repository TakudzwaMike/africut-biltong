<script>
	import CountUp from '$lib/components/CountUp.svelte';

	/**
	 * @type {any[]}
	 */
	let { caseStudies = [] } = $props();
</script>

{#if caseStudies.length > 0}
	<section id="case-studies" class="relative z-10">
		<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
			<div>
				<h2 class="text-center text-3xl font-bold tracking-tight text-main sm:text-4xl">
					Proven Results in Heavy Industry
				</h2>
				<div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
					{#each caseStudies as caseStudy}
						<a href={`/case-studies/${caseStudy.slug}`} class="corner-border block group">
							<div class="min-h-[120px] flex flex-col justify-center">
								{#if caseStudy.results[0]}
									<div class="text-4xl font-bold text-accent drop-shadow-accent-glow mb-2">
										<CountUp value={caseStudy.results[0].kpiValue} />
									</div>
									<p class="font-medium text-main/80 uppercase tracking-wide text-sm">
										{caseStudy.results[0].kpiName}
									</p>
								{:else}
									<blockquote class="italic text-main/80">
										"Significant Improvements"
									</blockquote>
								{/if}
							</div>
							
							<div class="mt-6 pt-6 border-t border-main/10">
								<cite class="block font-bold not-italic text-main">
									{caseStudy.client?.name || 'A Valued Partner'}
								</cite>
								<p class="mt-1 text-sm text-main/60 transition-colors group-hover:text-accent">
									{caseStudy.title} →
								</p>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</div>
	</section>
{/if}