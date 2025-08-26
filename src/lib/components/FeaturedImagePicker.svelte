<script>
	let {
		mediaItems = [],
		selectedMediaId = $bindable(),
		currentImageUrl = undefined,
		currentImageAlt = undefined
	} = $props();

	let selectedImage = $derived(mediaItems.find((item) => item.id === selectedMediaId));

	// Create a derived value for the image to show.
	// It prefers the newly selected image, but falls back to the initial/current one if nothing is selected.
	let imageToShow = $derived(
		selectedImage || (currentImageUrl ? { url: currentImageUrl, altText: currentImageAlt } : null)
	);
</script>

<div>
	<label for="mediaId" class="mb-1 block font-medium text-main/80"
		>Select an Image from the Media Library</label
	>
	<select
		id="mediaId"
		name="mediaId"
		bind:value={selectedMediaId}
		class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
	>
		<option value={null}>-- No Image --</option>
		{#each mediaItems as media}
			<option value={media.id}>
				{media.altText}
			</option>
		{/each}
	</select>

	{#if imageToShow}
		<div class="mt-4">
			<p class="text-sm text-main/80">Current Image:</p>
			<img
				src={imageToShow.url}
				alt={imageToShow.altText}
				class="mt-1 h-24 w-auto rounded-md bg-main/5 object-contain"
			/>
		</div>
	{/if}
</div>
