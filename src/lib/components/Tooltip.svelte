<script>
	import { fade } from 'svelte/transition';

	/**
	 * The text to display inside the tooltip.
	 * @type {string}
	 */
	let { text } = $props();

	let show = $state(false);
</script>

<div
	class="relative inline-block"
	on:mouseenter={() => (show = true)}
	on:mouseleave={() => (show = false)}
	on:focusin={() => (show = true)}
	on:focusout={() => (show = false)}
>
	<slot />

	{#if show}
		<div
			transition:fade={{ duration: 150 }}
			class="absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-main px-2 py-1 text-sm font-medium text-light shadow-lg"
		>
			{text}
			<div
				class="absolute left-1/2 top-full -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-main"
			></div>
		</div>
	{/if}
</div>