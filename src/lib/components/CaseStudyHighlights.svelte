<script>
	/**
	 * @type {any[]}
	 */
	export let caseStudies = [];
</script>

<section id="case-studies" class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<div>
			<h2 class="text-center text-3xl font-bold tracking-tight text-main sm:text-4xl">
				Proven Results in Heavy Industry
			</h2>
			<div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
				{#each caseStudies as caseStudy}
					<a href={`/case-studies/${caseStudy.slug}`} class="corner-border block">
						<blockquote class="italic text-main/80">
							<!-- Displaying the first 'result' as a highlight -->
                             {caseStudy.results[0]?.kpiName || 'Improvements'}
							"{caseStudy.results[0]?.kpiValue || 'Significant'}"
						</blockquote>
						<cite class="mt-4 block font-bold not-italic text-accent drop-shadow-accent-glow">
							- {caseStudy.clientName}
						</cite>
                        <p class="mt-2 text-sm text-main/60">{caseStudy.title}</p>
					</a>
				{/each}
			</div>
		</div>
	</div>
</section>