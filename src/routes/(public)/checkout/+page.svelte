<script>
	import { cart } from '$lib/cart';
	import { page } from '$app/stores';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let { form } = $props();

	let isSubmitting = $state(false);

	const subtotal = $derived(
		$cart.reduce((total, item) => total + item.price * item.quantity, 0)
	);
	const currency = $derived(
		$cart[0]?.currency || ($page.data.userCountryCode === 'ZA' ? 'ZAR' : 'USD')
	);

	// If the cart is empty, redirect back to the store
	onMount(() => {
		if ($cart.length === 0) {
			goto('/store');
		}
	});

	function formatPrice(priceInCents, currencyCode) {
		if (priceInCents === null || priceInCents === undefined) return '';
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currencyCode
		}).format(priceInCents / 100);
	}
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-4xl px-8 py-20 sm:py-24">
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Checkout</h1>
		</div>

		<div class="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2">
			<!-- Order Summary -->
			<div class="rounded-xl border border-main/10 bg-main/5 p-6">
				<h2 class="text-lg font-bold">Order Summary</h2>
				<div class="mt-4 space-y-2 border-b border-main/10 pb-4">
					{#each $cart as item}
						<div class="flex justify-between text-sm">
							<span class="text-main/80">{item.quantity} x {item.name}</span>
							<span class="font-medium">{formatPrice(item.price * item.quantity, currency)}</span>
						</div>
					{/each}
				</div>
				<div class="mt-4 flex justify-between font-bold">
					<span>Total</span>
					<span>{formatPrice(subtotal, currency)}</span>
				</div>
			</div>

			<!-- Customer Details Form -->
			<div class="rounded-xl border border-main/10 p-6">
				<h2 class="text-lg font-bold">Your Details</h2>
				<form
					method="POST"
					class="mt-4 space-y-4"
					use:enhance={() => {
						isSubmitting = true;
						return ({ update }) => {
							isSubmitting = false;
							update();
						};
					}}
				>
					<input type="hidden" name="cartItems" value={JSON.stringify($cart)} />
					<div>
						<label for="customerName" class="mb-1 block font-medium text-main/80">Full Name</label>
						<input
							type="text"
							id="customerName"
							name="customerName"
							required
							autocomplete="name"
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						/>
					</div>
					<div>
						<label for="customerEmail" class="mb-1 block font-medium text-main/80">Email Address</label>
						<input
							type="email"
							id="customerEmail"
							name="customerEmail"
							required
							autocomplete="email"
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						/>
					</div>

					{#if form?.message}
						<p class="text-center font-bold text-red-600">{form.message}</p>
					{/if}

					<SubmitButton type="submit" loading={isSubmitting} class="w-full bg-accent">
						Place Order (Mock Payment)
					</SubmitButton>
				</form>
			</div>
		</div>
	</div>
</div>