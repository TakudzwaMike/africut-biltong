<script>
	import MediaLibraryModal from '$lib/components/MediaLibraryModal.svelte';

	let {
		mediaItems = [],
		selectedMediaId = $bindable(),
		currentImageUrl = undefined,
		currentImageAlt = undefined,
		label = 'Featured Image'
	} = $props();

	let showModal = $state(false);

	let selectedImage = $derived(mediaItems.find((item) => item.id === selectedMediaId));

	let imageToShow = $derived(
		selectedImage || (currentImageUrl ? { url: currentImageUrl, altText: currentImageAlt } : null)
	);

	function handleSelect(event) {
		selectedMediaId = event.detail.id;
		showModal = false;
	}

	function clearSelection() {
		selectedMediaId = null;
	}
</script>

<div>
	<label class="mb-1 block font-medium text-main/80">{label}</label>

	<div class="flex items-center gap-4">
		{#if imageToShow}
			<div class="relative h-24 w-auto flex-shrink-0">
				<img
					src={imageToShow.thumbnailUrl || imageToShow.url}
					alt={imageToShow.altText}
					class="h-full w-auto rounded-md bg-main/5 object-contain"
				/>
			</div>
		{/if}

		<div class="flex-grow">
			<div class="flex gap-2">
				<button type="button" onclick={() => (showModal = true)} class="btn-secondary">
					{#if imageToShow}Change Image{:else}Select Image{/if}
				</button>
				{#if imageToShow}
					<button type="button" onclick={clearSelection} class="btn-danger"> Remove </button>
				{/if}
			</div>
			<p class="mt-2 text-xs text-main/60">
				Select an image from the <a href="/_/admin/media" class="text-accent underline">Media Library</a
				>.
			</p>
		</div>
	</div>

	<!-- Hidden input to hold the value for the form -->
	<input type="hidden" name="mediaId" value={selectedMediaId ?? ''} />
</div>

<MediaLibraryModal
	{mediaItems}
	show={showModal}
	on:select={handleSelect}
	on:close={() => (showModal = false)}
/>