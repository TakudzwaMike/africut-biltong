<script>
	import Image from "$lib/components/Image.svelte";
	import Seo from "$lib/components/Seo.svelte";
	import RichTextRenderer from "$lib/components/RichTextRenderer.svelte";
	import Icon from "@iconify/svelte";

	let { data } = $props();
	const { solution } = data;

	// Extract linked products from the join table structure
	const relatedProducts = solution.products
		.map((p) => p.product)
		.filter(Boolean);
</script>

<Seo
	title={`${solution.solutionName} | Vision AI Tech`}
	description={solution.shortDescription}
	imageUrl={solution.featuredImage?.displayUrl ||
		solution.featuredImage?.originalUrl}
/>
<!-- Hero Section -->
<div class="relative h-[60vh] min-h-[400px] w-full overflow-hidden bg-main">
	<!-- Background Image with Overlay -->
	<div class="absolute inset-0 opacity-60">
		{#if solution.featuredImage}
			<Image
				src={solution.featuredImage.displayUrl ||
					solution.featuredImage.originalUrl}
				alt={solution.featuredImage.altText}
				aspectRatio="auto"
				class="h-full w-full object-cover"
			/>
		{:else}
			<!-- Fallback Pattern -->
			<div
				class="h-full w-full bg-[radial-gradient(#C0D532_1px,transparent_1px)] [background-size:16px_16px] opacity-20"
			></div>
		{/if}
	</div>

	<!-- Gradient Fade -->
	<div
		class="absolute inset-0 bg-gradient-to-t from-main via-main/50 to-transparent"
	></div>

	<!-- Hero Content -->
	<div class="relative z-10 flex h-full items-end pb-16">
		<div class="mx-auto w-full max-w-6xl px-8">
			<div class="max-w-3xl">
				<div
					class="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-bold text-accent backdrop-blur-sm"
				>
					<Icon icon="mdi:check-decagram" />
					<span>Enterprise Solution</span>
				</div>
				<h1
					class="text-4xl font-bold tracking-tight text-light sm:text-6xl drop-shadow-lg"
				>
					{solution.solutionName}
				</h1>
				<p
					class="mt-6 text-xl text-light/90 leading-relaxed drop-shadow-md"
				>
					{solution.shortDescription}
				</p>
			</div>
		</div>
	</div>
</div>

<!-- Main Content Grid -->
<div class="relative z-10 bg-light">
	<div class="mx-auto max-w-6xl px-8 py-20">
		<div class="grid grid-cols-1 gap-12 lg:grid-cols-3">
			<!-- Left Column: Detailed Description -->
			<div class="lg:col-span-2">
				<h2
					class="text-2xl font-bold text-main mb-6 border-b border-main/10 pb-4"
				>
					Technical Overview
				</h2>
				<div class="prose prose-lg max-w-none">
					<RichTextRenderer content={solution.longDescription} />
				</div>
			</div>

			<!-- Right Column: Sidebar (Hardware & CTA) -->
			<div class="space-y-8">
				<!-- Deployment CTA Card -->
				<div class="corner-border bg-main text-light sticky top-24">
					<h3 class="text-xl font-bold">Deploy This Solution</h3>
					<p class="mt-2 text-light/70 text-sm">
						Speak with our engineering team to tailor this module
						for your specific site requirements.
					</p>
					<a
						href={solution.ctaLink ||
							`/contact?solution=${solution.slug}`}
						class="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 font-bold text-main transition hover:bg-white hover:shadow-lg"
					>
						{solution.ctaText || "Request Consultation"}
						<Icon icon="mdi:arrow-right" />
					</a>
				</div>

				<!-- Required Hardware Stack -->
				{#if relatedProducts.length > 0}
					<div>
						<h3
							class="text-lg font-bold text-main mb-4 flex items-center gap-2"
						>
							<Icon
								icon="mdi:server-network"
								class="text-accent"
							/>
							Required Hardware
						</h3>
						<div class="space-y-4">
							{#each relatedProducts as product}
								<a
									href={`/store/${product.slug}`}
									class="flex items-start gap-4 rounded-lg border border-main/10 p-3 transition hover:border-accent hover:bg-main/5 group"
								>
									<div
										class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-white"
									>
										{#if product.featuredImage}
											<img
												src={product.featuredImage
													.thumbnailUrl ||
													product.featuredImage
														.originalUrl}
												alt={product.featuredImage
													.altText}
												class="h-full w-full object-cover"
											/>
										{:else}
											<div
												class="flex h-full w-full items-center justify-center bg-main/5"
											>
												<Icon
													icon="mdi:cube-outline"
													class="text-main/20"
													width="24"
												/>
											</div>
										{/if}
									</div>
									<div>
										<h4
											class="font-bold text-main group-hover:text-accent transition-colors"
										>
											{product.name}
										</h4>
										<p
											class="text-xs text-main/60 line-clamp-2 mt-1"
										>
											{product.shortDescription}
										</p>
									</div>
								</a>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
