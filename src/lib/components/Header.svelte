<script>
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';

	let { settings, user } = $props();

	let isMenuOpen = $state(false);

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	afterNavigate(() => {
		isMenuOpen = false;
	});

	// Helper to highlight active links
	function isActive(path) {
		return $page.url.pathname === path;
	}
</script>

<svelte:body class:overflow-hidden={isMenuOpen} />

<header class="sticky top-0 z-50 border-b border-main/10 bg-light/90 backdrop-blur-md transition-all duration-300">
	<!-- Top accent line to match footer -->
	<div class="absolute top-0 left-0 right-0 h-1 bg-accent"></div>

	<nav class="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
		<!-- Logo -->
		<a href="/" class="z-[60] flex items-center gap-2 text-xl font-bold tracking-tight text-main">
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

		<!-- Desktop Menu -->
		<ul class="hidden items-center gap-8 md:flex">
			<li>
				<a
					href="/solutions"
					class="text-sm font-bold transition hover:text-accent {isActive('/solutions') ? 'text-accent' : 'text-main/80'}"
				>
					Solutions
				</a>
			</li>
			<li>
				<a
					href="/case-studies"
					class="text-sm font-bold transition hover:text-accent {isActive('/case-studies') ? 'text-accent' : 'text-main/80'}"
				>
					Case Studies
				</a>
			</li>
			<li>
				<a
					href="/resources"
					class="text-sm font-bold transition hover:text-accent {isActive('/resources') ? 'text-accent' : 'text-main/80'}"
				>
					Resources
				</a>
			</li>
			<li>
				<a 
					href="/about" 
					class="text-sm font-bold transition hover:text-accent {isActive('/about') ? 'text-accent' : 'text-main/80'}"
				>
					About Us
				</a>
			</li>
			<li>
				<a 
					href="/blog" 
					class="text-sm font-bold transition hover:text-accent {isActive('/blog') ? 'text-accent' : 'text-main/80'}"
				>
					Blog
				</a>
			</li>
		</ul>

		<!-- Desktop Actions -->
		<div class="hidden md:flex items-center gap-4">
			{#if user}
				<a
					href="/_/admin"
					class="text-sm font-bold text-main/60 hover:text-main"
				>
					Admin
				</a>
				<form action="/logout" method="POST">
					<button class="text-sm font-bold text-main/60 hover:text-red-500">Logout</button>
				</form>
			{:else}
				<a
					href="/contact"
					class="rounded-md bg-main px-5 py-2.5 text-sm font-bold text-light transition hover:bg-main/90 hover:shadow-lg"
				>
					Book Demo
				</a>
			{/if}
		</div>

		<!-- Mobile Toggle -->
		<button
			onclick={toggleMenu}
			aria-label="Open menu"
			class="relative z-[60] -mr-2 rounded-md p-2 text-main md:hidden"
		>
			{#if isMenuOpen}
				<Icon icon="mdi:close" width="28" />
			{:else}
				<Icon icon="mdi:menu" width="28" />
			{/if}
		</button>
	</nav>
</header>

<!-- Mobile Fullscreen Menu -->
{#if isMenuOpen}
	<div
		class="fixed inset-0 z-[55] flex flex-col items-center justify-center bg-light/95 backdrop-blur-xl transition-opacity duration-300"
	>
		<ul class="flex flex-col items-center gap-8 text-center">
			<li>
				<a href="/solutions" class="text-3xl font-bold text-main hover:text-accent">Solutions</a>
			</li>
			<li>
				<a href="/case-studies" class="text-3xl font-bold text-main hover:text-accent">Case Studies</a>
			</li>
			<li>
				<a href="/resources" class="text-3xl font-bold text-main hover:text-accent">Resources</a>
			</li>
			<li>
				<a href="/about" class="text-3xl font-bold text-main hover:text-accent">About Us</a>
			</li>
			<li>
				<a href="/blog" class="text-3xl font-bold text-main hover:text-accent">Blog</a>
			</li>
			
			<li class="mt-8">
				{#if user}
					<div class="flex flex-col gap-4">
						<a href="/_/admin" class="text-xl font-medium text-main/60">Dashboard</a>
						<form action="/logout" method="POST">
							<button class="text-xl font-medium text-red-500">Logout</button>
						</form>
					</div>
				{:else}
					<a
						href="/contact"
						class="inline-block rounded-md bg-accent px-8 py-4 text-xl font-bold text-main shadow-xl shadow-accent/20"
					>
						Book a Demo
					</a>
				{/if}
			</li>
		</ul>
	</div>
{/if}