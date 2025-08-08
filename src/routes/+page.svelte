<script>
	import Hero from '$lib/components/Hero.svelte';
	import CaseStudyHighlights from '$lib/components/CaseStudyHighlights.svelte';
	import SolutionsOverview from '$lib/components/SolutionsOverview.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
</script>

<!-- Section 1: Hero -->
<Hero />

<!-- Section 2: Trust Bar (simple version) -->
<div class="bg-light py-8 text-center">
	<h3 class="text-sm font-bold uppercase tracking-widest text-main/60">
		Trusted by Industry Leaders
	</h3>
	<!-- In the future, you can add client logos here -->
</div>

<!-- Section 3: Solutions Overview -->
<SolutionsOverview />

<!-- Section 4: Proven Results (Dynamic) -->
<CaseStudyHighlights caseStudies={data.caseStudies} />

<!-- Section 5: Technology Teaser -->
<section class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24 text-center">
		<h2 class="text-3xl font-bold tracking-tight text-main sm:text-4xl">
			Built on a Foundation of Data and Trust
		</h2>
		<p class="mx-auto mt-6 max-w-3xl text-lg leading-8 text-main/70">
			Our systems are engineered for reliability and precision. We leverage advanced AI and computer
			vision to detect unsafe conditions, predict equipment failure, and enable autonomous
			navigation. By processing your existing data streams securely, we deliver insights without
			disrupting your workflow.
		</p>
		<div class="mt-10">
			<a href="/about" class="font-bold text-accent transition hover:drop-shadow-accent-glow"
				>Discover Our Technology →</a
			>
		</div>
	</div>
</section>

<!-- Section 6: Final CTA -->
<section class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 pb-20 sm:pb-24">
		<div class="rounded-xl bg-main p-8 sm:p-16 text-center">
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