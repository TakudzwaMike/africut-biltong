<script>
	import Image from '$lib/components/Image.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import GatedDocumentModal from '$lib/components/GatedDocumentModal.svelte';
	import CaseStudyHighlights from '$lib/components/CaseStudyHighlights.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Icon from '@iconify/svelte';

	let { data } = $props();
	let gatedDocumentToShow = $state(null);
</script>


<Seo
/>
<PageHeader 
	title="Resources Library"
	subtitle="White papers, brochures, and technical documentation to help you make informed decisions."
/>

<!-- Section 1: Featured Case Studies -->
{#if data.caseStudies.length > 0}
	<div class="relative z-10 bg-white border-b border-main/5">
		<CaseStudyHighlights caseStudies={data.caseStudies} />
		<div class="pb-20 text-center -mt-10 relative z-20">
			<a
				href="/case-studies"
				class="inline-flex items-center gap-2 rounded-full border border-main/20 px-6 py-2 text-sm font-bold text-main hover:bg-main hover:text-light transition-colors"
			>
				Browse All Case Studies <Icon icon="mdi:arrow-right" />
			</a>
		</div>
	</div>
{/if}

<!-- Section 2: Downloads -->
{#if data.documents.length > 0}
	<section class="relative z-10 bg-slate-50 py-24">
		<div class="mx-auto max-w-7xl px-8">
			<div class="text-center mb-16">
				<h2 class="text-3xl font-bold tracking-tight text-main sm:text-4xl">
					Technical Downloads
				</h2>
				<p class="mx-auto mt-4 max-w-2xl text-lg text-main/70">
					In-depth specifications and brochures.
				</p>
			</div>

			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each data.documents as doc}
					<!-- Card Logic -->
					{#if doc.isGated}
						<button
							type="button"
							class="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-lg transition-all text-left"
							onclick={() => (gatedDocumentToShow = doc)}
						>
							{@render docCardContent(doc)}
						</button>
					{:else}
						<a
							href={doc.fileUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-lg transition-all"
						>
							{@render docCardContent(doc)}
						</a>
					{/if}
				{/each}
			</div>
		</div>
	</section>
{/if}

{#snippet docCardContent(doc)}
	<!-- Thumbnail -->
	<div class="aspect-[16/10] w-full overflow-hidden bg-main/5 relative">
		{#if doc.thumbnail}
			<Image
				src={doc.thumbnail.displayUrl || doc.thumbnail.originalUrl}
				alt={doc.thumbnail.altText}
				aspectRatio="16/10"
				class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
			/>
		{:else}
			<div class="flex h-full w-full items-center justify-center">
				<Icon icon="mdi:file-document-outline" class="text-main/20" width="64" />
			</div>
		{/if}
		<!-- Download Icon Overlay -->
		<div class="absolute inset-0 flex items-center justify-center bg-main/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
			<div class="rounded-full bg-accent p-3 text-main shadow-lg transform scale-75 transition-transform duration-300 group-hover:scale-100">
				<Icon icon="mdi:download" width="24" />
			</div>
		</div>
	</div>

	<!-- Text -->
	<div class="p-6 flex flex-1 flex-col">
		<div class="flex items-center justify-between mb-2">
			<span class="text-xs font-bold uppercase tracking-wider text-accent">
				{doc.isGated ? 'Access Required' : 'Public PDF'}
			</span>
			{#if doc.isGated}
				<Icon icon="mdi:lock-outline" class="text-main/40" width="16" />
			{/if}
		</div>
		<h3 class="text-lg font-bold text-main mb-2">{doc.title}</h3>
		<p class="text-sm text-main/70 line-clamp-2">{doc.description}</p>
	</div>
{/snippet}

<GatedDocumentModal
	show={!!gatedDocumentToShow}
	documentId={gatedDocumentToShow?.id}
	documentTitle={gatedDocumentToShow?.title}
	onclose={() => (gatedDocumentToShow = null)}
/>