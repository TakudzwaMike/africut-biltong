<script>
	import { viewport } from '$lib/actions/viewport.js';

	let isVisible = $state(false);
</script>

<section id="testimonials" class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<div
			class="fade-in"
			class:is-visible={isVisible}
			use:viewport={{ threshold: 0.2 }}
			onenterViewport={() => (isVisible = true)}
		>
			<h2 class="text-center text-3xl font-bold tracking-tight text-main sm:text-4xl">
				What People Are Saying
			</h2>
			<div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
				<div class="corner-border">
					<blockquote class="italic text-main/80">
						"The design is not just visually stunning but also incredibly intuitive. Our user engagement
						has skyrocketed"
					</blockquote>
					<cite class="mt-4 block font-bold not-italic text-accent drop-shadow-accent-glow">
						- Alex Doe, CEO of TechCorp
					</cite>
				</div>
				<div class="corner-border">
					<blockquote class="italic text-main/80">
						"A truly futuristic and professional look. It has set our brand apart from the
						competition. Highly recommended"
					</blockquote>
					<cite class="mt-4 block font-bold not-italic text-accent drop-shadow-accent-glow">
						- Jane Smith, Marketing Director
					</cite>
				</div>
				<div class="corner-border">
					<blockquote class="italic text-main/80">
						"Working with this design system was a breeze. The components are well-thought-out and
						easy to customize"
					</blockquote>
					<cite class="mt-4 block font-bold not-italic text-accent drop-shadow-accent-glow">
						- Sam Wilson, Lead Developer
					</cite>
				</div>
			</div>
		</div>
	</div>
</section>