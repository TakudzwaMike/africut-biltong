<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service'; // Import toast
	import SubmitButton from '$lib/components/SubmitButton.svelte';

	let isSubmitting = $state(false);
</script>

<div class="mx-auto max-w-2xl p-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight text-main">New Sale Event</h1>
		<p class="mt-2 text-base text-main/70">Create a campaign shell. You can add product prices on the next screen.</p>
	</div>

	<form 
		method="POST" 
		class="space-y-6 rounded-xl border border-main/10 bg-white p-8 shadow-sm"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ result, update }) => {
				// Ensure we turn off loading regardless of success/failure
				isSubmitting = false;
				
				if (result.type === 'failure') {
					toast.error(result.data?.message || 'Failed to create event.');
				} else if (result.type === 'error') {
					toast.error('An unexpected error occurred.');
				}
				
				await update();
			};
		}}
	>
		<div>
			<label for="name" class="mb-1 block font-medium text-main/80">Internal Name</label>
			<input 
				type="text" id="name" name="name" required placeholder="e.g. Q3 Inventory Clearance"
				class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
			/>
		</div>

		<div>
			<label for="publicLabel" class="mb-1 block font-medium text-main/80">Public Label (Badge)</label>
			<input 
				type="text" id="publicLabel" name="publicLabel" placeholder="e.g. Summer Sale"
				class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
			/>
			<p class="mt-1 text-xs text-main/60">Shown on product cards (e.g., "Black Friday").</p>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<div>
				<label for="startsAt" class="mb-1 block font-medium text-main/80">Start Date</label>
				<input 
					type="datetime-local" id="startsAt" name="startsAt" required
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
			<div>
				<label for="endsAt" class="mb-1 block font-medium text-main/80">End Date</label>
				<input 
					type="datetime-local" id="endsAt" name="endsAt" required
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
		</div>

		<div class="flex justify-end gap-4 pt-4">
			<a href="/_/admin/marketing" class="rounded-md px-4 py-2 font-bold text-main/60 hover:text-main">Cancel</a>
			<SubmitButton loading={isSubmitting} class="bg-accent px-8 py-2">Create Event</SubmitButton>
		</div>
	</form>
</div>