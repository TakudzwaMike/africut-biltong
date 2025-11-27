<script>
    import PageHeader from '$lib/components/PageHeader.svelte';
    import Image from '$lib/components/Image.svelte';
    import RichTextRenderer from '$lib/components/RichTextRenderer.svelte';
    import Icon from '@iconify/svelte';
    import { cart } from '$lib/stores/cart.svelte.js';
    import { currency } from '$lib/stores/currency.js';
    import { toast } from '$lib/toast-service';
    import Seo from '$lib/components/Seo.svelte'; // Import SEO
    import JsonLD from '$lib/components/JsonLD.svelte'; // Import JsonLD

    let { data } = $props();
    const { product } = data;

    // Variant State
    let selectedVariant = $state(product.variants.find(v => v.isDefault) || product.variants[0]);
    let quantity = $state(1);
    let isAdding = $state(false);

    // Gallery State
    let activeImageIndex = $state(0);
    let allImages = $derived([
        product.featuredImage,
        ...product.images.map(i => i.media)
    ].filter(Boolean));
    
    let activeImage = $derived(allImages[activeImageIndex]);

    // Pricing Logic
    let pricing = $derived.by(() => {
        if (!selectedVariant) return { current: 'Unavailable', original: null };

        const isZar = $currency === 'ZAR';
        const currentCents = isZar ? selectedVariant.effectivePriceZar : selectedVariant.effectivePriceUsd;
        const originalCents = isZar ? selectedVariant.compareAtPriceZar : selectedVariant.compareAtPriceUsd;

        if (currentCents === null) return { current: 'N/A', original: null };

        const format = (cents) => {
            const val = (cents / 100).toFixed(2);
            return isZar ? `R ${val}` : `$${val}`;
        };

        return {
            current: format(currentCents),
            currentRaw: currentCents,
            original: originalCents ? format(originalCents) : null,
            isOnSale: !!originalCents,
            badge: selectedVariant.saleBadge || 'Sale',
            amount: (currentCents / 100).toFixed(2) // For Schema
        };
    });

    // Derived Stock
    let stockStatus = $derived.by(() => {
        if (!selectedVariant) return { label: 'Unavailable', color: 'text-gray-500', icon: 'mdi:help-circle-outline' };
        if (product.type === 'physical') {
             if (selectedVariant.stock > 10) return { label: 'In Stock', color: 'text-green-600', icon: 'mdi:check-circle-outline' };
             if (selectedVariant.stock > 0) return { label: `Low Stock (${selectedVariant.stock})`, color: 'text-orange-500', icon: 'mdi:alert-circle-outline' };
             return { label: 'Out of Stock', color: 'text-red-500', icon: 'mdi:close-circle-outline' };
        }
        return { label: 'Instant Digital Access', color: 'text-green-600', icon: 'mdi:cloud-check-outline' };
    });

    function handleAddToCart() {
        if (!selectedVariant) return;
        if (pricing.current === 'N/A' || pricing.current === 'Unavailable') {
            toast.error('Price unavailable in this currency.');
            return;
        }

        isAdding = true;
        
        cart.addItem({
            id: product.id,
            name: product.name,
            variantId: selectedVariant.id,
            variantName: selectedVariant.name,
            image: product.featuredImage?.thumbnailUrl || product.featuredImage?.originalUrl,
            price: pricing.currentRaw,
            currency: $currency,
            quantity: quantity
        });

        toast.success('Added to Cart');
        setTimeout(() => isAdding = false, 500);
    }

    // Schema.org Data
    let productSchema = $derived({
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        image: allImages.map(img => img.originalUrl),
        description: product.shortDescription,
        brand: {
            '@type': 'Brand',
            name: 'Vision AI Tech'
        },
        sku: selectedVariant?.sku || product.id,
        offers: {
            '@type': 'Offer',
            url: `https://vision-ai.tech/products/${product.slug}`,
            priceCurrency: $currency,
            price: pricing.amount,
            availability: (product.type !== 'physical' || (selectedVariant?.stock > 0)) 
                ? 'https://schema.org/InStock' 
                : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition'
        }
    });
