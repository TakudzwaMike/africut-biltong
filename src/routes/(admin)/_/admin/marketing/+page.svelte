<script>
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import Icon from '@iconify/svelte';

	let { data } = $props();
	let activeTab = $state('events'); // 'events' | 'codes'

	// Helper for date formatting
	function formatDate(date) {
		if (!date) return '-';
		return new Date(date).toLocaleDateString();
	}

	const eventColumns = [
		{ label: 'Name' },
		{ label: 'Badge Label' },
		{ label: 'Active' },
		{ label: 'Dates' },
		{ label: 'Actions', class: 'text-right' }
	];

	const codeColumns = [
		{ label: 'Code' },
		{ label: 'Value' },
		{ label: 'Usage' },
		{ label: 'Status' },
		{ label: 'Actions', class: 'text-right' }
	];
</script>

<div class="p-8">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-main">Marketing</h1>
			<p class="mt-2 text-base text-main/70">Manage campaigns, sales events, and discount codes.</p>
		</div>
		
		<div class="flex gap-2">
			{#if activeTab === 'events'}
				<a
					href="/_/admin/marketing/events/new"
					class="flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
				>
					<Icon icon="mdi:plus" />
					<span>Create Sale Event</span>
				</a>
			{:else}
				<a
					href="/_/admin/marketing/codes/new"
					class="flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
				>
					<Icon icon="mdi:plus" />
					<span>Create Discount</span>
				</a>
			{/if}
		</div>
	</div>

	<!-- Tabs -->
	<div class="mb-6 flex gap-4 border-b border-main/10">
		<button 
			onclick={() => activeTab = 'events'} 
			class="px-4 py-2 font-bold border-b-2 transition-colors {activeTab === 'events' ? 'border-accent text-main' : 'border-transparent text-main/60 hover:text-main'}"
		>
			Sale Events
		</button>
		<button 
			onclick={() => activeTab = 'codes'} 
			class="px-4 py-2 font-bold border-b-2 transition-colors {activeTab === 'codes' ? 'border-accent text-main' : 'border-transparent text-main/60 hover:text-main'}"
		>
			Discount Codes
		</button>
	</div>

	{#if activeTab === 'events'}
		<DataTable 
			items={data.events} 
			columns={eventColumns} 
			emptyMessage="No sale events created yet."
			row={eventRow}
		/>
	{:else}
		<DataTable 
			items={data.codes} 
			columns={codeColumns} 
			emptyMessage="No discount codes created yet."
			row={codeRow}
		/>
	{/if}
</div>

{#snippet eventRow(event)}
	<td class="p-4 font-medium text-main">{event.name}</td>
	<td class="p-4">
		{#if event.publicLabel}
			<span class="rounded-full bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{event.publicLabel}</span>
		{:else}
			<span class="text-main/40 text-xs">None</span>
		{/if}
	</td>
	<td class="p-4">
		{#if event.isActive}
			<span class="flex items-center gap-1.5 text-xs font-bold text-green-600">
				<div class="h-2 w-2 rounded-full bg-green-600"></div> Active
			</span>
		{:else}
			<span class="flex items-center gap-1.5 text-xs font-bold text-main/40">
				<div class="h-2 w-2 rounded-full bg-main/20"></div> Inactive
			</span>
		{/if}
	</td>
	<td class="p-4 text-sm text-main/70">
		{formatDate(event.startsAt)} - {formatDate(event.endsAt)}
	</td>
	<td class="p-4 text-right">
		<a href={`/_/admin/marketing/events/${event.id}`} class="font-bold text-accent hover:underline">Manage</a>
	</td>
{/snippet}

{#snippet codeRow(code)}
	<td class="p-4 font-mono font-bold text-main">{code.code}</td>
	<td class="p-4">
		{#if code.type === 'percentage'}
			<span class="font-bold">{code.value}% Off</span>
		{:else}
			<span class="font-bold">${(code.value / 100).toFixed(2)} Off</span>
		{/if}
	</td>
	<td class="p-4 text-sm">
		<span class="font-mono">{code.usageCount}</span>
		{#if code.usageLimit}
			<span class="text-main/40">/ {code.usageLimit}</span>
		{/if}
	</td>
	<td class="p-4">
		{#if code.isActive}
			<span class="rounded-md bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">Active</span>
		{:else}
			<span class="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500">Inactive</span>
		{/if}
	</td>
	<td class="p-4 text-right">
		<a href={`/_/admin/marketing/codes/${code.id}`} class="text-sm text-main/60 hover:text-main">Edit</a>
	</td>
{/snippet}
