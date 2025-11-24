<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { invalidateAll } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import FeaturedImagePicker from '$lib/components/FeaturedImagePicker.svelte';
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
	items={data.teamMembers}
	title="Team Members"
	description="Manage the team profiles for the 'About Us' page."
>
	<!-- Snippet for the Form, passed as the `form` prop -->
	{#snippet form({ item, onCancel })}
		<form
			method="POST"
			action="?/save"
			class="rounded-xl border border-main/10 p-6"
			use:enhance={handleSave}
		>
			<input type="hidden" name="id" value={item.id ?? ''} />
			<h3 class="text-lg font-bold">{item.id ? 'Edit' : 'Add'} Team Member</h3>

			<div class="mt-4 space-y-4">
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label for="name" class="mb-1 block font-medium text-main/80">Full Name</label>
						<input
							type="text" id="name" name="name" required bind:value={item.name}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						/>
					</div>
					<div>
						<label for="title" class="mb-1 block font-medium text-main/80">Title / Role</label>
						<input
							type="text" id="title" name="title" required bind:value={item.title}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						/>
					</div>
				</div>
				<div>
					<label for="bio" class="mb-1 block font-medium text-main/80">Short Bio</label>
					<textarea
						id="bio" name="bio" rows="3" bind:value={item.bio}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					></textarea>
				</div>
				<div>
					<FeaturedImagePicker
						mediaItems={data.mediaItems}
						bind:selectedMediaId={item.mediaId}
						currentImageUrl={item.photo?.thumbnailUrl || item.photo?.originalUrl}
						currentImageAlt={item.photo?.altText}
						label="Profile Photo"
					/>
				</div>
			</div>

			<div class="mt-6 flex items-center justify-end gap-4">
				<button type="button" on:click={onCancel} class="font-medium text-main/70">Cancel</button>
				<SubmitButton type="submit" loading={isSubmitting} class="bg-accent px-6 py-2">
					Save Member
				</SubmitButton>
			</div>
		</form>
	{/snippet}

	<!-- Snippet for the Table Header, passed as the `tableHeader` prop -->
	{#snippet tableHeader()}
		<tr>
			<th class="p-4">Photo</th>
			<th class="p-4">Name</th>
			<th class="p-4">Title</th>
			<th class="p-4">Bio</th>
			<th class="p-4 text-right">Actions</th>
		</tr>
	{/snippet}

	<!-- Snippet for a single Table Row, passed as the `tableRow` prop -->
	{#snippet tableRow({ item, onEdit })}
		<td class="p-4">
			{#if item.photo}
				<img src={item.photo.thumbnailUrl || item.photo.originalUrl} alt={item.photo.altText} class="h-10 w-10 flex-shrink-0 rounded-full object-cover" />
			{:else}
				<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-main/5">
					<Icon icon="mdi:account" class="text-main/40" width="24" />
				</div>
			{/if}
		</td>
		<td class="p-4 font-medium">{item.name}</td>
		<td class="p-4 text-sm text-accent">{item.title}</td>
		<td class="p-4 text-sm text-main/70">{item.bio}</td>
		<td class="p-4">
			<div class="flex items-center justify-end gap-2">
				<button on:click={onEdit} class="rounded-md bg-main/80 p-1.5 text-light" aria-label="Edit team member">
					<Icon icon="mdi:pencil" width="16" />
				</button>
				<form method="POST" action="?/delete&id={item.id}" use:enhance={handleDelete}>
					<button class="rounded-md bg-red-500 p-1.5 text-white" aria-label="Delete team member">
						<Icon icon="mdi:trash-can-outline" width="16" />
					</button>
				</form>
			</div>
		</td>
	{/snippet}
</CrudManager>