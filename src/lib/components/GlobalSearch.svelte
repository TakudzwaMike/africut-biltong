<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
    
    // --- CLICK OUTSIDE ACTION ---
    // Built natively to avoid external dependencies
    function clickOutside(node) {
        const handleClick = (event) => {
            if (node && !node.contains(event.target) && !event.defaultPrevented) {
                node.dispatchEvent(new CustomEvent('click_outside', { detail: node }));
            }
        };
        document.addEventListener('click', handleClick, true);
        return {
            destroy() {
                document.removeEventListener('click', handleClick, true);
            }
        };
    }

	let query = $state('');
	let results = $state([]);
	let isLoading = $state(false);
	let showResults = $state(false);
    let inputEl = $state();
	let searchDebounce;

	function handleInput() {
		if (searchDebounce) clearTimeout(searchDebounce);
        
        if (query.length < 2) {
            results = [];
            showResults = false;
            return;
        }

		isLoading = true;
        showResults = true;

		searchDebounce = setTimeout(async () => {
			try {
				const res = await fetch(`/api/store/products/search?q=${encodeURIComponent(query)}`);
				if (res.ok) {
					results = await res.json();
				} else {
                    results = [];
                }
			} catch (error) {
				console.error('Search error:', error);
                results = [];
			} finally {
				isLoading = false;
			}
		}, 300);
	}

    function handleFocus() {
        if (query.length >= 2) showResults = true;
    }

    function closeSearch() {
        showResults = false;
    }

    function handleSelect(slug) {
        closeSearch();
        query = ''; // Clear search after selection
        goto(`/products/${slug}`);
    }

    // Format price helper
    function formatPrice(product) {
        const v = product.variants?.[0];
        if (!v) return '';
        
        const price = v.effectivePriceUsd || v.priceUsd;
        if (!price) return '';
        
        return `$${(price / 100).toFixed(2)}`;
    }
</script>

<div 
    class="relative w-full max-w-md"
    use:clickOutside 
    onclick_outside={closeSearch}
>
    <!-- Search Bar -->
    <div class="relative">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-main/40">
            <Icon icon="mdi:magnify" width="20" />
        </div>
        <input
            bind:this={inputEl}
            type="text"
            placeholder="Search products..."
            class="w-full rounded-full border-0 bg-main/5 py-2 pl-10 pr-4 text-sm text-main ring-1 ring-inset ring-transparent transition-all placeholder:text-main/40 focus:bg-white focus:ring-accent focus:shadow-lg"
            bind:value={query}
            oninput={handleInput}
            onfocus={handleFocus}
        />
        {#if isLoading}
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                <Icon icon="mdi:loading" class="animate-spin text-accent" width="16" />
            </div>
        {/if}
    </div>

    <!-- Dropdown Results -->
    {#if showResults}
        <div class="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
            {#if results.length > 0}
                <div class="overflow-y-auto max-h-96 py-2">
                    {#each results as product}
                        <button
                            onclick={() => handleSelect(product.slug)}
                            class="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-main/5"
                        >
                            <!-- Thumbnail -->
                            <div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 border border-gray-200">
                                {#if product.featuredImage}
                                    <img 
                                        src={product.featuredImage.thumbnailUrl || product.featuredImage.originalUrl} 
                                        alt={product.name} 
                                        class="h-full w-full object-cover"
                                    />
                                {:else}
                                    <div class="flex h-full w-full items-center justify-center text-gray-300">
                                        <Icon icon="mdi:cube" width="20" />
                                    </div>
                                {/if}
                            </div>

                            <!-- Text -->
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-bold text-main truncate">{product.name}</p>
                                <div class="flex items-center gap-2 text-xs text-main/60">
                                    <span class="capitalize">{product.type}</span>
                                    {#if product.variants?.[0]?.isOnSale}
                                        <span class="rounded-sm bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-accent-darker">
                                            SALE
                                        </span>
                                    {/if}
                                </div>
                            </div>

                            <!-- Price -->
                            <div class="text-sm font-bold text-main">
                                {formatPrice(product)}
                            </div>
                        </button>
                    {/each}
                </div>
                <div class="border-t border-main/5 bg-gray-50 px-4 py-2 text-center">
                    <a href={`/store?q=${query}`} class="text-xs font-bold text-accent hover:underline">
                        View all results
                    </a>
                </div>
            {:else if !isLoading}
                <div class="py-8 text-center text-main/50">
                    <p class="text-sm">No products found.</p>
                </div>
            {/if}
        </div>
    {/if}
</div>
