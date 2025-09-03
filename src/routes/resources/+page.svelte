<script>
	import Image from '$lib/components/Image.svelte';

	let { data } = $props();

	// Combine documents and case studies into a single list for display
	let resources = $derived([
		...data.documents.map((doc) => ({
			type: 'document',
			title: doc.title,
			description: doc.description,
			url: doc.fileUrl,
			thumbnail: doc.thumbnail,
			isExternal: true
		})),
		...data.caseStudies.map((cs) => ({
			type: 'case-study',
			title: cs.title,
			description: `Case study with ${cs.client?.name || 'a valued partner'}.`,
			url: `/case-studies/${cs.slug}`,
			thumbnail: null, // Case studies don't have thumbnails yet
			isExternal: false
		}))
	]);
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Resources</h1>
			<p class="mx-auto mt-4 max-w-2xl text-lg leading-8 text-main/70">
				Explore our in-depth case studies, brochures, and white papers to learn more about our
				impact.
			</p>
		</div>

		<div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each resources as resource}
				<a
					href={resource.url}
					target={resource.isExternal ? '_blank' : '_self'}
					rel={resource.isExternal ? 'noopener noreferrer' : ''}
					class="corner-border group block"
				>
					{#if resource.thumbnail}
						<Image
							src={resource.thumbnail.displayUrl || resource.thumbnail.originalUrl}
							alt={resource.thumbnail.altText}
							aspectRatio="16/9"
							class="mb-6 rounded-md transition-transform duration-300 group-hover:scale-105"
						/>
					{:else}
						<!-- Placeholder for items without a thumbnail -->
						<div
							class="mb-6 flex aspect-video w-full items-center justify-center rounded-md bg-main/5"
						>
							<span class="font-mono text-sm text-main/50">{resource.type}</span>
						</div>
					{/if}
					<h3 class="text-xl font-bold">{resource.title}</h3>
					<p class="mt-2 text-sm text-main/70">{resource.description}</p>
					<span class="mt-4 block font-bold text-accent transition hover:drop-shadow-accent-glow"
						>View Resource →</span
					>
				</a>
			{/each}
		</div>
	</div>
</div>