<script>
	import Image from '$lib/components/Image.svelte';

	let { featuredImage, galleryImages = [] } = $props();

	// Combine the featured image and gallery images into one list for display
	const allImages = $derived([
		...(featuredImage ? [featuredImage] : []),
		...galleryImages.map(gi => gi.media)
	]);

	let activeImage = $state(allImages[0]);
</script>

<div>
	{#if activeImage}
		<div class="mb-4">
			<Image
				src={activeImage.displayUrl || activeImage.originalUrl}
				alt={activeImage.altText}
				aspectRatio="1/1"
				class="w-full rounded-xl shadow-lg"
			/>
		</div>
	{/if}

	{#if allImages.length > 1}
		<div class="grid grid-cols-5 gap-2">
			{#each allImages as image (image.id)}
				<button
					onclick={() => (activeImage = image)}
					class="aspect-square rounded-md ring-offset-2 ring-offset-light transition focus:outline-none focus:ring-2"
					class:ring-2={activeImage?.id === image.id}
					class:ring-accent={activeImage?.id === image.id}
					class:ring-transparent={activeImage?.id !== image.id}
				>
					<img
						src={image.thumbnailUrl || image.originalUrl}
						alt={image.altText}
						class="h-full w-full rounded-md object-cover"
					/>
				</button>
			{/each}
		</div>
	{/if}
</div>