<script>
	import { cart } from '$lib/cart';
	import { page } from '$app/stores';

	const subtotal = $derived(
		$cart.reduce((total, item) => total + item.price * item.quantity, 0)
	);

	// Determine the currency from the first item in the cart, or default based on region
	const currency = $derived(
		$cart[0]?.currency || ($page.data.userCountryCode === 'ZA' ? 'ZAR' : 'USD')
	);

	function formatPrice(priceInCents, currencyCode) {
		if (priceInCents === null || priceInCents === undefined) return '';
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currencyCode
		}).format(priceInCents / 100);
	}

	function handleQuantityChange(productId, event) {
		const newQuantity = parseInt(event.currentTarget.value, 10);
		if (!isNaN(newQuantity)) {
			cart.updateQuantity(productId, newQuantity);
		}
	}
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-4xl px-8 py-20 sm:py-24">
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Your Cart</h1>
		</div>

		{#if $cart.length === 0}
			<div class="mt-16 text-center">
				<p class="text-lg text-main/70">Your cart is empty.</p>
				<a
					href="/store"
					class="mt-6 inline-block rounded-md bg-accent px-6 py-3 font-bold text-main shadow-lg shadow-accent/30 transition hover:-translate-y-1"
					>Continue Shopping</a
				>
			</div>
		{:else}
			<div class="mt-12">
				<table class="w-full text-left">
					<thead class="border-b-2 border-main/10">
						<tr>
							<th class="p-4" colspan="2">Product</th>
							<th class="p-4 text-center">Quantity</th>
							<th class="p-4 text-right">Total</th>
						</tr>
					</thead>
					<tbody>
						{#each $cart as item (item.id)}
							<tr class="border-b border-main/10">
								<td class="p-4">
									<img
										src={item.thumbnailUrl}
										alt={item.name}
										class="h-20 w-20 rounded-md bg-main/5 object-cover"
									/>
								</td>
								<td class="p-4">
									<a href={`/store/${item.slug}`} class="font-bold hover:underline">{item.name}</a>
									<p class="text-sm text-main/70">{formatPrice(item.price, currency)}</p>
								</td>
								<td class="p-4">
									<div class="flex justify-center">
										<input
											type="number"
											min="1"
											value={item.quantity}
											onchange={(e) => handleQuantityChange(item.id, e)}
											class="w-20 rounded-md border-0 bg-main/5 px-3 py-1.5 text-center text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
										/>
										<button
											onclick={() => cart.removeItem(item.id)}
											class="ml-2 p-1 text-main/50 hover:text-red-500"
											aria-label="Remove item"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="20"
												height="20"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												><path d="M3 6h18" /><path
													d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
												/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg
											>
										</button>
									</div>
								</td>
								<td class="p-4 text-right font-medium">
									{formatPrice(item.price * item.quantity, currency)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>

				<div class="mt-8 flex justify-end">
					<div class="w-full max-w-sm">
						<div class="flex justify-between font-bold">
							<span>Subtotal</span>
							<span>{formatPrice(subtotal, currency)}</span>
						</div>
						<p class="mt-2 text-sm text-main/60">
							Shipping and taxes will be calculated at checkout.
						</p>
						<a
							href="/checkout"
							class="mt-6 block w-full rounded-md bg-accent px-8 py-3 text-center font-bold text-main shadow-lg shadow-accent/30 transition hover:-translate-y-1"
						>
							Proceed to Checkout
						</a>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>