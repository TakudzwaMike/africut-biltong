<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { goto } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';

	let { data } = $props();
	let isSubmitting = $state(false);
	let type = $state(data.code.type);

	function formatDateTimeLocal(date) {
		if (!date) return '';
		const d = new Date(date);
		const pad = (num) => num.toString().padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}

	// Convert values for display (cents -> dollars)
	let displayValue = $derived(type === 'fixed' ? (data.code.value / 100).toFixed(2) : data.code.value);
	let displayMinOrder = $derived(data.code.minOrderAmount ? (data.code.minOrderAmount / 100).toFixed(2) : '');

	function handleUpdate() {
		isSubmitting = true;
		return ({ result, update }) => {
			isSubmitting = false;
			if (result.type === 'success') toast.success(result.data.message);
			else toast.error(result.data?.message);
			update({ reset: false });
		};
	}

	function handleDelete() {
		return ({ result }) => {
			if (result.type === 'success') {
				toast.success('Code deleted');
				goto('/_/admin/marketing');
			} else {
				toast.error('Failed to delete');
			}
		};
	}
</script>

<div class="mx-auto max-w-2xl p-8">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-main">Edit Discount Code</h1>
			<p class="text-main/70 mt-1">Usage Count: {data.code.usageCount}</p>
		</div>
		<div class="flex gap-2">
			<a href="/_/admin/marketing" class="btn-secondary bg-white text-main border border-main/10 hover:bg-main/5">Back</a>
			<form method="POST" action="?/delete" use:enhance={handleDelete} onsubmit={(e) => !confirm('Delete this code?') && e.preventDefault()}>
				<button class="btn-danger">Delete</button>
			</form>
		</div>
	</div>

	<form 
		method="POST" 
		action="?/update"
		class="space-y-6 rounded-xl border border-main/10 bg-white p-8 shadow-sm"
		use:enhance={handleUpdate}
	>
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<div class="sm:col-span-2">
				<label for="code" class="mb-1 block font-medium text-main/80">Code</label>
				<input 
					type="text" id="code" name="code" required value={data.code.code}
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
						value={displayValue}
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
				<label for="usageLimit" class="mb-1 block font-medium text-main/80">Usage Limit</label>
				<input 
					type="number" id="usageLimit" name="usageLimit" value={data.code.usageLimit} placeholder="Unlimited"
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
			<div>
				<label for="minOrderAmount" class="mb-1 block font-medium text-main/80">Min Order Amount</label>
				<div class="relative">
					<span class="absolute left-3 top-2 text-main/40">$</span>
					<input 
						type="number" id="minOrderAmount" name="minOrderAmount" step="0.01" value={displayMinOrder} placeholder="None"
						class="w-full rounded-md border-0 bg-main/5 pl-7 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 border-t border-main/10 pt-6">
			<div>
				<label for="startsAt" class="mb-1 block font-medium text-main/80">Start Date</label>
				<input 
					type="datetime-local" id="startsAt" name="startsAt" value={formatDateTimeLocal(data.code.startsAt)}
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
			<div>
				<label for="endsAt" class="mb-1 block font-medium text-main/80">End Date</label>
				<input 
					type="datetime-local" id="endsAt" name="endsAt" value={formatDateTimeLocal(data.code.endsAt)}
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
		</div>

		<div class="flex items-center gap-3 border-t border-main/10 pt-6">
			<input type="checkbox" name="isActive" id="isActive" checked={data.code.isActive} class="h-5 w-5 rounded border-main/20 text-accent focus:ring-accent" />
			<label for="isActive" class="font-bold text-main">Is Active</label>
		</div>

		<div class="flex justify-end pt-4">
			<SubmitButton loading={isSubmitting} class="bg-accent px-8 py-2">Save Changes</SubmitButton>
		</div>
	</form>
</div>
