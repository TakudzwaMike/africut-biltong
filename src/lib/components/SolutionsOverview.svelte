<script>
	import { viewport } from '$lib/actions/viewport.js';
	let isVisible = $state(false);
</script>

<section id="solutions-overview" class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<div
			class="fade-in"
			class:is-visible={isVisible}
			use:viewport={{ threshold: 0.1 }}
			onenterViewport={() => (isVisible = true)}
		>
			<h2 class="text-center text-3xl font-bold tracking-tight text-main sm:text-4xl">
				Actionable Intelligence for Your Core Operations
			</h2>
			<p class="mx-auto mt-4 max-w-3xl text-center text-lg leading-8 text-main/70">
				Our AI modules are designed to solve specific, high-impact challenges in your workflow.
			</p>
			<div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
				<div class="corner-border">
					<h3 class="text-xl font-bold">Production & Fleet Monitoring</h3>
					<p class="mt-2 text-main/70">
						An all-in-one solution to manage your heavy assets. We use telematics and AI to reduce
						downtime, cut fuel costs, and optimize your fleet's performance.
					</p>
				</div>
				<div class="corner-border">
					<h3 class="text-xl font-bold">GeoTechnical Intelligence</h3>
					<p class="mt-2 text-main/70">
						Enhance site safety and stability with our AI-driven geotechnical monitoring module.
						Proactively manage risk and integrate data with your existing platforms.
					</p>
				</div>
				<div class="corner-border">
					<h3 class="text-xl font-bold">Tailored AI Solutions</h3>
					<p class="mt-2 text-main/70">
						Every operation is unique. Our team can partner with you to build a custom AI engine
						that solves your most specific and challenging problems.
					</p>
				</div>
			</div>
			<div class="mt-16 text-center">
				<a
					href="/solutions"
					class="rounded-md bg-main px-6 py-3 font-bold text-light shadow-lg transition hover:-translate-y-1"
				>
					Explore All Solutions
				</a>
			</div>
		</div>
	</div>
</section>