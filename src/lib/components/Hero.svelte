<script>
	import { holographic } from '$lib/actions/holographic.js';
	import Image from './Image.svelte';
	import { onMount } from 'svelte';

	let { content, videoUrl = null } = $props();

	let player;
	let isMuted = $state(true);
	let showVideo = $state(false);

	// Function to extract YouTube Video ID from URL
	function getYouTubeId(url) {
		if (!url) return null;
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		const match = url.match(regExp);
		return match && match[2].length === 11 ? match[2] : null;
	}

	const videoId = getYouTubeId(videoUrl);

	onMount(() => {
		if (!videoId) return;

		// Load the YouTube IFrame Player API code asynchronously.
		const tag = document.createElement('script');
		tag.src = 'https://www.youtube.com/iframe_api';
		const firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		// This function creates an <iframe> (and YouTube player)
		// after the API code downloads.
		window.onYouTubeIframeAPIReady = () => {
			player = new YT.Player('youtube-player', {
				videoId: videoId,
				playerVars: {
					autoplay: 1,
					controls: 0,
					showinfo: 0,
					modestbranding: 1,
					loop: 1,
					playlist: videoId, // Required for looping
					fs: 0,
					rel: 0,
					disablekb: 1,
					mute: 1,
					playsinline: 1
				},
				events: {
					onReady: onPlayerReady
				}
			});
		};

		return () => {
			// Clean up the global function
			if (window.onYouTubeIframeAPIReady) {
				delete window.onYouTubeIframeAPIReady;
			}
		};
	});

	function onPlayerReady(event) {
		event.target.playVideo();
		showVideo = true;
	}

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

<section id="hero" class="relative overflow-hidden text-center">
	<!-- Background -->
	<div class="absolute inset-0 z-[-1]">
		{#if videoId}
			<!-- YouTube Player -->
			<div
				id="youtube-player"
				class="absolute h-[200%] w-[120%] -translate-x-[8%] -translate-y-[25%] transform"
			></div>
			<!-- Fallback Image while video loads -->
			{#if content.media}
				<Image
					src={content.media.displayUrl || content.media.originalUrl}
					alt={content.media.altText}
					aspectRatio="auto"
					class="h-full w-full transition-opacity duration-500 {showVideo ? 'opacity-0' : ''}"
				/>
			{/if}
		{:else if content.media}
			<!-- Static Image Background -->
			<Image
				src={content.media.displayUrl || content.media.originalUrl}
				alt={content.media.altText}
				aspectRatio="auto"
				class="h-full w-full"
			/>
		{/if}
		<!-- Dark overlay for text legibility -->
		<div class="absolute inset-0 bg-main/70"></div>
	</div>

	<!-- Content -->
	<div class="relative z-10 mx-auto max-w-6xl px-8 py-32 sm:py-48">
		<h1 class="text-4xl font-bold tracking-tight text-light sm:text-6xl">
			{content.title}
		</h1>
		<p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-light/80">
			{content.text}
		</p>
		<div class="perspective-container mt-10 flex flex-wrap items-center justify-center gap-6">
			<a
				href="/contact"
				class="holographic-button rounded-md bg-accent px-6 py-3 font-bold text-main shadow-accent-glow"
				use:holographic
			>
				Request a Demo
			</a>
			<a
				href="/solutions"
				class="holographic-button rounded-md bg-main px-6 py-3 font-bold text-light ring-1 ring-inset ring-light/50"
				use:holographic
			>
				Explore Our Solutions
			</a>
		</div>
	</div>

	<!-- Mute Button -->
	{#if videoId}
		<button
			onclick={toggleMute}
			aria-label={isMuted ? 'Unmute video' : 'Mute video'}
			class="absolute bottom-6 right-6 z-20 rounded-full bg-black/30 p-2 text-white/70 transition hover:bg-black/50 hover:text-white"
		>
			{#if isMuted}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-volume-x"
					><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="22" x2="16" y1="9" y2="15" /><line
						x1="16"
						x2="22"
						y1="9"
						y2="15"
					/></svg
				>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-volume-2"
					><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path
						d="M15.54 8.46a5 5 0 0 1 0 7.07"
					/><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg
				>
			{/if}
		</button>
	{/if}
</section>