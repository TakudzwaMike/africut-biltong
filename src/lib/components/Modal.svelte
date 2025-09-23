<script>
	import { fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	/**
	 * A two-way bindable prop to control the modal's visibility.
	 * @type {boolean}
	 */
	let { show = $bindable() } = $props();

	function handleKeydown(event) {
		if (event.key === 'Escape') {
			show = false;
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		transition:fade={{ duration: 150 }}
		on:click={() => (show = false)}
		role="dialog"
		aria-modal="true"
		class="fixed inset-0 z-[999] flex items-center justify-center bg-main/80 backdrop-blur-sm"
	>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			transition:fade={{ duration: 250, easing: quintOut, y: -20, start: 0.95 }}
			on:click={(e) => e.stopPropagation()}
			class="corner-border relative w-full max-w-2xl"
		>
			<button
				type="button"
				on:click={() => (show = false)}
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

			<slot />
		</div>
	</div>
{/if}