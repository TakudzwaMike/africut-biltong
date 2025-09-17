<script>
	let { data } = $props();

	function formatCurrency(amount, currency) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency
		}).format(amount / 100);
	}
</script>

<div class="p-8">
	<h1 class="text-3xl font-bold tracking-tight text-main">Orders</h1>
	<p class="mt-2 text-base text-main/70">View incoming orders from the store.</p>

	<div class="mt-8 space-y-6">
		{#each data.orders as order (order.id)}
			<div class="rounded-xl border border-main/10">
				<header class="flex items-center justify-between gap-4 border-b border-main/10 p-4">
					<div>
						<p class="font-bold">{order.customerName}</p>
						<p class="text-sm text-main/70">{order.customerEmail}</p>
					</div>
					<div class="text-right">
						<p class="font-bold">{formatCurrency(order.totalAmount, order.currency)}</p>
						<p class="text-sm text-main/70">
							{new Date(order.createdAt).toLocaleString()}
						</p>
					</div>
				</header>
				<div class="p-4">
					<ul class="space-y-2">
						{#each order.items as item}
							<li class="flex justify-between text-sm">
								<span>{item.quantity} x {item.product?.name || 'Deleted Product'}</span>
								<span>{formatCurrency(item.priceAtPurchase, order.currency)}</span>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		{:else}
			<div class="mt-8 rounded-xl border border-dashed border-main/20 p-12 text-center">
				<p class="text-main/70">No orders have been placed yet.</p>
			</div>
		{/each}
	</div>
</div>