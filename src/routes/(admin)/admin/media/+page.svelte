<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { invalidateAll } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import { upload } from '@vercel/blob/client';

	let { data, form } = $props();

	let fileInputEl = $state();
	let uploads = $state([]); // Store info about current uploads

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

	async function handleFileSelect(event) {
		const files = event.currentTarget.files;
		if (!files || files.length === 0) return;

		// Create an initial state for each file
		const newUploads = Array.from(files).map((file) => ({
			file,
			id: Math.random().toString(36).slice(2),
			progress: 0,
			url: null,
			error: null
		}));
		uploads = [...newUploads, ...uploads];

		// Process each upload
		for (const uploadItem of newUploads) {
			try {
				const newBlob = await upload(uploadItem.file.name, uploadItem.file, {
					access: 'public',
					handleUploadUrl: '/api/upload',
					onUploadProgress: ({ progress }) => {
						const u = uploads.find((u) => u.id === uploadItem.id);
						if (u) u.progress = progress;
					}
				});

				// Once uploaded to Vercel, save reference to our DB
				const formData = new FormData();
				formData.append('url', newBlob.url);
				// Default alt text to filename without extension
				const altText = uploadItem.file.name.split('.').slice(0, -1).join(' ');
				formData.append('altText', altText);

				const response = await fetch('?/addReference', {
					method: 'POST',
					body: formData
				});
				const result = await response.json();

				if (response.ok && result.success) {
					// Add the new media item to the top of the list for immediate feedback
					data.mediaItems.unshift(result.newMedia);
					// Mark local upload item as complete
					const u = uploads.find((u) => u.id === uploadItem.id);
					if (u) u.url = newBlob.url;
				} else {
					throw new Error(result.message || 'Failed to save to database.');
				}
			} catch (error) {
				const u = uploads.find((u) => u.id === uploadItem.id);
				if (u) u.error = error.message;
				toast.error(`Upload failed for ${uploadItem.file.name}: ${error.message}`);
			}
		}
	}
</script>

<div class="p-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-main">Media Library</h1>
			<p class="mt-2 text-base text-main/70">Manage all images for the website.</p>
		</div>
		<button
			onclick={() => fileInputEl?.click()}
			class="rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
		>
			+ Upload New
		</button>
		<input
			bind:this={fileInputEl}
			type="file"
			multiple
			onchange={handleFileSelect}
			accept="image/png, image/jpeg, image/svg+xml, image/webp"
			class="hidden"
		/>
	</div>

	<!-- Current Uploads -->
	{#if uploads.some((u) => !u.url && !u.error)}
		<div class="mt-8">
			<h3 class="text-lg font-bold">Current Uploads</h3>
			<div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
				{#each uploads.filter((u) => !u.url && !u.error) as uploadItem (uploadItem.id)}
					<div class="relative aspect-square">
						<div class="flex h-full w-full items-center justify-center rounded-md bg-main/5 p-2">
							<div class="w-full">
								<p class="truncate text-center text-xs text-main/80">{uploadItem.file.name}</p>
								<div class="mt-2 h-2 w-full rounded-full bg-main/10">
									<div
										class="h-2 rounded-full bg-accent transition-all"
										style:width="{uploadItem.progress}%"
									></div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

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