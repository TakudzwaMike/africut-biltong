<script>
	import { enhance } from '$app/forms';
	import SubmitButton from '$lib/components/SubmitButton.svelte';

	let isSubmitting = $state(false);
	let type = $state('percentage'); // 'percentage' | 'fixed'
</script>

<div class="mx-auto max-w-2xl p-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight text-main">New Discount Code</h1>
		<p class="mt-2 text-base text-main/70">Create a coupon for checkout.</p>
	</div>

	<form 
		method="POST" 
		class="space-y-6 rounded-xl border border-main/10 bg-white p-8 shadow-sm"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ update }) => {
				await update();
				isSubmitting = false;
			};
		}}
	>
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<div class="sm:col-span-2">
				<label for="code" class="mb-1 block font-medium text-main/80">Code</label>
				<input 
					type="text" id="code" name="code" required placeholder="e.g. WELCOME20"
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main font-bold uppercase tracking-wider shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>

			<div>
				<label for="type" class="mb-1 block font-medium text-main/80">Discount Type</label>
				<select 
					id="type" name="type" bind:value={type}
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				>
					<option value="percentage">Percentage (%)</option>
					<option value="fixed">Fixed Amount ($)</option>
				</select>
			</div>

			<div>
				<label for="value" class="mb-1 block font-medium text-main/80">Value</label>
				<div class="relative">
					{#if type === 'fixed'}
						<span class="absolute left-3 top-2 text-main/40">$</span>
					{/if}
					<input 
						type="number" id="value" name="value" required step={type === 'fixed' ? '0.01' : '1'}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent {type === 'fixed' ? 'pl-7' : ''}"
					/>
					{#if type === 'percentage'}
						<span class="absolute right-3 top-2 text-main/40">%</span>
					{/if}
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<div>
				<label for="usageLimit" class="mb-1 block font-medium text-main/80">Usage Limit (Optional)</label>
				<input 
					type="number" id="usageLimit" name="usageLimit" placeholder="e.g. 100"
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
				<p class="mt-1 text-xs text-main/60">Total number of times this code can be used.</p>
			</div>
			<div>
				<label for="minOrderAmount" class="mb-1 block font-medium text-main/80">Min Order Amount (Optional)</label>
				<div class="relative">
					<span class="absolute left-3 top-2 text-main/40">$</span>
					<input 
						type="number" id="minOrderAmount" name="minOrderAmount" step="0.01" placeholder="e.g. 50.00"
						class="w-full rounded-md border-0 bg-main/5 pl-7 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
				<p class="mt-1 text-xs text-main/60">Minimum cart subtotal (USD) required.</p>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 border-t border-main/10 pt-6">
			<div>
				<label for="startsAt" class="mb-1 block font-medium text-main/80">Start Date (Optional)</label>
				<input 
					type="datetime-local" id="startsAt" name="startsAt"
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
			<div>
				<label for="endsAt" class="mb-1 block font-medium text-main/80">End Date (Optional)</label>
				<input 
					type="datetime-local" id="endsAt" name="endsAt"
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
		</div>

		<div class="flex justify-end gap-4 pt-4">
			<a href="/_/admin/marketing" class="rounded-md px-4 py-2 font-bold text-main/60 hover:text-main">Cancel</a>
			<SubmitButton loading={isSubmitting} class="bg-accent px-8 py-2">Create Code</SubmitButton>
		</div>
	</form>
</div>
