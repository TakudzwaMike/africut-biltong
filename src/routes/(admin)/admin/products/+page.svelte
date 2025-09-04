<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { invalidateAll } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import FeaturedImagePicker from '$lib/components/FeaturedImagePicker.svelte';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';
	import { slugify } from '$lib/utils.js';

	let { data, form } = $props();

	let editingProduct = $state(null);
	let isSubmitting = $state(false);
	let contentJson = $state(null);
	let manualSlug = $state(false);

	$effect(() => {
		if (editingProduct && !manualSlug) {
			editingProduct.slug = slugify(editingProduct.name);
		}
	});

	function handleSave() {
		isSubmitting = true;
		return async ({ result, update }) => {
			if (result.type === 'success' && result.data?.success) {
				toast.success(result.data.message);
				editingProduct = null;
				await invalidateAll();
			} else if (result.type === 'failure') {
				toast.error(result.data?.message);
			}
			isSubmitting = false;
			update({ reset: false });
		};
	}

	function handleDelete() {
		return async ({ result, update }) => {
			if (result.type === 'success' && result.data?.status === 200) {
				toast.success(result.data.message);
				await invalidateAll();
			} else if (result.type === 'failure') {
				toast.error(result.data.message);
			}
			update();
		};
	}

	function startEditing(product) {
		editingProduct = { ...product };
		contentJson = product.longDescription;
		manualSlug = true; // Existing products should have manual slug control
	}

	function startCreating() {
		editingProduct = {
			id: null,
			name: '',
			slug: '',
			shortDescription: '',
			longDescription: null,
			mediaId: null,
			ctaText: '',
			ctaLink: ''
		};
		contentJson = null;
		manualSlug = false; // New products get automatic slugs
	}

	function cancelEditing() {
		editingProduct = null;
	}
</script>

<div class="p-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-main">Products</h1>
			<p class="mt-2 text-base text-main/70">Manage your product pages.</p>
		</div>
		{#if !editingProduct}
			<button
				onclick={startCreating}
				class="rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
			>
				+ Create New
			</button>
		{/if}
	</div>

	<!-- Add/Edit Form -->
	{#if editingProduct}
		{@const selectedImage = data.mediaItems.find((m) => m.id === editingProduct.mediaId)}
		<div class="mt-8 max-w-4xl">
			<form method="POST" action="?/save" class="space-y-8" use:enhance={handleSave}>
				<input type="hidden" name="id" value={editingProduct.id} />
				<input type="hidden" name="longDescription" value={JSON.stringify(contentJson)} />

				<div class="flex items-center justify-between border-b border-main/10 pb-4">
					<h2 class="text-2xl font-bold">
						{editingProduct.id ? 'Edit Product' : 'Create New Product'}
					</h2>
				</div>

				<!-- Core Details -->
				<div class="space-y-4 rounded-xl border border-main/10 p-6">
					<h3 class="text-lg font-bold">Core Details</h3>
					<div>
						<label for="name" class="mb-1 block font-medium text-main/80">Product Name</label>
						<input
							type="text"
							id="name"
							name="name"
							required
							bind:value={editingProduct.name}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						/>
					</div>
					<div>
						<div class="mb-1 flex items-center justify-between">
							<label for="slug" class="font-medium text-main/80">Slug</label>
							{#if !manualSlug}
								<button
									type="button"
									onclick={() => (manualSlug = true)}
									class="text-sm text-accent"
								>
									Edit
								</button>
							{/if}
						</div>
						<input
							type="text"
							id="slug"
							name="slug"
							required
							readonly={!manualSlug}
							bind:value={editingProduct.slug}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 read-only:bg-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						/>
					</div>
					<div>
						<label for="shortDescription" class="mb-1 block font-medium text-main/80"
							>Short Description</label
						>
						<textarea
							id="shortDescription"
							name="shortDescription"
							rows="3"
							bind:value={editingProduct.shortDescription}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						></textarea>
					</div>
				</div>

				<!-- Featured Image -->
				<div class="space-y-4 rounded-xl border border-main/10 p-6">
					<h3 class="text-lg font-bold">Featured Image</h3>
					<FeaturedImagePicker
						mediaItems={data.mediaItems}
						bind:selectedMediaId={editingProduct.mediaId}
						currentImageUrl={selectedImage?.thumbnailUrl || selectedImage?.originalUrl}
						currentImageAlt={selectedImage?.altText}
					/>
				</div>

				<!-- Long Description -->
				<div class="space-y-4 rounded-xl border border-main/10 p-6">
					<h3 class="text-lg font-bold">Long Description (Content)</h3>
					<RichTextEditor
						bind:content={contentJson}
						initialContent={editingProduct.longDescription}
					/>
				</div>

				<!-- Call to Action -->
				<div class="space-y-4 rounded-xl border border-main/10 p-6">
					<h3 class="text-lg font-bold">Call to Action (Optional)</h3>
					<div>
						<label for="ctaText" class="mb-1 block font-medium text-main/80">Button Text</label>
						<input
							type="text"
							id="ctaText"
							name="ctaText"
							bind:value={editingProduct.ctaText}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						/>
					</div>
					<div>
						<label for="ctaLink" class="mb-1 block font-medium text-main/80">Button Link</label>
						<input
							type="text"
							id="ctaLink"
							name="ctaLink"
							bind:value={editingProduct.ctaLink}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						/>
					</div>
				</div>

				<!-- Form Actions -->
				<div class="flex items-center justify-end gap-4">
					<button type="button" onclick={cancelEditing} class="font-medium text-main/70">Cancel</button>
					<SubmitButton type="submit" loading={isSubmitting} class="bg-accent px-6 py-2">
						Save Product
					</SubmitButton>
				</div>
			</form>
		</div>
	{/if}

	<!-- Existing Products Table -->
	<div class="mt-12 overflow-x-auto" class:hidden={editingProduct}>
		<table class="w-full min-w-max text-left">
			<thead class="border-b border-main/10">
				<tr>
					<th class="p-4">Image</th>
					<th class="p-4">Name</th>
					<th class="p-4">Description</th>
					<th class="p-4 text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.products as p (p.id)}
					<tr class="border-b border-main/10">
						<td class="p-4">
							{#if p.featuredImage}
								<img
									src={p.featuredImage.thumbnailUrl || p.featuredImage.originalUrl}
									alt={p.featuredImage.altText}
									class="h-10 w-16 rounded-md bg-main/5 object-cover"
								/>
							{:else}
								<div
									class="flex h-10 w-16 items-center justify-center rounded-md bg-main/5 text-xs text-main/50"
								>
									No Image
								</div>
							{/if}
						</td>
						<td class="p-4 font-medium">{p.name}</td>
						<td class="p-4 text-main/80">{p.shortDescription}</td>
						<td class="p-4">
							<div class="flex items-center justify-end gap-2">
								<button
									onclick={() => startEditing(p)}
									class="rounded-md bg-main/80 p-1.5 text-light backdrop-blur-sm"
								>
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
								<form method="POST" action="?/delete&id={p.id}" use:enhance={handleDelete}>
									<button class="rounded-md bg-red-500 p-1.5 text-white">
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
											><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path
												d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
											/><line x1="10" x2="10" y1="11" y2="17" /><line
												x1="14"
												x2="14"
												y1="11"
												y2="17"
											/></svg
										>
									</button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if (data.products?.length ?? 0) === 0}
			<div class="mt-8 rounded-xl border border-dashed border-main/20 p-12 text-center">
				<p class="text-main/70">No products found. Create your first one!</p>
			</div>
		{/if}
	</div>
</div>