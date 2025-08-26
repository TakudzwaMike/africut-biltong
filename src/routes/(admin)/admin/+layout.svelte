<script>
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';

	let isMenuOpen = $state(false);

	const navItems = [
		{ href: '/admin/page-content', label: 'Page Content' },
		{ href: '/admin/products', label: 'Products' },
		{ href: '/admin/solutions', label: 'Solutions' },
		{ href: '/admin/clients', label: 'Clients' },
		{ href: '/admin/case-studies', label: 'Case Studies' },
		{ href: '/admin/team-members', label: 'Team Members' },
		{ href: '/admin/blog', label: 'Blog Posts' },
		{ href: '/admin/leads', label: 'Leads' },
		{ href: '/admin/media', label: 'Media Library' },
		{ href: '/admin/settings', label: 'Site Settings' },
		{ href: '/admin/locations', label: 'Office Locations' },
		{ href: '/admin/audit-log', label: 'Audit Log' }
	];

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	afterNavigate(() => {
		isMenuOpen = false;
	});
</script>

<svelte:head>
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

<div class="admin-grid" style="min-height: 100vh;">
	<!-- Desktop-Only Sidebar -->
	<aside
		class="hidden flex-col border-r border-main/10 bg-main/5 p-6 lg:flex"
	>
		<a href="/admin" class="flex items-center gap-3 text-xl font-bold">
			{#if page.data.settings?.logoUrl}
				<img
					src={page.data.settings.logoUrl}
					alt="Logo"
					class="h-8 w-8 rounded-md object-contain"
				/>
			{/if}
			<span>{page.data.settings?.siteName || 'Vision AI'} Dashboard</span>
		</a>
		<nav class="mt-8">
			<ul class="space-y-2">
				{#each navItems as item}
					<li>
						<a
							href={item.href}
							class="block rounded-md px-4 py-2 font-medium transition {page.url.pathname.startsWith(
								item.href
							)
								? 'bg-accent text-main'
								: 'text-main/70 hover:bg-main/10'}"
						>
							{item.label}
						</a>
						<!-- Special case for Blog submenu -->
						{#if item.href === '/admin/blog' && page.url.pathname.startsWith('/admin/blog')}
							<ul class="ml-4 mt-2 space-y-1 border-l-2 border-main/10 pl-4">
								<li>
									<a
										href="/admin/blog"
										class="block rounded-md px-3 py-1 text-sm transition"
										class:font-bold={page.url.pathname === '/admin/blog'}
									>Posts</a
									>
								</li>
								<li>
									<a
										href="/admin/blog/categories"
										class="block rounded-md px-3 py-1 text-sm transition"
										class:font-bold={page.url.pathname.startsWith('/admin/blog/categories')}
									>Categories</a
									>
								</li>
							</ul>
						{/if}
					</li>
				{/each}
			</ul>
		</nav>

		<div class="mt-auto">
			<a href="/" class="block text-center text-sm text-main/60 hover:text-accent">← Back to Site</a>
		</div>
	</aside>

	<!-- Main Content Area -->
	<div class="flex flex-col">
		<!-- Mobile Header -->
		<header
			class="sticky top-0 z-90 flex items-center justify-between border-b border-main/10 bg-light/80 p-4 backdrop-blur-md lg:hidden"
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

		<main class="flex-grow overflow-y-auto bg-light">
			<slot />
		</main>
	</div>
</div>

<!-- Mobile Fullscreen Menu -->
{#if isMenuOpen}
	<div
		class="fixed inset-0 z-40 flex flex-col bg-light/95 p-6 backdrop-blur-lg lg:hidden"
	>
		<div class="flex items-center justify-between">
			<a href="/admin" class="flex items-center gap-3 text-xl font-bold">
				{#if page.data.settings?.logoUrl}
					<img
						src={page.data.settings.logoUrl}
						alt="Logo"
						class="h-8 w-8 rounded-md object-contain"
					/>
				{/if}
				<span>{page.data.settings?.siteName || 'Vision AI'} Dashboard</span>
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

		<nav class="mt-8 flex flex-1 flex-col">
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
						{#if item.href === '/admin/blog' && page.url.pathname.startsWith('/admin/blog')}
							<ul class="ml-4 mt-2 space-y-1 border-l-2 border-main/10 pl-4">
								<li>
									<a
										href="/admin/blog"
										class="block rounded-md px-3 py-2 text-base transition"
										class:font-bold={page.url.pathname === '/admin/blog'}
									>Posts</a
									>
								</li>
								<li>
									<a
										href="/admin/blog/categories"
										class="block rounded-md px-3 py-2 text-base transition"
										class:font-bold={page.url.pathname.startsWith('/admin/blog/categories')}
									>Categories</a
									>
								</li>
							</ul>
						{/if}
					</li>
				{/each}
			</ul>
		</nav>

		<div class="mt-auto">
			<a href="/" class="block text-center text-sm text-main/60 hover:text-accent">← Back to Site</a>
		</div>
	</div>
{/if}
