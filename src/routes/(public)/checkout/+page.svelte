<script>
	import { cart } from '$lib/stores/cart.svelte.js';
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';

	let { data } = $props();
	const { user, addresses } = data;

	// Reactive Cart State
	let items = $derived(cart.items);
	let subtotal = $derived(cart.total); // Using 'total' from store as subtotal
	let currency = $derived(cart.currency);
	
	// Discount State
	let discountCode = $state('');
	let discountError = $state('');
	let discountSuccess = $state('');
	let discountAmount = $state(0);
	let isCheckingCode = $state(false);
	
	// Final Calculation
	let total = $derived(Math.max(0, subtotal - discountAmount));

	// Form State
	let currentStep = $state('address'); // 'address' | 'payment' | 'polling'
	let selectedAddressId = $state(addresses.find(a => a.isDefault)?.id || addresses[0]?.id || null);
	let paymentMethod = $state(currency === 'ZAR' ? 'card' : 'ecocash');
	let mobilePhone = $state('');
	
	// Status State
	let isProcessing = $state(false);
	let errorMsg = $state('');
	let pollingMsg = $state('');
	let pollInterval;

	onMount(() => {
		if (cart.items.length === 0) {
			goto('/store');
		}
		return () => { if (pollInterval) clearInterval(pollInterval); }
	});

	function formatPrice(cents) {
		const symbol = currency === 'ZAR' ? 'R' : '$';
		return `${symbol}${(cents / 100).toFixed(2)}`;
	}

	async function applyDiscount() {
		if (!discountCode.trim()) return;
		isCheckingCode = true;
		discountError = '';
		discountSuccess = '';
		discountAmount = 0;

		try {
			const res = await fetch('/api/store/discount/validate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					code: discountCode, 
					subtotalCents: subtotal 
				})
			});
			
			const result = await res.json();
			
			if (result.valid) {
				discountAmount = result.discountAmount;
				discountSuccess = result.message;
			} else {
				discountError = result.message;
			}
		} catch (e) {
			discountError = 'Failed to validate code.';
		} finally {
			isCheckingCode = false;
		}
	}

	function removeDiscount() {
		discountCode = '';
		discountAmount = 0;
		discountSuccess = '';
		discountError = '';
	}

	async function handlePayment() {
		if (!selectedAddressId) {
			errorMsg = 'Please select a shipping address.';
			return;
		}
		
		isProcessing = true;
		errorMsg = '';

		try {
			const payload = {
				items: items.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
				currency,
				shippingAddressId: selectedAddressId,
				paymentMethod,
				phone: paymentMethod === 'ecocash' ? mobilePhone : undefined,
				discountCode: discountAmount > 0 ? discountCode : undefined
			};

			const res = await fetch('/api/store/checkout/initiate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const result = await res.json();
			if (!res.ok) throw new Error(result.message || 'Payment initiation failed.');

			// Check for 100% discount or redirect
			if (result.status === 'paid' && result.redirectUrl && result.redirectUrl.includes('checkout/success')) {
				cart.clear();
				goto(result.redirectUrl);
				return;
			}

			// Handle Redirect (Card) or Polling (Mobile Money)
			if (result.redirectUrl) {
				pollingMsg = "Redirecting to secure payment gateway...";
				currentStep = 'polling';
				window.location.href = result.redirectUrl;
			} else if (result.pollUrl) {
				currentStep = 'polling';
				pollingMsg = `Payment request sent to ${mobilePhone}. Please check your phone to authorize.`;
				startPolling(result.orderPublicId);
			}

		} catch (e) {
			console.error(e);
			errorMsg = e.message;
			isProcessing = false;
		}
	}

	function startPolling(orderPublicId) {
		pollInterval = setInterval(async () => {
			try {
				const res = await fetch(`/api/store/orders/${orderPublicId}/status`); // Fixed endpoint
				const data = await res.json();

				if (data.status === 'paid') {
					clearInterval(pollInterval);
					cart.clear();
					goto(`/checkout/success?order=${orderPublicId}`);
				} else if (data.status === 'cancelled' || data.status === 'failed') {
					clearInterval(pollInterval);
					errorMsg = "Payment failed or was cancelled. Please try again.";
					currentStep = 'payment';
					isProcessing = false;
				}
			} catch (e) {
				// Ignore polling errors, just retry
			}
		}, 3000);

		// Timeout after 60s
		setTimeout(() => {
			if (currentStep === 'polling') {
				clearInterval(pollInterval);
				errorMsg = "Payment verification timed out. Please check your order history.";
				currentStep = 'payment';
				isProcessing = false;
			}
		}, 60000);
	}
</script>

<svelte:head>
	<title>Checkout | Vision AI</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 pt-8 pb-24">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		
		<!-- Minimal Header -->
		<div class="mb-12 flex items-center gap-4 border-b border-slate-200 pb-6">
			<a href="/" class="text-xl font-bold text-main">Vision AI Tech</a>
			<Icon icon="mdi:chevron-right" class="text-slate-300" />
			<span class="font-medium text-slate-500">Secure Checkout</span>
		</div>

		<div class="grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-5">
			
			<!-- LEFT: Steps & Forms -->
			<div class="lg:col-span-3">
				
				<!-- Progress Stepper -->
				<nav class="mb-10 flex items-center gap-6 text-sm font-bold">
					<button class="flex items-center gap-3 {currentStep === 'address' ? 'text-accent' : 'text-main'}">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-current text-white shadow-sm">1</div>
						Shipping
					</button>
					<div class="h-px w-12 bg-slate-300"></div>
					<button class="flex items-center gap-3 {currentStep === 'payment' ? 'text-accent' : 'text-slate-400'}" disabled>
						<div class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-current bg-white">2</div>
						Payment
					</button>
					<div class="h-px w-12 bg-slate-300"></div>
					<span class="text-slate-400">Confirmation</span>
				</nav>

				<!-- STEP 1: ADDRESS -->
				{#if currentStep === 'address'}
					<div in:fade>
						<div class="flex justify-between items-end mb-6">
                            <h2 class="text-2xl font-bold text-main">Shipping Address</h2>
                            <a href="/account/addresses" class="text-sm font-bold text-accent hover:underline flex items-center gap-1">
                                <Icon icon="mdi:plus" /> New Address
                            </a>
                        </div>
						
						{#if addresses.length > 0}
							<div class="space-y-4">
								{#each addresses as addr}
									<label class="group relative flex cursor-pointer items-start gap-4 rounded-xl border p-6 shadow-sm transition-all 
										{selectedAddressId === addr.id ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-slate-200 bg-white hover:border-slate-300'}">
										
                                        <div class="flex h-5 items-center">
                                            <input type="radio" bind:group={selectedAddressId} value={addr.id} class="h-4 w-4 text-accent focus:ring-accent" />
                                        </div>
                                         
										<div class="flex-1">
                                            <div class="flex justify-between items-center mb-1">
											    <span class="font-bold text-main">{addr.label}</span>
                                                {#if addr.isDefault}
                                                    <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-200 rounded px-2 py-0.5">Default</span>
                                                {/if}
                                            </div>
											<p class="text-sm text-slate-600 leading-relaxed">
												{addr.firstName} {addr.lastName}<br>
												{addr.address}, {addr.city}<br>
												{addr.state} {addr.zipCode}, {addr.country}
											</p>
										</div>
									</label>
								{/each}
							</div>
							<div class="mt-8 flex justify-end">
								<button 
									onclick={() => currentStep = 'payment'}
									disabled={!selectedAddressId}
									class="rounded-md bg-main px-8 py-3 font-bold text-light transition hover:bg-main/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
								>
									Continue to Payment
								</button>
							</div>
						{:else}
							<div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
								<p class="text-slate-500">You don't have any saved addresses.</p>
								<a href="/account/addresses?redirectTo=/checkout" class="mt-4 inline-block rounded-md bg-white border border-slate-200 px-6 py-2 text-sm font-bold text-main shadow-sm hover:border-accent">
                                    Add New Address
                                </a>
							</div>
						{/if}
					</div>
				
				<!-- STEP 2: PAYMENT -->
				{:else if currentStep === 'payment'}
					<div in:fade>
						<h2 class="mb-6 text-2xl font-bold text-main">Payment Method</h2>
						
						{#if errorMsg}
							<div class="mb-6 rounded-md bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-200 flex items-center gap-2">
                                <Icon icon="mdi:alert-circle" width="20" />
								{errorMsg}
							</div>
						{/if}

						<div class="space-y-4">
							{#if currency === 'USD'}
                                <!-- EcoCash -->
								<label class="flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-md {paymentMethod === 'ecocash' ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-slate-200 bg-white'}">
									<input type="radio" bind:group={paymentMethod} value="ecocash" class="text-accent focus:ring-accent" />
									<div>
                                        <span class="font-bold text-main block">EcoCash / Mobile Money</span>
                                        <span class="text-xs text-slate-500">Instant mobile payment</span>
                                    </div>
                                    <Icon icon="mdi:cellphone-nfc" width="32" class="ml-auto text-slate-400" />
								</label>

								{#if paymentMethod === 'ecocash'}
									<div class="ml-0 sm:ml-8 p-6 rounded-lg bg-white border border-slate-200 shadow-inner" transition:slide>
										<label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phone Number</label>
                                        <div class="relative">
                                            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <Icon icon="mdi:phone" class="text-slate-400" />
                                            </div>
										    <input type="tel" bind:value={mobilePhone} placeholder="0771234567" class="w-full rounded-md border-slate-300 pl-10 focus:border-accent focus:ring-accent" />
                                        </div>
                                        <p class="text-xs text-slate-400 mt-2">You will receive a USSD prompt on this number.</p>
									</div>
								{/if}
                                                                 
                                <!-- Card -->
								<label class="flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-md {paymentMethod === 'card' ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-slate-200 bg-white'}">
									<input type="radio" bind:group={paymentMethod} value="card" class="text-accent focus:ring-accent" />
									<div>
                                        <span class="font-bold text-main block">Visa / MasterCard</span>
                                        <span class="text-xs text-slate-500">Secured by Paynow</span>
                                    </div>
                                    <div class="ml-auto flex gap-2 text-slate-400">
                                        <Icon icon="mdi:credit-card" width="24" />
                                    </div>
								</label>
							{:else}
								<!-- ZAR Payment -->
								<label class="flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all border-accent bg-accent/5 ring-1 ring-accent">
									<input type="radio" checked class="text-accent focus:ring-accent" />
									<div>
                                        <span class="font-bold text-main block">Credit/Debit Card</span>
                                        <span class="text-xs text-slate-500">Secured by Paystack</span>
                                    </div>
                                    <Icon icon="mdi:lock" width="24" class="ml-auto text-slate-400" />
								</label>
							{/if}
						</div>

						<div class="mt-8 flex justify-between items-center pt-8 border-t border-slate-200">
							<button onclick={() => currentStep = 'address'} class="text-sm font-bold text-slate-500 hover:text-main flex items-center gap-1">
								<Icon icon="mdi:arrow-left" /> Back
							</button>
							<button 
								onclick={handlePayment}
								disabled={isProcessing || (paymentMethod === 'ecocash' && !mobilePhone)}
								class="rounded-md bg-accent px-8 py-3 font-bold text-main shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
							>
								{#if isProcessing}
                                    <Icon icon="mdi:loading" class="animate-spin" /> Processing...
                                {:else}
                                    Pay {formatPrice(total)} <Icon icon="mdi:check" />
                                {/if}
							</button>
						</div>
					</div>
				
				<!-- STEP 3: POLLING / REDIRECTING -->
				{:else if currentStep === 'polling'}
					<div in:fade class="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
						<div class="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-slate-100 border-t-accent"></div>
						<h3 class="text-2xl font-bold text-main">Processing Payment</h3>
						<p class="mt-4 text-slate-600 max-w-md mx-auto leading-relaxed">{pollingMsg}</p>
						<div class="mt-8 rounded-full bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 border border-amber-200 flex items-center gap-2">
                            <Icon icon="mdi:alert-circle-outline" />
                            Do not close this window
                        </div>
					</div>
				{/if}
			</div>

			<!-- RIGHT: Order Summary -->
			<div class="lg:col-span-2">
				<div class="sticky top-24 rounded-xl bg-white p-6 shadow-xl ring-1 ring-black/5">
					<h3 class="font-bold text-main border-b border-slate-100 pb-4 mb-4">Order Summary</h3>
					<div class="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
						{#each items as item}
							<div class="flex items-start gap-4">
								<div class="h-16 w-16 flex-shrink-0 rounded-md bg-slate-50 border border-slate-200 overflow-hidden relative">
									{#if item.image}
										<img src={item.image} alt={item.name} class="h-full w-full object-cover" />
									{/if}
									<span class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-main text-xs font-bold text-white shadow-sm border border-white">
										{item.quantity}
									</span>
								</div>
								<div class="flex-1 min-w-0">
									<p class="text-sm font-bold text-main truncate">{item.name}</p>
									<p class="text-xs text-slate-500">{item.variantName}</p>
								</div>
								<p class="text-sm font-bold text-main whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
							</div>
						{/each}
					</div>
					
					<div class="border-t border-slate-100 pt-4 mt-4 space-y-2">
						<div class="flex justify-between text-sm text-slate-600">
							<span>Subtotal</span>
							<span>{formatPrice(subtotal)}</span>
						</div>
						<div class="flex justify-between text-sm text-slate-600">
							<span>Shipping</span>
							<span class="text-green-600 font-medium">Free</span>
						</div>
						{#if discountAmount > 0}
							<div class="flex justify-between text-sm text-green-600 font-bold">
								<span>Discount ({discountCode})</span>
								<span>-{formatPrice(discountAmount)}</span>
							</div>
						{/if}
					</div>

					<!-- Discount Input -->
					<div class="mt-4 pt-4 border-t border-slate-100">
						<label for="discount" class="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 block">Discount Code</label>
						<div class="flex gap-2">
							<input 
								type="text" 
								id="discount" 
								bind:value={discountCode} 
								placeholder="Enter Code" 
								disabled={discountAmount > 0}
								class="w-full rounded-md border-slate-200 bg-slate-50 py-2 px-3 text-sm focus:border-accent focus:ring-accent disabled:text-slate-400"
							/>
							{#if discountAmount > 0}
								<button onclick={removeDiscount} class="rounded-md bg-red-100 px-3 text-red-600 hover:bg-red-200">
									<Icon icon="mdi:close" />
								</button>
							{:else}
								<button 
									onclick={applyDiscount} 
									disabled={!discountCode || isCheckingCode}
									class="rounded-md bg-main px-4 text-sm font-bold text-white hover:bg-main/90 disabled:opacity-50"
								>
									Apply
								</button>
							{/if}
						</div>
						{#if discountError}
							<p class="mt-1 text-xs text-red-500 font-bold">{discountError}</p>
						{/if}
						{#if discountSuccess}
							<p class="mt-1 text-xs text-green-600 font-bold">{discountSuccess}</p>
						{/if}
					</div>
					
					<div class="border-t border-slate-100 pt-4 mt-4 flex justify-between items-center">
						<span class="font-bold text-lg text-main">Total</span>
						<span class="font-bold text-3xl text-accent flex items-baseline gap-1">
							<span class="text-sm font-normal text-slate-400 mr-1">{currency}</span>
							{formatPrice(total).replace(currency === 'ZAR' ? 'R' : '$', '')}
						</span>
					</div>
				</div>
			</div>

		</div>
	</div>
</div>
