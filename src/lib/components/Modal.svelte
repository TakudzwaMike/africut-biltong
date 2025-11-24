<script>
	import { fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	/**
	 * @type {{
	 *   show: boolean,
	 *   children: import('svelte').Snippet,
	 *   onclose?: () => void
	 * }}
	 */
	let { show = $bindable(false), children, onclose } = $props();

	function close() {
		show = false;
		if (onclose) onclose();
	}

	function handleKeydown(event) {
		if (event.key === 'Escape' && show) {
			close();
		}
	}

	// FIX: Use $effect to handle body scrolling instead of <svelte:body>
	// This runs only in the browser and reacts to changes in 'show'
	$effect(() => {
		if (show) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		// Cleanup when component unmounts
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if show}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		transition:fade={{ duration: 150 }}
		onclick={close}
		role="dialog"
		aria-modal="true"
		class="fixed inset-0 z-[999] flex items-center justify-center bg-main/80 backdrop-blur-sm p-4"
		tabindex="-1"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			transition:fade={{ duration: 250, easing: quintOut, y: -20, start: 0.95 }}
			onclick={(e) => e.stopPropagation()}
			role="document"
			tabindex="0"
			class="corner-border relative max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-light shadow-2xl"
		>
			<button
				type="button"
				onclick={close}
				aria-label="Close modal"
				class="absolute right-4 top-4 z-10 text-main/50 transition hover:text-main"
			>
				<svg
					xmlns="http://www.w.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-x"
					><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
				>
			</button>

			<!-- Render the content snippet -->
			{@render children?.()}
		</div>
	</div>
{/if}