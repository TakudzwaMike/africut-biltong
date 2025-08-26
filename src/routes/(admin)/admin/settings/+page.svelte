<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';

	let { data, form } = $props();

	let siteSettings = $state(data);

	$effect(() => {
		if (form?.success) {
			toast.success(form.message);
		}
	});
</script>

<div class="p-8">
	<h1 class="text-3xl font-bold tracking-tight text-main">Site Settings</h1>
	<p class="mt-2 text-base text-main/70">Manage global branding and logos for the website.</p>

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={() => {
			return ({ result }) => {
				if (result.type === 'success' && result.data) {
					// We can't update the data store directly after a successful form post
					// without a full page reload or more complex state management.
					// A toast notification is the simplest feedback.
					toast.success('Settings saved! Reloading page to see changes.');
					setTimeout(() => window.location.reload(), 1500);
				}
			};
		}}
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
						bind:value={siteSettings.siteName}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>

				<div>
					<label for="logo" class="mb-1 block font-medium text-main/80">Site Logo</label>
					{#if siteSettings.logoUrl}
						<div class="mb-2">
							<p class="text-sm text-main/80">Current Logo:</p>
							<img
								src={siteSettings.logoUrl}
								alt="Current logo"
								class="mt-1 h-12 max-w-48 rounded-md bg-main/5 object-contain p-1"
							/>
						</div>
					{/if}
					<input
						type="file"
						id="logo"
						name="logo"
						accept="image/png, image/jpeg, image/svg+xml, image/webp"
						class="w-full rounded-md border border-main/10 bg-main/5 text-sm text-main/80 file:mr-4 file:border-0 file:bg-main/10 file:px-4 file:py-2 file:font-bold"
					/>
					<p class="mt-1 text-xs text-main/60">
						Optional. Uploading a new file will replace the current logo.
					</p>
				</div>
			</div>
		</div>

		<div class="rounded-xl border border-main/10 p-6">
			<h3 class="text-lg font-bold">Company Brochure</h3>
			<div class="mt-4">
				<label for="brochure" class="mb-1 block font-medium text-main/80">Upload Brochure (PDF)</label>
				{#if siteSettings.brochureUrl}
					<div class="mb-2">
						<p class="text-sm text-main/80">Current Brochure:</p>
						<a
							href={siteSettings.brochureUrl}
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
					bind:value={siteSettings.heroVideoUrl}
					placeholder="e.g., https://www.youtube.com/watch?v=..."
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
				<p class="mt-1 text-xs text-main/60">
					Optional. If provided, this will replace the background image. Use the full YouTube URL,
					not the embed link
				</p>
			</div>
		</div>

		<div class="rounded-xl border border-main/10 p-6">
			<h3 class="text-lg font-bold">Contact & Social</h3>
			<div class="mt-4">
				<label for="whatsappNumber" class="mb-1 block font-medium text-main/80"
					>WhatsApp Number for Quick Chat</label
				>
				<input
					type="tel"
					id="whatsappNumber"
					name="whatsappNumber"
					bind:value={siteSettings.whatsappNumber}
					placeholder="e.g., 263771234567 (include country code)"
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
				<p class="mt-1 text-xs text-main/60">
					Optional. If provided, a floating WhatsApp chat button will appear on the site.
				</p>
			</div>
		</div>

		{#if form?.message && !form.success}
			<p class="text-center font-bold text-red-600">{form.message}</p>
		{/if}

		<div class="text-left">
			<button
				type="submit"
				class="rounded-md bg-accent px-6 py-2 font-bold text-main shadow-lg shadow-accent/30 transition hover:-translate-y-0.5"
			>
				Save Settings
			</button>
		</div>
	</form>
</div>
