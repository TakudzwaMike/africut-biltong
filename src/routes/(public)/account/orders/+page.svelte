<script>
    import Icon from '@iconify/svelte';
    
    let { data } = $props();

    function formatMoney(cents, currency) {
        const symbol = currency === 'ZAR' ? 'R' : '$';
        return `${symbol}${(cents / 100).toFixed(2)}`;
    }

    function getStatusColor(status) {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'delivered': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    }
</script>

<svelte:head>
	<title>Order History | Vision AI</title>
</svelte:head>

<h2 class="text-2xl font-bold text-main mb-8">Order History</h2>

{#if data.orders.length === 0}
    <div class="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-900/5 border border-dashed border-slate-200">
        <Icon icon="mdi:package-variant-closed" width="48" class="mx-auto text-slate-300 mb-4" />
        <p class="text-main/60">You haven't placed any orders yet.</p>
        <a href="/store" class="mt-4 inline-block text-sm font-bold text-accent hover:underline">Browse Store</a>
    </div>
{:else}
    <div class="space-y-6">
        {#each data.orders as order}
            <div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5 transition hover:shadow-md">
                <!-- Order Header -->
                <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                    <div class="flex items-center gap-4">
                        <div>
                            <span class="block text-xs font-bold uppercase tracking-wider text-slate-400">Order Placed</span>
                            <span class="text-sm font-medium text-main">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <span class="block text-xs font-bold uppercase tracking-wider text-slate-400">Total</span>
                            <span class="text-sm font-bold text-main">{formatMoney(order.total, order.currency)}</span>
                        </div>
                        <div>
                            <span class="block text-xs font-bold uppercase tracking-wider text-slate-400">Order #</span>
                            <span class="text-sm font-mono text-main">{order.publicId}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide {getStatusColor(order.status)}">
                            {order.status}
                        </span>
                        <a href={`/checkout/success?order=${order.publicId}`} class="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-main shadow-sm hover:bg-slate-50">
                            View Receipt
                        </a>
                    </div>
                </div>

                <!-- Order Items Preview -->
                <div class="p-6">
                    <ul class="space-y-4">
                        {#each order.items as item}
                            <li class="flex items-center gap-4">
                                <div class="flex h-12 w-12 items-center justify-center rounded bg-slate-100 text-slate-400">
                                    <Icon icon="mdi:cube-outline" width="24" />
                                </div>
                                <div class="flex-1">
                                    <p class="font-bold text-main text-sm">{item.variant?.product?.name || 'Product Discontinued'}</p>
                                    <p class="text-xs text-slate-500">
                                        {item.variant?.name} • Qty: {item.quantity}
                                    </p>
                                </div>
                                <p class="text-sm font-medium text-slate-600">
                                    {formatMoney(item.priceAtPurchase * item.quantity, order.currency)}
                                </p>
                            </li>
                        {/each}
                    </ul>
                    
                    {#if order.discountAmount > 0}
                        <div class="mt-4 pt-4 border-t border-slate-100 flex justify-end text-sm text-green-600 font-medium">
                            <span>Discount Applied: -{formatMoney(order.discountAmount, order.currency)}</span>
                        </div>
                    {/if}
                </div>
            </div>
        {/each}
    </div>
{/if}
