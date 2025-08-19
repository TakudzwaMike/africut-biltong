<script>
	let { aspectRatio = '16/9', label = aspectRatio } = $props();
</script>

<div
	style:aspect-ratio={aspectRatio}
	class="flex items-center justify-center rounded-md border-2 border-dashed border-main/20 bg-main/5"
>
	<span class="font-mono text-sm text-main/50">{label}</span>
</div>