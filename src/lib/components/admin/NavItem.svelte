<script>
	import { page } from '$app/stores';

	/**
	 * @type {{
	 *   href: string;
	 *   label: string;
	 *   subItems?: { href: string; label: string; exact?: boolean }[];
	 * }}
	 */
	let { item } = $props();

	const isActive = $derived(
		$page.url.pathname.startsWith(item.href) &&
		// If it has sub-items, it's only active if a sub-item is also not active on a more specific route
		(!item.subItems || item.subItems.some(sub => $page.url.pathname.startsWith(sub.href)))
	);
</script>

<li>
	<a
		href={item.href}
		class="block rounded-md px-4 py-2 font-medium transition {isActive
			? 'bg-accent text-main'
			: 'text-main/70 hover:bg-main/10'}"
	>
		{item.label}
	</a>
	{#if item.subItems && isActive}
		<ul class="ml-4 mt-2 space-y-1 border-l-2 border-main/10 pl-4">
			{#each item.subItems as subItem}
				{@const isSubActive = subItem.exact ? $page.url.pathname === subItem.href : $page.url.pathname.startsWith(subItem.href)}
				<li>
					<a
						href={subItem.href}
						class="block rounded-md px-3 py-1 text-sm transition"
						class:font-bold={isSubActive}
					>
						{subItem.label}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</li>