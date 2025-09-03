<script>
	import Image from '$lib/components/Image.svelte';
	export let data;
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Our Products</h1>
			<p class="mx-auto mt-4 max-w-2xl text-lg leading-8 text-main/70">
				A suite of hardware and software solutions designed for the demands of heavy industry.
			</p>
		</div>
		<div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
			{#each data.products as product}
				<a href={`/products/${product.slug}`} class="corner-border group block">
					{#if product.featuredImage}
						<Image
							src={product.featuredImage.displayUrl || product.featuredImage.originalUrl}
							alt={product.featuredImage.altText}
							aspectRatio="16/9"
							class="mb-6 rounded-md transition-transform duration-300 group-hover:scale-105"
						/>
					{/if}
					<h3 class="text-2xl font-bold text-main">{product.name}</h3>
					<p class="mt-2 text-main/70">{product.shortDescription}</p>
					<span class="mt-4 block font-bold text-accent transition hover:drop-shadow-accent-glow"
						>Learn More →</span
					>
				</a>
			{/each}
		</div>
	</div>
</div>