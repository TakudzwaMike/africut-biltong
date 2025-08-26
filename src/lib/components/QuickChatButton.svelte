<script>
	let { phoneNumber } = $props();

	const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
	const whatsappUrl = `https://wa.me/${cleanPhoneNumber}`;
</script>

<a
	href={whatsappUrl}
	target="_blank"
	rel="noopener noreferrer"
	aria-label="Chat on WhatsApp"
	class="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="32"
		height="32"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="lucide lucide-message-circle"
		><path
			d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
		/></svg
	>
</a>
