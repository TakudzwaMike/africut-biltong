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

	let { data } = $props();

	// --- STATE ---
	let editingProduct = $state(null); // If null, list view. If object, edit view.
	let isSubmitting = $state(false);
	let searchQuery = $state(data.pagination.query || '');
	let searchTimeout;

	// Complex Form State
	let contentJson = $state(null);
	let galleryImages = $state([]);
	let variants = $state([]);
	let features = $state([]);
	let selectedSolutionIds = $state(new Set());

	// --- ACTIONS ---

	function startCreating() {
		// Default state for new product
		contentJson = null;
		galleryImages = [];
		variants = [{ id: null, name: 'Default', sku: '', priceUsd: 0, priceZar: 0, stock: 0, isDefault: true }];
		features = [];
		selectedSolutionIds = new Set();

		editingProduct = {
			id: null,
			name: '',
			slug: '',
			shortDescription: '',
			type: 'physical',
			mediaId: null,
			ctaText: '',
			ctaLink: ''
		};
	}

	function startEditing(product) {
		// Hydrate state from existing product
		contentJson = product.longDescription;
		
		// Map gallery images for the manager
		galleryImages = product.images.map(img => ({
			mediaId: img.mediaId,
			media: img.media // The manager expects the full media object for display
		}));

		// Deep copy variants
        // CONVERSION: Divide cents by 100 to show Dollars/Rands in UI
		variants = product.variants.map(v => ({ 
            ...v,
            priceUsd: v.priceUsd ? v.priceUsd / 100 : 0,
            priceZar: v.priceZar ? v.priceZar / 100 : 0
        }));
		
		// Deep copy features
		features = product.features.map(f => ({ ...f }));

		// Hydrate Smart Links
		selectedSolutionIds = new Set(product.solutions.map(s => s.solutionId));

		editingProduct = { ...product };
	}

	function cancelEditing() {
		editingProduct = null;
	}

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

	function handleSubmit() {
		isSubmitting = true;
		return async ({ result, update }) => {
			isSubmitting = false;
			if (result.type === 'success') {
				toast.success('Product saved successfully!');
				await invalidateAll();
				editingProduct = null; // Close the panel
			} else if (result.type === 'failure') {
				toast.error(result.data?.message || 'Failed to save product.');
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

	// --- VARIANT LOGIC ---
	function addVariant() {
		variants.push({
			id: null,
			name: '',
			sku: '',
			priceUsd: 0,
			priceZar: 0,
			stock: 0,
			isDefault: variants.length === 0
		});
	}

	function removeVariant(index) {
		if (variants.length <= 1) {
			toast.error('Product must have at least one variant.');
			return;
		}
		variants = variants.filter((_, i) => i !== index);
	}

	function setAsDefault(index) {
		variants = variants.map((v, i) => ({ ...v, isDefault: i === index }));
	}

	// --- FEATURE LOGIC ---
	function addFeature() {
		features.push({ icon: 'mdi:check', text: '' });
	}
	
	function removeFeature(index) {
		features = features.filter((_, i) => i !== index);
	}

	// --- SMART LINK LOGIC ---
	function toggleSolution(id) {
		if (selectedSolutionIds.has(id)) {
			selectedSolutionIds.delete(id);
		} else {
			selectedSolutionIds.add(id);
		}
	}

	// --- TABLE CONFIG ---
	function getTotalStock(variants) {
		return variants.reduce((sum, v) => sum + (v.stock || 0), 0);
	}

	function formatPriceRange(variants) {
		if (!variants || variants.length === 0) return '-';
		// Database stores cents, so divide by 100 for display
		const prices = variants.map(v => v.priceUsd).filter(p => p !== null);
		if (prices.length === 0) return '-';
		const min = Math.min(...prices) / 100;
		const max = Math.max(...prices) / 100;
		return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} - $${max.toFixed(2)}`;
	}

	const columns = [
		{ label: 'Image', class: 'w-20' },
		{ label: 'Name' },
		{ label: 'Type' },
		{ label: 'Stock' },
		{ label: 'Price (USD)' },
		{ label: 'Actions', class: 'text-right' }
	];
</script>

<div class="p-8">
	<!-- Header & Search -->
	<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-main">Products</h1>
			<p class="mt-2 text-base text-main/70">Manage hardware inventory and services.</p>
		</div>
		
		<div class="flex flex-col items-end gap-4 sm:flex-row">
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

			<button
				onclick={startCreating}
				class="flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
			>
				<Icon icon="mdi:plus" />
				<span>Create New</span>
			</button>
		</div>
	</div>

	<!-- Table View -->
	<div class:hidden={editingProduct}>
		<DataTable 
			items={data.products} 
			{columns} 
			emptyMessage="No products found."
			row={productRow}
		/>
        
        <!-- Pagination -->
        {#if data.pagination.totalPages > 1}
            <div class="mt-6 flex items-center justify-between border-t border-main/10 pt-6">
                <div class="text-sm text-main/60">
                    Page <span class="font-bold text-main">{data.pagination.page}</span> of <span class="font-bold text-main">{data.pagination.totalPages}</span>
                </div>
                <div class="flex gap-2">
                    <!-- Add pagination controls logic if needed in future, same as other pages -->
                </div>
            </div>
        {/if}
	</div>

	<!-- EDIT / CREATE SLIDE-OVER PANEL -->
	{#if editingProduct}
		<!-- Backdrop -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			onclick={cancelEditing}
			class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
			role="button"
			tabindex="0"
		></div>

		<!-- Slide-Over Container -->
		<div class="fixed inset-y-0 right-0 z-50 flex w-full max-w-4xl flex-col bg-light shadow-2xl transition-transform">
			
			<!-- Form Header -->
			<div class="flex items-center justify-between border-b border-main/10 px-6 py-4 bg-white">
				<h2 class="text-xl font-bold text-main">
					{editingProduct.id ? 'Edit Product' : 'New Product'}
				</h2>
				<button onclick={cancelEditing} class="text-main/50 hover:text-main">
					<Icon icon="mdi:close" width="24" />
				</button>
			</div>

			<!-- Scrollable Content -->
			<div class="flex-1 overflow-y-auto p-6 bg-slate-50">
				<form method="POST" action="?/save" id="productForm" use:enhance={handleSubmit} class="space-y-8">
					<input type="hidden" name="id" value={editingProduct.id || ''} />
					
					<!-- Serialized JSON Data -->
					<input type="hidden" name="longDescription" value={JSON.stringify(contentJson || {})} />
					<input type="hidden" name="variants" value={JSON.stringify(variants)} />
					<input type="hidden" name="features" value={JSON.stringify(features)} />
					{#each galleryImages as img}
						<input type="hidden" name="galleryImageIds" value={img.mediaId} />
					{/each}
					{#each Array.from(selectedSolutionIds) as solId}
						<input type="hidden" name="solutionIds" value={solId} />
					{/each}

					<!-- SECTION 1: Core Info -->
					<div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
						<h3 class="text-sm font-bold uppercase tracking-wider text-main/60 mb-4">Core Details</h3>
						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div class="md:col-span-2">
								<label class="mb-1 block text-sm font-bold text-main/80">Product Name</label>
								<input type="text" name="name" required bind:value={editingProduct.name} class="w-full rounded-md border-main/20 bg-main/5 px-3 py-2 text-main focus:border-accent focus:ring-accent" />
							</div>
							<div>
								<label class="mb-1 block text-sm font-bold text-main/80">Slug</label>
								<input type="text" name="slug" required bind:value={editingProduct.slug} class="w-full rounded-md border-main/20 bg-main/5 px-3 py-2 text-main focus:border-accent focus:ring-accent" />
							</div>
							<div>
								<label class="mb-1 block text-sm font-bold text-main/80">Type</label>
								<select name="type" bind:value={editingProduct.type} class="w-full rounded-md border-main/20 bg-main/5 px-3 py-2 text-main focus:border-accent focus:ring-accent">
									<option value="physical">Physical (Hardware)</option>
									<option value="digital">Digital (License/Software)</option>
									<option value="service">Service (Consulting)</option>
								</select>
							</div>
							<div class="md:col-span-2">
								<label class="mb-1 block text-sm font-bold text-main/80">Short Description</label>
								<textarea name="shortDescription" rows="2" bind:value={editingProduct.shortDescription} class="w-full rounded-md border-main/20 bg-main/5 px-3 py-2 text-main focus:border-accent focus:ring-accent"></textarea>
							</div>
						</div>
					</div>

					<!-- SECTION 2: Variants & Pricing -->
					<div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
						<div class="flex items-center justify-between mb-4">
							<h3 class="text-sm font-bold uppercase tracking-wider text-main/60">Pricing & Variants</h3>
							<button type="button" onclick={addVariant} class="text-xs font-bold text-accent hover:underline flex items-center gap-1">
								<Icon icon="mdi:plus" /> Add Variant
							</button>
						</div>
						
						<div class="space-y-4">
							{#each variants as variant, i}
								<div class="relative grid grid-cols-1 gap-4 rounded-lg border border-main/10 bg-main/5 p-4 sm:grid-cols-6">
									<!-- Delete Button -->
									<button type="button" onclick={() => removeVariant(i)} class="absolute right-2 top-2 text-red-500 hover:text-red-700" title="Remove Variant">
										<Icon icon="mdi:close" />
									</button>

									<div class="sm:col-span-2">
										<label class="mb-1 block text-xs font-bold text-main/60">Variant Name</label>
										<input type="text" bind:value={variant.name} placeholder="Default" class="w-full rounded border-main/20 bg-white px-2 py-1 text-sm" />
									</div>
									<div class="sm:col-span-2">
										<label class="mb-1 block text-xs font-bold text-main/60">SKU</label>
										<input type="text" bind:value={variant.sku} class="w-full rounded border-main/20 bg-white px-2 py-1 text-sm" />
									</div>
									<div class="sm:col-span-2">
										<label class="mb-1 block text-xs font-bold text-main/60">Stock</label>
										<input type="number" bind:value={variant.stock} class="w-full rounded border-main/20 bg-white px-2 py-1 text-sm" />
									</div>
									<div class="sm:col-span-3">
										<label class="mb-1 block text-xs font-bold text-main/60">Price (USD)</label>
										<div class="relative">
											<span class="absolute left-2 top-1.5 text-xs text-main/40">$</span>
											<!-- STEP="0.01" allows decimals -->
											<input type="number" step="0.01" bind:value={variant.priceUsd} class="w-full rounded border-main/20 bg-white pl-5 py-1 text-sm" />
										</div>
									</div>
									<div class="sm:col-span-3">
										<label class="mb-1 block text-xs font-bold text-main/60">Price (ZAR)</label>
										<div class="relative">
											<span class="absolute left-2 top-1.5 text-xs text-main/40">R</span>
											<input type="number" step="0.01" bind:value={variant.priceZar} class="w-full rounded border-main/20 bg-white pl-5 py-1 text-sm" />
										</div>
									</div>
									<div class="sm:col-span-6 flex items-center gap-2">
										<input type="radio" name="defaultVariant" checked={variant.isDefault} onchange={() => setAsDefault(i)} class="text-accent focus:ring-accent" />
										<span class="text-xs font-medium text-main/80">Set as Default Variant</span>
									</div>
								</div>
							{/each}
						</div>
					</div>

					<!-- SECTION 3: Smart Links (Solutions) -->
					<div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
						<h3 class="text-sm font-bold uppercase tracking-wider text-main/60 mb-4">Smart Linking</h3>
						<p class="text-sm text-main/70 mb-4">Select the Solutions that use this product.</p>
						
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
							{#each data.allSolutions as solution}
								<label class="flex items-start gap-3 p-2 rounded border border-main/10 hover:bg-main/5 cursor-pointer transition-colors" class:bg-accent-light={selectedSolutionIds.has(solution.id)}>
									<input 
										type="checkbox" 
										checked={selectedSolutionIds.has(solution.id)}
										onchange={() => toggleSolution(solution.id)}
										class="mt-1 h-4 w-4 rounded border-main/30 text-accent focus:ring-accent"
									/>
									<div>
										<span class="block text-sm font-bold text-main">{solution.solutionName}</span>
									</div>
								</label>
							{/each}
						</div>
					</div>

					<!-- SECTION 4: Media -->
					<div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
						<h3 class="text-sm font-bold uppercase tracking-wider text-main/60 mb-4">Media</h3>
						<div class="space-y-6">
							<FeaturedImagePicker
								mediaItems={data.mediaItems}
								bind:selectedMediaId={editingProduct.mediaId}
								currentImageUrl={editingProduct.featuredImage?.thumbnailUrl || editingProduct.featuredImage?.originalUrl}
								currentImageAlt={editingProduct.featuredImage?.altText}
							/>
							<div class="border-t border-main/10 pt-6">
								<ImageGalleryManager mediaItems={data.mediaItems} bind:galleryImages />
							</div>
						</div>
					</div>

					<!-- SECTION 5: Features & Description -->
					<div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
						<h3 class="text-sm font-bold uppercase tracking-wider text-main/60 mb-4">Detailed Content</h3>
						
						<!-- Features List -->
						<div class="mb-8">
							<div class="flex items-center justify-between mb-2">
								<label class="text-sm font-bold text-main/80">Key Features</label>
								<button type="button" onclick={addFeature} class="text-xs font-bold text-accent hover:underline">+ Add Feature</button>
							</div>
							<div class="space-y-2">
								{#each features as feature, i}
									<div class="flex gap-2">
										<div class="relative w-1/4">
											<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
												<Icon icon={feature.icon || 'mdi:check'} class="text-main/40" />
											</div>
											<input type="text" bind:value={feature.icon} placeholder="Icon" class="w-full rounded border-main/20 pl-8 text-sm" />
										</div>
										<input type="text" bind:value={feature.text} placeholder="Description" class="flex-1 rounded border-main/20 text-sm" />
										<button type="button" onclick={() => removeFeature(i)} class="text-red-500 px-2"><Icon icon="mdi:close" /></button>
									</div>
								{/each}
							</div>
						</div>

						<!-- Rich Text -->
						<div>
							<label class="mb-2 block text-sm font-bold text-main/80">Long Description</label>
							<RichTextEditor
								bind:content={contentJson}
								initialContent={editingProduct.longDescription}
							/>
						</div>
					</div>

					<!-- SECTION 6: CTA Overrides -->
					<div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
						<h3 class="text-sm font-bold uppercase tracking-wider text-main/60 mb-4">Call to Action</h3>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label class="mb-1 block text-xs font-bold text-main/60">Button Text</label>
								<input type="text" bind:value={editingProduct.ctaText} placeholder="Default: Add to Cart" class="w-full rounded border-main/20 bg-main/5 px-2 py-1.5 text-sm" />
							</div>
							<div>
								<label class="mb-1 block text-xs font-bold text-main/60">Button Link</label>
								<input type="text" bind:value={editingProduct.ctaLink} placeholder="Default: /cart" class="w-full rounded border-main/20 bg-main/5 px-2 py-1.5 text-sm" />
							</div>
						</div>
					</div>

				</form>
			</div>

			<!-- Sticky Footer Actions -->
			<div class="border-t border-main/10 bg-white p-4 flex justify-end gap-4">
				<button type="button" onclick={cancelEditing} class="rounded-md border border-main/20 px-6 py-2 font-bold text-main hover:bg-main/5">Cancel</button>
				<!-- Use form="productForm" to link button outside form tag -->
				<SubmitButton form="productForm" type="submit" loading={isSubmitting} class="bg-accent px-8">Save Product</SubmitButton>
			</div>
		</div>
	{/if}
</div>

{#snippet productRow(p)}
	<td class="p-4">
		{#if p.featuredImage}
			<img src={p.featuredImage.thumbnailUrl || p.featuredImage.originalUrl} alt={p.name} class="h-10 w-10 rounded-md object-cover bg-main/5" />
		{:else}
			<div class="flex h-10 w-10 items-center justify-center rounded-md bg-main/5"><Icon icon="mdi:image-off" class="text-main/20" /></div>
		{/if}
	</td>
	<td class="p-4 font-medium">{p.name}</td>
	<td class="p-4"><span class="inline-block rounded-full bg-main/5 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-main/60">{p.type}</span></td>
    <td class="p-4 text-sm">{p.type === 'physical' ? getTotalStock(p.variants) : '∞'}</td>
    <td class="p-4 text-sm font-mono">{formatPriceRange(p.variants)}</td>
	<td class="p-4 text-right">
		<div class="flex items-center justify-end gap-2">
			<button onclick={() => startEditing(p)} class="rounded-md bg-main/80 p-1.5 text-light hover:bg-main" title="Edit"><Icon icon="mdi:pencil" width="16" /></button>
			<form method="POST" action="?/delete&id={p.id}" use:enhance={handleDelete}>
				<button class="rounded-md bg-red-500 p-1.5 text-white hover:bg-red-600" title="Delete"><Icon icon="mdi:trash-can-outline" width="16" /></button>
			</form>
		</div>
	</td>
{/snippet}