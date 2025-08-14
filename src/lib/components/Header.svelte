<script>
	/** @type {import('../../routes/$types').PageData} */
	export let data;
</script>

<header class="sticky top-0 z-50 border-b border-main/10 bg-light/80 px-8 backdrop-blur-md">
	<nav class="mx-auto flex max-w-6xl items-center justify-between py-4">
		<a href="/" class="text-xl font-bold">
			{#if data.settings?.logoUrl}
				<img src={data.settings.logoUrl} alt={data.settings.siteName} class="h-8 object-contain" />
			{:else}
				{data.settings?.siteName || 'Vision AI Tech'}
			{/if}
		</a>
		<ul class="flex items-center gap-6">
			<li>
				<a
					href="/solutions"
					class="font-medium transition hover:text-accent hover:drop-shadow-accent-glow"
					>Solutions</a
				>
			</li>
			<li>
				<a
					href="/case-studies"
					class="font-medium transition hover:text-accent hover:drop-shadow-accent-glow"
					>Case Studies</a
				>
			</li>
			<li>
				<a
					href="/about"
					class="font-medium transition hover:text-accent hover:drop-shadow-accent-glow"
					>About Us</a
				>
			</li>
            {#if data.user}
                <li>
                    <a
                        href="/admin"
                        class="font-medium transition hover:text-accent hover:drop-shadow-accent-glow"
                        >Admin</a
                    >
                </li>
                 <li>
                    <form action="/logout" method="POST">
                        <button class="font-medium transition hover:text-accent hover:drop-shadow-accent-glow">Logout</button>
                    </form>
                </li>
            {:else}
			    <li>
				    <a
					    href="/contact"
					    class="rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
					    >Request a Demo</a
				    >
			    </li>
            {/if}
		</ul>
	</nav>
</header>