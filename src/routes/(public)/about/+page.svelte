<script>
	import Image from "$lib/components/Image.svelte";
	import PageHeader from "$lib/components/PageHeader.svelte";
	import Seo from "$lib/components/Seo.svelte";
	import Icon from "@iconify/svelte";

	let { data } = $props();
</script>

<Seo
	title="About Us | Vision AI Tech"
	description="Pioneering intelligence in heavy industry."
/>

<PageHeader
	title="Pioneering Intelligence"
	subtitle="Vision AI Tech was founded to bring the transformative power of artificial intelligence to the world's most essential and challenging sectors."
	backgroundImage={data.content?.history?.media}
/>

<!-- Company History / Mission -->
{#if data.content?.history}
	<section class="relative z-10 bg-light py-24">
		<div class="mx-auto max-w-7xl px-8">
			<div class="grid items-center gap-16 lg:grid-cols-2">
				<!-- Text Content -->
				<div>
					<div
						class="inline-flex items-center gap-2 rounded-full bg-main/5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-main/60 mb-6"
					>
						<Icon icon="mdi:history" />
						<span>Our Journey</span>
					</div>
					<h2
						class="text-3xl font-bold tracking-tight text-main sm:text-4xl mb-6"
					>
						{data.content.history.title}
					</h2>
					<p class="text-lg leading-relaxed text-main/70">
						{data.content.history.text}
					</p>

					<div class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div class="border-l-4 border-accent pl-4">
							<p class="font-bold text-main text-xl">Mission</p>
							<p class="text-sm text-main/70 mt-1">
								To automate the dangerous and mundane, unlocking
								human potential.
							</p>
						</div>
						<div class="border-l-4 border-accent pl-4">
							<p class="font-bold text-main text-xl">Vision</p>
							<p class="text-sm text-main/70 mt-1">
								A zero-harm, high-efficiency future for heavy
								industry.
							</p>
						</div>
					</div>
				</div>

				<!-- Image -->
				<div class="relative">
					<div
						class="absolute -inset-4 rounded-xl bg-accent/20 blur-xl"
					></div>
					{#if data.content.history.media}
						<Image
							src={data.content.history.media.displayUrl ||
								data.content.history.media.originalUrl}
							alt={data.content.history.media.altText}
							aspectRatio="4/3"
							class="relative rounded-xl shadow-2xl"
						/>
					{/if}
				</div>
			</div>
		</div>
	</section>
{/if}

<!-- Team Section -->
{#if data.teamMembers.length > 0}
	<section class="relative z-10 bg-slate-50 py-24">
		<div class="mx-auto max-w-7xl px-8">
			<div class="text-center mb-16">
				<h2
					class="text-3xl font-bold tracking-tight text-main sm:text-4xl"
				>
					Meet The Experts
				</h2>
				<p class="mx-auto mt-4 max-w-2xl text-lg text-main/70">
					Engineers, Data Scientists, and Industry Veterans driving
					our innovation.
				</p>
			</div>

			<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.teamMembers as member}
					<div
						class="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl"
					>
						<!-- Photo -->
						<div class="aspect-square overflow-hidden bg-main/5">
							{#if member.photo}
								<Image
									src={member.photo.thumbnailUrl ||
										member.photo.originalUrl}
									alt={member.photo.altText}
									aspectRatio="1/1"
									class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								/>
							{:else}
								<div
									class="flex h-full w-full items-center justify-center text-main/20"
								>
									<Icon icon="mdi:account" width="64" />
								</div>
							{/if}

							<!-- Overlay Gradient -->
							<div
								class="absolute inset-0 bg-gradient-to-t from-main/90 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80"
							></div>

							<!-- Content overlaid on bottom of image for cinematic effect -->
							<div
								class="absolute bottom-0 left-0 right-0 p-6 text-light"
							>
								<h3 class="text-xl font-bold">{member.name}</h3>
								<p
									class="text-accent font-medium text-sm uppercase tracking-wide"
								>
									{member.title}
								</p>
							</div>
						</div>

						<!-- Bio (visible on hover/focus logic or just below) -->
						<!-- Let's put bio below for better readability -->
						<div class="p-6">
							<p
								class="text-sm text-main/70 leading-relaxed line-clamp-4"
							>
								{member.bio}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}
