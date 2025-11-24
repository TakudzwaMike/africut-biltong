<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import FeaturedImagePicker from '$lib/components/FeaturedImagePicker.svelte';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';
	import ImageGalleryManager from '$lib/components/ImageGalleryManager.svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import Icon from '@iconify/svelte';

	let { data, form } = $props();

	let editingProduct = $state(null);
	let isSubmitting = $state(false);
	let isSuccess = $state(false);
	let isError = $state(false);

	let contentJson = $state(null);
	let galleryImages = $state([]);

	// Search & Pagination State
	let searchQuery = $state(data.pagination.query || '');
	let searchTimeout;

	const columns = [
		{ label: 'Image', class: 'w-24' },
		{ label: 'Name' },
		{ label: 'Description' },
		{ label: 'Actions', class: 'text-right' }
	];

	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			const url = new URL($page.url);
			if (searchQuery) {
				url.searchParams.set('q', searchQuery);
				url.searchParams.set('page', '1');
			} else {
				url.searchParams.delete('q');
			}
			goto(url, { keepFocus: true, noScroll: true });
		}, 400);
	}

	function changePage(newPage) {
		const url = new URL($page.url);
		url.searchParams.set('page', newPage.toString());
		goto(url, { noScroll: true });
	}

	function startEditing(product) {
		editingProduct = {
			...product,
			priceUSD: product.prices?.USD ? (product.prices.USD / 100).toFixed(2) : '',
			priceZAR: product.prices?.ZAR ? (product.prices.ZAR / 100).toFixed(2) : ''
		};
		contentJson = product.longDescription;
		galleryImages = [...product.galleryImages];
	}

	function startCreating() {
		editingProduct = {
			id: null, name: '', slug: '', shortDescription: '', longDescription: null, mediaId: null,
			ctaText: '', ctaLink: '', type: 'physical', priceUSD: '', priceZAR: '', stockQuantity: null
		};
		contentJson = null;
		galleryImages = [];
	}

	function cancelEditing() {
		editingProduct = null;
	}

	function handleSubmit() {
		isSubmitting = true;
		isSuccess = false;
		isError = false;

		return ({ result, update }) => {
			isSubmitting = false;
			if (result.type === 'success') {
				isSuccess = true;
				toast.success(result.data?.message);
				invalidateAll();
				setTimeout(() => {
					editingProduct = null;
					isSuccess = false;
				}, 1000);
			} else if (result.type === 'failure') {
				isError = true;
				toast.error(result.data?.message);
				setTimeout(() => {
					isError = false;
				}, 2000);
			}
			update({ reset: false });
		};
	}

	function handleDelete() {
		return ({ result }) => {
			if (result.type === 'success' && result.data?.status === 200) {
				toast.success(result.data.message);
				invalidateAll();
			} else if (result.type === 'failure') {
				toast.error(result.data.message);
			}
		};
	}
</script>

