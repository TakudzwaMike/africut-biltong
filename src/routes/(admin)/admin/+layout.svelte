<script>
	import { page } from '$app/stores';

	const navItems = [
		{ href: '/admin/clients', label: 'Clients' },
		{ href: '/admin/case-studies', label: 'Case Studies' },
		{ href: '/admin/solutions', label: 'Solutions' },
		{ href: '/admin/blog', label: 'Blog Posts' },
		{ href: '/admin/leads', label: 'Leads' },
		{ href: '/admin/settings', label: 'Site Settings' },
		{ href: '/admin/locations', label: 'Office Locations' }
	];
</script>

<!-- Using inline styles for debugging the grid -->
<div style="display: grid; grid-template-columns: 260px 1fr; min-height: 100vh;">
	<!-- Left Column: Navigation -->
	<aside class="flex flex-col border-r border-main/10 bg-main/5 p-6">
		<a href="/admin" class="flex flex-col items-center gap-3 text-xl font-bold">
			{#if $page.data.settings?.logoUrl}
				<img
					src={$page.data.settings.logoUrl}
					alt="Logo"
					class="w-32 rounded-md object-contain"
				/>
			{/if}
            <!--
			<span>{$page.data.settings?.siteName || 'Vision AI'}</span>
            -->
		</a>
		<nav class="mt-8">
			<ul class="space-y-2">
                <p>Website</p>
				{#each navItems as item}
					<li>
						<a
							href={item.href}
							class="block rounded-md px-4 py-2 font-medium transition {$page.url.pathname.startsWith(
								item.href
							)
								? 'bg-accent text-main'
								: 'text-main/70 hover:bg-main/10'}"
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
        <nav class="mt-8">
			<ul class="space-y-2">
                <p>Store</p>
			</ul>
		</nav>

		<div class="mt-auto">
			<a href="/" class="block text-center text-sm text-main/60 hover:text-accent">← Back to Site</a>
		</div>
	</aside>

	<!-- Right Column: Content Slot -->
	<main class="overflow-y-auto bg-light">
		<slot />
	</main>
</div>