<script>
	import Modal from '$lib/components/Modal.svelte';
	import { enhance } from '$app/forms';
	import SubmitButton from './SubmitButton.svelte';

	let { show = $bindable(false), destinationUrl, documentTitle, onclose } = $props();

	let isSubmitting = $state(false);

	function handleClose() {
		show = false;
		if (onclose) onclose();
	}
</script>

<Modal bind:show>
	<form
		method="POST"
		action="/_/admin/tracked-links?/create"
		class="p-6"
		use:enhance={() => {
			isSubmitting = true;
			return ({ result, update }) => {
				isSubmitting = false;
				if (result.type === 'success') {
					// The toast and invalidate are handled on the tracked-links page
					handleClose();
				}
				update(); // Update form prop on failure
			};
		}}
	>
		<input type="hidden" name="destinationUrl" value={destinationUrl} />

		<h3 class="text-lg font-bold">Create Tracked Link</h3>
		<p class="mt-1 text-sm text-main/70">
			Generate a new short link and QR code for: <span class="font-bold">{documentTitle}</span>
		</p>

		<div class="mt-4">
			<label for="description" class="mb-1 block font-medium text-main/80"
				>Description (for internal tracking)</label
			>
			<input
				type="text"
				id="description"
				name="description"
				required
				placeholder="e.g., Q3 LinkedIn Campaign Brochure"
				class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
			/>
		</div>

		<div class="mt-6 flex justify-end gap-4">
			<button type="button" class="font-medium text-main/70" onclick={handleClose}
				>Cancel</button
			>
			<SubmitButton type="submit" loading={isSubmitting} class="bg-accent px-6 py-2">
				Generate
			</SubmitButton>
		</div>
	</form>
</Modal>