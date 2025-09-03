<script>
	import Image from '$lib/components/Image.svelte';
	let { teamMembers = [] } = $props();
</script>

<section class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<div class="text-center">
			<h2 class="text-3xl font-bold tracking-tight text-main sm:text-4xl">Meet Our Team</h2>
			<p class="mx-auto mt-4 max-w-2xl text-lg leading-8 text-main/70">
				The experts driving our innovation and delivering results.
			</p>
		</div>

		<div class="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each teamMembers as member}
				<div class="corner-border text-center">
					{#if member.photo}
						<Image
							src={member.photo.thumbnailUrl || member.photo.originalUrl}
							alt={member.photo.altText}
							aspectRatio="1/1"
							class="mx-auto h-32 w-32 rounded-full"
						/>
					{:else}
						<div class="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-main/5">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="64"
								height="64"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="lucide lucide-user text-main/40"
								><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle
									cx="12"
									cy="7"
									r="4"
								/></svg
							>
						</div>
					{/if}
					<h3 class="mt-6 text-xl font-bold">{member.name}</h3>
					<p class="text-accent">{member.title}</p>
					<p class="mt-2 text-sm text-main/80">{member.bio}</p>
				</div>
			{/each}
		</div>
	</div>
</section>