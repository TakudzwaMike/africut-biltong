<script>
	import RichTextRenderer from "$lib/components/RichTextRenderer.svelte";
	import Seo from "$lib/components/Seo.svelte";
	import CountUp from "$lib/components/CountUp.svelte";
	import Icon from "@iconify/svelte";

	/** @type {import('./$types').PageData} */
	let { data } = $props();
	const { caseStudy } = data;

	function handlePrint() {
		window.print();
	}
</script>

<Seo
	title={`${caseStudy.title} | Vision AI Tech Case Study`}
	description={`Read our case study with ${caseStudy.client?.name} on ${caseStudy.title.toLowerCase()}.`}
/>
<div class="relative z-10 print:bg-white print:text-black">
	<div class="mx-auto max-w-4xl px-8 py-20 sm:py-24 print:px-0 print:py-0">
		<!-- Print Header (Only visible when printing) -->
		<div
			class="hidden print:mb-8 print:block border-b border-black/10 pb-4"
		>
			<div class="flex items-center justify-between">
				<h1 class="text-xl font-bold">Vision AI Tech</h1>
				<span class="text-sm text-gray-500">Case Study Report</span>
			</div>
		</div>

		<!-- Screen Header -->
		<div class="text-center print:text-left">
			<div
				class="flex items-center justify-center gap-2 print:justify-start"
			>
				<p
					class="font-bold text-accent drop-shadow-accent-glow print:text-black print:drop-shadow-none"
				>
					Case Study: {caseStudy.client?.name || "A Valued Partner"}
				</p>
			</div>
			<h1
				class="mt-2 text-4xl font-bold tracking-tight text-main sm:text-5xl print:text-black print:text-3xl"
			>
				{caseStudy.title}
			</h1>

			<!-- Download Button (Hidden in Print) -->
			<div class="mt-8 print:hidden">
				<button
					onclick={handlePrint}
					class="inline-flex items-center gap-2 rounded-md bg-main px-4 py-2 text-sm font-bold text-light transition hover:bg-main/90"
				>
					<Icon icon="mdi:printer" width="20" />
					Download / Print Report
				</button>
			</div>
		</div>

		<!-- Body -->
		<div class="mt-16 space-y-12 print:mt-8 print:space-y-8">
			<!-- Key Results (Moved to top for Print impact) -->
			<div
				class="rounded-xl bg-main p-8 text-center shadow-xl print:border print:border-black/10 print:bg-white print:p-4 print:shadow-none print:text-left"
			>
				<h3
					class="text-2xl font-bold text-light print:text-black print:text-xl"
				>
					Key Results
				</h3>
				<div
					class="mt-6 flex flex-wrap justify-center gap-12 print:justify-start print:gap-8"
				>
					{#each caseStudy.results as result}
						<div class="text-light print:text-black">
							<!-- Note: CountUp animation might not show in static print, so we render static text for print if needed, 
							     but browsers usually render the final state of the DOM. -->
							<div
								class="text-5xl font-bold text-accent drop-shadow-accent-glow print:text-3xl print:text-black print:drop-shadow-none"
							>
								{result.kpiValue}
							</div>
							<p
								class="mt-2 font-medium text-light/80 text-lg print:text-sm print:text-gray-600"
							>
								{result.kpiName}
							</p>
						</div>
					{/each}
				</div>
			</div>

			<div
				class="corner-border bg-light/50 backdrop-blur-sm print:bg-transparent print:p-0 print:shadow-none print:border-none"
			>
				<h2
					class="text-2xl font-bold text-main mb-4 print:text-black print:text-xl print:border-b print:border-black/20 print:pb-2"
				>
					The Challenge
				</h2>
				<div class="print:text-sm print:leading-relaxed">
					<RichTextRenderer content={caseStudy.challenge} />
				</div>
			</div>

			<div
				class="corner-border bg-light/50 backdrop-blur-sm print:bg-transparent print:p-0 print:shadow-none print:border-none"
			>
				<h2
					class="text-2xl font-bold text-main mb-4 print:text-black print:text-xl print:border-b print:border-black/20 print:pb-2"
				>
					Our Solution
				</h2>
				<div class="print:text-sm print:leading-relaxed">
					<RichTextRenderer content={caseStudy.solution} />
				</div>
			</div>
		</div>

		<!-- Print Footer -->
		<div
			class="hidden print:mt-16 print:block print:border-t print:border-black/10 print:pt-4 print:text-center print:text-xs print:text-gray-500"
		>
			<p>
				© {new Date().getFullYear()} Vision AI Tech. All rights reserved.
			</p>
			<p>www.vision-ai.tech</p>
		</div>
	</div>
</div>

<style>
	@media print {
		/* Hide global layout elements defined in +layout.svelte */
		:global(header),
		:global(footer),
		:global(canvas),
		:global(.toast-container),
		:global(.fixed) {
			display: none !important;
		}

		:global(body) {
			background-color: white !important;
			color: black !important;
		}

		/* Ensure corners don't print weirdly */
		:global(.corner-border::before),
		:global(.corner-border::after) {
			display: none !important;
		}

		:global(.corner-border) {
			padding: 0 !important;
			border: none !important;
		}
	}
</style>
