<script>
	import { holographic } from '$lib/actions/holographic.js';
</script>

<section id="hero" class="relative overflow-hidden text-center">
	<!-- Background Image/Video Placeholder and Overlay -->
	<div class="absolute inset-0 z-[-1]">
		<!-- Placeholder for a background image or video -->
		<div class="flex h-full w-full items-center justify-center bg-main/5">
			<span class="font-mono text-sm text-main/50">Background Placeholder (16:9)</span>
		</div>
		<!-- Dark overlay for text legibility -->
		<div class="absolute inset-0 bg-main/70"></div>
	</div>

	<!-- Content -->
	<div class="relative z-10 mx-auto max-w-6xl px-8 py-32 sm:py-48">
		<h1 class="text-4xl font-bold tracking-tight text-light sm:text-6xl">
			Transforming Operations with Smart, Simple AI
		</h1>
		<p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-light/80">
			We provide AI-powered solutions for the mining, construction, and heavy industries, turning
			your operational data into measurable gains in profitability and sustainability.
		</p>
		<div class="perspective-container mt-10 flex flex-wrap items-center justify-center gap-6">
			<a
				href="/contact"
				class="holographic-button rounded-md bg-accent px-6 py-3 font-bold text-main shadow-accent-glow"
				use:holographic
			>
				Request a Demo
			</a>
			<a
				href="/solutions"
				class="holographic-button rounded-md bg-main px-6 py-3 font-bold text-light ring-1 ring-inset ring-light/50"
				use:holographic
			>
				Explore Our Solutions
			</a>
		</div>
	</div>
</section>