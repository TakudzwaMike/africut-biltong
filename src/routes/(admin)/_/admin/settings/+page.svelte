<script>
	import { enhance } from "$app/forms";
	import { toast } from "$lib/toast-service";
	import FeaturedImagePicker from "$lib/components/FeaturedImagePicker.svelte";
	import { invalidateAll } from "$app/navigation";
	import SubmitButton from "$lib/components/SubmitButton.svelte";

	let { data, form } = $props();

	// Initialize form state
	let formState = $state({ ...data.settings });

	let isSubmitting = $state(false);
	let isSuccess = $state(false);
	let isError = $state(false);

	let isDirty = $derived(
		JSON.stringify(formState) !== JSON.stringify(data.settings),
	);

	function handleSubmit() {
		isSubmitting = true;
		isSuccess = false;
		isError = false;

		return async ({ result, update }) => {
			isSubmitting = false;

			if (result.type === "success") {
				isSuccess = true;
				toast.success(result.data?.message);
				await invalidateAll();
			} else if (result.type === "failure") {
				isError = true;
				toast.error(result.data?.message);
			}

			update({ reset: false });

			setTimeout(() => {
				isSuccess = false;
				isError = false;
			}, 2000);
		};
	}
</script>

<div class="p-8">
	<h1 class="text-3xl font-bold tracking-tight text-main">Site Settings</h1>
	<p class="mt-2 text-base text-main/70">
		Manage global branding, store rates, and configuration.
	</p>

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={handleSubmit}
		class="mt-8 max-w-2xl space-y-6"
	>
		<input
			type="hidden"
			name="siteLogoMediaId"
			value={formState.siteLogoMediaId ?? ""}
		/>

		<!-- Branding Card -->
		<div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
			<h3 class="text-lg font-bold">Branding</h3>
			<div class="mt-4 space-y-6">
				<div>
					<label
						for="siteName"
						class="mb-1 block font-medium text-main/80"
						>Site Name</label
					>
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
						currentImageUrl={data.logo?.thumbnailUrl ||
							data.logo?.originalUrl}
						currentImageAlt={data.logo?.altText}
						label="Site Logo"
					/>
				</div>
			</div>
		</div>

		<!-- Store Settings Card (NEW) -->
		<div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
			<h3 class="text-lg font-bold flex items-center gap-2">
				Store Configuration
				<span
					class="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent uppercase"
					>Commerce</span
				>
			</h3>
			<div class="mt-4">
				<div class="flex items-center justify-between mb-1">
					<label
						for="exchangeRate"
						class="block font-medium text-main/80"
						>USD to ZAR Exchange Rate</label
					>
					{#if data.liveWiseRate}
						<button
							type="button"
							onclick={(e) => {
								e.preventDefault();
								formState.exchangeRate =
									data.liveWiseRate.toFixed(2);
							}}
							class="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors flex items-center"
							title="Click to sync this input with the live Wise Rate"
						>
							<span class="mr-1">Live Wise Rate:</span> R {data.liveWiseRate.toFixed(
								2,
							)} — Sync
						</button>
					{/if}
				</div>
				<div class="relative">
					<div
						class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
					>
						<span class="text-main/50 font-bold">R</span>
					</div>
					<input
						type="number"
						step="0.01"
						id="exchangeRate"
						name="exchangeRate"
						bind:value={formState.exchangeRate}
						placeholder="18.50"
						class="w-full rounded-md border-0 bg-main/5 pl-8 pr-3 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
				<p class="mt-1 text-xs text-main/60">
					Used to auto-calculate ZAR prices for new products if only
					USD is provided (and vice versa).
				</p>
			</div>
		</div>

		<!-- Brochure Card -->
		<div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
			<h3 class="text-lg font-bold">Company Brochure</h3>
			<div class="mt-4">
				<label
					for="brochure"
					class="mb-1 block font-medium text-main/80"
					>Upload Brochure (PDF)</label
				>
				{#if data.settings.brochureUrl}
					<div class="mb-2 flex items-center gap-2 text-sm">
						<span class="font-bold text-accent">✓ Active:</span>
						<a
							href={data.settings.brochureUrl}
							target="_blank"
							class="text-main/80 hover:text-main underline"
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
			</div>
		</div>

		<!-- Hero Video Card -->
		<div class="rounded-xl border border-main/10 bg-white p-6 shadow-sm">
			<h3 class="text-lg font-bold">Homepage Hero</h3>
			<div class="mt-4">
				<label
					for="heroVideoUrl"
					class="mb-1 block font-medium text-main/80"
					>Background YouTube Video URL</label
				>
				<input
					type="url"
					id="heroVideoUrl"
					name="heroVideoUrl"
					bind:value={formState.heroVideoUrl}
					placeholder="https://www.youtube.com/watch?v=..."
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
		</div>

		<!-- Social & Contact -->
		<div
			class="rounded-xl border border-main/10 bg-white p-6 shadow-sm space-y-4"
		>
			<h3 class="text-lg font-bold">Contact & Social</h3>
			<div>
				<label
					for="whatsappNumber"
					class="mb-1 block font-medium text-main/80"
					>WhatsApp Number</label
				>
				<input
					type="tel"
					id="whatsappNumber"
					name="whatsappNumber"
					bind:value={formState.whatsappNumber}
					placeholder="e.g., 263771234567"
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
			<hr class="border-main/10" />
			<div>
				<label
					for="socialLinkedIn"
					class="mb-1 block font-medium text-main/80"
					>LinkedIn URL</label
				>
				<input
					type="url"
					id="socialLinkedIn"
					name="socialLinkedIn"
					bind:value={formState.socialLinkedIn}
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
			<div>
				<label
					for="socialInstagram"
					class="mb-1 block font-medium text-main/80"
					>Instagram URL</label
				>
				<input
					type="url"
					id="socialInstagram"
					name="socialInstagram"
					bind:value={formState.socialInstagram}
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
			<div>
				<label
					for="socialTikTok"
					class="mb-1 block font-medium text-main/80"
					>TikTok URL</label
				>
				<input
					type="url"
					id="socialTikTok"
					name="socialTikTok"
					bind:value={formState.socialTikTok}
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
			<div>
				<label for="socialX" class="mb-1 block font-medium text-main/80"
					>X (Twitter) URL</label
				>
				<input
					type="url"
					id="socialX"
					name="socialX"
					bind:value={formState.socialX}
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
			<div>
				<label
					for="socialFacebook"
					class="mb-1 block font-medium text-main/80"
					>Facebook URL</label
				>
				<input
					type="url"
					id="socialFacebook"
					name="socialFacebook"
					bind:value={formState.socialFacebook}
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
			<div>
				<label
					for="socialInstagram"
					class="mb-1 block font-medium text-main/80"
					>Instagram URL</label
				>
				<input
					type="url"
					id="socialInstagram"
					name="socialInstagram"
					bind:value={formState.socialInstagram}
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
			<div>
				<label
					for="socialTikTok"
					class="mb-1 block font-medium text-main/80"
					>TikTok URL</label
				>
				<input
					type="url"
					id="socialTikTok"
					name="socialTikTok"
					bind:value={formState.socialTikTok}
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>
		</div>

		{#if form?.message && !form.success}
			<p class="text-center font-bold text-red-600">{form.message}</p>
		{/if}

		<div class="text-left pb-12">
			<SubmitButton
				type="submit"
				loading={isSubmitting}
				success={isSuccess}
				error={isError}
				disabled={!isDirty || isSubmitting}
				class="bg-accent px-6 py-2 w-full sm:w-auto"
			>
				Save Settings
			</SubmitButton>
		</div>
	</form>
</div>
