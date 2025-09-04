<script>
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';

	let { phoneNumber } = $props();
	const basePhoneNumber = phoneNumber.replace(/\D/g, '');

	// This derived value will reactively generate the context-aware message
	const prefilledMessage = $derived(() => {
		const pathname = $page.url.pathname;
		let message = "Hello, I'm interested in learning more about Vision AI Tech.";

		if (pathname.startsWith('/solutions/')) {
			// Example: "/solutions/fleet-management" -> "Fleet Management"
			const solutionName = pathname.split('/solutions/')[1].replace(/-/g, ' ');
			message = `Hello, I'd like to discuss your solution for ${solutionName}.`;
		} else if (pathname.startsWith('/products/')) {
			const productName = pathname.split('/products/')[1].replace(/-/g, ' ');
			message = `Hello, I have a question about your "${productName}" product.`;
		} else if (pathname.startsWith('/case-studies/')) {
			message = `Hello, I was reading one of your case studies and had a question.`;
		} else if (pathname === '/contact') {
			message = `Hello, I was on your contact page and would like to chat.`;
		}

		// URL-encode the message so it can be safely used in the link
		return encodeURIComponent(message);
	});

	// The final URL is also a derived value, so it updates automatically
	const whatsappUrl = $derived(`https://wa.me/${basePhoneNumber}?text=${prefilledMessage}`);
</script>

<a
	href={whatsappUrl}
	target="_blank"
	rel="noopener noreferrer"
	aria-label="Chat with us on WhatsApp"
	class="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
>
	<Icon icon="mdi:whatsapp" width="32" height="32" />
</a>