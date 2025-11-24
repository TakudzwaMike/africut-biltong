<script>
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';
	import { invalidateAll } from '$app/navigation';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import QRCode from 'qrcode';
	import Icon from '@iconify/svelte';

	let { data, form } = $props();

	let isSubmitting = $state(false);
	let showingQrCodeForLink = $state(null);

	$effect(() => {
		if (form?.success && form.form?.action.includes('?/create')) {
			toast.success(form.message);
			invalidateAll();
		} else if (form?.message && form.form?.action.includes('?/create')) {
			toast.error(form.message);
		}
	});

	function handleDelete() {
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
						const formEl = document.querySelector('form[action="?/create"]');
						formEl?.reset();
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

	<!-- Existing Links Table -->
	<div class="mt-12 overflow-x-auto">
		<table class="w-full min-w-max text-left">
			<thead class="border-b border-main/10">
				<tr>
					<th class="p-4">Description</th>
					<th class="p-4">Tracked Link</th>
					<th class="p-4">Destination</th>
					<th class="p-4">Clicks</th>
					<th class="p-4 text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.links as link (link.id)}
					{@const fullUrl = `https://vision-ai.tech/r/${link.shortCode}`}
					<tr class="border-b border-main/10">
						<td class="p-4 align-top">
							<p class="font-bold">{link.description}</p>
							<p class="text-xs text-main/60">
								By {link.user.username} on {new Date(link.createdAt).toLocaleDateString()}
							</p>
						</td>
						<td class="p-4 align-top">
							<div class="flex items-center gap-2">
								<a
									href={fullUrl}
									target="_blank"
									class="font-mono text-sm text-accent underline"
									>{fullUrl}</a
								>
								<button
									type="button"
									title="Copy link"
									onclick={() => copyToClipboard(fullUrl)}
									class="text-main/60 transition hover:text-main"
								>
									<Icon icon="mdi:content-copy" />
								</button>
							</div>
						</td>
						<td class="p-4 align-top">
							<a
								href={link.destinationUrl}
								target="_blank"
								class="block max-w-xs truncate font-mono text-sm text-main/70 underline"
								title={link.destinationUrl}
							>
								{link.destinationUrl}
							</a>
						</td>
						<td class="p-4 align-top">
							<a
								href={`/_/admin/tracked-links/${link.id}`}
								class="font-bold text-accent underline"
							>
								{link.visits.length}
							</a>
						</td>
						<td class="p-4 align-top">
							<div class="flex items-center justify-end gap-2">
								<button
									type="button"
									onclick={() => (showingQrCodeForLink = link)}
									class="rounded-md bg-main/80 p-1.5 text-light"
									aria-label="Show QR Code"
								>
									<Icon icon="mdi:qrcode" width="16" height="16" />
								</button>
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
									<button
										type="submit"
										class="rounded-md bg-red-500 p-1.5 text-white"
										aria-label="Delete link"
									>
										<Icon icon="mdi:trash-can-outline" width="16" height="16" />
									</button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if (data.links?.length ?? 0) === 0}
			<div class="mt-8 rounded-xl border border-dashed border-main/20 p-12 text-center">
				<p class="text-main/70">No tracked links found. Create your first one!</p>
			</div>
		{/if}
	</div>
</div>

<!-- QR Code Modal -->
{#if showingQrCodeForLink}
	{@const fullUrl = `https://vision-ai.tech/r/${showingQrCodeForLink.shortCode}`}
	<div
		class="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		onclick={() => (showingQrCodeForLink = null)}
	>
		<div
			class="w-full max-w-sm rounded-xl bg-light p-6 text-center shadow-2xl"
			onclick={(e) => e.stopPropagation()}
		>
			<h3 class="text-lg font-bold">{showingQrCodeForLink.description}</h3>
			{#await generateQrCode(fullUrl) then qrCodeDataUrl}
				<img src={qrCodeDataUrl} alt="QR Code" class="mx-auto my-4 rounded-lg" />
			{/await}
			<div
				class="flex items-center justify-center gap-2 rounded-md bg-main/5 p-2 font-mono text-sm"
			>
				<span class="truncate">{fullUrl}</span>
				<button
					type="button"
					title="Copy link"
					onclick={() => copyToClipboard(fullUrl)}
					class="flex-shrink-0 text-main/60 transition hover:text-main"
				>
					<Icon icon="mdi:content-copy" />
				</button>
			</div>
			<button
				type="button"
				class="mt-6 rounded-md bg-main px-6 py-2 font-bold text-light"
				onclick={() => (showingQrCodeForLink = null)}
			>
				Close
			</button>
		</div>
	</div>
{/if}
