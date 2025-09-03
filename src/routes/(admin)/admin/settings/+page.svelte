<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import FeaturedImagePicker from '$lib/components/FeaturedImagePicker.svelte';
	import { invalidateAll, applyAction } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';

	let { data, form } = $props();

	// Use $state for local form bindings, initialized from loaded data.
	let formState = $state({
		siteName: data.settings.siteName,
		siteLogoMediaId: data.settings.siteLogoMediaId,
		heroVideoUrl: data.settings.heroVideoUrl,
		whatsappNumber: data.settings.whatsappNumber,
		socialLinkedIn: data.settings.socialLinkedIn,
		socialX: data.settings.socialX,
		socialFacebook: data.settings.socialFacebook
	});

	let isSubmitting = $state(false);

	function handleSubmit() {
		isSubmitting = true;
		return ({ result, update }) => {
			isSubmitting = false;
			if (result.type === 'success') {
				toast.success(result.data?.message);
				// Invalidate all data to ensure we get fresh state from the server,
				// including potentially the new logo object.
				invalidateAll();
			} else if (result.type === 'failure') {
				toast.error(result.data?.message);
			}
		};
	}
</script>

<div class="p-8">
	<h1 class="text-3xl font-bold tracking-tight text-main">Site Settings</h1>
	<p class="mt-2 text-base text-main/70">Manage global branding and logos for the website.</p>

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={handleSubmit}
		class="mt-8 max-w-2xl space-y-6"
	>
		<div class="rounded-xl border border-main/10 p-6">
			<h3 class="text-lg font-bold">Branding</h3>
			<div class="mt-4 space-y-6">
				<div>
					<label for="siteName" class="mb-1 block font-medium text-main/80">Site Name</label>
					<input
						type="text"
						id="siteName"
						name="siteName"
						required
						bind:value={formState.siteName}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>

				<div>
					<FeaturedImagePicker
						mediaItems={data.mediaItems}
						bind:selectedMediaId={formState.siteLogoMediaId}
						currentImageUrl={data.logo?.thumbnailUrl || data.logo?.originalUrl}
						currentImageAlt={data.logo?.altText}
					/>
					<input type="hidden" name="siteLogoMediaId" value={formState.siteLogoMediaId ?? ''} />
				</div>
			</div>
		</div>

		<div class="rounded-xl border border-main/10 p-6">
			<h3 class="text-lg font-bold">Company Brochure</h3>
			<div class="mt-4">
				<label for="brochure" class="mb-1 block font-medium text-main/80"
					>Upload Brochure (PDF)</label
				>
				{#if data.settings.brochureUrl}
					<div class="mb-2">
						<p class="text-sm text-main/80">Current Brochure:</p>
						<a
							href={data.settings.brochureUrl}
							target="_blank"
							class="mt-1 block text-accent underline"
						>
							View Current Brochure
						</a>
					</div>
				{/if}
				<input
					type="file"
					id="brochure"
					name="brochure"
					accept="application/pdf"
					class="w-full rounded-md border border-main/10 bg-main/5 text-sm text-main/80 file:mr-4 file:border-0 file:bg-main/10 file:px-4 file:py-2 file:font-bold"
				/>
				<p class="mt-1 text-xs text-main/60">
					Optional. Uploading a new PDF will replace the current one.
				</p>
			</div>
		</div>

		<div class="rounded-xl border border-main/10 p-6">
			<h3 class="text-lg font-bold">Homepage Hero</h3>
			<div class="mt-4">
				<label for="heroVideoUrl" class="mb-1 block font-medium text-main/80"
					>Background YouTube Video URL</label
				>
				<input
					type="url"
					id="heroVideoUrl"
					name="heroVideoUrl"
					bind:value={formState.heroVideoUrl}
					placeholder="e.g., https://www.youtube.com/watch?v=..."
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
				<p class="mt-1 text-xs text-main/60">
					Optional. If provided, this will replace the background image. Use the full YouTube URL,
					not the embed link
				</p>
			</div>
		</div>

		<div class="rounded-xl border border-main/10 p-6 space-y-4">
			<h3 class="text-lg font-bold">Contact & Social</h3>
			<div>
				<label for="whatsappNumber" class="mb-1 block font-medium text-main/80"
					>WhatsApp Number for Quick Chat</label
				>
				<input
					type="tel"
					id="whatsappNumber"
					name="whatsappNumber"
					bind:value={formState.whatsappNumber}
					placeholder="e.g., 263771234567 (include country code)"
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
				<p class="mt-1 text-xs text-main/60">
					Optional. If provided, a floating WhatsApp chat button will appear on the site.
				</p>
			</div>
			<hr class="border-main/10" />
			<div>
				<label for="socialLinkedIn" class="mb-1 block font-medium text-main/80"
					>LinkedIn Profile URL</label
				>
				<input
					type="url"
					id="socialLinkedIn"
					name="socialLinkedIn"
					bind:value={formState.socialLinkedIn}
					placeholder="https://www.linkedin.com/company/..."
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
			<div>
				<label for="socialX" class="mb-1 block font-medium text-main/80"
					>X (Twitter) Profile URL</label
				>
				<input
					type="url"
					id="socialX"
					name="socialX"
					bind:value={formState.socialX}
					placeholder="https://x.com/..."
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
			<div>
				<label for="socialFacebook" class="mb-1 block font-medium text-main/80"
					>Facebook Profile URL</label
				>
				<input
					type="url"
					id="socialFacebook"
					name="socialFacebook"
					bind:value={formState.socialFacebook}
					placeholder="https://www.facebook.com/..."
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
		</div>

		{#if form?.message && !form.success}
			<p class="text-center font-bold text-red-600">{form.message}</p>
		{/if}

		<div class="text-left">
			<SubmitButton type="submit" loading={isSubmitting} class="bg-accent px-6 py-2">
				Save Settings
			</SubmitButton>
		</div>
	</form>
</div>