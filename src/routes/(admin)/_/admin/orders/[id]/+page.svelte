<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import Icon from '@iconify/svelte';

	let { data } = $props();
	const { order } = data;

	function handleUpdate() {
		return ({ result, update }) => {
			if (result.type === 'success') toast.success('Order status updated');
			update({ reset: false });
		};
	}

	function formatMoney(cents, currency) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
	}
</script>

<div class="p-8 max-w-6xl mx-auto">
	<div class="mb-8 flex items-center justify-between">
        <div>
		    <h1 class="text-3xl font-bold text-main">Order #{order.publicId}</h1>
            <p class="text-main/60 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
		<a href="/_/admin/orders" class="text-sm font-bold text-main/60 hover:text-main">← Back to Orders</a>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		
		<!-- Left Column: Items & Totals -->
		<div class="lg:col-span-2 space-y-8">
			<div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
				<h3 class="text-lg font-bold mb-4 border-b border-main/10 pb-2">Line Items</h3>
				<ul class="divide-y divide-main/5">
					{#each order.items as item}
						<li class="py-4 flex justify-between items-center">
							<div class="flex items-center gap-4">
                                <div class="h-10 w-10 rounded bg-main/5 flex items-center justify-center text-main/40 font-bold">
                                    {item.quantity}x
                                </div>
								<div>
									<p class="font-bold text-main">{item.variant?.product?.name || 'Deleted Product'}</p>
									<p class="text-xs text-main/60">
                                        {item.variant?.name} 
                                        {#if item.variant?.sku}• SKU: {item.variant.sku}{/if}
                                    </p>
								</div>
							</div>
							<p class="font-mono font-medium">{formatMoney(item.priceAtPurchase * item.quantity, order.currency)}</p>
						</li>
					{/each}
				</ul>
				
				<!-- Financial Breakdown -->
				<div class="mt-4 pt-4 border-t border-main/10 space-y-2">
					<div class="flex justify-between items-center text-sm text-main/70">
						<span>Subtotal</span>
						<span>{formatMoney(order.subtotal || order.total, order.currency)}</span>
					</div>
					
					{#if order.discountAmount > 0}
						<div class="flex justify-between items-center text-sm text-green-600 font-medium">
							<span class="flex items-center gap-1">
								<Icon icon="mdi:ticket-percent" width="16" />
								Discount {order.discountCode ? `(${order.discountCode.code})` : ''}
							</span>
							<span>-{formatMoney(order.discountAmount, order.currency)}</span>
						</div>
					{/if}

					<div class="flex justify-between items-center pt-2 mt-2 border-t border-dashed border-main/10">
						<span class="font-bold text-lg">Total</span>
						<span class="font-bold text-2xl text-accent drop-shadow-sm">{formatMoney(order.total, order.currency)}</span>
					</div>
				</div>
			</div>

			<div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
				<h3 class="text-lg font-bold mb-4 border-b border-main/10 pb-2">Shipping Details</h3>
				{#if order.shippingAddress}
					<div class="text-main/80">
						<p class="font-bold text-lg">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                        <div class="mt-2 text-sm leading-relaxed">
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                            <p>{order.shippingAddress.country}</p>
                        </div>
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center py-6 text-main/40">
                        <Icon icon="mdi:map-marker-off" width="32" />
					    <p class="mt-2 text-sm">No shipping address provided.</p>
                    </div>
				{/if}
			</div>
		</div>

		<!-- Right Column: Actions & Customer -->
		<div class="space-y-8">
			
            <!-- Status Management -->
            <div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
				<h3 class="text-lg font-bold mb-4">Fulfillment Status</h3>
				
				<form method="POST" action="?/updateStatus" use:enhance={handleUpdate}>
					<label class="block text-xs font-bold text-main/60 mb-2">Current Status</label>
					<select name="status" class="w-full rounded-md border-main/20 bg-main/5 px-3 py-2 mb-4 focus:border-accent focus:ring-accent" value={order.status}>
						<option value="pending">Pending</option>
						<option value="paid">Paid</option>
						<option value="shipped">Shipped</option>
						<option value="delivered">Delivered</option>
						<option value="cancelled">Cancelled</option>
					</select>
					<button class="w-full rounded-md bg-main px-4 py-2.5 font-bold text-light hover:bg-main/90 shadow-lg transition-all hover:-translate-y-0.5">
						Update Status
					</button>
				</form>

                <div class="mt-6 pt-6 border-t border-main/10">
                    <p class="text-xs text-main/50 mb-1">Payment Polling URL</p>
                    <code class="block w-full overflow-hidden text-ellipsis whitespace-nowrap rounded bg-main/5 px-2 py-1 text-xs text-main/70 font-mono">
                        {order.paymentGatewayPollUrl || 'None'}
                    </code>
                </div>
			</div>

            <!-- Customer Card -->
			<div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
				<h3 class="text-lg font-bold mb-4">Customer</h3>
				<div class="flex items-start gap-4">
					<div class="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
						<Icon icon="mdi:account" width="24" />
					</div>
					<div>
						<p class="font-bold text-main">{order.user.firstName || 'Guest'} {order.user.lastName || ''}</p>
						<a href={`mailto:${order.user.email}`} class="text-sm text-main/60 hover:text-accent hover:underline block mt-1">
                            {order.user.email}
                        </a>
                        <p class="text-xs text-main/40 mt-2">User ID: {order.userId}</p>
					</div>
				</div>
			</div>

		</div>
	</div>
</div>
