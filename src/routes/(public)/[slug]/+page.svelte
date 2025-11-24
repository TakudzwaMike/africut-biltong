<script>
	import { page } from '$app/stores';
	import PageHeader from '$lib/components/PageHeader.svelte';

	// Map slugs to basic content titles
	// In a real app, you might fetch this content from the DB (PageContent table)
	const staticPages = {
		'privacy': 'Privacy Policy',
		'terms': 'Terms of Service'
	};

	let title = $derived(staticPages[$page.params.slug] || 'Page Not Found');
</script>

<svelte:head>
	<title>{title} | Vision AI Tech</title>
</svelte:head>

<PageHeader {title} />

<div class="relative z-10 bg-light py-24">
	<div class="mx-auto max-w-3xl px-8">
		<div class="prose prose-lg mx-auto">
			{#if $page.params.slug === 'privacy'}
				<p>At Vision AI Tech, we take your privacy seriously. This policy describes how we collect, use, and protect your data.</p>
				<h3>1. Data Collection</h3>
				<p>We collect information you provide directly to us via our contact forms, including name, email, and inquiry details.</p>
				<h3>2. Use of Data</h3>
				<p>We use this data solely to communicate with you regarding your inquiries and our services. We do not sell your data to third parties.</p>
			{:else if $page.params.slug === 'terms'}
				<p>Welcome to Vision AI Tech. By using our website and services, you agree to the following terms.</p>
				<h3>1. Intellectual Property</h3>
				<p>All content, software, and technology on this site is the property of Vision AI Tech.</p>
				<h3>2. Disclaimer</h3>
				<p>Our AI solutions are provided "as is". While we strive for accuracy, we do not guarantee 100% predictive success in all scenarios.</p>
			{:else}
				<div class="text-center py-12">
					<p class="text-xl font-bold text-main">404 - Page Not Found</p>
					<a href="/" class="mt-4 inline-block text-accent underline">Return Home</a>
				</div>
			{/if}
		</div>
	</div>
</div>