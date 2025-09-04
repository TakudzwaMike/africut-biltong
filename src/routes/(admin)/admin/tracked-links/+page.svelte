<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { invalidateAll } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import QRCode from 'qrcode';

	let { data, form } = $props();

	let isSubmitting = $state(false);

	$effect(() => {
		// This handles the successful "create" action from the form below
		if (form?.success && form.form?.action.includes('?/create')) {
			toast.success(form.message);
			invalidateAll();
		} else if (form?.message && form.form?.action.includes('?/create')) {
			toast.error(form.message);
		}
	});

	function handleDelete() {
		// This is the callback for the use:enhance directive on the delete form
		return ({ result }) => {
			if (result.type === 'success' && result.data?.success) {
				toast.success(result.data.message);
				invalidateAll();
			} else if (result.type === 'failure') {
				toast.error(result.data?.message);
			}
		};
	}

	async function generateQrCode(text) {
		try {
			return await QRCode.toDataURL(text, {
				errorCorrectionLevel: 'H',
				margin: 2,
				width: 256
			});
		} catch (err) {
			console.error(err);
			return null;
		}
	}

	function copyToClipboard(text) {
		navigator.clipboard.writeText(text).then(
			() => toast.success('Link copied!'),
			() => toast.error('Failed to copy link.')
		);
	}
</script>

<div class="p-8">
	<h1 class="text-3xl font-bold tracking-tight text-main">Tracked Links & QR Codes</h1>
	<p class="mt-2 text-base text-main/70">
		Generate short links and QR codes to track campaign performance.
	</p>

	<!-- Create New Link Form -->
	<div class="mt-8 max-w-2xl">
		<form
			method="POST"
			action="?/create"
			class="rounded-xl border border-main/10 p-6"
			use:enhance={() => {
				isSubmitting = true;
				return ({ result }) => {
					isSubmitting = false;
					if (result.type === 'success') {
						document.querySelector('form[action="?/create"]')?.reset();
					}
				};
			}}
		>
			<h3 class="text-lg font-bold">Create New Link</h3>
			<div class="mt-4 space-y-4">
				<div>
					<label for="destinationUrl" class="mb-1 block font-medium text-main/80"
						>Destination URL</label
					>
					<input
						type="url"
						id="destinationUrl"
						name="destinationUrl"
						required
						placeholder="https://vision-ai.tech/products/..."
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
				<div>
					<label for="description" class="mb-1 block font-medium text-main/80"
						>Description (for internal tracking)</label
					>
					<input
						type="text"
						id="description"
						name="description"
						required
						placeholder="e.g., Q3 LinkedIn Campaign"
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
			</div>
			<div class="mt-6">
				<SubmitButton type="submit" loading={isSubmitting} class="bg-accent px-6 py-2">
					Generate Link
				</SubmitButton>
			</div>
		</form>
	</div>

	<!-- Existing Links -->
	<div class="mt-12 space-y-6">
		{#each data.links as link (link.id)}
			{@const fullUrl = `https://vision-ai.tech/r/${link.shortCode}`}
			<div class="grid gap-6 rounded-xl border border-main/10 p-6 md:grid-cols-[1fr,auto]">
				<div>
					<p class="text-sm text-main/60">Description</p>
					<h3 class="font-bold">{link.description}</h3>
					<p class="mt-4 text-sm text-main/60">Destination</p>
					<a
						href={link.destinationUrl}
						target="_blank"
						class="truncate font-mono text-sm text-accent underline"
						>{link.destinationUrl}</a
					>
					<p class="mt-4 text-sm text-main/60">Tracked Link</p>
					<div class="flex items-center gap-2">
						<a href={fullUrl} target="_blank" class="font-mono text-sm text-accent underline"
							>{fullUrl}</a
						>
						<button title="Copy link" onclick={() => copyToClipboard(fullUrl)}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								class="text-main/60 hover:text-main"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path
									d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
								/></svg
							>
						</button>
					</div>
					<div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-main/60">
						<span>
							Created by <span class="font-bold">{link.user.username}</span> on {new Date(
								link.createdAt
							).toLocaleDateString()}
						</span>
						<a href={`/admin/tracked-links/${link.id}`} class="font-bold text-accent underline"
							>{link.visits.length} Clicks</a
						>
						<form
							method="POST"
							action="?/delete&id={link.id}"
							use:enhance={handleDelete}
							onsubmit={(e) => {
								if (!confirm('Are you sure you want to permanently delete this link?')) {
									e.preventDefault();
								}
							}}
						>
							<button type="submit" class="font-bold text-red-500 transition hover:text-red-400">
								Delete
							</button>
						</form>
					</div>
				</div>
				<div class="text-center">
					{#await generateQrCode(fullUrl) then qrCodeDataUrl}
						<img src={qrCodeDataUrl} alt="QR Code" class="mx-auto rounded-lg" />
					{/await}
				</div>
			</div>
		{/each}
	</div>
</div>
