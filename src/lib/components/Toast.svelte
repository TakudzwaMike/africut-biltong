<script>
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { removeToast } from '$lib/toast-service.js';

	/**
	 * The toast object from the store.
	 * @type {{id: string, type: 'success' | 'error' | 'info', message: string}}
	 */
	let { toast } = $props();

	const icons = {
		success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
		error: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
		info: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`
	};

	const colors = {
		success: 'bg-green-500',
		error: 'bg-red-500',
		info: 'bg-main'
	};
</script>

<div
	transition:fly={{ duration: 300, x: 300, easing: quintOut }}
	role="alert"
	class="pointer-events-auto flex w-full max-w-sm items-start gap-4 overflow-hidden rounded-lg p-4 shadow-lg {colors[
		toast.type
	]}"
>
	<div class="flex-shrink-0 text-light">
		{@html icons[toast.type]}
	</div>
	<div class="w-0 flex-1">
		<p class="font-medium text-light">{toast.message}</p>
	</div>
	<div class="flex flex-shrink-0">
		<button
			onclick={() => removeToast(toast.id)}
			class="-m-1.5 inline-flex rounded-lg p-1.5 text-light/70 transition hover:text-light"
		>
			<span class="sr-only">Dismiss</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
			>
		</button>
	</div>
</div>