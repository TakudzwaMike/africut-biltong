<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { invalidateAll } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import CrudManager from '$lib/components/admin/CrudManager.svelte';
	import Icon from '@iconify/svelte';

	let { data, form } = $props();
	let crudManager;
	let isSubmitting = $state(false);

	function handleSave() {
		isSubmitting = true;
		return async ({ result, update }) => {
			if (result.type === 'success' && result.data?.success) {
				toast.success(result.data.message);
				crudManager.closeForm();
				await invalidateAll();
			} else if (result.type === 'failure') {
				toast.error(result.data?.message);
			}
			isSubmitting = false;
			update({ reset: false });
		};
	}

	function handleDelete() {
		return async ({ result, update }) => {
			if (result.type === 'success' && result.data?.success) {
				toast.success(result.data.message);
				await invalidateAll();
			} else if (result.type === 'failure') {
				toast.error(result.data?.message);
			}
			update();
		};
	}
</script>

<CrudManager
	bind:this={crudManager}
	items={data.locations}
	title="Office Locations"
	description="Manage the contact locations displayed in the website footer."
>
	{#snippet form({ item, onCancel })}
		<form
			method="POST"
			action="?/save"
			class="rounded-xl border border-main/10 p-6"
			use:enhance={handleSave}
		>
			<input type="hidden" name="id" value={item.id ?? ''} />
			<h3 class="text-lg font-bold">{item.id ? 'Edit' : 'Add New'} Location</h3>
			<div class="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
				<div>
					<label for="countryName" class="mb-1 block font-medium text-main/80">Country Name</label>
					<input
						type="text" name="countryName" placeholder="e.g., Zimbabwe" required
						bind:value={item.countryName}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
				<div>
					<label for="countryCode" class="mb-1 block font-medium text-main/80">Country Code (2 Letters)</label>
					<input
						type="text" name="countryCode" placeholder="e.g., ZW" required maxlength="2"
						bind:value={item.countryCode}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
				<div class="sm:col-span-2">
					<label for="address" class="mb-1 block font-medium text-main/80">Address/Details</label>
					<textarea
						name="address" rows="3" placeholder="e.g., 123 Innovation Drive, Harare"
						required bind:value={item.address}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					></textarea>
				</div>
				<div class="sm:col-span-2">
					<label for="phoneNumber" class="mb-1 block font-medium text-main/80">Phone Number (Optional)</label>
					<input
						type="tel" name="phoneNumber" placeholder="e.g., +263 77 123 4567"
						bind:value={item.phoneNumber}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
				<div>
					<label for="latitude" class="mb-1 block font-medium text-main/80">Latitude (Optional)</label>
					<input
						type="text" name="latitude" placeholder="e.g., -17.8252"
						bind:value={item.latitude}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
				<div>
					<label for="longitude" class="mb-1 block font-medium text-main/80">Longitude (Optional)</label>
					<input
						type="text" name="longitude" placeholder="e.g., 31.0335"
						bind:value={item.longitude}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
			</div>
			<div class="mt-6 flex items-center justify-end gap-4">
				<button type="button" on:click={onCancel} class="font-medium text-main/70">Cancel</button>
				<SubmitButton type="submit" loading={isSubmitting} class="bg-accent px-6 py-2">
					Save Location
				</SubmitButton>
			</div>
		</form>
	{/snippet}

	{#snippet tableHeader()}
		<tr>
			<th class="p-4">Country</th>
			<th class="p-4">Address</th>
			<th class="p-4">Phone</th>
			<th class="p-4">Coords</th>
			<th class="p-4 text-right">Actions</th>
		</tr>
	{/snippet}

	{#snippet tableRow({ item, onEdit })}
		<td class="p-4 font-medium">{item.countryName} ({item.countryCode})</td>
		<td class="p-4 text-main/80">{item.address}</td>
		<td class="p-4 text-main/80">{item.phoneNumber || 'N/A'}</td>
		<td class="p-4 font-mono text-xs text-main/60">
			{item.latitude || 'N/A'}, {item.longitude || 'N/A'}
		</td>
		<td class="p-4">
			<div class="flex items-center justify-end gap-2">
				<button on:click={onEdit} class="rounded-md bg-main/80 p-1.5 text-light" aria-label="Edit location">
					<Icon icon="mdi:pencil" width="16" />
				</button>
				<form method="POST" action="?/delete&id={item.id}" use:enhance={handleDelete}>
					<button class="rounded-md bg-red-500 p-1.5 text-white" aria-label="Delete location">
						<Icon icon="mdi:trash-can-outline" width="16" />
					</button>
				</form>
			</div>
		</td>
	{/snippet}
</CrudManager>