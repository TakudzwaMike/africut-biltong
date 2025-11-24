<script>
	import DataTable from '$lib/components/admin/DataTable.svelte';
    import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';

	let { data } = $props();

	function formatCurrency(cents, currency) {
        if (!cents) return '-';
		const symbol = currency === 'ZAR' ? 'R' : '$';
		return `${symbol}${(cents / 100).toFixed(2)}`;
	}

    function changePage(newPage) {
		const url = new URL($page.url);
		url.searchParams.set('page', newPage.toString());
		goto(url, { noScroll: true });
	}

    function getStatusColor(status) {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800 border-green-200';
            case 'delivered': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    }

	const columns = [
		{ label: 'Order #' },
		{ label: 'Customer' },
		{ label: 'Date' },
		{ label: 'Total', class: 'text-right' },
		{ label: 'Status', class: 'text-right' },
		{ label: 'Actions', class: 'text-right' }
	];
</script>

<div class="p-8">
	<h1 class="text-3xl font-bold tracking-tight text-main mb-2">Orders</h1>
    <p class="text-main/60 mb-8">Manage incoming orders and fulfillment.</p>

	<DataTable 
		items={data.orders} 
		{columns} 
		emptyMessage="No orders found."
		row={orderRow}
	/>

    <!-- Pagination -->
	{#if data.pagination.totalPages > 1}
        <div class="mt-6 flex items-center justify-between border-t border-main/10 pt-6">
            <div class="text-sm text-main/60">
                Page <span class="font-bold text-main">{data.pagination.page}</span> of <span class="font-bold text-main">{data.pagination.totalPages}</span>
            </div>
            <div class="flex gap-2">
                <button onclick={() => changePage(data.pagination.page - 1)} disabled={data.pagination.page <= 1} class="flex items-center gap-1 rounded-md border border-main/10 bg-white px-3 py-1.5 text-sm font-medium text-main transition hover:bg-main/5 disabled:cursor-not-allowed disabled:opacity-50"><Icon icon="mdi:chevron-left" /> Previous</button>
                <button onclick={() => changePage(data.pagination.page + 1)} disabled={data.pagination.page >= data.pagination.totalPages} class="flex items-center gap-1 rounded-md border border-main/10 bg-white px-3 py-1.5 text-sm font-medium text-main transition hover:bg-main/5 disabled:cursor-not-allowed disabled:opacity-50">Next <Icon icon="mdi:chevron-right" /></button>
            </div>
        </div>
    {/if}
</div>

{#snippet orderRow(o)}
	<td class="p-4 font-mono font-bold text-main">#{o.publicId}</td>
	<td class="p-4">
        <div class="flex flex-col">
            <span class="font-bold text-main">{o.user?.firstName || 'Guest'} {o.user?.lastName || ''}</span>
            <span class="text-xs text-main/60">{o.user?.email || 'Unknown'}</span>
        </div>
    </td>
	<td class="p-4 text-sm text-main/70">{new Date(o.createdAt).toLocaleDateString()}</td>
	<td class="p-4 text-right font-mono font-bold text-main">{formatCurrency(o.total, o.currency)}</td>
	<td class="p-4 text-right">
		<span class="inline-block rounded-full border px-2 py-0.5 text-xs font-bold uppercase tracking-wide {getStatusColor(o.status)}">
			{o.status}
		</span>
	</td>
	<td class="p-4 text-right">
		<a href={`/_/admin/orders/${o.id}`} class="inline-flex items-center gap-1 rounded-md bg-main/5 px-3 py-1.5 text-sm font-bold text-main hover:bg-main/10 transition-colors">
            View <Icon icon="mdi:arrow-right" width="16" />
        </a>
	</td>
{/snippet}