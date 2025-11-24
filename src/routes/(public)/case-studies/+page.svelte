<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Icon from '@iconify/svelte';
	import CountUp from '$lib/components/CountUp.svelte';

	export let data;
</script>

<PageHeader 
	title="Proven Results"
	subtitle="Real-world impact. See how we've delivered measurable gains in safety and profitability for our partners."
/>

<div class="relative z-10 bg-light py-24">
	<div class="mx-auto max-w-7xl px-8">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each data.caseStudies as caseStudy}
				<a href={`/case-studies/${caseStudy.slug}`} class="group relative flex flex-col overflow-hidden rounded-2xl bg-main text-light shadow-xl transition-all duration-500 hover:-translate-y-2">
					
					<!-- Tech Background Pattern -->
					<div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:24px_24px]"></div>
					<div class="absolute inset-0 bg-gradient-to-b from-transparent to-main/90"></div>

					<div class="relative p-8 flex flex-1 flex-col">
						<!-- Client Logo Placeholder / Name -->
						<div class="mb-6 flex items-center gap-3 text-accent">
							<Icon icon="mdi:domain" width="24" />
							<span class="font-bold uppercase tracking-wider text-sm">{caseStudy.client?.name}</span>
						</div>

						<h3 class="text-2xl font-bold leading-tight mb-6 group-hover:text-accent transition-colors">
							{caseStudy.title}
						</h3>

						<!-- Key Stat Highlight -->
						<div class="mt-auto border-t border-white/10 pt-6">
							{#if caseStudy.results[0]}
								<p class="text-xs uppercase tracking-widest text-light/50 mb-1">Key Result</p>
								<div class="text-4xl font-bold text-accent drop-shadow-accent-glow">
									<CountUp value={caseStudy.results[0].kpiValue} />
								</div>
								<p class="text-sm text-light/80">{caseStudy.results[0].kpiName}</p>
							{:else}
								<span class="text-sm font-bold text-accent flex items-center gap-2">
									Read Case Study <Icon icon="mdi:arrow-right" />
								</span>
							{/if}
						</div>
					</div>

					<!-- Hover Techlines -->
					<div class="absolute top-0 left-0 h-full w-full pointer-events-none">
						<div class="absolute top-4 left-4 h-4 w-4 border-t-2 border-l-2 border-accent/0 transition-all duration-300 group-hover:border-accent"></div>
						<div class="absolute bottom-4 right-4 h-4 w-4 border-b-2 border-r-2 border-accent/0 transition-all duration-300 group-hover:border-accent"></div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</div>