</script>

<Seo 
    title={`${product.name} | Vision AI Store`}
    description={product.shortDescription}
    imageUrl={product.featuredImage?.displayUrl || product.featuredImage?.originalUrl}
    ogType="product"
/>

<JsonLD data={productSchema} />

<div class="min-h-screen bg-slate-50 pt-8 pb-24">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">

        <!-- Breadcrumbs -->
        <nav class="flex items-center text-sm font-medium text-slate-500 mb-8">
            <a href="/" class="hover:text-main">Home</a>
            <Icon icon="mdi:chevron-right" class="mx-2" />
            <a href="/store" class="hover:text-main">Store</a>
            <Icon icon="mdi:chevron-right" class="mx-2" />
            <span class="text-main font-bold">{product.name}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <!-- LEFT COLUMN: Gallery (7 cols) -->
            <div class="lg:col-span-7 space-y-4">
                <!-- Main Image (FIXED: Added fit="contain") -->
                <div class="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm relative group">
                    {#if activeImage}
                        <Image 
                            src={activeImage.displayUrl || activeImage.originalUrl}
                            alt={product.name}
                            aspectRatio="4/3"
                            fit="contain" 
                            class="h-full w-full p-8 transition-transform duration-500 group-hover:scale-105"
                        />
                    {:else} 
                        <div class="flex h-full w-full items-center justify-center text-main/20">
                            <Icon icon="mdi:image-off" width="64" />
                        </div>
                    {/if}
                    
                    <div class="absolute top-4 left-4 flex flex-col gap-2 items-start">
                        <span class="bg-white/90 backdrop-blur text-main text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-slate-100 uppercase tracking-wider">
                            {product.type}
                        </span>
                        {#if pricing.isOnSale}
                            <span class="bg-accent text-main text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider animate-pulse">
                                {pricing.badge}
                            </span>
                        {/if}
                    </div>
                </div>

                <!-- Thumbnails -->
                {#if allImages.length > 1}
                    <div class="flex gap-4 overflow-x-auto pb-2">
                        {#each allImages as img, i}
                            <button 
                                class="h-20 w-20 flex-shrink-0 rounded-lg border bg-white overflow-hidden transition-all
                                {i === activeImageIndex ? 'border-accent ring-2 ring-accent/20' : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'}"
                                onclick={() => activeImageIndex = i}
                            >
                                <img 
                                    src={img.thumbnailUrl || img.originalUrl} 
                                    alt="Thumbnail" 
                                    class="h-full w-full object-cover" 
                                />
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- RIGHT COLUMN: Buying Controls (5 cols) -->
            <div class="lg:col-span-5">
                <div class="sticky top-24 space-y-8">
                    
                    <!-- Header Info -->
                    <div>
                        <h1 class="text-3xl font-bold text-main tracking-tight sm:text-4xl">{product.name}</h1>
                        <p class="mt-4 text-lg text-slate-600 leading-relaxed">{product.shortDescription}</p>
                    </div>

                    <!-- Price & Stock -->
                    <div class="flex items-center justify-between border-y border-slate-200 py-6">
                        <div>
                            <p class="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Price</p>
                            <div class="flex items-baseline gap-3">
                                <p class="text-4xl font-bold text-main {pricing.isOnSale ? 'text-accent' : ''}">
                                    {pricing.current}
                                </p>
                                {#if pricing.isOnSale}
                                    <p class="text-lg font-medium text-slate-400 line-through">
                                        {pricing.original}
                                    </p>
                                {/if}
                            </div>
                        </div>
                        <div class="text-right"> 
                            <p class="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Availability</p> 
                            <div class="flex items-center justify-end gap-1 {stockStatus.color}">
                                <Icon icon={stockStatus.icon} width="20" />
                                <span class="font-bold">{stockStatus.label}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Variant Selector -->
                    {#if product.variants.length > 1}
                        <div>
                            <label for="variant" class="block text-sm font-bold text-main mb-3">Configuration</label>
                            <div class="grid grid-cols-2 gap-3">
                                {#each product.variants as v}
                                    <button 
                                        class="flex flex-col items-start rounded-lg border px-4 py-3 text-left transition-all
                                        {selectedVariant.id === v.id 
                                            ? 'border-accent bg-accent/5 text-main ring-1 ring-accent' 
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}"
                                        onclick={() => selectedVariant = v}
                                    >
                                        <span class="font-bold text-sm">{v.name}</span>
                                        {#if v.sku}
                                            <span class="text-xs opacity-60 mt-1">{v.sku}</span>
                                        {/if}
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- Actions -->
                    <div class="flex gap-4 pt-4">
                        <div class="w-24">
                            <label for="qty" class="sr-only">Quantity</label>
                            <div class="relative">
                                <input 
                                    type="number" 
                                    id="qty" 
                                    min="1" 
                                    max={product.type === 'physical' ? selectedVariant.stock : 99}
                                    bind:value={quantity}
                                    class="w-full rounded-lg border-slate-300 py-3.5 text-center font-bold text-main focus:border-accent focus:ring-accent"
                                />
                            </div>
                        </div>
                        <button 
                            onclick={handleAddToCart}
                            disabled={product.type === 'physical' && selectedVariant.stock < 1}
                            class="flex-1 rounded-lg bg-accent px-8 py-3.5 text-lg font-bold text-main shadow-lg shadow-accent/20 transition-all hover:-translate-y-1 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            <Icon icon="mdi:cart-plus" width="24" />
                            {isAdding ? 'Adding...' : 'Add to Cart'}
                        </button>
                    </div>

                    <!-- Specs List -->
                    {#if product.features.length > 0}
                        <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 mt-6">
                            <h3 class="text-sm font-bold text-main uppercase tracking-wider mb-4">Highlights</h3>
                            <ul class="space-y-3">
                                {#each product.features as feature}
                                    <li class="flex items-start gap-3 text-slate-600 text-sm">
                                        <Icon icon={feature.icon || 'mdi:check-circle'} class="mt-0.5 text-accent flex-shrink-0" width="18" />
                                        <span>{feature.text}</span>
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {/if}

                </div>
            </div>
        </div>
    </div>

    <!-- LONG DESCRIPTION & SMART LINKS -->
    <div class="mx-auto max-w-7xl px-6 lg:px-8 mt-24">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <!-- Description -->
            <div class="lg:col-span-8">
                <h2 class="text-2xl font-bold text-main mb-8 border-b border-slate-200 pb-4">Product Details</h2>
                <div class="prose prose-lg max-w-none prose-slate">
                    <RichTextRenderer content={product.longDescription} />
                </div>
            </div>

            <!-- Related Solutions (Smart Links) -->
            {#if product.solutions.length > 0}
                <div class="lg:col-span-4">
                    <div class="rounded-xl bg-main text-white p-8 shadow-xl sticky top-24">
                        <h3 class="text-xl font-bold mb-2">Integrated Ecosystem</h3>
                        <p class="text-white/70 text-sm mb-6">This product is optimized for the following Vision AI solutions.</p>
                        
                        <div class="space-y-4">
                            {#each product.solutions as link}
                                {@const sol = link.solution}
                                <a href={`/solutions/${sol.slug}`} class="flex items-center gap-4 rounded-lg bg-white/10 p-3 hover:bg-white/20 transition-colors group">
                                    <div class="h-12 w-12 flex-shrink-0 rounded bg-white/5 overflow-hidden">
                                        {#if sol.featuredImage}
                                            <Image 
                                                src={sol.featuredImage.thumbnailUrl || sol.featuredImage.originalUrl} 
                                                alt={sol.solutionName} 
                                                aspectRatio="1/1" 
                                                class="h-full w-full object-cover" 
                                            />
                                        {/if}
                                    </div>
                                    <div>
                                        <p class="font-bold text-white text-sm group-hover:text-accent transition-colors">{sol.solutionName}</p>
                                        <p class="text-xs text-white/50 uppercase tracking-wider font-bold mt-1">View Solution →</p>
                                    </div>
                                </a>
                            {/each}
                        </div>
                    </div>
                </div>
            {/if}

        </div>
    </div>
</div>