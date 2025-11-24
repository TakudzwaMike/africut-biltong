<script>
	import DataTable from '$lib/components/admin/DataTable.svelte';

	let { data } = $props();

	function formatCurrency(amount, currency) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency
		}).format(amount / 100);
	}

	const columns = [
		{ label: 'Date' },
		{ label: 'Customer' },
		{ label: 'Items' },
		{ label: 'Total', class: 'text-right' },
		{ label: 'Status', class: 'text-right' }
	];
</script>

<div class="p-8">
	<h1 class="text-3xl font-bold tracking-tight text-main">Orders</h1>
	<p class="mt-2 text-base text-main/70">View incoming orders from the store.</p>

	<DataTable 
		items={data.orders} 
		{columns} 
		emptyMessage="No orders have been placed yet."
		row={orderRow}
	/>
</div>

{#snippet orderRow(order)}
	<td class="p-4 text-sm text-main/70 whitespace-nowrap">
		{new Date(order.createdAt).toLocaleString()}
	</td>
	<td class="p-4">
		<p class="font-bold text-main">{order.customerName}</p>
		<p class="text-xs text-main/60">{order.customerEmail}</p>
	</td>
	<td class="p-4 text-sm">
		<ul class="space-y-1">
			{#each order.items as item}
				<li>
					<span class="font-bold">{item.quantity}x</span> 
					{item.product?.name || 'Deleted Product'}
				</li>
			{/each}
		</ul>
	</td>
	<td class="p-4 text-right font-mono font-bold">
		{formatCurrency(order.totalAmount, order.currency)}
	</td>
	<td class="p-4 text-right">
		<span class="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-green-800">
			{order.status}
		</span>
	</td>
{/snippet}