<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { invalidateAll } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import FeaturedImagePicker from '$lib/components/FeaturedImagePicker.svelte';
	import CrudManager from '$lib/components/admin/CrudManager.svelte';
	import Icon from '@iconify/svelte';

	let { data } = $props();
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
			if (result.type === 'success' && result.data?.status === 200) {
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
	items={data.clients}
	title="Partners"
	description="Manage our Partners and their logoss"
>
	{#snippet form({ item, onCancel })}
		<form
			method="POST"
			action="?/save"
			class="space-y-6 rounded-xl border border-main/10 p-6"
			use:enhance={handleSave}
		>
			<input type="hidden" name="id" value={item.id ?? ''} />
			<h3 class="text-lg font-bold">{item.id ? 'Edit' : 'Add New'} Partner</h3>

			<div>
				<label for="name" class="mb-1 block font-medium text-main/80">Partner Name</label>
				<input
					type="text"
					id="name"
					name="name"
					required
					bind:value={item.name}
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
			<div>
				<FeaturedImagePicker
					label="Partner Logo"
					mediaItems={data.mediaItems}
					bind:selectedMediaId={item.mediaId}
					currentImageUrl={item.logo?.thumbnailUrl || item.logo?.originalUrl}
					currentImageAlt={item.logo?.altText}
				/>
			</div>

			<div class="mt-6 flex items-center justify-end gap-4">
				<button type="button" on:click={onCancel} class="font-medium text-main/70">Cancel</button>
				<SubmitButton type="submit" loading={isSubmitting} class="bg-accent px-6 py-2">
					Save Partner
				</SubmitButton>
			</div>
		</form>
	{/snippet}

	{#snippet tableHeader()}
		<tr>
			<th class="p-4">Logo</th>
			<th class="p-4">Name</th>
			<th class="p-4 text-right">Actions</th>
		</tr>
	{/snippet}

	{#snippet tableRow({ item, onEdit })}
		<td class="p-4">
			{#if item.logo}
				<img
					src={item.logo.thumbnailUrl || item.logo.originalUrl}
					alt={item.logo.altText}
					class="h-10 w-20 rounded-md bg-main/5 object-contain p-1"
				/>
			{:else}
				<div
					class="flex h-10 w-20 items-center justify-center rounded-md bg-main/5 text-xs text-main/50"
				>
					No Logo
				</div>
			{/if}
		</td>
		<td class="p-4 font-medium">{item.name}</td>
		<td class="p-4">
			<div class="flex items-center justify-end gap-2">
				<button
					on:click={onEdit}
					class="rounded-md bg-main/80 p-1.5 text-light backdrop-blur-sm"
				>
					<Icon icon="mdi:pencil" width="16" />
				</button>
				<form method="POST" action="?/delete&id={item.id}" use:enhance={handleDelete}>
					<button class="rounded-md bg-red-500 p-1.5 text-white">
						<Icon icon="mdi:trash-can-outline" width="16" />
					</button>
				</form>
			</div>
		</td>
	{/snippet}
</CrudManager>