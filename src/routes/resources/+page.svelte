<script>
	import { page } from '$app/stores';

	let { data } = $props();
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Resources</h1>
			<p class="mx-auto mt-4 max-w-2xl text-lg leading-8 text-main/70">
				Explore our in-depth case studies and company brochure to learn more about our impact
			</p>
		</div>

		{#if $page.data.settings?.brochureUrl}
			<div class="mt-16">
				<div class="rounded-xl bg-main p-8 text-center sm:p-16">
					<h2 class="text-3xl font-bold tracking-tight text-light sm:text-4xl">
						Our Company Brochure
					</h2>
					<p class="mx-auto mt-4 max-w-2xl text-center text-lg text-light/70">
						Get a comprehensive overview of our solutions, technology, and proven results in a single
						download.
					</p>
					<div class="mt-10">
						<a
							href={$page.data.settings.brochureUrl}
							target="_blank"
							class="rounded-md bg-accent px-6 py-3 font-bold text-main shadow-lg shadow-accent/30 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/40"
						>
							Download PDF
						</a>
					</div>
				</div>
			</div>
		{/if}

		<div class="mt-20">
			<h2 class="text-center text-3xl font-bold tracking-tight text-main sm:text-4xl">
				Case Studies
			</h2>
			<div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each data.caseStudies as cs}
					<a href={`/case-studies/${cs.slug}`} class="corner-border block">
						<blockquote class="italic text-main/80">
							"{cs.results[0]?.kpiValue || 'Significant'}" {cs.results[0]?.kpiName || 'Improvements'}
						</blockquote>
						<cite class="mt-4 block font-bold not-italic text-accent drop-shadow-accent-glow">
							- {cs.client?.name || 'A Valued Partner'}
						</cite>
						<p class="mt-2 text-sm text-main/60">{cs.title}</p>
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>
