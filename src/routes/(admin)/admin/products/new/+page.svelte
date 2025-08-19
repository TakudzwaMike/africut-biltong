<script>
	import { slugify } from '$lib/utils.js';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import { enhance } from '$app/forms';

	let { form } = $props();

	let name = $state('');
	let slug = $state('');
	let manualSlug = $state(false);
	let contentJson = $state(null);

	let isSubmitting = $state(false);
	let isSuccess = $state(false);
	let isError = $state(false);

	$effect(() => {
		if (!manualSlug) {
			slug = slugify(name);
		}
	});

	function handleSubmit() {
		isSubmitting = true;
		isSuccess = false;
		isError = false;

		return ({ result, update }) => {
			isSubmitting = false;

			if (result.type === 'success' || result.status === 303) {
				// 303 is the redirect status code
				isSuccess = true;
				// The page will redirect, so no need to reset the button state
			} else if (result.type === 'failure') {
				isError = true;
				// Reset the button after a couple of seconds
				setTimeout(() => {
					isError = false;
				}, 2000);
			}
			update();
		};
	}
</script>

<div class="p-8">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight text-main">New Product</h1>
		<a href="/admin/products" class="font-bold text-accent transition hover:drop-shadow-accent-glow"
			>← Back to List</a
		>
	</div>

	<form
		method="POST"
		enctype="multipart/form-data"
		class="mt-8 max-w-4xl space-y-8"
		use:enhance={handleSubmit}
	>
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
					bind:value={name}
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
			<div>
				<label for="image" class="mb-1 block font-medium text-main/80">Header Image</label>
				<input
					type="file"
					id="image"
					name="image"
					accept="image/png, image/jpeg, image/webp"
					class="w-full rounded-md border border-main/10 bg-main/5 text-sm text-main/80 file:mr-4 file:border-0 file:bg-main/10 file:px-4 file:py-2 file:font-bold"
				/>
				<p class="mt-1 text-xs text-main/60">Optional. Recommended aspect ratio 16:9.</p>
			</div>
			<div>
				<label for="shortDescription" class="mb-1 block font-medium text-main/80"
					>Short Description</label
				>
				<textarea
					id="shortDescription"
					name="shortDescription"
					rows="3"
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				></textarea>
			</div>
		</div>

		<!-- Long Description -->
		<div class="space-y-4 rounded-xl border border-main/10 p-6">
			<h3 class="text-lg font-bold">Long Description (Content)</h3>
			<RichTextEditor bind:content={contentJson} />
		</div>

		{#if form?.message}
			<p class="text-center font-bold text-red-600">{form.message}</p>
		{/if}

		<div class="text-center">
			<SubmitButton
				type="submit"
				loading={isSubmitting}
				success={isSuccess}
				error={isError}
			>
				Create Product
			</SubmitButton>
		</div>
	</form>
</div>