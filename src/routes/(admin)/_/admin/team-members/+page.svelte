<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { invalidateAll } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import FeaturedImagePicker from '$lib/components/FeaturedImagePicker.svelte';

	let { data, form } = $props();

	let editingMember = $state(null);
	let isSubmitting = $state(false);

	// This function will be the callback for the save form's use:enhance
	function handleSave() {
		isSubmitting = true;
		// The return function is the crucial part that handles the result
		return async ({ result, update }) => {
			if (result.type === 'success' && result.data?.success) {
				toast.success(result.data.message);
				editingMember = null; // Close the form on success
				await invalidateAll(); // Force a refresh of the page's data
			} else if (result.type === 'failure') {
				toast.error(result.data?.message);
			}
			isSubmitting = false;
			update({ reset: false }); // Update the `form` prop but don't clear inputs
		};
	}

	// This function will be the callback for the delete form's use:enhance
	function handleDelete() {
		// No loading state needed for the small delete button
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

	function startEditing(member) {
		editingMember = { ...member };
	}

	function startCreating() {
		editingMember = { id: null, name: '', title: '', bio: '', mediaId: null };
	}

	function cancelEditing() {
		editingMember = null;
	}
</script>

<div class="p-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-main">Team Members</h1>
			<p class="mt-2 text-base text-main/70">Manage the team profiles for the "About Us" page.</p>
		</div>
		<button
			onclick={startCreating}
			class="rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
		>
			+ Add New Member
		</button>
	</div>

	<!-- Add/Edit Form -->
	{#if editingMember}
		<div class="mt-8 max-w-2xl">
			<form
				method="POST"
				action="?/save"
				class="rounded-xl border border-main/10 p-6"
				use:enhance={handleSave}
			>
				<input type="hidden" name="id" value={editingMember.id} />
				<h3 class="text-lg font-bold">{editingMember.id ? 'Edit' : 'Add'} Team Member</h3>

				<div class="mt-4 space-y-4">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label for="name" class="mb-1 block font-medium text-main/80">Full Name</label>
							<input
								type="text"
								id="name"
								name="name"
								required
								bind:value={editingMember.name}
								class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
							/>
						</div>
						<div>
							<label for="title" class="mb-1 block font-medium text-main/80"
								>Title / Role</label
							>
							<input
								type="text"
								id="title"
								name="title"
								required
								bind:value={editingMember.title}
								class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
							/>
						</div>
					</div>
					<div>
						<label for="bio" class="mb-1 block font-medium text-main/80">Short Bio</label>
						<textarea
							id="bio"
							name="bio"
							rows="3"
							bind:value={editingMember.bio}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						></textarea>
					</div>
					<div>
						<FeaturedImagePicker
							mediaItems={data.mediaItems}
							bind:selectedMediaId={editingMember.mediaId}
							currentImageUrl={editingMember.photo?.thumbnailUrl || editingMember.photo?.originalUrl}
							currentImageAlt={editingMember.photo?.altText}
						/>
					</div>
				</div>

				<div class="mt-6 flex items-center justify-end gap-4">
					<button type="button" onclick={cancelEditing} class="font-medium text-main/70"
						>Cancel</button
					>
					<SubmitButton
						type="submit"
						loading={isSubmitting}
						class="bg-accent px-6 py-2"
					>
						Save Member
					</SubmitButton>
				</div>
			</form>
		</div>
	{/if}

	<!-- Existing Team Members Grid -->
	<div class="mt-12 overflow-x-auto" class:hidden={editingMember}>
		<table class="w-full min-w-max text-left">
			<thead class="border-b border-main/10">
				<tr>
					<th class="p-4">Photo</th>
					<th class="p-4">Name</th>
					<th class="p-4">Title</th>
					<th class="p-4">Bio</th>
					<th class="p-4 text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.teamMembers as member (member.id)}
					<tr class="border-b border-main/10">
						<td class="p-4">
							{#if member.photo}
								<img
									src={member.photo.thumbnailUrl || member.photo.originalUrl}
									alt={member.photo.altText}
									class="h-10 w-10 flex-shrink-0 rounded-full object-cover"
								/>
							{:else}
								<div
									class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-main/5"	
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="lucide lucide-user text-main/40"
										><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle
											cx="12"
											cy="7"
											r="4"
										/></svg
									>
								</div>
							{/if}
						</td>
						<td class="p-4 font-medium">{member.name}</td>
						<td class="p-4 text-sm text-accent">{member.title}</td>
						<td class="p-4 text-sm text-main/70">{member.bio}</td>
						<td class="p-4">
							<div class="flex items-center justify-end gap-2">
								<button
									onclick={() => startEditing(member)}
									class="rounded-md bg-main/80 p-1.5 text-light backdrop-blur-sm"
									aria-label="Edit team member"
								>
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
										class="lucide lucide-pencil"
										><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path
											d="m15 5 4 4"
										/></svg
									>
								</button>
								<form method="POST" action="?/delete&id={member.id}" use:enhance={handleDelete}>
									<button
										class="rounded-md bg-red-500 p-1.5 text-white"
										aria-label="Delete team member"
									>
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

		{#if (data.teamMembers?.length ?? 0) === 0}
			<div class="mt-8 rounded-xl border border-dashed border-main/20 p-12 text-center">
				<p class="text-main/70">No team members found. Create your first one!</p>
			</div>
		{/if}
	</div>
</div>
						