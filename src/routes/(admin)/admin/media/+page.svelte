<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { invalidateAll } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';

	let { data, form } = $props();
	let isSubmitting = $state(false);

	function handleUpload() {
		isSubmitting = true;
		return ({ result, update }) => {
			isSubmitting = false;
			if (result.type === 'success') {
				toast.success(result.data?.message);
				invalidateAll(); // Re-run the load function to get the new media list
				const formEl = document.querySelector('form[action="?/upload"]');
				formEl?.reset();
			} else if (result.type === 'failure') {
				toast.error(result.data?.message);
			}
			update({ reset: false }); // Prevent SvelteKit from resetting the form fields
		};
	}

	function handleDelete() {
		return ({ result }) => {
			if (result.type === 'success') {
				toast.success(result.data?.message);
				invalidateAll();
			} else if (result.type === 'failure') {
				toast.error(result.data?.message);
			}
		};
	}
</script>

<div class="p-8">
	<h1 class="text-3xl font-bold tracking-tight text-main">Media Library</h1>
	<p class="mt-2 text-base text-main/70">Manage all images for the website.</p>

	<!-- Upload Form -->
	<div class="mt-8 max-w-2xl">
		<form
			method="POST"
			action="?/upload"
			enctype="multipart/form-data"
			class="rounded-xl border border-main/10 p-6"
			use:enhance={handleUpload}
		>
			<h3 class="text-lg font-bold">Upload New Image</h3>
			<div class="mt-4 space-y-4">
				<div>
					<label for="image" class="mb-1 block font-medium text-main/80">Image File</label>
					<input
						type="file"
						id="image"
						name="image"
						required
						accept="image/png, image/jpeg, image/svg+xml, image/webp"
						class="w-full rounded-md border border-main/10 bg-main/5 text-sm text-main/80 file:mr-4 file:border-0 file:bg-main/10 file:px-4 file:py-2 file:font-bold"
					/>
				</div>
				<div>
					<label for="altText" class="mb-1 block font-medium text-main/80"
						>Alternative Text (for SEO & Accessibility)</label
					>
					<input
						type="text"
						id="altText"
						name="altText"
						required
						placeholder="e.g., A haul truck at a modern mining site"
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
			</div>
			<div class="mt-6">
				<SubmitButton type="submit" loading={isSubmitting} class="bg-accent px-6 py-2">
					Upload Image
				</SubmitButton>
			</div>
		</form>
	</div>

	<!-- Image Grid -->
	<div class="mt-12">
		<h3 class="text-lg font-bold">Uploaded Media</h3>
		{#if (data.mediaItems?.length ?? 0) === 0}
			<div class="mt-4 rounded-xl border border-dashed border-main/20 p-12 text-center">
				<p class="text-main/70">No media has been uploaded yet.</p>
			</div>
		{:else}
			<div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
				{#each data.mediaItems as item (item.id)}
					<div class="group relative aspect-square">
						<img
							src={item.url}
							alt={item.altText}
							class="h-full w-full rounded-md bg-main/5 object-cover"
						/>
						<div
							class="absolute inset-0 flex flex-col items-center justify-center rounded-md bg-black/70 p-2 text-center text-white opacity-0 transition-opacity group-hover:opacity-100"
						>
							<p class="text-xs">{item.altText}</p>
							<form method="POST" action="?/delete&id={item.id}" use:enhance={handleDelete}>
								<button
									class="mt-2 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white"
								>
									Delete
								</button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
