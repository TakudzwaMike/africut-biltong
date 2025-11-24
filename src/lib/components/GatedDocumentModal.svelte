<script>
	import SubmitButton from '$lib/components/SubmitButton.svelte';

	/**
	 * @type {{
	 *   show: boolean,
	 *   documentId: number,
	 *   documentTitle: string,
	 *   onclose: () => void
	 * }}
	 */
	let { show = false, documentId, documentTitle, onclose } = $props();

	let email = $state('');
	let isLoading = $state(false);
	let errorMessage = $state('');

	async function handleSubmit(event) {
		event.preventDefault();
		isLoading = true;
		errorMessage = '';

		try {
			const response = await fetch('/api/gate-document', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ documentId, email })
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'An unknown error occurred.');
			}

			// On success, trigger the download and close the modal
			window.open(data.fileUrl, '_blank');
			if (onclose) onclose();
		} catch (error) {
			errorMessage = error.message;
		} finally {
			isLoading = false;
		}
	}

	// Reset state when the modal is closed
	$effect(() => {
		if (!show) {
			email = '';
			isLoading = false;
			errorMessage = '';
		}
	});
</script>

{#if show}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		onclick={onclose}
		tabindex="-1"
	>
		<div
			class="w-full max-w-lg rounded-xl bg-main p-8 text-center shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			role="document"
			tabindex="0"
		>
			<h2 class="text-2xl font-bold text-light">Access Document</h2>
			<p class="mt-2 text-base text-light/70">
				To download "<span class="font-bold text-accent">{documentTitle}</span>", please enter your
				email address below.
			</p>

			<form onsubmit={handleSubmit} class="mt-8">
				<label for="email" class="sr-only">Email address</label>
				<input
					type="email"
					name="email"
					id="email"
					placeholder="Enter your email"
					required
					bind:value={email}
					class="block w-full rounded-md border-0 bg-light/5 px-3.5 py-2.5 text-light shadow-sm ring-1 ring-inset ring-light/10 placeholder:text-light/50 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>

				{#if errorMessage}
					<p class="mt-4 font-bold text-red-500">{errorMessage}</p>
				{/if}

				<div class="mt-6">
					<SubmitButton type="submit" loading={isLoading} class="w-full bg-accent px-6 py-3">
						Download Now
					</SubmitButton>
				</div>
			</form>
		</div>
	</div>
{/if}