<script>
	import { viewport } from '$lib/actions/viewport.js';

	let isVisible = $state(false);
</script>

<section id="design-system" class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<div
			class="fade-in rounded-xl bg-main p-8 sm:p-16"
			class:is-visible={isVisible}
			use:viewport={{ threshold: 0.2 }}
			onenterViewport={() => (isVisible = true)}
		>
			<h2 class="text-center text-3xl font-bold tracking-tight text-light sm:text-4xl">
				Design System
			</h2>
			<div class="mx-auto mt-12 max-w-3xl">
				<h3 class="text-2xl font-bold text-light">Typography & Color</h3>
				<p class="mt-4 text-light/70">
					A consistent and scalable system for text and color is the foundation of a great user
					interface. Below are the core elements of our visual language
				</p>
				<blockquote class="mt-6 border-l-4 border-accent pl-4 italic text-light/80">
					"Good design is obvious. Great design is transparent." — Joe Sparano
				</blockquote>
			</div>
			<div class="mt-16 grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
				<div class="flex flex-col items-center">
					<div class="h-24 w-24 rounded-lg bg-main ring-2 ring-inset ring-light/20"></div>
					<p class="mt-4 font-bold text-light">Main</p>
					<code class="text-sm text-light/70">#12102B</code>
				</div>
				<div class="flex flex-col items-center">
					<div class="h-24 w-24 rounded-lg bg-light"></div>
					<p class="mt-4 font-bold text-light">Light</p>
					<code class="text-sm text-light/70">#FEFEFE</code>
				</div>
				<div class="flex flex-col items-center">
					<div class="h-24 w-24 rounded-lg bg-accent"></div>
					<p class="mt-4 font-bold text-light">Accent</p>
					<code class="text-sm text-light/70">#C0D532</code>
				</div>
			</div>
		</div>
	</div>
</section>