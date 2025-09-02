<script>
	import { page } from '$app/stores';
	import '../app.css';
	import Canvas from '$lib/components/Canvas.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import QuickChatButton from '$lib/components/QuickChatButton.svelte';
	import JsonLD from '$lib/components/JsonLD.svelte';

	/** @type {import('./$types').LayoutData} */
	export let data;

	$: isAdminRoute = $page.url.pathname.startsWith('/admin');

	const organizationSchema = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: data.settings?.siteName || 'Vision AI Tech',
		url: 'https://www.vision-ai.tech', // Replace with your actual production domain
		logo: data.settings?.logo?.url,
		// Dynamically add locations if they exist
		location: data.locations?.map((loc) => ({
			'@type': 'Place',
			address: {
				'@type': 'PostalAddress',
				addressLocality: loc.address, // Using address as locality, adjust if needed
				addressCountry: loc.countryCode
			}
		})),
		areaServed: {
			'@type': 'GeoCircle',
			geoMidpoint: {
				'@type': 'GeoCoordinates',
				latitude: '-29.0', // Approximate center of Southern Africa
				longitude: '24.0'
			},
			geoRadius: '1500000' // Radius in meters (1500 km)
		}
	};
</script>

<JsonLD data={organizationSchema} />

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
	<slot />
{:else}
	<Canvas />
	<Header {data} />
	<main>
		<slot />
	</main>
	<Footer />
	{#if data.settings?.whatsappNumber}
			<QuickChatButton phoneNumber={data.settings.whatsappNumber} />
	{/if}
{/if}

<ToastContainer />