<div class="p-8">
	<!-- Header Row -->
	<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-main">Products</h1>
			<p class="mt-2 text-base text-main/70">Manage your products and services for the store.</p>
		</div>
		
		<div class="flex flex-col items-end gap-4 sm:flex-row">
			<!-- Search Box -->
			<div class="relative w-full sm:w-64">
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<Icon icon="mdi:magnify" class="text-main/40" />
				</div>
				<input
					type="text"
					placeholder="Search products..."
					bind:value={searchQuery}
					oninput={handleSearchInput}
					class="block w-full rounded-md border-0 bg-white py-2 pl-10 pr-3 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6"
				/>
			</div>

			{#if !editingProduct}
				<button
					onclick={startCreating}
					class="flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
				>
					<Icon icon="mdi:plus" />
					<span>Create New</span>
				</button>
			{/if}
		</div>
	</div>

	<!-- Add/Edit Form as a slide-over panel -->
	{#if editingProduct}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			onclick={cancelEditing}
			class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
			role="button"
			tabindex="0"
		></div>
		<div
			class="fixed inset-y-0 right-0 z-50 w-full max-w-2xl flex flex-col bg-light shadow-lg"
		>
			<form method="POST" action="?/save" class="flex h-full flex-col" use:enhance={handleSubmit}>
				<input type="hidden" name="id" value={editingProduct.id} />
				<!-- Ensure contentJson is valid -->
				<input type="hidden" name="longDescription" value={JSON.stringify(contentJson || {})} />

				<!-- Header -->
				<header class="flex-shrink-0 border-b border-main/10 p-4">
					<h2 class="text-2xl font-bold">
						{editingProduct.id ? 'Edit Product' : 'Create New Product'}
					</h2>
				</header>

				<!-- Scrollable Content Area -->
				<div class="flex-grow space-y-8 overflow-y-auto p-6">
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
							<label for="slug" class="mb-1 block font-medium text-main/80">Slug</label>
							<input
								type="text"
								id="slug"
								name="slug"
								required
								bind:value={editingProduct.slug}
								class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
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

					<!-- Store Details -->
					<div class="space-y-4 rounded-xl border border-main/10 p-6">
						<h3 class="text-lg font-bold">Store Details</h3>
						<div>
							<label for="type" class="mb-1 block font-medium text-main/80">Product Type</label>
							<select
								name="type"
								id="type"
								bind:value={editingProduct.type}
								class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
							>
								<option value="physical">Physical</option>
								<option value="service">Service</option>
								<option value="digital">Digital</option>
							</select>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="priceUSD" class="mb-1 block font-medium text-main/80">Price (USD)</label>
								<input
									type="number"
									step="0.01"
									name="priceUSD"
									id="priceUSD"
									bind:value={editingProduct.priceUSD}
									placeholder="e.g., 49.99"
									class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
								/>
							</div>
							<div>
								<label for="priceZAR" class="mb-1 block font-medium text-main/80">Price (ZAR)</label>
								<input
									type="number"
									step="0.01"
									name="priceZAR"
									id="priceZAR"
									bind:value={editingProduct.priceZAR}
									placeholder="e.g., 899.99"
									class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
								/>
							</div>
						</div>
						{#if editingProduct.type === 'physical'}
							<div>
								<label for="stockQuantity" class="mb-1 block font-medium text-main/80"
									>Stock Quantity</label
								>
								<input
									type="number"
									name="stockQuantity"
									id="stockQuantity"
									bind:value={editingProduct.stockQuantity}
									placeholder="Leave blank for infinite stock"
									class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
								/>
							</div>
						{/if}
					</div>

					<!-- Featured Image -->
					<div class="space-y-4 rounded-xl border border-main/10 p-6">
						<h3 class="text-lg font-bold">Featured Image</h3>
						<FeaturedImagePicker
							mediaItems={data.mediaItems}
							bind:selectedMediaId={editingProduct.mediaId}
							currentImageUrl={editingProduct.featuredImage?.url}
							currentImageAlt={editingProduct.featuredImage?.altText}
						/>
					</div>

					<!-- Product Gallery -->
					<div class="space-y-4 rounded-xl border border-main/10 p-6">
						<ImageGalleryManager mediaItems={data.mediaItems} bind:galleryImages />
					</div>

					<!-- Long Description -->
					<div class="space-y-4 rounded-xl border border-main/10 p-6">
						<h3 class="text-lg font-bold">Long Description</h3>
						<RichTextEditor
							bind:content={contentJson}
							initialContent={editingProduct.longDescription}
						/>
					</div>

					<!-- CTA -->
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
				</div>

				<!-- Fixed Footer Buttons -->
				<div
					class="flex flex-shrink-0 items-center justify-end gap-4 border-t border-main/10 bg-light/80 p-4 backdrop-blur-sm"
				>
					<button type="button" onclick={cancelEditing} class="font-medium text-main/70"
						>Cancel</button
					>
					<SubmitButton
						type="submit"
						loading={isSubmitting}
						success={isSuccess}
						error={isError}
						class="bg-accent"
					>
						Save Product
					</SubmitButton>
				</div>
			</form>
		</div>
	{/if}

	<!-- Existing Products Table using DataTable -->
	<div class:hidden={editingProduct}>
		<DataTable 
			items={data.products} 
			{columns} 
			emptyMessage="No products found. Create your first one!"
			row={productRow}
		/>

		<!-- Pagination Footer -->
		{#if data.pagination.totalPages > 1}
			<div class="mt-6 flex items-center justify-between border-t border-main/10 pt-6">
				<div class="text-sm text-main/60">
					Page <span class="font-bold text-main">{data.pagination.page}</span> of <span class="font-bold text-main">{data.pagination.totalPages}</span>
				</div>
				<div class="flex gap-2">
					<button
						onclick={() => changePage(data.pagination.page - 1)}
						disabled={data.pagination.page <= 1}
						class="flex items-center gap-1 rounded-md border border-main/10 bg-white px-3 py-1.5 text-sm font-medium text-main transition hover:bg-main/5 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Icon icon="mdi:chevron-left" /> Previous
					</button>
					<button
						onclick={() => changePage(data.pagination.page + 1)}
						disabled={data.pagination.page >= data.pagination.totalPages}
						class="flex items-center gap-1 rounded-md border border-main/10 bg-white px-3 py-1.5 text-sm font-medium text-main transition hover:bg-main/5 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Next <Icon icon="mdi:chevron-right" />
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

{#snippet productRow(p)}
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
				class="rounded-md bg-main/80 p-1.5 text-light backdrop-blur-sm hover:bg-main"
				title="Edit Product"
			>
				<Icon icon="mdi:pencil" width="16" />
			</button>
			<form method="POST" action="?/delete&id={p.id}" use:enhance={handleDelete}>
				<button class="rounded-md bg-red-500 p-1.5 text-white hover:bg-red-600" title="Delete Product">
					<Icon icon="mdi:trash-can-outline" width="16" />
				</button>
			</form>
		</div>
	</td>
{/snippet}