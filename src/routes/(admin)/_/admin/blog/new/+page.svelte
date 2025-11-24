<script>
	import { slugify } from '$lib/utils.js';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';
	import FeaturedImagePicker from '$lib/components/FeaturedImagePicker.svelte';

	let { form, data } = $props();

	let title = $state('');
	let slug = $state('');
	let manualSlug = $state(false);
	let contentJson = $state(null);

	$effect(() => {
		if (!manualSlug) {
			slug = slugify(title);
		}
	});
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-4xl px-8 py-20 sm:py-24">
		<div class="flex items-center justify-between">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">New Blog Post</h1>
			<a href="/_/admin/blog" class="font-bold text-accent transition hover:drop-shadow-accent-glow"
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
						bind:value={title}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
				<div>
					<div class="mb-1 flex items-center justify-between">
						<label for="slug" class="font-medium text-main/80">Slug</label>
						{#if !manualSlug}
							<button type="button" onclick={() => (manualSlug = true)} class="text-sm text-accent"
								>Edit</button
							>
						{/if}
					</div>
					<input
						type="text"
						id="slug"
						name="slug"
						required
						readonly={!manualSlug}
						bind:value={slug}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 read-only:bg-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
			</div>

			<div class="space-y-4 rounded-xl border border-main/10 p-6">
				<h3 class="text-lg font-bold">Featured Image</h3>
				<FeaturedImagePicker mediaItems={data.mediaItems} />
			</div>

			<div class="space-y-4 rounded-xl border border-main/10 p-6">
				<h3 class="text-lg font-bold">Content</h3>
				<!-- Updated to use the new RichTextEditor -->
				<RichTextEditor bind:content={contentJson} />
			</div>

			<div class="space-y-4 rounded-xl border border-main/10 p-6">
				<h3 class="text-lg font-bold">Categories</h3>
				<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
					{#each data.categories as category}
						<label class="flex items-center gap-2 rounded-md bg-main/5 p-3">
							<input
								type="checkbox"
								name="categoryIds"
								value={category.id}
								class="h-4 w-4 rounded border-main/20 bg-main/10 text-accent focus:ring-accent"
							/>
							<span>{category.name}</span>
						</label>
					{/each}
				</div>
				{#if data.categories.length === 0}
					<p class="text-sm text-main/70">
						No categories created yet. <a
							href="/_/admin/blog/categories"
							class="text-accent underline">Create one first</a
						>.
					</p>
				{/if}
			</div>

			<div class="space-y-4 rounded-xl border border-main/10 p-6">
				<h3 class="text-lg font-bold">Publishing</h3>
				<div>
					<label class="relative inline-flex cursor-pointer items-center">
						<input type="checkbox" name="isPublished" class="peer sr-only" checked />
						<div
							class="h-7 w-12 rounded-full bg-main/20 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-md after:transition-all after:duration-300 after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent/50"
						></div>
						<span class="ml-3 text-sm font-medium text-main/80">Publish this post</span>
					</label>
					<p class="mt-2 text-xs text-main/60">
						If unchecked, the post will be saved as a draft regardless of the date.
					</p>
				</div>
				<div>
					<label for="publishedAt" class="mb-1 block font-medium text-main/80"
						>Publish Date (Optional)</label
					>
					<input
						type="datetime-local"
						id="publishedAt"
						name="publishedAt"
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
					<p class="mt-1 text-xs text-main/60">
						Leave blank to publish immediately. Select a future date to schedule the post.
					</p>
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
					Save Post
				</button>
			</div>
		</form>
	</div>
</div>