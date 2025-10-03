<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { invalidateAll } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import FeaturedImagePicker from '$lib/components/FeaturedImagePicker.svelte';
	import CreateTrackedLinkModal from '$lib/components/CreateTrackedLinkModal.svelte';
	import { upload } from '@vercel/blob/client'; // 1. Import the client-side upload helper

	let { data, form } = $props();

	let editingDocument = $state(null);
	let linkableDocument = $state(null);
	let isSubmitting = $state(false);

	// 2. Add state to track the file upload progress
	let fileUploadStatus = $state({
		inProgress: false,
		message: ''
	});

	function handleSave() {
		isSubmitting = true;
		return async ({ result, update }) => {
			if (result.type === 'success' && result.data?.success) {
				toast.success(result.data.message);
				editingDocument = null; // Close form on success
				await invalidateAll(); // Refresh data without full reload
			} else if (result.type === 'failure') {
				toast.error(result.data?.message);
			}
			isSubmitting = false;
			update({ reset: false });
		};
	}

	function handleDelete() {
		return async ({ result, update }) => {
			if (result.type === 'success' && result.data?.success) {
				toast.success(result.data.message);
				await invalidateAll();
			} else if (result.type === 'failure') {
				toast.error(result.data?.message);
			}
			update();
		};
	}

	function startEditing(doc) {
		editingDocument = { ...doc };
		// Reset upload status when opening the form
		fileUploadStatus = { inProgress: false, message: '' };
	}

	function startCreating() {
		editingDocument = {
			id: null,
			title: '',
			description: '',
			fileUrl: null,
			thumbnailMediaId: null,
			isGated: false
		};
		// Reset upload status when opening the form
		fileUploadStatus = { inProgress: false, message: '' };
	}

	function cancelEditing() {
		editingDocument = null;
	}

	// 3. New function to handle the client-side upload
	async function handleFileChange(event) {
		const file = event.currentTarget.files?.[0];
		if (!file) return;

		fileUploadStatus = { inProgress: true, message: `Uploading ${file.name}...` };

		try {
			// This function communicates with our new API endpoint and uploads the file directly to Vercel Blob
			const newBlob = await upload(file.name, file, {
				access: 'public',
				handleUploadUrl: '/api/upload' // The new API route we created
			});

			// On success, update the form state with the new URL and show a success message
			if (editingDocument) {
				editingDocument.fileUrl = newBlob.url;
			}
			fileUploadStatus = { inProgress: false, message: 'Upload complete!' };
			toast.success('File uploaded successfully.');
		} catch (error) {
			const message = `Upload failed: ${error.message}`;
			fileUploadStatus = { inProgress: false, message };
			toast.error(message);
		}
	}
</script>

