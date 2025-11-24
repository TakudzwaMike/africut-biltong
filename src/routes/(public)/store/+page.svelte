<script>
    import Image from '$lib/components/Image.svelte';
    import Icon from '@iconify/svelte';
    import { currency } from '$lib/stores/currency';

    let { data } = $props();
    const { collections } = data;

    // Flatten products for hero background
    const allProducts = [
        ...collections.hardware,
        ...collections.software,
        ...collections.services
    ];
    
    // Take first 3 for a clean hero backdrop
    const heroImages = allProducts.slice(0, 3).map(p => p.featuredImage).filter(Boolean);

    function getPrice(product) {
        const v = product.variants[0]; 
        if (!v) return null;
        if ($currency === 'ZAR') return v.priceZar ? `R ${(v.priceZar/100).toFixed(2)}` : null;
        return v.priceUsd ? `$${(v.priceUsd/100).toFixed(2)}` : null;
    }
</script>

<svelte:head>
    <title>Store | Vision AI Tech</title>
    <meta name="description" content="Shop enterprise-grade AI hardware, software licenses, and expert services." />
</svelte:head>

<!-- STORE HERO -->
<section class="relative min-h-[60vh] w-full overflow-hidden bg-main text-light flex items-center">
    
    <!-- Subtle Background Pattern (Abstract) -->
    <div class="absolute inset-0 opacity-20 pointer-events-none">
         <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:24px_24px]"></div>
    </div>

    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-r from-main via-main/90 to-main/40"></div>

    <!-- Content -->
    <div class="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8 pt-12 pb-12">
        <div class="max-w-3xl space-y-8">
            <!-- Badge -->
            <div class="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 backdrop-blur-sm">
                <div class="h-2 w-2 rounded-full bg-accent animate-pulse"></div>
                <span class="text-xs font-bold uppercase tracking-widest text-accent">Official Store</span>
            </div>
            
            <h1 class="text-5xl font-bold tracking-tight text-white sm:text-7xl leading-[1.1]">
                Equip Your <br />
                <span class="text-accent">Operation.</span>
            </h1>
            
            <p class="text-xl text-slate-300 leading-relaxed max-w-2xl font-light">
                Direct access to the enterprise sensors, software licenses, and engineering services that power the Vision AI ecosystem.
            </p>
            
            <div class="flex flex-wrap gap-4 pt-6">
                <a href="#hardware" class="flex items-center gap-2 rounded-md bg-accent px-8 py-4 text-lg font-bold text-main shadow-lg shadow-accent/20 transition-transform hover:-translate-y-1 hover:shadow-accent/40">
                    <Icon icon="mdi:server-network" width="24" />
                    Shop Hardware
                </a>
                <a href="#software" class="flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10 hover:border-white/40">
                    <Icon icon="mdi:license" width="24" />
                    Get Licenses
                </a>
            </div>
        </div>
    </div>
    
    <!-- Hero Image/Visual (Right Side Desktop) -->
    <div class="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:block opacity-30 mask-image-linear-to-l">
        {#if heroImages[0]}
            <Image 
                src={heroImages[0].displayUrl || heroImages[0].originalUrl}
                alt="Hero Background"
                class="h-full w-full object-cover grayscale"
            />
        {/if}
        <div class="absolute inset-0 bg-gradient-to-l from-transparent to-main"></div>
    </div>
</section>

<!-- VALUE PROPS -->
<section class="bg-white border-b border-slate-100 relative z-20">
    <div class="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div class="flex items-center gap-5">
                <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 text-main ring-1 ring-slate-100">
                    <Icon icon="mdi:truck-fast-outline" width="24" />
                </div>
                <div>
                    <h3 class="text-base font-bold text-main">Global Logistics</h3>
                    <p class="text-sm text-slate-500">Reliable shipping with tracking</p>
                </div>
            </div>
            <div class="flex items-center gap-5">
                <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 text-main ring-1 ring-slate-100">
                    <Icon icon="mdi:shield-check-outline" width="24" />
                </div>
                <div>
                    <h3 class="text-base font-bold text-main">Enterprise Warranty</h3>
                    <p class="text-sm text-slate-500">2-year coverage on hardware</p>
                </div>
            </div>
            <div class="flex items-center gap-5">
                <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 text-main ring-1 ring-slate-100">
                    <Icon icon="mdi:face-agent" width="24" />
                </div>
                <div>
                    <h3 class="text-base font-bold text-main">Engineer Support</h3>
                    <p class="text-sm text-slate-500">Direct technical assistance</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- MAIN CATALOG -->
<div class="bg-slate-50/50 py-24">
    <div class="mx-auto max-w-7xl px-6 lg:px-8 space-y-32">

        <!-- HARDWARE COLLECTION -->
        {#if collections.hardware.length > 0}
            <section id="hardware" class="scroll-mt-24">
                <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-slate-200 pb-6">
                    <div>
                        <div class="text-xs font-bold uppercase tracking-widest text-accent mb-2">Infrastructure</div>
                        <h2 class="text-3xl font-bold text-main">Industrial Hardware</h2>
                    </div>
                    <a href="/products?type=physical" class="group flex items-center gap-2 text-sm font-bold text-main/60 hover:text-main transition-colors">
                        View Full Catalog 
                        <Icon icon="mdi:arrow-right" class="transition-transform group-hover:translate-x-1" />
                    </a>
                </div>
                
                <div class="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                    {#each collections.hardware as product}
                        <a href={`/products/${product.slug}`} class="group block bg-transparent">
                            <!-- Card Image -->
                            <div class="aspect-square w-full overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-accent/50 relative">
                                {#if product.featuredImage}
                                    <div class="h-full w-full p-6 flex items-center justify-center">
                                        <Image 
                                            src={product.featuredImage.displayUrl || product.featuredImage.originalUrl}
                                            alt={product.name}
                                            aspectRatio="1/1"
                                            class="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                {:else}
                                    <div class="flex h-full w-full items-center justify-center text-slate-300"><Icon icon="mdi:server" width="48" /></div>
                                {/if}
                                
                                <!-- Price Badge (Cleaner Look) -->
                                {#if getPrice(product)}
                                    <div class="absolute top-3 right-3 bg-main text-white text-xs font-bold px-2.5 py-1 rounded">
                                        {getPrice(product)}
                                    </div>
                                {/if}
                            </div>

                            <!-- Card Text -->
                            <div class="mt-4">
                                <h3 class="text-base font-bold text-main truncate group-hover:text-accent transition-colors">{product.name}</h3>
                                <p class="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">{product.shortDescription}</p>
                            </div>
                        </a>
                    {/each}
                </div>
            </section>
        {/if}

        <!-- SOFTWARE BANNER -->
        {#if collections.software.length > 0}
            <section id="software" class="relative scroll-mt-24 rounded-3xl overflow-hidden bg-main text-light shadow-2xl">
                <!-- Abstract BG -->
                <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle, #ffffff 1px, transparent 1px); background-size: 32px 32px;"></div>
                
                <div class="relative z-10 px-8 py-16 md:py-20 md:px-16 flex flex-col lg:flex-row items-start gap-12">
                    <div class="lg:w-1/3 space-y-6 pt-4">
                        <div class="inline-block rounded border border-accent/50 px-3 py-1 text-xs font-bold text-accent">
                            SaaS & Licensing
                        </div>
                        <h2 class="text-3xl md:text-4xl font-bold leading-tight">Intelligent Software</h2>
                        <p class="text-light/70 text-lg leading-relaxed">
                            Unlock the full potential of your hardware with our advanced AI models.
                        </p>
                        <a href="/products?type=digital" class="inline-flex items-center gap-2 text-white font-bold hover:text-accent transition-colors border-b-2 border-transparent hover:border-accent pb-1">
                            Browse All Licenses <Icon icon="mdi:arrow-right" />
                        </a>
                    </div>

                    <!-- Horizontal Scroll Area -->
                    <div class="lg:w-2/3 w-full">
                        <div class="flex gap-6 overflow-x-auto pb-8 pt-4 px-2 snap-x hide-scrollbar">
                            {#each collections.software as product}
                                <a href={`/products/${product.slug}`} class="snap-center shrink-0 w-72 bg-white text-main rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group border border-white/10">
                                    <div class="aspect-video bg-slate-100 relative overflow-hidden">
                                         {#if product.featuredImage}
                                            <Image 
                                                src={product.featuredImage.displayUrl || product.featuredImage.originalUrl} 
                                                alt={product.name} 
                                                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                            />
                                        {:else}
                                            <div class="h-full w-full flex items-center justify-center text-slate-300"><Icon icon="mdi:code-tags" width="40"/></div>
                                        {/if}
                                    </div>
                                    <div class="p-5">
                                        <h4 class="font-bold text-lg line-clamp-1 group-hover:text-accent transition-colors">{product.name}</h4>
                                        <div class="flex justify-between items-center mt-4">
                                            <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">License</span>
                                            <span class="text-main font-mono font-bold">{getPrice(product) || 'Custom'}</span>
                                        </div>
                                    </div>
                                </a>
                            {/each}
                        </div>
                    </div>
                </div>
            </section>
        {/if}

        <!-- SERVICES -->
        {#if collections.services.length > 0}
            <section id="services" class="scroll-mt-24">
                 <div class="flex items-end justify-between mb-10 gap-4 border-b border-slate-200 pb-6">
                    <div>
                        <div class="text-xs font-bold uppercase tracking-widest text-accent mb-2">Deployment</div>
                        <h2 class="text-3xl font-bold text-main">Professional Services</h2>
                    </div>
                    <a href="/products?type=service" class="hidden md:flex items-center gap-2 font-bold text-main/60 hover:text-main transition-colors">
                        View Services <Icon icon="mdi:arrow-right" />
                    </a>
                </div>

                <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {#each collections.services as product}
                        <a href={`/products/${product.slug}`} class="group relative flex items-start gap-5 rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-accent hover:shadow-lg">
                            <div class="h-14 w-14 flex-shrink-0 flex items-center justify-center rounded-xl bg-main text-white shadow-md group-hover:bg-accent group-hover:text-main transition-colors">
                                <Icon icon="mdi:account-wrench" width="24" />
                            </div>
                            <div>
                                <h4 class="text-lg font-bold text-main mb-2 group-hover:text-accent transition-colors">{product.name}</h4>
                                <p class="text-sm text-slate-500 leading-relaxed line-clamp-2">{product.shortDescription}</p>
                                <span class="mt-4 inline-block text-xs font-bold uppercase tracking-wide text-main border-b border-main/20 pb-0.5 group-hover:border-accent">Book Now</span>
                            </div>
                        </a>
                    {/each}
                </div>
            </section>
        {/if}

    </div>
</div>

<style>
    .mask-image-linear-to-l {
        mask-image: linear-gradient(to left, black 0%, transparent 100%);
        -webkit-mask-image: linear-gradient(to left, black 0%, transparent 100%);
    }
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>