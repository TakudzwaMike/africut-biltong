<script>
	import { page } from "$app/state";
	import "../../app.css";
	import Canvas from "$lib/components/Canvas.svelte";
	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import ToastContainer from "$lib/components/ToastContainer.svelte";
	import QuickChatButton from "$lib/components/QuickChatButton.svelte";
	import JsonLD from "$lib/components/JsonLD.svelte";
	import Seo from "$lib/components/Seo.svelte";

	/** @type {import('./$types').LayoutData} */
	const { children, data } = $props();

	let isAdminRoute = $derived(page.url.pathname.startsWith("/_/admin"));

	const organizationSchema = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: data.settings?.siteName || "Vision AI Tech",
		url: "https://www.vision-ai.tech",
		logo: data.settings?.logo?.url,
		description:
			"Smart, simple AI solutions for mining and construction industries",
		location: data.locations?.map((loc) => ({
			"@type": "Place",
			address: {
				"@type": "PostalAddress",
				addressLocality: loc.address,
				addressCountry: loc.countryCode,
			},
		})),
		areaServed: {
			"@type": "GeoCircle",
			geoMidpoint: {
				"@type": "GeoCoordinates",
				latitude: "-29.0",
				longitude: "24.0",
			},
			geoRadius: "1500000",
		},
	};

	const websiteSchema = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: data.settings?.siteName || "Vision AI Tech",
		url: "https://www.vision-ai.tech",
		description:
			"Smart, simple AI solutions to enhance profitability, safety, and sustainability",
		potentialAction: {
			"@type": "SearchAction",
			target: "https://www.vision-ai.tech/search?q={search_term_string}",
			"query-input": "required name=search_term_string",
		},
	};
</script>

<JsonLD data={organizationSchema} />
<JsonLD data={websiteSchema} />

<Seo />

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		rel="preconnect"
		href="https://fonts.gstatic.com"
		crossorigin="true"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{#if isAdminRoute}
	{@render children?.()}
{:else}
	<Canvas />
	<Header settings={data.settings} user={data.user} />
	<main>
		{@render children?.()}
	</main>
	<Footer />
	{#if data.settings?.whatsappNumber}
		<QuickChatButton phoneNumber={data.settings.whatsappNumber} />
	{/if}
{/if}

<ToastContainer />
