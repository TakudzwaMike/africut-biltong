<script>
	import JsonLD from '$lib/components/JsonLD.svelte';
	import { cart } from '$lib/cart.js';
	import { page } from '$app/stores';
	import { toast } from '$lib/toast-service';
	import ProductGallery from '$lib/components/ProductGallery.svelte';
	import RichTextRenderer from '$lib/components/RichTextRenderer.svelte';
	import Image from '$lib/components/Image.svelte';

	let { data } = $props();
	const { product } = data;
	const currency = $derived($page.data.userCountryCode === 'ZA' ? 'ZAR' : 'USD');
	const price = $derived(product.prices?.[currency]);

	// Extract related solutions from the join table structure
	const relatedSolutions = product.solutions.map(s => s.solution).filter(Boolean);

	const productSchema = {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: product.name,
		description: product.shortDescription,
		image: product.featuredImage?.displayUrl,
		offers: price
			? {
					'@type': 'Offer',
					priceCurrency: currency,
					price: (price / 100).toFixed(2)
				}
			: undefined
	};

	function formatPrice(priceInCents, currencyCode) {
		if (priceInCents === null || priceInCents === undefined) return 'Price unavailable';
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currencyCode
		}).format(priceInCents / 100);
	}

	function handleAddToCart(product) {
		if (price === null || price === undefined) {
			toast.error('This product cannot be purchased in your region.');
			return;
		}
		cart.addItem(product, price, currency);
		toast.success(`Added ${product.name} to cart!`);
	}
</script>

<JsonLD data={productSchema} />

<svelte:head>
	<title>{product.name} | Vision AI Tech Products</title>
	<meta name="description" content={product.shortDescription} />
</svelte:head>

<div class="relative z-10">
	<div class="mx-auto max-w-4xl px-8 py-20 sm:py-24">
		<div class="grid gap-8 md:grid-cols-2 md:items-start">
			<div>
				<ProductGallery
					featuredImage={product.featuredImage}
					galleryImages={product.galleryImages}
				/>
			</div>
			<div>
				<h1 class="text-4xl font-bold tracking-tight text-main">{product.name}</h1>
				<p class="mt-4 text-3xl font-bold tracking-tight text-main/90">
					{formatPrice(price, currency)}
				</p>
				<p class="mx-auto mt-6 text-lg leading-8 text-main/70">
					{product.shortDescription}
				</p>
				<div class="mt-8">
					<button
						onclick={() => handleAddToCart(product)}
						disabled={price === null}
						class="w-full rounded-md bg-accent px-8 py-3 font-bold text-main shadow-lg shadow-accent/30 transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:bg-main/20 disabled:shadow-none"
					>
						Add to Cart
					</button>
				</div>
			</div>
		</div>

		<div class="mx-auto mt-16">
			<RichTextRenderer content={product.longDescription} />
		</div>

		<!-- Related Solutions Section -->
		{#if relatedSolutions.length > 0}
			<div class="mt-24 border-t border-main/10 pt-16">
				<h3 class="text-2xl font-bold text-main mb-8">Part of these Solutions</h3>
				<div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
					{#each relatedSolutions as solution}
						<a href={`/solutions/${solution.slug}`} class="group relative block overflow-hidden rounded-xl border border-main/10 bg-white hover:shadow-lg transition-all hover:-translate-y-1">
							<div class="aspect-[16/9] overflow-hidden">
								{#if solution.featuredImage}
									<Image 
										src={solution.featuredImage.thumbnailUrl || solution.featuredImage.originalUrl} 
										alt={solution.featuredImage.altText}
										aspectRatio="16/9"
										class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
									/>
								{:else}
									<div class="flex h-full w-full items-center justify-center bg-main/5">
										<span class="text-main/40">No Image</span>
									</div>
								{/if}
							</div>
							<div class="p-6">
								<h4 class="text-lg font-bold text-main group-hover:text-accent">{solution.solutionName}</h4>
								<p class="mt-2 text-sm text-main/70 line-clamp-2">{solution.shortDescription}</p>
								<span class="mt-4 inline-block text-sm font-bold text-accent">Learn more →</span>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>