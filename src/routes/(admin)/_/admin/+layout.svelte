<script>
	import '../../../../app.css'
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { navItems } from '$lib/admin/navigation.js';
	import NavItem from '$lib/components/admin/NavItem.svelte'; 

	let isMenuOpen = $state(false);

	// Reactive variable for the logo, derived from page data.
	// This will automatically update when the underlying data changes.
	let logo = $derived(
		page.data.mediaItems?.find((m) => m.id == page.data.settings?.siteLogoMediaId)
	);

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	// Close the mobile menu after navigation
	afterNavigate(() => {
		isMenuOpen = false;
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
	<link
		href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&display=swap"
		rel="stylesheet"
	/>
	<style>
		@media (min-width: 1024px) {
			.admin-grid {
				display: grid;
				grid-template-columns: 260px 1fr;
			}
		}
	</style>
</svelte:head>

<svelte:body class:overflow-hidden={isMenuOpen} />

<div class="admin-grid min-h-screen">
	<!--
      Desktop-Only Fixed Sidebar
      KEY CHANGES:
      1. `sticky top-0`: This makes the sidebar stick to the top of the viewport as you scroll the main content.
      2. `h-screen`: This constrains the sidebar's height to be exactly the height of the screen.
    -->
	<aside class="hidden h-screen w-64 flex-shrink-0 flex-col border-r border-main/10 bg-main/5 lg:sticky lg:top-0 lg:flex">
		<div class="flex h-full flex-col p-6">
			<a href="/admin" class="flex items-center gap-3 text-xl font-bold">
				{#if logo}
					<img
						src={logo.thumbnailUrl || logo.originalUrl}
						alt={logo.altText}
						class="h-8 w-8 rounded-md object-contain"
					/>
				{/if}
				<span>{page.data.settings?.siteName || 'Vision AI'} Dashboard</span>
			</a>

			<!--
        Your existing `flex-grow` and `overflow-y-auto` on the nav element are PERFECT.
        Because the parent <aside> now has a fixed height (h-screen), this overflow
        will now correctly activate, creating a scrollbar ONLY for the navigation list.
      -->
			<nav class="mt-8 flex-grow overflow-y-auto">
				<ul class="space-y-2">
					{#each navItems as item}
						<NavItem {item} />
					{/each}
				</ul>
			</nav>

			<div class="mt-auto flex-shrink-0 pt-4">
				<a href="/" class="block text-center text-sm text-main/60 hover:text-accent"
					>← Back to Site</a
				>
			</div>
		</div>
	</aside>

	<!--
    Main Content Area
    KEY CHANGE:
    1. `overflow-y-auto`: This tells the main content area to manage its own scrolling if its content is taller than the viewport.
  -->
	<div class="flex flex-1 flex-col overflow-y-auto">
		<!-- Mobile Header -->
		<header
			class="flex flex-shrink-0 items-center justify-between border-b border-main/10 bg-light/80 p-4 backdrop-blur-md lg:hidden"
		>
			<a href="/admin" class="text-lg font-bold">{page.data.settings?.siteName || 'Admin'}</a>
			<button onclick={toggleMenu} aria-label="Open menu" class="rounded-md p-2">
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
		</header>

		<main class="flex-grow">
			<slot />
		</main>
	</div>
</div>


<!-- Mobile Fullscreen Menu -->
{#if isMenuOpen}
	<button
		onclick={toggleMenu}
		aria-label="Close menu"
		class="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
	></button>

	<div
		class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-light/95 p-6 backdrop-blur-lg lg:hidden"
	>
		<div class="flex items-center justify-between">
			<a href="/_/admin" class="flex items-center gap-3 text-xl font-bold">
				{#if logo}
					<img
						src={logo.thumbnailUrl || logo.originalUrl}
						alt={logo.altText}
						class="h-8 w-8 rounded-md object-contain"
					/>
				{/if}
				<span>{page.data.settings?.siteName || 'Vision AI'}</span>
			</a>
			<button onclick={toggleMenu} aria-label="Close menu" class="rounded-md p-2">
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
					class="lucide lucide-x"
					><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
				>
			</button>
		</div>

		<nav class="mt-8 flex-1 overflow-y-auto">
			<ul class="space-y-2">
				{#each navItems as item}
					<li>
						<a
							href={item.href}
							class="block rounded-md px-4 py-3 text-lg font-medium transition {page.url.pathname.startsWith(
								item.href
							)
								? 'bg-accent text-main'
								: 'text-main/70 hover:bg-main/10'}"
						>
							{item.label}
						</a>
						<!-- Special case for Blog submenu -->
						{#if item.href === '/_/admin/blog' && page.url.pathname.startsWith('/_/admin/blog')}
							<ul class="ml-4 mt-2 space-y-1 border-l-2 border-main/10 pl-4">
								<li>
									<a
										href="/_/admin/blog"
										class="block rounded-md px-3 py-2 text-base transition"
										class:font-bold={page.url.pathname === '/_/admin/blog'}
									>Posts</a
									>
								</li>
								<li>
									<a
										href="/_/admin/blog/categories"
										class="block rounded-md px-3 py-2 text-base transition"
										class:font-bold={page.url.pathname.startsWith(
											'/_/admin/blog/categories'
										)}
									>Categories</a
									>
								</li>
							</ul>
						{/if}
					</li>
				{/each}
			</ul>
		</nav>

		<div class="mt-auto flex-shrink-0 pt-4">
			<a href="/" class="block text-center text-sm text-main/60 hover:text-accent"
				>← Back to Site</a
			>
		</div>
	</div>
{/if}