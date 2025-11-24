<script>
	import SubmitButton from '$lib/components/SubmitButton.svelte';
    import Modal from '$lib/components/Modal.svelte';
    import Icon from '@iconify/svelte';

	let { show = $bindable(false), documentId, documentTitle, onclose } = $props();

	let email = $state('');
	let isLoading = $state(false);
	let errorMessage = $state('');
    let isSuccess = $state(false);

	async function handleSubmit(event) {
		event.preventDefault();
		isLoading = true;
		errorMessage = '';

		try {
			const response = await fetch('/api/gate-document', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ documentId, email })
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'An unknown error occurred.');
			}

            // Success State
            isSuccess = true;
            // Close after a delay or let user close
            setTimeout(() => {
                if(onclose) onclose();
                show = false;
            }, 3000);

		} catch (error) {
			errorMessage = error.message;
		} finally {
			isLoading = false;
		}
	}

	$effect(() => {
		if (!show) {
			email = '';
            isSuccess = false;
			isLoading = false;
			errorMessage = '';
		}
	});
</script>

<Modal bind:show>
    <div class="p-8 text-center">
        {#if isSuccess}
            <div class="flex flex-col items-center animate-fade-in">
                <div class="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4 text-green-600">
                    <Icon icon="mdi:email-check" width="32" />
                </div>
                <h2 class="text-2xl font-bold text-main">Check your inbox!</h2>
                <p class="mt-2 text-main/70">
                    We've sent the download link for <strong>{documentTitle}</strong> to {email}.
                </p>
                <button onclick={() => show = false} class="mt-6 font-bold text-accent hover:underline">
                    Close
                </button>
            </div>
        {:else}
            <h2 class="text-2xl font-bold text-main">Access Document</h2>
            <p class="mt-2 text-base text-main/70">
                To download "<span class="font-bold text-accent">{documentTitle}</span>", please enter your email address.
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
                    class="block w-full rounded-md border-0 bg-main/5 px-4 py-3 text-main shadow-sm ring-1 ring-inset ring-main/10 placeholder:text-main/50 focus:ring-2 focus:ring-inset focus:ring-accent"
                />

                {#if errorMessage}
                    <p class="mt-4 text-sm font-bold text-red-500">{errorMessage}</p>
                {/if}

                <div class="mt-6">
                    <SubmitButton type="submit" loading={isLoading} class="w-full bg-accent px-6 py-3 text-main">
                        Send Download Link
                    </SubmitButton>
                </div>
            </form>
        {/if}
    </div>
</Modal>