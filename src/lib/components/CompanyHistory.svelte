<script>
	import Image from '$lib/components/Image.svelte';
	let { content } = $props();
</script>

{#if content}
	<section class="relative z-10">
		<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<div class="grid items-center gap-12 md:grid-cols-2">
			{#if content.media}
				<Image
					src={content.media.displayUrl || content.media.originalUrl}
					alt={content.media.altText}
					aspectRatio="4/3"
					class="rounded-xl"
				/>
			{/if}
			<div class="text-center md:text-left">
					<h2 class="text-3xl font-bold tracking-tight text-main sm:text-4xl">
						{content.title}
					</h2>
					<p class="mx-auto mt-6 max-w-3xl text-lg leading-8 text-main/70">
						{content.text}
					</p>
				</div>
			</div>
		</div>
	</section>
{/if}