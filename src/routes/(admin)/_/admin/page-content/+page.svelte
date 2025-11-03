<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import { invalidateAll } from '$app/navigation';
	import FeaturedImagePicker from '$lib/components/FeaturedImagePicker.svelte';

	let { data, form } = $props();

	// Create local, editable state for each section
	let sectionsState = $state(
		data.content.reduce((acc, section) => {
			acc[section.id] = { ...section }; // Create a mutable copy
			return acc;
		}, {})
	);

	let formsStatus = $state(
		data.content.reduce((acc, section) => {
			acc[section.id] = { loading: false, success: false, error: false };
			return acc;
		}, {})
	);

	function handleSave(sectionId) {
		const status = formsStatus[sectionId];

		return () => {
			status.loading = true;
			status.success = false;
			status.error = false;

			return async ({ result }) => {
				status.loading = false;
				if (result.type === 'success') {
					status.success = true;
					toast.success(result.data?.message);
					await invalidateAll(); // Refresh data to show changes
				} else if (result.type === 'failure') {
					status.error = true;
					toast.error(result.data?.message);
				}

				setTimeout(() => {
					status.success = false;
					status.error = false;
				}, 2000);
			};
		};
	}
</script>

<div class="p-8">
	<h1 class="text-3xl font-bold tracking-tight text-main">Page Content</h1>
	<p class="mt-2 text-base text-main/70">
		Manage the content for key sections of the public website.
	</p>

	<div class="mt-8 max-w-4xl space-y-8">
		{#each data.content as section (section.id)}
			{@const state = sectionsState[section.id]}
			{@const status = formsStatus[section.id]}
			<form
				method="POST"
				action="?/save"
				use:enhance={handleSave(section.id)}
				class="rounded-xl border border-main/10"
			>
				<input type="hidden" name="id" value={state.id} />
				<input type="hidden" name="mediaId" value={state.mediaId ?? ''} />

				<header class="border-b border-main/10 p-4">
					<h3 class="text-lg font-bold capitalize">{state.section.replace('_', ' ')} Section</h3>
					<p class="text-sm text-main/60">Page: {state.page}</p>
				</header>

				<div class="space-y-6 p-6">
					<div>
						<label for="title-{state.id}" class="mb-1 block font-medium text-main/80">Title</label>
						<input
							type="text"
							id="title-{state.id}"
							name="title"
							bind:value={state.title}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						/>
					</div>
					<div>
						<label for="text-{state.id}" class="mb-1 block font-medium text-main/80">Text</label>
						<textarea
							id="text-{state.id}"
							name="text"
							rows="5"
							bind:value={state.text}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						></textarea>
					</div>
					<div>
						<FeaturedImagePicker
							mediaItems={data.mediaItems}
							bind:selectedMediaId={state.mediaId}
							label="Associated Image"
						/>
					</div>
				</div>

				<footer class="border-t border-main/10 bg-main/5 p-4 text-right">
					<SubmitButton
						type="submit"
						class="px-6 py-2"
						loading={status.loading}
						success={status.success}
						error={status.error}
					>
						Save Section
					</SubmitButton>
				</footer>
			</form>
		{/each}
	</div>
</div>