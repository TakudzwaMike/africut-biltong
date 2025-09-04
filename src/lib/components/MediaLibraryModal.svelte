<script>
	import Modal from '$lib/components/Modal.svelte';
	import { createEventDispatcher } from 'svelte';

	let { show = false, mediaItems = [] } = $props();

	const dispatch = createEventDispatcher();

	function selectImage(media) {
		dispatch('select', media);
	}
</script>

<Modal {show} on:close={() => dispatch('close')}>
	<div class="p-6">
		<h3 class="text-lg font-bold">Select an Image</h3>
		<p class="text-sm text-main/70">Click an image to select it.</p>

		{#if mediaItems.length === 0}
			<div class="mt-4 rounded-xl border border-dashed border-main/20 p-12 text-center">
				<p class="text-main/70">
					No media found. <a href="/admin/media" class="text-accent underline">Upload some first</a>.
				</p>
			</div>
		{:else}
			<div class="mt-4 grid max-h-[60vh] grid-cols-3 gap-4 overflow-y-auto pr-2 sm:grid-cols-4 md:grid-cols-5">
				{#each mediaItems as item (item.id)}
					<button type='button'
						onclick={() => selectImage(item)}
						class="group relative aspect-square rounded-md ring-accent transition focus:outline-none focus:ring-2"
					>
						<img
							src={item.thumbnailUrl || item.originalUrl}
							alt={item.altText}
							class="h-full w-full rounded-md bg-main/5 object-cover"
						/>
						<div
							class="absolute inset-0 flex items-center justify-center rounded-md bg-black/50 text-center text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100"
						>
							<p class="p-1 text-xs">{item.altText}</p>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>
</Modal>