<script>
	import { holographic } from '$lib/actions/holographic.js';
	import Image from './Image.svelte';
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';

	let { content, videoUrl = null } = $props();

	let player;
	let isMuted = $state(true);
	let showVideo = $state(false);

	function getYouTubeId(url) {
		if (!url) return null;
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		const match = url.match(regExp);
		return match && match[2].length === 11 ? match[2] : null;
	}

	const videoId = getYouTubeId(videoUrl);

	onMount(() => {
		if (!videoId) return;

		const tag = document.createElement('script');
		tag.src = 'https://www.youtube.com/iframe_api';
		const firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		window.onYouTubeIframeAPIReady = () => {
			player = new YT.Player('youtube-player', {
				videoId: videoId,
				playerVars: {
					autoplay: 1,
					controls: 0,
					showinfo: 0,
					modestbranding: 1,
					loop: 1,
					playlist: videoId,
					fs: 0,
					rel: 0,
					disablekb: 1,
					mute: 1,
					playsinline: 1,
					iv_load_policy: 3
				},
				events: {
					onReady: (event) => {
						event.target.playVideo();
						showVideo = true;
					}
				}
			});
		};

		return () => {
			if (window.onYouTubeIframeAPIReady) {
				delete window.onYouTubeIframeAPIReady;
			}
		};
	});

	function toggleMute() {
		if (!player) return;
		if (player.isMuted()) {
			player.unMute();
			isMuted = false;
		} else {
			player.mute();
			isMuted = true;
		}
	}
</script>

<section id="hero" class="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-main">
	<!-- Background Layer -->
	<div class="absolute inset-0 z-0 select-none">
		{#if videoId}
			<div class="relative h-full w-full overflow-hidden">
				<!-- YouTube Iframe Overlay -->
				<div id="youtube-player" class="pointer-events-none absolute left-1/2 top-1/2 min-h-[150%] min-w-[150%] -translate-x-1/2 -translate-y-1/2 opacity-60"></div>
				
				<!-- Fallback Image -->
				{#if content.media}
					<div class="absolute inset-0 transition-opacity duration-1000 {showVideo ? 'opacity-0' : 'opacity-60'}">
						<Image
							src={content.media.displayUrl || content.media.originalUrl}
							alt={content.media.altText}
							aspectRatio="auto"
							class="h-full w-full object-cover"
						/>
					</div>
				{/if}
			</div>
		{:else if content.media}
			<div class="h-full w-full opacity-60">
				<Image
					src={content.media.displayUrl || content.media.originalUrl}
					alt={content.media.altText}
					aspectRatio="auto"
					class="h-full w-full object-cover"
				/>
			</div>
		{/if}
		
		<!-- Cinematic Gradient Overlays -->
		<div class="absolute inset-0 bg-gradient-to-b from-main/80 via-main/40 to-main"></div>
		<div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-main)_120%)]"></div>
	</div>

	<!-- Content Layer -->
	<div class="relative z-10 mx-auto max-w-7xl px-8 pt-20 text-center">
		<div class="animate-fade-in space-y-8">
			
			<div class="mx-auto flex max-w-fit items-center gap-2 rounded-full border border-light/10 bg-light/5 px-4 py-1.5 backdrop-blur-sm">
				<span class="relative flex h-2 w-2">
				  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
				  <span class="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
				</span>
				<span class="text-xs font-bold uppercase tracking-widest text-light/90">Next Gen Intelligence</span>
			</div>

			<h1 class="text-5xl font-bold tracking-tight text-light sm:text-7xl md:leading-tight">
				{content.title}
			</h1>
			
			<p class="mx-auto max-w-2xl text-lg leading-relaxed text-light/80 sm:text-xl">
				{content.text}
			</p>

			<div class="mt-10 flex flex-wrap items-center justify-center gap-6">
				<a
					href="/contact"
					class="holographic-button group relative flex items-center gap-3 rounded-md bg-accent px-8 py-4 text-lg font-bold text-main shadow-[0_0_20px_rgba(192,213,50,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(192,213,50,0.6)]"
					use:holographic
				>
					<span>Request a Demo</span>
					<Icon icon="mdi:arrow-right" width="24" class="transition-transform group-hover:translate-x-1" />
				</a>
				<a
					href="/solutions"
					class="holographic-button group flex items-center gap-3 rounded-md border border-light/20 bg-white/5 px-8 py-4 text-lg font-bold text-light backdrop-blur-sm transition-all hover:border-light/50 hover:bg-white/10"
					use:holographic={{ tiltStrength: 5 }}
				>
					<span>View Solutions</span>
				</a>
			</div>
		</div>
	</div>

	<!-- Mute Button -->
	{#if videoId}
		<button
			onclick={toggleMute}
			aria-label={isMuted ? 'Unmute video' : 'Mute video'}
			class="absolute bottom-8 right-8 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/20 text-white/70 backdrop-blur-md transition hover:bg-accent hover:text-main"
		>
			{#if isMuted}
				<Icon icon="mdi:volume-off" width="24" />
			{:else}
				<Icon icon="mdi:volume-high" width="24" />
			{/if}
		</button>
	{/if}
</section>