<script>
	import { enhance } from "$app/forms";
	import { toast } from "$lib/toast-service";
	import { invalidateAll, goto } from "$app/navigation";
	import { page } from "$app/stores";
	import Icon from "@iconify/svelte";

	// Shared Admin Components
	import SubmitButton from "$lib/components/SubmitButton.svelte";
	import DataTable from "$lib/components/admin/DataTable.svelte";
	import SlideOverPanel from "$lib/components/admin/SlideOverPanel.svelte";
	import FormSection from "$lib/components/admin/FormSection.svelte";

	// Product-Specific Components
	import ProductVariantEditor from "$lib/components/admin/products/ProductVariantEditor.svelte";
	import FeatureListEditor from "$lib/components/admin/products/FeatureListEditor.svelte";
	import SolutionPicker from "$lib/components/admin/products/SolutionPicker.svelte";

	// Existing Media Components
	import FeaturedImagePicker from "$lib/components/FeaturedImagePicker.svelte";
	import RichTextEditor from "$lib/components/RichTextEditor.svelte";
	import ImageGalleryManager from "$lib/components/ImageGalleryManager.svelte";

	let { data } = $props();

	// --- STATE ---
	let editingProduct = $state(null);
	let isSubmitting = $state(false);
	let searchQuery = $state(data.pagination?.query || "");
	let searchTimeout;

	// Form State
	let contentJson = $state(null);
	let galleryImages = $state([]);
	let variants = $state([]);
	let features = $state([]);
	let selectedSolutionIds = $state(new Set());

	// --- HELPERS ---
	function getDefaultVariant() {
		return {
			id: null,
			name: "Default",
			sku: "",
			priceUsd: 0,
			priceZar: 0,
			stock: 0,
			isDefault: true,
			supplierId: "",
			rawPrice: 0,
			supplierSku: "",
			shippingFlatRate: 0,
		};
	}

	// --- ACTIONS ---
	function startCreating() {
		contentJson = null;
		galleryImages = [];
		variants = [getDefaultVariant()];
		features = [];
		selectedSolutionIds = new Set();
		editingProduct = {
			id: null,
			name: "",
			slug: "",
			shortDescription: "",
			type: "physical",
			mediaId: null,
			ctaText: "",
			ctaLink: "",
			approvalStatus: "pending",
		};
	}

	function startEditing(product) {
		contentJson = product.longDescription;
		galleryImages = product.images.map((img) => ({
			mediaId: img.mediaId,
			media: img.media,
		}));
		variants = product.variants.map((v) => {
			const link = v.supplierLinks?.[0];
			return {
				...v,
				priceUsd: v.priceUsd ? v.priceUsd / 100 : 0,
				priceZar: v.priceZar ? v.priceZar / 100 : 0,
				supplierId: link?.supplierId ?? "",
				rawPrice: link ? link.rawPrice / 100 : 0,
				supplierSku: link?.supplierSku ?? "",
				shippingFlatRate: v.shippingFlatRate
					? v.shippingFlatRate / 100
					: 0,
			};
		});
		features = product.features.map((f) => ({ ...f }));
		selectedSolutionIds = new Set(
			product.solutions.map((s) => s.solutionId),
		);
		editingProduct = { ...product };
	}

	function closePanel() {
		editingProduct = null;
	}

	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			const url = new URL($page.url);
			if (searchQuery) {
				url.searchParams.set("q", searchQuery);
				url.searchParams.set("page", "1");
			} else {
				url.searchParams.delete("q");
			}
			goto(url, { keepFocus: true, noScroll: true });
		}, 400);
	}

	function handleSubmit() {
		isSubmitting = true;
		return async ({ result, update }) => {
			isSubmitting = false;
			if (result.type === "success") {
				toast.success("Product saved successfully!");
				await invalidateAll();
				editingProduct = null;
			} else if (result.type === "failure") {
				toast.error(result.data?.message || "Failed to save product.");
			}
			update({ reset: false });
		};
	}

	function handleDelete() {
		return ({ result }) => {
			if (result.type === "success" && result.data?.status === 200) {
				toast.success(result.data.message);
				invalidateAll();
			} else if (result.type === "failure") {
				toast.error(result.data.message);
			}
		};
	}

	// --- VARIANT LOGIC ---
	function addVariant() {
		variants = [...variants, { ...getDefaultVariant(), isDefault: false }];
	}
	function removeVariant(index) {
		if (variants.length <= 1) {
			toast.error("Must have at least one variant.");
			return;
		}
		variants = variants.filter((_, i) => i !== index);
	}
	function setAsDefault(index) {
		variants = variants.map((v, i) => ({ ...v, isDefault: i === index }));
	}

	// --- TABLE CONFIG ---
	function getTotalStock(vars) {
		return vars.reduce((sum, v) => sum + (v.stock || 0), 0);
	}
	function formatPriceRange(vars) {
		if (!vars?.length) return "-";
		const prices = vars.map((v) => v.priceUsd).filter((p) => p !== null);
		if (!prices.length) return "-";
		const min = Math.min(...prices) / 100;
		const max = Math.max(...prices) / 100;
		return min === max
			? `$${min.toFixed(2)}`
			: `$${min.toFixed(2)} - $${max.toFixed(2)}`;
	}
	const columns = [
		{ label: "Image", class: "w-16 hidden sm:table-cell" },
		{ label: "Name" },
		{ label: "Type", class: "hidden md:table-cell" },
		{ label: "Stock", class: "hidden md:table-cell" },
		{ label: "Price", class: "hidden sm:table-cell" },
		{ label: "", class: "text-right w-24" },
	];
