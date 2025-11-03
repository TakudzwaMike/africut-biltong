<script>
	import Image from '$lib/components/Image.svelte';
	import GatedDocumentModal from '$lib/components/GatedDocumentModal.svelte';
	import CaseStudyHighlights from '$lib/components/CaseStudyHighlights.svelte';

	let { data } = $props();

	let gatedDocumentToShow = $state(null);
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<!-- Page Header -->
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Resources</h1>
			<p class="mx-auto mt-4 max-w-2xl text-lg leading-8 text-main/70">
				Explore our in-depth case studies, brochures, and white papers to learn more about our
				impact.
			</p>
		</div>

		<!-- Section 1: Case Studies -->
		{#if data.caseStudies.length > 0}
			<CaseStudyHighlights caseStudies={data.caseStudies} />
			<div class="mt-16 text-center">
				<a
					href="/case-studies"
					class="font-bold text-accent transition hover:drop-shadow-accent-glow"
				>
					View All Case Studies →
				</a>
			</div>
		{/if}

		<!-- Section 2: Downloads -->
		{#if data.documents.length > 0}
			<section class="mt-24">
				<div class="text-center">
					<h2 class="text-3xl font-bold tracking-tight text-main sm:text-4xl">
						Downloads & White Papers
					</h2>
					<p class="mx-auto mt-4 max-w-2xl text-lg leading-8 text-main/70">
						Access brochures, technical sheets, and other valuable documents.
					</p>
				</div>

				<div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
					{#each data.documents as doc}
						<div class="corner-border group block">
							{#if doc.isGated}
								<button
									type="button"
									class="h-full w-full text-left"
									onclick={() => (gatedDocumentToShow = doc)}
								>
									{#if doc.thumbnail}
										<Image
											src={doc.thumbnail.displayUrl || doc.thumbnail.originalUrl}
											alt={doc.thumbnail.altText}
											aspectRatio="16/9"
											class="mb-6 rounded-md transition-transform duration-300 group-hover:scale-105"
										/>
									{:else}
										<div
											class="mb-6 flex aspect-video w-full items-center justify-center rounded-md bg-main/5"
										>
											<span class="font-mono text-sm text-main/50">Document</span>
										</div>
									{/if}
									<h3 class="text-xl font-bold">{doc.title}</h3>
									<p class="mt-2 text-sm text-main/70">{doc.description}</p>
									<span
										class="mt-4 block font-bold text-accent transition hover:drop-shadow-accent-glow"
										>Download →</span
									>
								</button>
							{:else}
								<a
									href={doc.fileUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="h-full w-full"
								>
									{#if doc.thumbnail}
										<Image
											src={doc.thumbnail.displayUrl || doc.thumbnail.originalUrl}
											alt={doc.thumbnail.altText}
											aspectRatio="16/9"
											class="mb-6 rounded-md transition-transform duration-300 group-hover:scale-105"
										/>
									{:else}
										<div
											class="mb-6 flex aspect-video w-full items-center justify-center rounded-md bg-main/5"
										>
											<span class="font-mono text-sm text-main/50">Document</span>
										</div>
									{/if}
									<h3 class="text-xl font-bold">{doc.title}</h3>
									<p class="mt-2 text-sm text-main/70">{doc.description}</p>
									<span
										class="mt-4 block font-bold text-accent transition hover:drop-shadow-accent-glow"
										>View Document →</span
									>
								</a>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</div>
</div>

<GatedDocumentModal
	show={!!gatedDocumentToShow}
	documentId={gatedDocumentToShow?.id}
	documentTitle={gatedDocumentToShow?.title}
	on:close={() => (gatedDocumentToShow = null)}
/>