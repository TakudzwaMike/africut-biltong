<script>
	import { afterNavigate } from '$app/navigation';

	/** @type {import('../../routes/$types').PageData} */
	let { data } = $props();

	let isMenuOpen = $state(false);

	// Use $derived for reactivity in Svelte 5.
	// It will automatically re-calculate when `data.settings` or `data.mediaItems` changes.
	let logo = $derived(
		data.mediaItems?.find((m) => m.id == data.settings?.siteLogoMediaId)
	);

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	// Close the mobile menu after navigation
	afterNavigate(() => {
		isMenuOpen = false;
	});
</script>

<!-- This prevents the body from scrolling when the mobile menu is open -->
<svelte:body class:overflow-hidden={isMenuOpen} />

<header class="sticky top-0 z-50 border-b border-main/10 bg-light/80 px-8 backdrop-blur-md">
	<nav class="mx-auto flex max-w-6xl items-center justify-between py-4">
		<a href="/" class="z-[60] text-xl font-bold">
			{#if logo}
				<img src={logo.displayUrl || logo.originalUrl} alt={logo.altText} class="h-8 object-contain" />
			{:else}
				{data.settings?.siteName || 'Vision AI Tech'}
			{/if}
		</a>

		<!-- Desktop Menu -->
		<ul class="hidden items-center gap-6 md:flex">
			<li>
				<a
					href="/products"
					class="font-medium transition hover:text-accent hover:drop-shadow-accent-glow"
					>Products</a
				>
			</li>
			<li>
				<a
					href="/solutions"
					class="font-medium transition hover:text-accent hover:drop-shadow-accent-glow"
					>Solutions</a
				>
			</li>
			<li>
				<a
					href="/case-studies"
					class="font-medium transition hover:text-accent hover:drop-shadow-accent-glow"
					>Case Studies</a
				>
			</li>
			<li>
				<a
					href="/resources"
					class="font-medium transition hover:text-accent hover:drop-shadow-accent-glow"
					>Resources</a
				>
			</li>
			<li>
				<a
					href="/about"
					class="font-medium transition hover:text-accent hover:drop-shadow-accent-glow"
					>About Us</a
				>
			</li>
			{#if data.user}
				<li>
					<a
						href="/admin"
						class="font-medium transition hover:text-accent hover:drop-shadow-accent-glow"
						>Admin</a
					>
				</li>

				<li>
					<form action="/logout" method="POST">
						<button class="font-medium transition hover:text-accent hover:drop-shadow-accent-glow"
							>Logout</button
						>
					</form>
				</li>
			{:else}
				<li>
					<a
						href="/contact"
						class="rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
						>Request a Demo</a
					>
				</li>
			{/if}
		</ul>

		<!-- Mobile Menu Button -->
		<button
			onclick={toggleMenu}
			aria-label="Open menu"
			class="relative z-[60] -mr-2 rounded-md p-2 md:hidden"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="lucide lucide-menu"
				><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line
					x1="4"
					x2="20"
					y1="18"
					y2="18"
				/></svg
			>
		</button>
	</nav>
</header>

<!-- Mobile Menu Overlay -->
{#if isMenuOpen}
	<div
		class="fixed inset-0 z-[55] flex flex-col items-center justify-center bg-light/90 pt-20 text-center backdrop-blur-lg"
	>
		<ul class="flex flex-col gap-8">
			<li>
				<a href="/products" class="text-2xl font-bold text-main">Products</a>
			</li>
			<li>
				<a href="/solutions" class="text-2xl font-bold text-main">Solutions</a>
			</li>
			<li>
				<a href="/case-studies" class="text-2xl font-bold text-main">Case Studies</a>
			</li>
			<li>
				<a href="/resources" class="text-2xl font-bold text-main">Resources</a>
			</li>
			<li>
				<a href="/about" class="text-2xl font-bold text-main">About Us</a>
			</li>
			{#if data.user}
				<li>
					<a href="/admin" class="text-2xl font-bold text-main">Admin</a>
				</li>
				<li>
					<form action="/logout" method="POST">
						<button class="text-2xl font-bold text-main">Logout</button>
					</form>
				</li>
			{:else}
				<li class="mt-4">
					<a
						href="/contact"
						class="rounded-md bg-accent px-6 py-3 font-bold text-main shadow-lg shadow-accent/30"
						>Request a Demo</a
					>
				</li>
			{/if}
		</ul>
	</div>
{/if}