</script>

<div class="p-4 sm:p-6 lg:p-8">
	<!-- Header & Search -->
	<div
		class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6"
	>
		<div>
			<h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-main">
				Products
			</h1>
			<p class="mt-1 text-sm sm:text-base text-main/70">
				Manage hardware inventory and services.
			</p>
		</div>
		<div class="flex flex-wrap items-center gap-2 sm:gap-4">
			<div class="relative flex-1 sm:flex-none sm:w-64">
				<div
					class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
				>
					<Icon icon="mdi:magnify" class="text-main/40" />
				</div>
				<input
					type="text"
					placeholder="Search..."
					bind:value={searchQuery}
					oninput={handleSearchInput}
					class="block w-full rounded-md border-0 bg-white py-2 pl-10 pr-3 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-accent text-sm"
				/>
			</div>
			<a href="/_/admin/products/import" class="btn-icon" title="Import"
				><Icon icon="mdi:file-upload" /></a
			>
			<a href="/_/admin/products/export" class="btn-icon" title="Export"
				><Icon icon="mdi:file-download" /></a
			>
			<button onclick={startCreating} class="btn-primary">
				<Icon icon="mdi:plus" />
				<span class="hidden sm:inline">Create New</span>
			</button>
		</div>
	</div>

	<!-- Table View -->
	<DataTable
		items={data.products}
		{columns}
		emptyMessage="No products found."
		row={productRow}
	/>

	<!-- Pagination -->
	{#if data.pagination?.totalPages > 1}
		<div
			class="mt-6 flex items-center justify-between border-t border-main/10 pt-6"
		>
			<div class="text-sm text-main/60">
				Page <span class="font-bold text-main"
					>{data.pagination.page}</span
				>
				of
				<span class="font-bold text-main"
					>{data.pagination.totalPages}</span
				>
			</div>
		</div>
	{/if}
</div>

<!-- SLIDE-OVER PANEL -->
<SlideOverPanel
	open={!!editingProduct}
	title={editingProduct?.id ? "Edit Product" : "New Product"}
	onClose={closePanel}
>
	<form
		method="POST"
		action="?/save"
		id="productForm"
		use:enhance={handleSubmit}
		class="space-y-6"
	>
		<input type="hidden" name="id" value={editingProduct?.id || ""} />
		<input
			type="hidden"
			name="longDescription"
			value={JSON.stringify(contentJson || {})}
		/>
		<input type="hidden" name="variants" value={JSON.stringify(variants)} />
		<input type="hidden" name="features" value={JSON.stringify(features)} />
		{#each galleryImages as img}<input
				type="hidden"
				name="galleryImageIds"
				value={img.mediaId}
			/>{/each}
		{#each Array.from(selectedSolutionIds) as solId}<input
				type="hidden"
				name="solutionIds"
				value={solId}
			/>{/each}

		<!-- Section 1: Core Details -->
		<FormSection title="Core Details">
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="sm:col-span-2">
					<label class="label">Product Name</label>
					<input
						type="text"
						name="name"
						required
						bind:value={editingProduct.name}
						class="input"
					/>
				</div>
				<div>
					<label class="label">Slug</label>
					<input
						type="text"
						name="slug"
						required
						bind:value={editingProduct.slug}
						class="input"
					/>
				</div>
				<div>
					<label class="label">Type</label>
					<select
						name="type"
						bind:value={editingProduct.type}
						class="input"
					>
						<option value="physical">Physical</option>
						<option value="digital">Digital</option>
						<option value="service">Service</option>
					</select>
				</div>
				<div>
					<label class="label">Approval Status</label>
					<select
						name="approvalStatus"
						bind:value={editingProduct.approvalStatus}
						class="input"
					>
						<option value="pending">Pending</option>
						<option value="approved">Approved</option>
						<option value="rejected">Rejected</option>
						<option value="draft">Draft</option>
					</select>
				</div>
				<div class="sm:col-span-2">
					<label class="label">Short Description</label>
					<textarea
						name="shortDescription"
						rows="2"
						bind:value={editingProduct.shortDescription}
						class="input"
					></textarea>
				</div>
			</div>
		</FormSection>

		<!-- Section 2: Variants -->
		<FormSection title="Pricing & Variants">
			<div class="flex justify-end mb-4">
				<button
					type="button"
					onclick={addVariant}
					class="text-xs font-bold text-accent hover:underline flex items-center gap-1"
				>
					<Icon icon="mdi:plus" /> Add Variant
				</button>
			</div>
			<div class="space-y-4">
				{#each variants as variant, i (variant.id ?? `new-${i}`)}
					<ProductVariantEditor
						bind:variant={variants[i]}
						suppliers={data.suppliers}
						index={i}
						onRemove={removeVariant}
						onSetDefault={setAsDefault}
					/>
				{/each}
			</div>
		</FormSection>

		<!-- Section 3: Smart Linking -->
		<FormSection title="Smart Linking">
			<SolutionPicker
				allSolutions={data.allSolutions ?? []}
				bind:selectedIds={selectedSolutionIds}
			/>
		</FormSection>

		<!-- Section 4: Media -->
		<FormSection title="Media">
			<FeaturedImagePicker
				mediaItems={data.mediaItems}
				bind:selectedMediaId={editingProduct.mediaId}
				currentImageUrl={editingProduct?.featuredImage?.thumbnailUrl ||
					editingProduct?.featuredImage?.originalUrl}
				currentImageAlt={editingProduct?.featuredImage?.altText}
			/>
			<div class="border-t border-main/10 pt-6 mt-6">
				<ImageGalleryManager
					mediaItems={data.mediaItems}
					bind:galleryImages
				/>
			</div>
		</FormSection>

		<!-- Section 5: Features & Description -->
		<FormSection title="Detailed Content">
			<FeatureListEditor bind:features />
			<div class="mt-6">
				<label class="label">Long Description</label>
				<RichTextEditor
					bind:content={contentJson}
					initialContent={editingProduct?.longDescription}
				/>
			</div>
		</FormSection>

		<!-- Section 6: CTA -->
		<FormSection title="Call to Action">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label class="label">Button Text</label>
					<input
						type="text"
						bind:value={editingProduct.ctaText}
						placeholder="Add to Cart"
						class="input"
					/>
				</div>
				<div>
					<label class="label">Button Link</label>
					<input
						type="text"
						bind:value={editingProduct.ctaLink}
						placeholder="/cart"
						class="input"
					/>
				</div>
			</div>
		</FormSection>
	</form>

	{#snippet footer()}
		<button
			type="button"
			onclick={closePanel}
			class="btn-secondary w-full sm:w-auto">Cancel</button
		>
		<SubmitButton
			form="productForm"
			type="submit"
			loading={isSubmitting}
			class="btn-primary w-full sm:w-auto">Save Product</SubmitButton
		>
	{/snippet}
</SlideOverPanel>

{#snippet productRow(p)}
	<td class="p-4 hidden sm:table-cell">
		{#if p.featuredImage}
			<img
				src={p.featuredImage.thumbnailUrl ||
					p.featuredImage.originalUrl}
				alt={p.name}
				class="h-10 w-10 rounded-md object-cover bg-main/5"
			/>
		{:else}
			<div
				class="flex h-10 w-10 items-center justify-center rounded-md bg-main/5"
			>
				<Icon icon="mdi:image-off" class="text-main/20" />
			</div>
		{/if}
	</td>
	<td class="p-4 font-medium">{p.name}</td>
	<td class="p-4 hidden md:table-cell"><span class="badge">{p.type}</span></td
	>
	<td class="p-4 text-sm hidden md:table-cell"
		>{p.type === "physical" ? getTotalStock(p.variants) : "∞"}</td
	>
	<td class="p-4 text-sm font-mono hidden sm:table-cell"
		>{formatPriceRange(p.variants)}</td
	>
	<td class="p-4 text-right">
		<div class="flex items-center justify-end gap-2">
			<button
				onclick={() => startEditing(p)}
				class="btn-icon-sm"
				title="Edit"><Icon icon="mdi:pencil" width="16" /></button
			>
			<form
				method="POST"
				action="?/delete&id={p.id}"
				use:enhance={handleDelete}
			>
				<button
					class="btn-icon-sm text-red-500 hover:bg-red-50"
					title="Delete"
					><Icon icon="mdi:trash-can-outline" width="16" /></button
				>
			</form>
		</div>
	</td>
{/snippet}

<style>
	.label {
		@apply mb-1 block text-sm font-bold text-main/80;
	}
	.input {
		@apply w-full rounded-md border-main/20 bg-main/5 px-3 py-2 text-main text-sm focus:border-accent focus:ring-accent;
	}
	.badge {
		@apply inline-block rounded-full bg-main/5 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-main/60;
	}
	.btn-primary {
		@apply flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5;
	}
	.btn-secondary {
		@apply rounded-md border border-main/20 px-6 py-2 font-bold text-main hover:bg-main/5;
	}
	.btn-icon {
		@apply flex items-center justify-center rounded-md border border-main/20 bg-white p-2 font-bold text-main shadow-sm transition hover:bg-main/5;
	}
	.btn-icon-sm {
		@apply rounded-md bg-main/80 p-1.5 text-light hover:bg-main;
	}
</style>
