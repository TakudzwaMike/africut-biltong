<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import { invalidateAll } from '$app/navigation';

	let { data, form } = $props();

	// Initialize the state for all forms at the top level
	let formsState = $state(
		data.content.reduce((acc, section) => {
			acc[section.id] = { loading: false, success: false, error: false };
			return acc;
		}, {})
	);

	function handleSave(sectionId) {
		const state = formsState[sectionId];

		return () => {
			// Runs when the form is submitted
			state.loading = true;
			state.success = false;
			state.error = false;

			return ({ result }) => {
				// Runs when the action is complete
				state.loading = false;
				if (result.type === 'success') {
					state.success = true;
					toast.success(result.data?.message);
					invalidateAll(); // Refresh data to show changes
				} else if (result.type === 'failure') {
					state.error = true;
					toast.error(result.data?.message);
				}

				// Reset the button's visual state after a couple of seconds
				setTimeout(() => {
					state.success = false;
					state.error = false;
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
			{@const state = formsState[section.id]}
			<form
				method="POST"
				action="?/save"
				use:enhance={handleSave(section.id)}
				class="rounded-xl border border-main/10"
			>
				<input type="hidden" name="id" value={section.id} />
				<header class="border-b border-main/10 p-4">
					<h3 class="text-lg font-bold capitalize">{section.section.replace('_', ' ')} Section</h3>
					<p class="text-sm text-main/60">Page: {section.page}</p>
				</header>

				<div class="space-y-6 p-6">
					<div>
						<label for="title-{section.id}" class="mb-1 block font-medium text-main/80"
							>Title</label
						>
						<input
							type="text"
							id="title-{section.id}"
							name="title"
							value={section.title}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						/>
					</div>
					<div>
						<label for="text-{section.id}" class="mb-1 block font-medium text-main/80">Text</label>
						<textarea
							id="text-{section.id}"
							name="text"
							rows="5"
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						>{section.text}</textarea>
					</div>
					<div>
						<label for="mediaId-{section.id}" class="mb-1 block font-medium text-main/80"
							>Associated Image</label
						>
						<select
							id="mediaId-{section.id}"
							name="mediaId"
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						>
							<option value="">-- No Image --</option>
							{#each data.mediaItems as media}
								<option value={media.id} selected={section.mediaId === media.id}>
									{media.altText}
								</option>
							{/each}
						</select>
						{#if section.media}
							<div class="mt-4">
								<p class="text-sm text-main/80">Current Image:</p>
								<img
									src={section.media.url}
									alt={section.media.altText}
									class="mt-1 h-24 w-auto rounded-md bg-main/5 object-contain"
								/>
							</div>
						{/if}
					</div>
				</div>

				<footer class="border-t border-main/10 bg-main/5 p-4 text-right">
					<SubmitButton
						type="submit"
						class="px-6 py-2"
						loading={state.loading}
						success={state.success}
						error={state.error}
					>
						Save Section
					</SubmitButton>
				</footer>
			</form>
		{/each}
	</div>
</div>
