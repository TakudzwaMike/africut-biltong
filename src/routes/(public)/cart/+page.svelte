<script>
	import { cart } from '$lib/stores/cart.svelte.js'; // Make sure it points to .svelte.js
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Icon from '@iconify/svelte';
	import { fade } from 'svelte/transition';

	// Svelte 5 Runes: Use 'cart' directly. No '$' needed.
	// We use derived to ensure reactive updates if specific properties change,
	// but accessing cart.items directly in the template also works in Svelte 5.
	let items = $derived(cart.items);
	let total = $derived(cart.total);
	let currency = $derived(cart.currency);
	let count = $derived(cart.count);

	function formatPrice(cents) {
		const symbol = currency === 'ZAR' ? 'R' : '$';
		return `${symbol}${(cents / 100).toFixed(2)}`;
	}
</script>

<svelte:head>
	<title>Your Cart | Vision AI</title>
</svelte:head>

<PageHeader 
	title="Shopping Cart" 
	subtitle={count > 0 ? `${count} item${count !== 1 ? 's' : ''} ready for checkout.` : 'Your cart is currently empty.'}
/>

<div class="relative z-10 bg-slate-50 py-24">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		
		{#if items.length === 0}
			<div class="flex flex-col items-center justify-center py-12 text-center" in:fade>
				<div class="mb-6 rounded-full bg-white p-8 shadow-sm ring-1 ring-slate-900/5">
					<Icon icon="mdi:cart-off" width="64" class="text-main/20" />
				</div>
				<h2 class="text-2xl font-bold text-main">Your cart is empty</h2>
				<p class="mt-2 text-main/60">Looks like you haven't added any hardware or licenses yet.</p>
				<a href="/store" class="mt-8 inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 font-bold text-main shadow-lg transition hover:-translate-y-1">
					Browse Store <Icon icon="mdi:arrow-right" />
				</a>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-12 lg:grid-cols-3" in:fade>
				
				<!-- Left: Cart Items -->
				<div class="lg:col-span-2 space-y-4">
					{#each items as item (item.variantId)}
						<div class="flex flex-col gap-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 sm:flex-row sm:items-center transition hover:shadow-md" transition:fade|local>
							<!-- Image -->
							<div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
								{#if item.image}
									<img src={item.image} alt={item.name} class="h-full w-full object-cover" />
								{:else}
									<div class="flex h-full w-full items-center justify-center text-main/20">
										<Icon icon="mdi:cube-outline" width="32" />
									</div>
								{/if}
							</div>

							<!-- Details -->
							<div class="flex-1">
								<h3 class="font-bold text-main text-lg">
									<a href={`/products/${item.id}`} class="hover:text-accent transition-colors">{item.name}</a>
								</h3>
								<p class="text-sm text-main/60 mt-1 font-medium">{item.variantName || 'Default'}</p>
								<button onclick={() => cart.removeItem(item.variantId)} class="mt-3 flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors">
									<Icon icon="mdi:trash-can-outline" /> Remove
								</button>
							</div>

							<!-- Controls -->
							<div class="flex flex-col items-end gap-3">
								<span class="text-lg font-bold text-main">{formatPrice(item.price * item.quantity)}</span>
								
								<div class="flex items-center rounded-lg border border-slate-200 bg-slate-50">
									<button 
										onclick={() => cart.updateQuantity(item.variantId, -1)}
										class="px-3 py-1 text-main/60 hover:bg-white hover:text-main disabled:opacity-30 transition-colors rounded-l-lg"
										disabled={item.quantity <= 1}
									>−</button>
									<div class="w-8 text-center text-sm font-bold border-x border-slate-200 py-1 bg-white">
										{item.quantity}
									</div>
									<button 
										onclick={() => cart.updateQuantity(item.variantId, 1)}
										class="px-3 py-1 text-main/60 hover:bg-white hover:text-main transition-colors rounded-r-lg"
									>+</button>
								</div>
							</div>
						</div>
					{/each}
				</div>

				<!-- Right: Summary -->
				<div class="h-fit space-y-6 rounded-xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5 sticky top-24">
					<h3 class="text-xl font-bold text-main border-b border-slate-100 pb-4">Order Summary</h3>
					
					<div class="space-y-3 text-sm">
						<div class="flex justify-between text-main/70">
							<span>Subtotal</span>
							<span>{formatPrice(total)}</span>
						</div>
						<div class="flex justify-between text-main/70">
							<span>Shipping</span>
							<span class="italic text-main/40">Calculated at checkout</span>
						</div>
					</div>

					<div class="border-t border-slate-100 pt-4 flex justify-between items-center">
						<span class="font-bold text-main text-lg">Total</span>
						<span class="font-bold text-3xl text-main">{formatPrice(total)}</span>
					</div>

					<a href="/checkout" class="block w-full rounded-md bg-accent px-6 py-4 text-center font-bold text-main shadow-lg transition hover:bg-white hover:ring-2 hover:ring-accent hover:shadow-xl">
						Proceed to Checkout
					</a>
					
					<div class="flex items-center justify-center gap-2 text-xs text-main/40 pt-2">
						<Icon icon="mdi:lock" />
						<span>Secure Encrypted Checkout</span>
					</div>
				</div>

			</div>
		{/if}
	</div>
</div>