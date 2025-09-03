<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { invalidateAll } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import FeaturedImagePicker from '$lib/components/FeaturedImagePicker.svelte';

	let { data, form } = $props();

	let editingMember = $state(null);
	let isSubmitting = $state(false);
	let isSuccess = $state(false);
	let isError = $state(false);

	const handleSubmit = $(() => {
		return ({ form, data, action, cancel }) => {
			isSubmitting = true;
			isSuccess = false;
			isError = false;

			return async ({ result, update }) => {
				isSubmitting = false;
				if (result.type === 'success') {
					isSuccess = true;
					toast.success(result.data?.message);
					if (result.action.pathname.includes('?/save')) {
						editingMember = null;
					}
					await invalidateAll();
				} else if (result.type === 'failure') {
					isError = true;
					toast.error(result.data?.message);
				}

				update({ reset: false });

				setTimeout(() => {
					isSuccess = false;
					isError = false;
				}, 2000);
			};
		};
	});

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
				use:enhance={handleSubmit}
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
							<label for="title" class="mb-1 block font-medium text-main/80">Title / Role</label>
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
							currentImageUrl={editingMember.photo?.url}
							currentImageAlt={editingMember.photo?.altText}
						/>
					</div>
				</div>

				<div class="mt-6 flex items-center justify-end gap-4">
					<button type="button" onclick={cancelEditing} class="font-medium text-main/70">Cancel</button>
					<SubmitButton
						type="submit"
						loading={isSubmitting}
						success={isSuccess}
						error={isError}
						class="bg-accent px-6 py-2"
					>
						Save Member
					</SubmitButton>
				</div>
			</form>
		</div>
	{/if}

	<!-- Existing Team Members Grid -->
	<div class="mt-12">
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.teamMembers as member (member.id)}
				<div class="group relative rounded-xl border border-main/10 p-4">
					<div class="flex items-start gap-4">
						{#if member.photo}
							<img
								src={member.photo.url}
								alt={member.photo.altText}
								class="h-16 w-16 flex-shrink-0 rounded-full object-cover"
							/>
						{:else}
							<div
								class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-main/5"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="32"
									height="32"
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
						<div>
							<h3 class="font-bold">{member.name}</h3>
							<p class="text-sm text-accent">{member.title}</p>
						</div>
					</div>
					<p class="mt-4 text-sm text-main/80">{member.bio}</p>

					<div
						class="absolute right-2 top-2 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100"
					>
						<button
							onclick={() => startEditing(member)}
							class="rounded-md bg-main/80 p-1.5 text-light backdrop-blur-sm"
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
						<form method="POST" action="?/delete&id={member.id}" use:enhance={handleSubmit}>
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
				</div>
			{/each}
		</div>
	</div>
</div>