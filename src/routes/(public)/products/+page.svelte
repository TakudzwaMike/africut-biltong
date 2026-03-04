<script>
    import PageHeader from "$lib/components/PageHeader.svelte";
    import Seo from "$lib/components/Seo.svelte";
    import Image from "$lib/components/Image.svelte";
    import Icon from "@iconify/svelte";
    import { currency, currencyRates } from "$lib/stores/currency";

    let { data } = $props();

    // Helper to display price based on selected currency
    function getPriceDetails(product) {
        const v =
            product.variants.find((variant) => variant.isDefault) ||
            product.variants[0];
        if (!v) return null;

        const isZar = $currency === "ZAR";

        // Dynamically calculate ZAR price using the live exchange rate
        const currentCents = isZar
            ? Math.round(v.effectivePriceUsd * $currencyRates.USD_TO_ZAR)
            : v.effectivePriceUsd;

        const originalCents =
            isZar && v.compareAtPriceUsd
                ? Math.round(v.compareAtPriceUsd * $currencyRates.USD_TO_ZAR)
                : v.compareAtPriceUsd;

        if (currentCents === null) return null;

        const format = (cents) =>
            isZar
                ? `R ${(cents / 100).toFixed(2)}`
                : `$${(cents / 100).toFixed(2)}`;

        return {
            current: format(currentCents),
            original: originalCents ? format(originalCents) : null,
            isOnSale: v.isOnSale,
            badge: v.saleBadge,
        };
    }
</script>

<Seo
    title="All Products | Vision AI Store"
    description="Full catalog of hardware and software"
/>
<PageHeader
    title="Product Catalog"
    subtitle="Browse our complete inventory of hardware, licenses, and services."
/>

<div class="relative z-10 bg-slate-50 py-24">
    <div class="mx-auto max-w-7xl px-8">
        <!-- Toolbar -->
        <div
            class="mb-12 flex items-center justify-between border-b border-slate-200 pb-4"
        >
            <p class="text-sm font-bold text-slate-500 uppercase tracking-wide">
                {data.products.length} Products
            </p>
            <div class="flex items-center gap-2 text-sm font-bold">
                <span class="text-slate-400">Currency:</span>
                <button
                    onclick={() => currency.setCurrency("USD")}
                    class:text-accent={$currency === "USD"}>USD</button
                >
                <span class="text-slate-300">|</span>
                <button
                    onclick={() => currency.setCurrency("ZAR")}
                    class:text-accent={$currency === "ZAR"}>ZAR</button
                >
            </div>
        </div>

        <!-- Grid -->
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {#each data.products as product}
                {@const pricing = getPriceDetails(product)}
                <a
                    href={`/products/${product.slug}`}
                    class="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                    <!-- Image -->
                    <div
                        class="aspect-[4/3] overflow-hidden bg-main/5 relative"
                    >
                        {#if product.featuredImage}
                            <Image
                                src={product.featuredImage.displayUrl ||
                                    product.featuredImage.originalUrl}
                                alt={product.name}
                                aspectRatio="4/3"
                                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        {:else}
                            <div
                                class="flex h-full w-full items-center justify-center text-main/20"
                            >
                                <Icon icon="mdi:cube-outline" width="48" />
                            </div>
                        {/if}

                        <!-- Badges -->
                        <div
                            class="absolute top-4 left-4 flex flex-col gap-2 items-start"
                        >
                            <span
                                class="rounded bg-white/90 px-2 py-1 text-xs font-bold uppercase tracking-wider text-main shadow-sm backdrop-blur"
                            >
                                {product.type}
                            </span>
                            {#if pricing && pricing.isOnSale}
                                <span
                                    class="rounded bg-accent text-main px-2 py-1 text-xs font-bold uppercase tracking-wider shadow-sm animate-pulse"
                                >
                                    {pricing.badge || "Sale"}
                                </span>
                            {/if}
                        </div>
                    </div>

                    <!-- Details -->
                    <div class="flex flex-1 flex-col p-6">
                        <h3
                            class="text-lg font-bold text-main group-hover:text-accent transition-colors"
                        >
                            {product.name}
                        </h3>
                        <p
                            class="mt-2 text-sm text-main/60 line-clamp-2 flex-1"
                        >
                            {product.shortDescription}
                        </p>

                        <div
                            class="mt-6 flex items-center justify-between border-t border-slate-100 pt-4"
                        >
                            <div class="flex flex-col">
                                {#if pricing}
                                    {#if pricing.isOnSale}
                                        <span
                                            class="text-xs text-slate-400 line-through"
                                            >{pricing.original}</span
                                        >
                                    {/if}
                                    <span
                                        class="text-xl font-bold text-main {pricing.isOnSale
                                            ? 'text-accent'
                                            : ''}"
                                    >
                                        {pricing.current}
                                    </span>
                                {:else}
                                    <span class="text-sm text-slate-400"
                                        >Unavailable</span
                                    >
                                {/if}
                            </div>
                            <span
                                class="text-sm font-bold text-accent flex items-center gap-1"
                            >
                                View <Icon icon="mdi:arrow-right" />
                            </span>
                        </div>
                    </div>
                </a>
            {/each}
        </div>

        {#if data.products.length === 0}
            <div class="py-20 text-center text-main/50">
                <Icon
                    icon="mdi:package-variant-closed"
                    width="64"
                    class="mx-auto mb-4 opacity-50"
                />
                <p class="text-lg">No products found in the catalog.</p>
            </div>
        {/if}
    </div>
</div>
