<script>
	import Image from '$lib/components/Image.svelte';
	import { cart } from '$lib/cart.js';
	import { page } from '$app/stores';
	import { toast } from '$lib/toast-service';

	let { data } = $props();

	// Use the Geo-IP country code to select the default currency
	const currency = $derived($page.data.userCountryCode === 'ZA' ? 'ZAR' : 'USD');

	// Create derived lists for each product type
	const physicalProducts = $derived(data.products.filter((p) => p.type === 'physical'));
	const services = $derived(data.products.filter((p) => p.type === 'service'));
	const digitalProducts = $derived(data.products.filter((p) => p.type === 'digital'));

	function formatPrice(priceInCents, currencyCode) {
		if (priceInCents === null || priceInCents === undefined) return 'Price unavailable';
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currencyCode
		}).format(priceInCents / 100);
	}

	function handleAddToCart(product) {
		const price = product.prices?.[currency];
		if (price === null || price === undefined) {
			toast.error('This product cannot be purchased in your region.');
			return;
		}
		cart.addItem(product, price, currency);
		toast.success(`Added ${product.name} to cart!`);
	}
</script>

<div class="relative z-10">
	<!-- Store Hero Section -->
	<div class="bg-main/5 py-20 text-center sm:py-24">
		<div class="mx-auto max-w-4xl px-8">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">
				Vision AI Tech Store
			</h1>
			<p class="mx-auto mt-4 max-w-2xl text-lg leading-8 text-main/70">
				Discover our suite of hardware, software, and service solutions engineered for the demands of
				heavy industry.
			</p>
		</div>
	</div>

	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<!-- Physical Products Section -->
		{#if physicalProducts.length > 0}
			<section class="mb-20">
				<h2 class="text-3xl font-bold tracking-tight text-main">Physical Products</h2>
				<div class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
					{#each physicalProducts as product}
						{@const price = product.prices?.[currency]}
						<div class="corner-border group flex flex-col">
							<a href={`/store/${product.slug}`} class="block">
								{#if product.featuredImage}
									<Image
										src={product.featuredImage.displayUrl || product.featuredImage.originalUrl}
										alt={product.featuredImage.altText}
										aspectRatio="16/9"
										class="mb-6 rounded-md transition-transform duration-300 group-hover:scale-105"
									/>
								{/if}
								<h3 class="text-xl font-bold text-main">{product.name}</h3>
								<p class="mt-2 flex-grow text-main/70">{product.shortDescription}</p>
							</a>
							<div class="mt-4 flex items-center justify-between">
								<p class="text-xl font-bold">{formatPrice(price, currency)}</p>
								<button
									onclick={() => handleAddToCart(product)}
									disabled={price === null}
									class="rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-main/20 disabled:shadow-none"
								>
									Add to Cart
								</button>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Services Section -->
		{#if services.length > 0}
			<section class="mb-20">
				<h2 class="text-3xl font-bold tracking-tight text-main">Services</h2>
				<div class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
					{#each services as product}
						{@const price = product.prices?.[currency]}
						<!-- Service Card (can be styled differently if needed) -->
						<div class="corner-border group flex flex-col">
							<a href={`/store/${product.slug}`} class="block">
								{#if product.featuredImage}
									<Image
										src={product.featuredImage.displayUrl || product.featuredImage.originalUrl}
										alt={product.featuredImage.altText}
										aspectRatio="16/9"
										class="mb-6 rounded-md transition-transform duration-300 group-hover:scale-105"
									/>
								{/if}
								<h3 class="text-xl font-bold text-main">{product.name}</h3>
								<p class="mt-2 flex-grow text-main/70">{product.shortDescription}</p>
							</a>
							<div class="mt-4 flex items-center justify-between">
								<p class="text-xl font-bold">{formatPrice(price, currency)}</p>
								<button
									onclick={() => handleAddToCart(product)}
									disabled={price === null}
									class="rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-main/20 disabled:shadow-none"
								>
									Add to Cart
								</button>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Digital Products Section -->
		{#if digitalProducts.length > 0}
			<section>
				<h2 class="text-3xl font-bold tracking-tight text-main">Digital Products</h2>
				<div class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
					{#each digitalProducts as product}
						{@const price = product.prices?.[currency]}
						<!-- Digital Product Card -->
						<div class="corner-border group flex flex-col">
							<a href={`/store/${product.slug}`} class="block">
								{#if product.featuredImage}
									<Image
										src={product.featuredImage.displayUrl || product.featuredImage.originalUrl}
										alt={product.featuredImage.altText}
										aspectRatio="16/9"
										class="mb-6 rounded-md transition-transform duration-300 group-hover:scale-105"
									/>
								{/if}
								<h3 class="text-xl font-bold text-main">{product.name}</h3>
								<p class="mt-2 flex-grow text-main/70">{product.shortDescription}</p>
							</a>
							<div class="mt-4 flex items-center justify-between">
								<p class="text-xl font-bold">{formatPrice(price, currency)}</p>
								<button
									onclick={() => handleAddToCart(product)}
									disabled={price === null}
									class="rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-main/20 disabled:shadow-none"
								>
									Add to Cart
								</button>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</div>
</div>