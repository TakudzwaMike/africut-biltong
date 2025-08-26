<script>
	import { viewport } from '$lib/actions/viewport';

	let {
		src,
		alt = '',
		aspectRatio = '16/9',
		fit = 'cover',
		class: className = ''
	} = $props();

	let visible = $state(false);
	let loaded = $state(false);
</script>

<div
	use:viewport={{ onEnter: () => (visible = true) }}
	style:aspect-ratio={aspectRatio}
	class="relative overflow-hidden bg-main/5 {className}"
>
	<div class="absolute inset-0 animate-pulse bg-main/10" class:hidden={loaded}></div>

	{#if visible}
		<img
			{src}
			{alt}
			style:object-fit={fit}
			class="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500"
			class:opacity-100={loaded}
			on:load={() => (loaded = true)}
		/>
	{/if}
</div>
