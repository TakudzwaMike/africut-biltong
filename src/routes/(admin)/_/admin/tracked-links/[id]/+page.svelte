<script>
	import Icon from '@iconify/svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';

	let { data } = $props();
    // Default to empty objects to prevent crashes if data is missing during hydration
	let link = $derived(data.link || {});
    let stats = $derived(data.stats || { total: 0, countries: {}, browsers: {}, devices: {} });

	const columns = [
		{ label: 'Time' },
		{ label: 'Location' },
		{ label: 'Device' },
		{ label: 'Referrer' }
	];
</script>

<div class="p-8">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex items-center gap-4 mb-2">
			<a href="/_/admin/tracked-links" class="text-main/60 hover:text-main">
				<Icon icon="mdi:arrow-left" width="24" />
			</a>
			<h1 class="text-3xl font-bold tracking-tight text-main">Link Analytics</h1>
		</div>
		<div class="ml-10">
			<p class="text-lg font-medium text-main">{link.description || 'Loading...'}</p>
			<div class="flex items-center gap-4 text-sm text-main/60 mt-1">
				<a href={link.destinationUrl} target="_blank" class="hover:underline flex items-center gap-1">
					<Icon icon="mdi:link" /> {link.destinationUrl || '#'}
				</a>
				<span>•</span>
				<span class="font-mono bg-main/5 px-2 py-0.5 rounded text-main/80">
                    vision-ai.tech/r/{link.shortCode || '...'}
                </span>
			</div>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-4 mb-12">
		<div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
			<p class="text-sm font-bold uppercase tracking-widest text-main/60">Recent Clicks</p>
			<p class="mt-2 text-4xl font-bold text-accent">{stats.total}</p>
		</div>
		
		<div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
			<p class="text-sm font-bold uppercase tracking-widest text-main/60">Top Country</p>
			{#if Object.keys(stats.countries).length > 0}
				{@const top = Object.entries(stats.countries).sort((a,b) => b[1] - a[1])[0]}
				<p class="mt-2 text-2xl font-bold text-main">{top[0]}</p>
				<p class="text-xs text-main/50">{top[1]} visits</p>
			{:else}
				<p class="mt-2 text-xl text-main/40">-</p>
			{/if}
		</div>

		<div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
			<p class="text-sm font-bold uppercase tracking-widest text-main/60">Top Browser</p>
			{#if Object.keys(stats.browsers).length > 0}
				{@const top = Object.entries(stats.browsers).sort((a,b) => b[1] - a[1])[0]}
				<p class="mt-2 text-2xl font-bold text-main">{top[0]}</p>
				<p class="text-xs text-main/50">{top[1]} visits</p>
			{:else}
				<p class="mt-2 text-xl text-main/40">-</p>
			{/if}
		</div>

        <div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
			<p class="text-sm font-bold uppercase tracking-widest text-main/60">Mobile vs Desktop</p>
            <div class="mt-4 flex h-4 w-full overflow-hidden rounded-full bg-main/5">
                <div 
                    class="bg-accent h-full transition-all duration-500" 
                    style="width: {((stats.devices['mobile'] || 0) / (stats.total || 1)) * 100}%"
                ></div>
            </div>
            <div class="flex justify-between text-xs mt-2 text-main/60">
                <span>Mobile: {stats.devices['mobile'] || 0}</span>
                <span>Desktop: {stats.devices['desktop'] || 0}</span>
            </div>
		</div>
	</div>

	<!-- Recent Visits Table -->
	<h3 class="text-xl font-bold text-main mb-4">Recent Activity</h3>
	
    <DataTable 
		items={link.visits || []} 
		{columns} 
		emptyMessage="No clicks recorded yet." 
		row={visitRow} 
	/>
</div>

{#snippet visitRow(v)}
	<td class="p-4 text-sm text-main/70 whitespace-nowrap">
		{new Date(v.visitedAt).toLocaleString()}
	</td>
	<td class="p-4">
		<span class="inline-flex items-center gap-2">
            {#if v.ipCountry}
			    <img 
                    src={`https://flagcdn.com/24x18/${v.ipCountry.toLowerCase()}.png`} 
                    alt={v.ipCountry} 
                    class="h-3 w-auto rounded-sm shadow-sm"
                    loading="lazy"
                />
            {/if}
			<span class="font-medium text-main">{v.ipCountry || 'Unknown'}</span>
		</span>
	</td>
	<td class="p-4 text-sm">
		<div class="flex flex-col">
			<span class="font-bold text-main">{v.browser}</span>
			<span class="text-xs text-main/50">{v.os} • {v.deviceType}</span>
		</div>
	</td>
	<td class="p-4 text-sm text-main/60 max-w-xs truncate" title={v.referrer}>
		{v.referrer || 'Direct / None'}
	</td>
{/snippet}