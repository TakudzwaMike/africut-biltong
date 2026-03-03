<script>
	import { page } from "$app/state";

	let {
		title = "Vision AI Tech - Smart, Simple AI Solutions",
		description = "We provide smart, simple AI solutions to enhance profitability, safety, and sustainability in the mining and construction industries.",
		imageUrl = null, // Will default to the site logo if not provided
		ogType = "website",
	} = $props();

	const siteUrl = "https://vision-ai.tech"; // Your production domain
	const siteName = $derived(page.data.settings?.siteName || "Vision AI Tech");
	const siteLogoUrl = $derived(
		page.data.settings?.logo?.displayUrl ||
			page.data.settings?.logo?.originalUrl,
	);

	const finalImageUrl = $derived(imageUrl || siteLogoUrl);
	const canonicalUrl = $derived(`${siteUrl}${page.url.pathname}`);
</script>

<svelte:head>
	<!-- Standard SEO -->
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="author" content="Vision AI Tech" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href={canonicalUrl} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={ogType} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:locale" content="en_US" />
	{#if finalImageUrl}
		<meta property="og:image" content={finalImageUrl} />
	{/if}

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	{#if finalImageUrl}
		<meta name="twitter:image" content={finalImageUrl} />
	{/if}
</svelte:head>
