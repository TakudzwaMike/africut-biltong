<script>
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import { cart } from '$lib/stores/cart.svelte.js';
	import { fade, scale } from 'svelte/transition';
    import GlobalSearch from './GlobalSearch.svelte'; // Import the new component

	let { settings, user } = $props();
	let isMenuOpen = $state(false);

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	afterNavigate(() => {
		isMenuOpen = false;
	});

	function isActive(path) {
		return $page.url.pathname === path;
	}
</script>

<svelte:body class:overflow-hidden={isMenuOpen} />

<header class="sticky top-0 z-50 border-b border-main/10 bg-light/90 backdrop-blur-md transition-all duration-300">
	<!-- Top accent line -->
	<div class="absolute top-0 left-0 right-0 h-1 bg-accent"></div>

	<nav class="mx-auto flex max-w-7xl items-center justify-between px-8 py-4 gap-8">
		<!-- Logo -->
		<a href="/" class="z-[60] flex flex-shrink-0 items-center gap-2 text-xl font-bold tracking-tight text-main">
			{#if settings?.logo}
				<img
					src={settings.logo.displayUrl || settings.logo.originalUrl}
					alt={settings.logo.altText}
					class="h-8 w-auto object-contain"
				/>
			{:else}
				<span class="text-2xl font-bold">{settings?.siteName || 'Vision AI Tech'}</span>
			{/if}
		</a>

        <!-- Search Bar (Desktop Only - Hidden on mobile to save space, or could be a toggle) -->
        <div class="hidden lg:block flex-1 max-w-md">
            <GlobalSearch />
        </div>

		<!-- Desktop Menu -->
		<ul class="hidden items-center gap-6 xl:gap-8 lg:flex flex-shrink-0">
			<li><a href="/solutions" class="text-sm font-bold transition hover:text-accent {isActive('/solutions') ? 'text-accent' : 'text-main/80'}">Solutions</a></li>
			<li><a href="/store" class="text-sm font-bold transition hover:text-accent {isActive('/store') ? 'text-accent' : 'text-main/80'}">Store</a></li>
			<li><a href="/resources" class="text-sm font-bold transition hover:text-accent {isActive('/resources') ? 'text-accent' : 'text-main/80'}">Resources</a></li>
			<li><a href="/about" class="text-sm font-bold transition hover:text-accent {isActive('/about') ? 'text-accent' : 'text-main/80'}">About</a></li>
		</ul>

		<!-- Desktop Actions -->
		<div class="hidden md:flex items-center gap-4 flex-shrink-0">
			
			<!-- Cart Button (Only shows if count > 0) -->
			<!-- Note: referencing cart.count directly triggers reactivity -->
			{#if cart.count > 0}
				<a
					href="/cart"
					transition:scale={{ duration: 200, start: 0.8 }}
					class="group relative flex items-center justify-center rounded-full bg-main/5 p-2 text-main transition-colors hover:bg-accent hover:text-main"
					title="View Cart"
				>
					<Icon icon="mdi:cart-outline" width="24" />
					<span class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm border-2 border-white">
						{cart.count}
					</span>
				</a>
			{/if}

			{#if user}
				<a href="/account" class="text-sm font-bold text-main/60 hover:text-main">Account</a>
                {#if user.role !== 'customer'}
				    <a href="/_/admin" class="text-sm font-bold text-accent hover:underline">Admin</a>
                {/if}
			{:else}
				<a href="/login" class="text-sm font-bold text-main/60 hover:text-main">Sign In</a>
				<a href="/contact" class="rounded-md bg-main px-5 py-2.5 text-sm font-bold text-light transition hover:bg-main/90 hover:shadow-lg">
					Book Demo
				</a>
			{/if}
		</div>

		<!-- Mobile Toggle -->
		<div class="flex items-center gap-4 lg:hidden">
			{#if cart.count > 0}
				<a href="/cart" class="relative text-main">
					<Icon icon="mdi:cart-outline" width="28" />
					<span class="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
				</a>
			{/if}
			
			<button onclick={toggleMenu} aria-label="Open menu" class="relative z-[60] rounded-md p-2 text-main">
				{#if isMenuOpen}
					<Icon icon="mdi:close" width="28" />
				{:else}
					<Icon icon="mdi:menu" width="28" />
				{/if}
			</button>
		</div>
	</nav>
</header>

<!-- Mobile Fullscreen Menu -->
{#if isMenuOpen}
	<div class="fixed inset-0 z-[55] flex flex-col bg-light/95 backdrop-blur-xl transition-opacity duration-300 overflow-y-auto pt-24 px-8 pb-8">
        
        <!-- Mobile Search -->
        <div class="mb-8">
            <GlobalSearch />
        </div>

		<ul class="flex flex-col gap-6 text-center">
			<li><a href="/solutions" class="text-2xl font-bold text-main hover:text-accent">Solutions</a></li>
			<li><a href="/store" class="text-2xl font-bold text-main hover:text-accent">Store</a></li>
			<li><a href="/case-studies" class="text-2xl font-bold text-main hover:text-accent">Case Studies</a></li>
			<li><a href="/resources" class="text-2xl font-bold text-main hover:text-accent">Resources</a></li>
			<li><a href="/about" class="text-2xl font-bold text-main hover:text-accent">About Us</a></li>
			
			<li class="mt-8 border-t border-main/10 pt-8">
				{#if user}
					<div class="flex flex-col gap-4 items-center">
                        <a href="/account" class="text-xl font-medium text-main">My Account</a>
                        {#if user.role !== 'customer'}
						    <a href="/_/admin" class="text-xl font-medium text-accent">Admin Dashboard</a>
                        {/if}
						<form action="/logout" method="POST">
							<button class="text-xl font-medium text-red-500">Logout</button>
						</form>
					</div>
				{:else}
                    <div class="flex flex-col gap-4">
                        <a href="/login" class="text-xl font-bold text-main">Sign In</a>
					    <a href="/contact" class="inline-block rounded-md bg-accent px-8 py-4 text-xl font-bold text-main shadow-xl shadow-accent/20">
						    Book a Demo
					    </a>
                    </div>
				{/if}
			</li>
		</ul>
	</div>
{/if}
