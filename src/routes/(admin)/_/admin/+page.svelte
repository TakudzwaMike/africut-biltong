<script>
	import { page } from '$app/stores';
	import { toast } from '$lib/toast-service';

	let brochureUrl = $derived($page.data.settings?.brochureUrl);

	function copyToClipboard(text) {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(text).then(
				() => {
					toast.success('Link copied to clipboard!');
				},
				(err) => {
					toast.error('Failed to copy link.');
					console.error('Could not copy text: ', err);
				}
			);
		} else {
			toast.error('Clipboard API not available.');
		}
	}
</script>

<div class="p-8">
	<h1 class="text-3xl font-bold tracking-tight text-main">Welcome, {$page.data.user.username}</h1>
	<p class="mt-2 text-base text-main/70">Here are some quick actions to get you started.</p>

	<div class="mt-8 max-w-xl">
		<div class="rounded-xl border border-main/10 p-6">
			<h3 class="text-lg font-bold">Quick Actions</h3>
			<div class="mt-4 space-y-3">
				<!-- Copy Brochure Link -->
				{#if brochureUrl}
					<div class="flex items-center justify-between gap-4 rounded-md bg-main/5 p-3">
						<div>
							<p class="font-medium">Company Brochure Link</p>
							<a href={brochureUrl} target="_blank" class="text-xs text-accent underline"
								>View Brochure</a
							>
						</div>
						<button
							onclick={() => copyToClipboard(brochureUrl)}
							class="rounded-md bg-main px-3 py-1.5 text-sm font-bold text-light transition hover:bg-main/90"
						>
							Copy Link
						</button>
					</div>
				{:else}
					<div class="rounded-md bg-main/5 p-3 text-center">
						<p class="text-sm text-main/70">
							No brochure uploaded yet. <a
								href="/_/admin/settings"
								class="font-bold text-accent underline">Upload one in settings</a
							>.
						</p>
					</div>
				{/if}

				<!-- Add more quick actions here in the future -->
			</div>
		</div>
	</div>
</div>