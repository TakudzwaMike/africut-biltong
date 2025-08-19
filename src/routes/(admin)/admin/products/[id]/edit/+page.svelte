<script>
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';

	let { data, form } = $props();

	let productData = $state(data.product);
	let contentJson = $state(data.product.longDescription);
</script>

<div class="p-8">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight text-main">Edit Product</h1>
		<a href="/admin/products" class="font-bold text-accent transition hover:drop-shadow-accent-glow"
			>← Back to List</a
		>
	</div>

	<form method="POST" enctype="multipart/form-data" class="mt-8 max-w-4xl space-y-8">
		<input type="hidden" name="longDescription" value={JSON.stringify(contentJson)} />

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
					bind:value={productData.name}
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
					bind:value={productData.slug}
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
			<div>
				<label for="image" class="mb-1 block font-medium text-main/80">Header Image</label>
				{#if productData.imageUrl}
					<div class="mb-2">
						<p class="text-sm text-main/80">Current Image:</p>
						<img
							src={productData.imageUrl}
							alt="Current header"
							class="mt-1 max-h-32 rounded-md bg-main/5 object-contain p-1"
						/>
					</div>
				{/if}
				<input
					type="file"
					id="image"
					name="image"
					accept="image/png, image/jpeg, image/webp"
					class="w-full rounded-md border border-main/10 bg-main/5 text-sm text-main/80 file:mr-4 file:border-0 file:bg-main/10 file:px-4 file:py-2 file:font-bold"
				/>
				<p class="mt-1 text-xs text-main/60">
					Optional. Uploading a new file will replace the current image.
				</p>
			</div>
			<div>
				<label for="shortDescription" class="mb-1 block font-medium text-main/80"
					>Short Description</label
				>
				<textarea
					id="shortDescription"
					name="shortDescription"
					rows="3"
					bind:value={productData.shortDescription}
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				></textarea>
			</div>
		</div>

		<!-- Long Description -->
		<div class="space-y-4 rounded-xl border border-main/10 p-6">
			<h3 class="text-lg font-bold">Long Description (Content)</h3>
			<RichTextEditor bind:content={contentJson} initialContent={productData.longDescription} />
		</div>

		{#if form?.message}
			<p class="text-center font-bold text-red-600">{form.message}</p>
		{/if}

		<div class="text-center">
			<button
				type="submit"
				class="rounded-md bg-accent px-8 py-3 font-bold text-main shadow-lg shadow-accent/30 transition hover:-translate-y-1"
			>
				Save Changes
			</button>
		</div>
	</form>
</div>