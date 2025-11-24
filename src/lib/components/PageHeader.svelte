<script>
	import Image from '$lib/components/Image.svelte';
	
	let { title, subtitle, backgroundImage = null } = $props();
</script>

<div class="relative h-[50vh] min-h-[350px] w-full overflow-hidden bg-main flex items-center justify-center text-center">
	<!-- Background Layer -->
	<div class="absolute inset-0 opacity-40">
		{#if backgroundImage}
			<Image 
				src={backgroundImage.displayUrl || backgroundImage.originalUrl} 
				alt={backgroundImage.altText} 
				aspectRatio="auto"
				class="h-full w-full object-cover"
			/>
		{:else}
			<!-- Tech Pattern Fallback -->
			<div class="h-full w-full bg-[radial-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:20px_20px]"></div>
		{/if}
	</div>

	<!-- Gradient Overlays -->
	<div class="absolute inset-0 bg-gradient-to-t from-main via-main/60 to-transparent"></div>
	<div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-main)_100%)]"></div>

	<!-- Content -->
	<div class="relative z-10 max-w-4xl px-8 pt-10">
		<h1 class="text-4xl font-bold tracking-tight text-light sm:text-6xl drop-shadow-xl">
			{title}
		</h1>
		{#if subtitle}
			<p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-light/80 sm:text-xl drop-shadow-md">
				{subtitle}
			</p>
		{/if}
		<div class="mt-8 flex justify-center">
			<div class="h-1 w-24 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]"></div>
		</div>
	</div>
</div>