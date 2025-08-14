<script>
	import { page } from '$app/stores';
	import '../app.css';
	import Canvas from '$lib/components/Canvas.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';

	/** @type {import('./$types').LayoutData} */
	export let data;

	$: isAdminRoute = $page.url.pathname.startsWith('/admin');
</script>

<svelte:head>
	<title>Vision AI Tech - AI Solutions for Heavy Industry</title>
	<meta
		name="description"
		content="Vision AI Tech provides smart, simple AI solutions to enhance profitability, safety, and sustainability in the mining and construction industries."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
	<link
		href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{#if isAdminRoute}
	<!-- For admin routes, render only the slot and toasts -->
	<slot />
{:else}
	<!-- For public routes, render the full public layout -->
	<Canvas />
	<Header {data} />
	<main>
		<slot />
	</main>
	<Footer />
{/if}

<ToastContainer />