<div class="p-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-main">Documents</h1>
			<p class="mt-2 text-base text-main/70">
				Manage downloadable resources like brochures and white papers.
			</p>
		</div>
		{#if !editingDocument}
			<button
				onclick={startCreating}
				class="rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
			>
				+ Add Document
			</button>
		{/if}
	</div>

	<!-- Add/Edit Form -->
	{#if editingDocument}
		{@const selectedThumbnail = data.mediaItems.find(
			(m) => m.id === editingDocument.thumbnailMediaId
		)}
		<div class="mt-8 max-w-2xl">
			<!-- 4. Remove enctype="multipart/form-data" from the form -->
			<form
				method="POST"
				action={editingDocument.id ? '?/update' : '?/create'}
				class="space-y-6 rounded-xl border border-main/10 p-6"
				use:enhance={handleSave}
			>
				{#if editingDocument.id}
					<input type="hidden" name="id" value={editingDocument.id} />
				{/if}

				<!-- 5. Add a hidden input to send the final file URL to the server -->
				<input type="hidden" name="fileUrl" value={editingDocument.fileUrl ?? ''} />

				<!-- This hidden input is the key to fixing the bug -->
				<input type="hidden" name="thumbnailMediaId" value={editingDocument.thumbnailMediaId ?? ''} />

				<h3 class="text-lg font-bold">{editingDocument.id ? 'Edit' : 'Add New'} Document</h3>

				<div>
					<label for="title" class="mb-1 block font-medium text-main/80">Title</label>
					<input
						type="text"
						id="title"
						name="title"
						required
						bind:value={editingDocument.title}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
				<div>
					<label for="description" class="mb-1 block font-medium text-main/80">Description</label>
					<textarea
						id="description"
						name="description"
						rows="3"
						bind:value={editingDocument.description}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					></textarea>
				</div>
				<div>
					<label for="file" class="mb-1 block font-medium text-main/80">
						Document File (PDF, etc.)
					</label>

					<!-- 6. Display the file upload status -->
					{#if fileUploadStatus.inProgress}
						<div class="mt-2 flex items-center gap-2 text-sm text-main/70">
							<svg
								class="h-4 w-4 animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								><circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle><path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path></svg
							>
							<span>{fileUploadStatus.message}</span>
						</div>
					{:else if editingDocument.fileUrl}
						<div class="mb-2">
							<a
								href={editingDocument.fileUrl}
								target="_blank"
								class="text-sm text-accent underline"
							>
								View Current File
							</a>
						</div>
					{/if}

					<!-- 7. Attach the on:change handler to the file input -->
					<input
						type="file"
						id="file"
						name="file"
						required={!editingDocument.id && !editingDocument.fileUrl}
						on:change={handleFileChange}
						disabled={fileUploadStatus.inProgress}
						class="w-full rounded-md border border-main/10 bg-main/5 text-sm text-main/80 file:mr-4 file:border-0 file:bg-main/10 file:px-4 file:py-2 file:font-bold disabled:opacity-50"
					/>
					<p class="mt-1 text-xs text-main/60">
						{editingDocument.id
							? 'Optional: Uploading a file will replace the current one.'
							: 'Required for new documents.'}
					</p>
				</div>
				<div>
					<FeaturedImagePicker
						label="Thumbnail Image (Optional)"
						mediaItems={data.mediaItems}
						bind:selectedMediaId={editingDocument.thumbnailMediaId}
						currentImageUrl={selectedThumbnail?.thumbnailUrl || selectedThumbnail?.originalUrl}
						currentImageAlt={selectedThumbnail?.altText}
					/>
				</div>
				<div>
					<label class="relative inline-flex cursor-pointer items-center">
						<input
							type="checkbox"
							name="isGated"
							class="peer sr-only"
							bind:checked={editingDocument.isGated}
						/>
						<div
							class="h-7 w-12 rounded-full bg-main/20 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-md after:transition-all after:duration-300 after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent/50"
						></div>
						<span class="ml-3 text-sm font-medium text-main/80">Require Email to Download</span>
					</label>
					<p class="mt-1 text-xs text-main/60">
						If checked, users must enter their email to access this file.
					</p>
				</div>

				<div class="mt-6 flex items-center justify-end gap-4">
					<button type="button" onclick={cancelEditing} class="font-medium text-main/70">Cancel</button
					>
					<SubmitButton type="submit" loading={isSubmitting} class="bg-accent px-6 py-2">
						Save Document
					</SubmitButton>
				</div>
			</form>
		</div>
	{/if}

	<!-- Existing Documents Table -->
	<div class="mt-12 overflow-x-auto" class:hidden={editingDocument}>
		<table class="w-full min-w-max text-left">
			<thead class="border-b border-main/10">
				<tr>
					<th class="p-4">Thumbnail</th>
					<th class="p-4">Title</th>
					<th class="p-4">Description</th>
					<th class="p-4 text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.documents as doc (doc.id)}
					<tr class="border-b border-main/10">
						<td class="p-4">
							{#if doc.thumbnail}
								<img
									src={doc.thumbnail.thumbnailUrl || doc.thumbnail.originalUrl}
									alt={doc.thumbnail.altText}
									class="h-10 w-16 rounded-md bg-main/5 object-cover"
								/>
							{:else}
								<div
									class="flex h-10 w-16 items-center justify-center rounded-md bg-main/5 text-xs text-main/50"
								>
									No Thumb
								</div>
							{/if}
						</td>
						<td class="p-4 font-medium">{doc.title}</td>
						<td class="p-4 text-main/80">{doc.description}</td>
						<td class="p-4">
							<div class="flex items-center justify-end gap-2">
								<button
									onclick={() => (linkableDocument = doc)}
									title="Create Tracked Link"
									class="rounded-md bg-blue-500 p-1.5 text-light"
								>
									<!-- Link Icon -->
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
										class="lucide lucide-link"
										><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" /><path
											d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"
										/></svg
									>
								</button>
								<button
									onclick={() => startEditing(doc)}
									class="rounded-md bg-main/80 p-1.5 text-light backdrop-blur-sm"
								>
									<!-- Edit Icon -->
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
								<form method="POST" action="?/delete&id={doc.id}" use:enhance={handleDelete}>
									<button class="rounded-md bg-red-500 p-1.5 text-white">
										<!-- Delete Icon -->
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
											><path d="M3 6h18" /><path
												d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
											/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line
												x1="10"
												x2="10"
												y1="11"
												y2="17"
											/><line x1="14" x2="14" y1="11" y2="17" /></svg
										>
									</button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if (data.documents?.length ?? 0) === 0}
			<div class="mt-8 rounded-xl border border-dashed border-main/20 p-12 text-center">
				<p class="text-main/70">No documents found. Upload your first one!</p>
			</div>
		{/if}
	</div>
</div>

{#if linkableDocument}
	<CreateTrackedLinkModal
		show={!!linkableDocument}
		destinationUrl={linkableDocument.fileUrl}
		documentTitle={linkableDocument.title}
		on:close={() => (linkableDocument = null)}
	/>
{/if}
