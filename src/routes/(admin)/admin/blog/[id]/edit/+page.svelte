<script>
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';
	import FeaturedImagePicker from '$lib/components/FeaturedImagePicker.svelte';

	let { data, form } = $props();

	let postData = $state(data.post);
	let contentJson = $state(data.post.contentJson);
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-4xl px-8 py-20 sm:py-24">
		<div class="flex items-center justify-between">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Edit Blog Post</h1>
			<a href="/admin/blog" class="font-bold text-accent transition hover:drop-shadow-accent-glow"
				>← Back to List</a
			>
		</div>

		<form method="POST" class="mt-12 space-y-8">
			<input type="hidden" name="contentJson" value={JSON.stringify(contentJson)} />

			<div class="space-y-4 rounded-xl border border-main/10 p-6">
				<h3 class="text-lg font-bold">Post Details</h3>
				<div>
					<label for="title" class="mb-1 block font-medium text-main/80">Title</label>
					<input
						type="text"
						id="title"
						name="title"
						required
						bind:value={postData.title}
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
						bind:value={postData.slug}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
			</div>
			
			<div class="space-y-4 rounded-xl border border-main/10 p-6">
				<h3 class="text-lg font-bold">Featured Image</h3>
				<FeaturedImagePicker
					mediaItems={data.mediaItems}
					bind:selectedMediaId={postData.mediaId}
					currentImageUrl={postData.featuredImage?.url}
					currentImageAlt={postData.featuredImage?.altText}
				/>
			</div>

			<div class="space-y-4 rounded-xl border border-main/10 p-6">
				<h3 class="text-lg font-bold">Content</h3>
				<RichTextEditor bind:content={contentJson} initialContent={postData.contentJson} />
			</div>
			
			<div class="space-y-4 rounded-xl border border-main/10 p-6">
				<h3 class="text-lg font-bold">Categories</h3>
				{@const postCategoryIds = new Set(postData.categories.map(c => c.categoryId))}
				<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
					{#each data.allCategories as category}
						<label class="flex items-center gap-2 rounded-md bg-main/5 p-3">
							<input
								type="checkbox"
								name="categoryIds"
								value={category.id}
								checked={postCategoryIds.has(category.id)}
								class="h-4 w-4 rounded border-main/20 bg-main/10 text-accent focus:ring-accent"
							/>
							<span>{category.name}</span>
						</label>
					{/each}
				</div>
				{#if data.allCategories.length === 0}
					<p class="text-sm text-main/70">
						No categories created yet. <a
							href="/admin/blog/categories"
							class="text-accent underline">Create one first</a
						>.
					</p>
				{/if}
			</div>

			<div class="space-y-4 rounded-xl border border-main/10 p-6">
				<h3 class="text-lg font-bold">Publishing</h3>
				<label class="relative inline-flex cursor-pointer items-center">
					<input
						type="checkbox"
						name="isPublished"
						class="peer sr-only"
						bind:checked={postData.isPublished}
					/>
					<div
						class="h-7 w-12 rounded-full bg-main/20 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-md after:transition-all after:duration-300 after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent/50"
					></div>
					<span class="ml-3 text-sm font-medium text-main/80">Publish this post</span>
				</label>
				<p class="text-xs text-main/60">
					If unchecked, the post will be saved as a draft.
				</p>
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
