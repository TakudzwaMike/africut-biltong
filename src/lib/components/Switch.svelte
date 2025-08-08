<script>
	let { checked = $bindable(false), id = 'switch-' + Math.random().toString(36).slice(2, 9), children } = $props();

</script>

<label {id} class="relative inline-flex cursor-pointer items-center">
	<input type="checkbox" bind:checked class="peer sr-only" {id} />
	<div
		class="h-7 w-12 rounded-full bg-main/20 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-md after:transition-all after:duration-300 after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent/50"
	></div>
	<span class="ml-3 text-sm font-medium text-main/80">{@render children()}</span>
</label>