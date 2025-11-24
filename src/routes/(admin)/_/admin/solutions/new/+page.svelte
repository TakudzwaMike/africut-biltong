<script>
	import { slugify } from '$lib/utils.js';
	import FeaturedImagePicker from '$lib/components/FeaturedImagePicker.svelte';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';

	let { data, form } = $props();

	let solutionName = $state('');
	let slug = $state('');
	let manualSlug = $state(false);
	let longDescriptionJson = $state(null);

	$effect(() => {
		if (!manualSlug) {
			slug = slugify(solutionName);
		}
	});
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-4xl px-8 py-20 sm:py-24">
		<div class="flex items-center justify-between">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">New Solution</h1>
			<a href="/_/admin/solutions" class="font-bold text-accent transition hover:drop-shadow-accent-glow"
				>← Back to List</a
			>
		</div>

		<form method="POST" enctype="multipart/form-data" class="mt-12 space-y-6">
			<input type="hidden" name="longDescription" value={JSON.stringify(longDescriptionJson)} />

			<div>
				<label for="solutionName" class="mb-1 block font-medium text-main/80"
					>Solution Name</label
				>
				<input
					type="text"
					id="solutionName"
					name="solutionName"
					required
					bind:value={solutionName}
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
				<h3 class="text-lg font-bold">Featured Image</h3>
				<FeaturedImagePicker mediaItems={data.mediaItems} />
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
			<div>
				<label for="longDescription" class="mb-1 block font-medium text-main/80"
					>Long Description (Content)</label
				>
				<RichTextEditor bind:content={longDescriptionJson} />
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
					Create Solution
				</button>
			</div>
		</form>
	</div>
</div>