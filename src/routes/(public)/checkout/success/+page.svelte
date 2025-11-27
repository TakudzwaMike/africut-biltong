<script>
    import Icon from '@iconify/svelte';
    import { onMount } from 'svelte';
    import { run } from 'svelte/legacy';
    import confetti from 'canvas-confetti'; // You might need to install this, or we can use a CSS animation fallback

    let { data } = $props();
    const { order } = data;

    function formatMoney(cents, currency) {
        const symbol = currency === 'ZAR' ? 'R' : '$';
        return `${symbol}${(cents / 100).toFixed(2)}`;
    }

    onMount(() => {
        if (order.status === 'paid') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#C0D532', '#12102B', '#ffffff']
            });
        }
    });
</script>

<svelte:head>
    <title>Order Confirmed | Vision AI</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 py-24">
    <div class="mx-auto max-w-3xl px-6 lg:px-8">
        
        <!-- Status Card -->
        <div class="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5 text-center mb-8">
            {#if order.status === 'paid'}
                <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                    <Icon icon="mdi:check-bold" class="text-green-600" width="32" />
                </div>
                <h1 class="text-3xl font-bold text-main">Order Confirmed!</h1>
                <p class="mt-4 text-lg text-slate-600">
                    Thank you for your purchase. Your order <span class="font-mono font-bold text-main">#{order.publicId}</span> has been processed.
                </p>
            {:else}
                <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 mb-6">
                    <Icon icon="mdi:clock-outline" class="text-yellow-600" width="32" />
                </div>
                <h1 class="text-3xl font-bold text-main">Order Pending</h1>
                <p class="mt-4 text-lg text-slate-600">
                    Your order <span class="font-mono font-bold text-main">#{order.publicId}</span> is currently <strong>{order.status}</strong>.
                </p>
            {/if}
            
            <div class="mt-8 flex justify-center gap-4">
                <a href="/account/orders" class="rounded-md border border-slate-200 px-6 py-2 text-sm font-bold text-main hover:bg-slate-50">
                    View Order History
                </a>
                <a href="/store" class="rounded-md bg-main px-6 py-2 text-sm font-bold text-light hover:bg-main/90">
                    Continue Shopping
                </a>
            </div>
        </div>

        <!-- Order Details -->
        <div class="rounded-2xl bg-white overflow-hidden shadow-sm ring-1 ring-slate-900/5">
            <div class="border-b border-slate-100 bg-slate-50/50 px-8 py-4 flex justify-between items-center">
                <h3 class="font-bold text-main">Receipt</h3>
                <span class="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            
            <div class="p-8">
                <!-- Items -->
                <ul class="space-y-6 mb-8">
                    {#each order.items as item}
                        <li class="flex items-start gap-4">
                            <div class="h-16 w-16 rounded-md bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                                {#if item.variant?.product?.featuredImage}
                                    <!-- Ideally fetch image relation in server load, but fallback to icon is fine for receipt -->
                                    <div class="h-full w-full flex items-center justify-center text-slate-300"><Icon icon="mdi:cube" width="24" /></div>
                                {:else}
                                    <div class="h-full w-full flex items-center justify-center text-slate-300"><Icon icon="mdi:cube" width="24" /></div>
                                {/if}
                            </div>
                            <div class="flex-1">
                                <p class="font-bold text-main">{item.variant?.product?.name || 'Unknown Product'}</p>
                                <p class="text-sm text-slate-500">{item.variant?.name}</p>
                            </div>
                            <div class="text-right">
                                <p class="font-medium text-main">{formatMoney(item.priceAtPurchase * item.quantity, order.currency)}</p>
                                <p class="text-xs text-slate-400">{item.quantity} x {formatMoney(item.priceAtPurchase, order.currency)}</p>
                            </div>
                        </li>
                    {/each}
                </ul>

                <!-- Totals -->
                <div class="border-t border-slate-100 pt-6 space-y-2">
                    <div class="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span>{formatMoney(order.subtotal || order.total, order.currency)}</span>
                    </div>
                    
                    {#if order.discountAmount > 0}
                        <div class="flex justify-between text-green-600 font-medium">
                            <span class="flex items-center gap-1">
                                <Icon icon="mdi:tag" width="16" /> 
                                Discount {order.discountCode ? `(${order.discountCode.code})` : ''}
                            </span>
                            <span>-{formatMoney(order.discountAmount, order.currency)}</span>
                        </div>
                    {/if}

                    <div class="flex justify-between text-xl font-bold text-main pt-4 border-t border-slate-100 mt-4">
                        <span>Total</span>
                        <span>{formatMoney(order.total, order.currency)}</span>
                    </div>
                </div>
            </div>

            <!-- Shipping Address -->
            {#if order.shippingAddress}
                <div class="bg-slate-50 px-8 py-6 border-t border-slate-100">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Shipping To</h4>
                    <p class="font-medium text-main">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p class="text-sm text-slate-600">{order.shippingAddress.address}</p>
                    <p class="text-sm text-slate-600">{order.shippingAddress.city}, {order.shippingAddress.country}</p>
                </div>
            {/if}
        </div>

    </div>
</div>
