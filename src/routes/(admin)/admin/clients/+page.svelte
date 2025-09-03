<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { invalidateAll } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import FeaturedImagePicker from '$lib/components/FeaturedImagePicker.svelte';

	let { data, form } = $props();

	let editingClient = $state(null);
	let isSubmitting = $state(false);

	$effect(() => {
		if (form?.success) {
			toast.success(form.message);
			invalidateAll();
			editingClient = null;
		} else if (form?.message && form?.status !== 200) {
			toast.error(form.message);
		}
	});

	function startEditing(client) {
		editingClient = { ...client };
	}

	function startCreating() {
		editingClient = { id: null, name: '', mediaId: null };
	}

	function cancelEditing() {
		editingClient = null;
	}

	function handleDelete() {
		return ({ result }) => {
			if (result.type === 'success' && result.data?.status === 200) {
				toast.success(result.data.message);
				invalidateAll();
			} else if (result.type === 'failure') {
				toast.error(result.data.message);
			}
		};
	}
</script>

<div class="p-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-main">Clients</h1>
			<p class="mt-2 text-base text-main/70">Manage your clients and their logos.</p>
		</div>
		{#if !editingClient}
			<button
				onclick={startCreating}
				class="rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
			>
				+ Create New
			</button>
		{/if}
	</div>

	<!-- Add/Edit Form -->
	{#if editingClient}
		<div class="mt-8 max-w-2xl">
			<form
				method="POST"
				action="?/save"
				class="space-y-6 rounded-xl border border-main/10 p-6"
				use:enhance={() => {
					isSubmitting = true;
					return () => (isSubmitting = false);
				}}
			>
				<input type="hidden" name="id" value={editingClient.id} />
				<h3 class="text-lg font-bold">{editingClient.id ? 'Edit' : 'Add New'} Client</h3>

				<div>
					<label for="name" class="mb-1 block font-medium text-main/80">Client Name</label>
					<input
						type="text"
						id="name"
						name="name"
						required
						bind:value={editingClient.name}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
				<div>
					<FeaturedImagePicker
						mediaItems={data.mediaItems}
						bind:selectedMediaId={editingClient.mediaId}
						currentImageUrl={editingClient.logo?.url}
						currentImageAlt={editingClient.logo?.altText}
					/>
				</div>

				<div class="mt-6 flex items-center justify-end gap-4">
					<button type="button" onclick={cancelEditing} class="font-medium text-main/70">Cancel</button>
					<SubmitButton type="submit" loading={isSubmitting} class="bg-accent px-6 py-2">
						Save Client
					</SubmitButton>
				</div>
			</form>
		</div>
	{/if}

	<!-- Existing Clients Table -->
	<div class="mt-12 overflow-x-auto" class:hidden={editingClient}>
		<table class="w-full min-w-max text-left">
			<thead class="border-b border-main/10">
				<tr>
					<th class="p-4">Logo</th>
					<th class="p-4">Name</th>
					<th class="p-4 text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.clients as client (client.id)}
					<tr class="border-b border-main/10">
						<td class="p-4">
							{#if client.logo}
								<img
									src={client.logo.thumbnailUrl || client.logo.originalUrl}
									alt={client.logo.altText}
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
						<td class="p-4 font-medium">{client.name}</td>
						<td class="p-4">
							<div class="flex items-center justify-end gap-2">
								<button
									onclick={() => startEditing(client)}
									class="rounded-md bg-main/80 p-1.5 text-light backdrop-blur-sm"
								>
									<svg
										xmlns="http://www.w.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="lucide lucide-pencil"
										><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path
											d="m15 5 4 4"
										/></svg
									>
								</button>
								<form method="POST" action="?/delete&id={client.id}" use:enhance={handleDelete}>
									<button class="rounded-md bg-red-500 p-1.5 text-white">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											class="lucide lucide-trash-2"
											><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path
												d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
											/><line x1="10" x2="10" y1="11" y2="17" /><line
												x1="14"
												x2="14"
												y1="11"
												y2="17"
											/></svg
										>
									</button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if (data.clients?.length ?? 0) === 0}
			<div class="mt-8 rounded-xl border border-dashed border-main/20 p-12 text-center">
				<p class="text-main/70">No clients found. Create your first one!</p>
			</div>
		{/if}
	</div>
</div>