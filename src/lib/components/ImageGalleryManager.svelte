<script>
	import MediaLibraryModal from '$lib/components/MediaLibraryModal.svelte';

	let {
		mediaItems = [],
		galleryImages = $bindable([]) // Array of { mediaId, media: { thumbnailUrl, altText } }
	} = $props();

	let showModal = $state(false);

	function handleSelect(event) {
		const selectedMedia = event.detail;
		// Avoid adding duplicates
		if (!galleryImages.some((img) => img.mediaId === selectedMedia.id)) {
			galleryImages.push({
				mediaId: selectedMedia.id,
				media: selectedMedia
			});
		}
	}

	function removeImage(mediaId) {
		galleryImages = galleryImages.filter((img) => img.mediaId !== mediaId);
	}

	// Basic drag-and-drop reordering logic
	let draggedItem = null;

	function handleDragStart(event, index) {
		draggedItem = index;
		event.dataTransfer.effectAllowed = 'move';
	}

	function handleDragOver(event, index) {
		event.preventDefault();
		const draggedOverItem = galleryImages[index];
		if (draggedItem === null || galleryImages[draggedItem] === draggedOverItem) return;

		// Reorder the array
		let items = [...galleryImages];
		const [reorderedItem] = items.splice(draggedItem, 1);
		items.splice(index, 0, reorderedItem);
		draggedItem = index;
		galleryImages = items;
	}

	function handleDragEnd() {
		draggedItem = null;
	}
</script>

<div>
	<h3 class="text-lg font-bold">Product Gallery</h3>
	<p class="text-xs text-main/60 mb-4">Drag and drop images to reorder them.</p>

	<div class="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-5">
		{#each galleryImages as image, i (image.mediaId)}
			<div
				class="group relative aspect-square"
				draggable="true"
				ondragstart={(e) => handleDragStart(e, i)}
				ondragover={(e) => handleDragOver(e, i)}
				ondragend={handleDragEnd}
			>
				<img
					src={image.media.thumbnailUrl || image.media.originalUrl}
					alt={image.media.altText}
					class="h-full w-full rounded-md object-cover"
				/>
				<div class="absolute inset-0 rounded-md bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
					<button
						type="button"
						onclick={() => removeImage(image.mediaId)}
						class="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white"
						aria-label="Remove image"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
						>
					</button>
				</div>
				<!-- Hidden inputs to submit the IDs in order -->
				<input type="hidden" name="galleryImageIds" value={image.mediaId} />
			</div>
		{/each}
	</div>

	<button type="button" onclick={() => (showModal = true)} class="btn-secondary mt-4">
		+ Add Images from Library
	</button>
</div>

<MediaLibraryModal
	{mediaItems}
	bind:show={showModal}
	on:select={handleSelect}
/>