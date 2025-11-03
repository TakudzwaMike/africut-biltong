<script>
	import JsonLD from '$lib/components/JsonLD.svelte';
	import { cart } from '$lib/cart.js';
	import { page } from '$app/stores';
	import { toast } from '$lib/toast-service';
	import ProductGallery from '$lib/components/ProductGallery.svelte';

	let { data } = $props();
	const { product } = data;
	const currency = $derived($page.data.userCountryCode === 'ZA' ? 'ZAR' : 'USD');
	const price = $derived(product.prices?.[currency]);

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

	function renderRichTextToHtml(richText) {
		if (!richText?.content) return '';

		const renderNode = (node) => {
			let textContent = node.content?.map(renderNode).join('') || '';

			switch (node.type) {
				case 'paragraph':
					return `<p>${textContent || '<br>'}</p>`;
				case 'heading':
					const level = node.attrs?.level || 1;
					return `<h${level}>${textContent}</h${level}>`;
				case 'bold':
					return `<strong>${textContent}</strong>`;
				case 'italic':
					return `<em>${textContent}</em>`;
				case 'text':
					return node.text;
				default:
					return textContent;
			}
		};

		return richText.content.map(renderNode).join('');
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

		<article class="prose prose-lg mx-auto mt-16 text-main/80">
			{@html renderRichTextToHtml(product.longDescription)}
		</article>
	</div>
</div>