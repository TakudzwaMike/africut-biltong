<script>
	import { page } from '$app/stores';
	import Canvas from '$lib/components/Canvas.svelte';
	
	// IMPORTANT: Import global styles here because this file sits outside 
	// the (public) and (admin) layouts where CSS is usually loaded.
	import '../app.css'; 
</script>

<svelte:head>
	<title>{$page.status}: {$page.error?.message} | Vision AI Tech</title>
	<!-- Re-add fonts here since we don't have a root layout -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
	<link
		href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<!-- Re-use the background canvas for consistency -->
<Canvas />

<div class="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 text-center">
	<div class="corner-border max-w-lg bg-light/80 backdrop-blur-md">
		<h1 class="text-6xl font-bold text-accent drop-shadow-accent-glow">
			{$page.status}
		</h1>
		<h2 class="mt-4 text-2xl font-bold text-main">
			{$page.error?.message || 'Something went wrong.'}
		</h2>
		
		<p class="mt-4 text-main/70">
			{#if $page.status === 404}
				The page you are looking for might have been moved, deleted, or possibly never existed.
			{:else}
				We encountered an unexpected error. Our engineering team has been notified.
			{/if}
		</p>

		<div class="mt-8 flex flex-wrap justify-center gap-4">
			<a
				href="/"
				class="rounded-md bg-main px-6 py-2 font-bold text-light transition hover:bg-main/90"
			>
				Return Home
			</a>
			<a
				href="/contact"
				class="rounded-md border-2 border-main px-6 py-2 font-bold text-main transition hover:bg-main hover:text-light"
			>
				Contact Support
			</a>
		</div>
	</div>
</div>