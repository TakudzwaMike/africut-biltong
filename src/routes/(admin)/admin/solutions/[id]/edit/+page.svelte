<script>
	import FeaturedImagePicker from '$lib/components/FeaturedImagePicker.svelte';
	let { data, form } = $props();

	let solutionData = $state(data.solution);
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-4xl px-8 py-20 sm:py-24">
		<div class="flex items-center justify-between">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Edit Solution</h1>
			<a href="/admin/solutions" class="font-bold text-accent transition hover:drop-shadow-accent-glow"
				>← Back to List</a
			>
		</div>

		<form method="POST" enctype="multipart/form-data" class="mt-12 space-y-6">
			<div>
				<label for="solutionName" class="mb-1 block font-medium text-main/80"
					>Solution Name</label
				>
				<input
					type="text"
					id="solutionName"
					name="solutionName"
					required
					bind:value={solutionData.solutionName}
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
					bind:value={solutionData.slug}
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
			<div>
				<h3 class="text-lg font-bold">Featured Image</h3>
				<FeaturedImagePicker
					mediaItems={data.mediaItems}
					bind:selectedMediaId={solutionData.mediaId}
					currentImageUrl={solutionData.featuredImage?.url}
					currentImageAlt={solutionData.featuredImage?.altText}
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
					bind:value={solutionData.shortDescription}
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				></textarea>
			</div>
			<div>
				<label for="longDescription" class="mb-1 block font-medium text-main/80"
					>Long Description (Content)</label
				>
				<textarea
					id="longDescription"
					name="longDescription"
					rows="8"
					bind:value={solutionData.longDescription}
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				></textarea>
			</div>

			<div class="space-y-4 rounded-xl border border-main/10 p-6">
				<h3 class="text-lg font-bold">Call to Action (Optional)</h3>
				<p class="text-xs text-main/60">
					Override the default "Discuss this Solution" button on the public page.
				</p>
				<div>
					<label for="ctaText" class="mb-1 block font-medium text-main/80">Button Text</label>
					<input
						type="text"
						id="ctaText"
						name="ctaText"
						placeholder="e.g., Talk to an Expert"
						bind:value={solutionData.ctaText}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
				<div>
					<label for="ctaLink" class="mb-1 block font-medium text-main/80">Button Link</label>
					<input
						type="text"
						id="ctaLink"
						name="ctaLink"
						placeholder="e.g., /contact?source=expert-talk"
						bind:value={solutionData.ctaLink}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
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
</div>