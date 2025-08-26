<script>
	import { page } from '$app/stores';
</script>

<footer class="relative z-10 border-t border-main/10 bg-light">
	<div class="mx-auto max-w-6xl px-8 py-12">
		<div class="grid grid-cols-1 gap-12 text-center sm:grid-cols-3 sm:text-left">
			<!-- Column 1: Branding -->
			<div class="flex flex-col items-center sm:items-start">
				<a href="/" class="text-xl font-bold">
					{#if $page.data.settings?.logoUrl}
						<img
							src={$page.data.settings.logoUrl}
							alt={$page.data.settings.siteName}
							class="h-8 object-contain"
						/>
					{:else}
						{$page.data.settings?.siteName || 'Vision AI Tech'}
					{/if}
				</a>
				<p class="mt-2 text-main/70">Smart, Simple AI Solutions.</p>
			</div>

			<!-- Column 2: Sitemap Links -->
			<div>
				<h3 class="font-bold uppercase tracking-wider text-main/60">Sitemap</h3>
				<ul class="mt-4 space-y-2">
					<li>
						<a
							href="/solutions"
							class="text-main/80 transition hover:text-accent hover:drop-shadow-accent-glow"
							>Solutions</a
						>
					</li>
					<li>
						<a
							href="/case-studies"
							class="text-main/80 transition hover:text-accent hover:drop-shadow-accent-glow"
							>Case Studies</a
						>
					</li>
					<li>
						<a
							href="/about"
							class="text-main/80 transition hover:text-accent hover:drop-shadow-accent-glow"
							>About Us</a
						>
					</li>
					<li>
						<a
							href="/contact"
							class="text-main/80 transition hover:text-accent hover:drop-shadow-accent-glow"
							>Contact</a
						>
					</li>
					{#if $page.data.settings?.brochureUrl}
						<li>
							<a
								href={$page.data.settings.brochureUrl}
								target="_blank"
								class="font-bold text-accent transition hover:drop-shadow-accent-glow"
								>Download Brochure</a
							>
						</li>
					{/if}
				</ul>
			</div>

			<!-- Column 3: Contact & Legal -->
			<div>
				<h3 class="font-bold uppercase tracking-wider text-main/60">Get In Touch</h3>
				<ul class="mt-4 space-y-2">
					<li>
						<a
							href="mailto:hello@vision-ai.tech"
							class="text-main/80 transition hover:text-accent hover:drop-shadow-accent-glow"
							>hello@vision-ai.tech</a
						>
					</li>
					{#if $page.data.locations?.length > 0}
						{#each $page.data.locations as loc}
							<li
								class="transition {$page.data.userCountryCode === loc.countryCode
									? 'text-accent font-bold'
									: 'text-main/80'}"
							>
								{loc.address}
								{#if loc.phoneNumber}
									<br />
									<a href="tel:{loc.phoneNumber.replace(/\s/g, '')}" class="hover:underline"
										>{loc.phoneNumber}</a
									>
								{/if}
							</li>
						{/each}
					{/if}
				</ul>
			</div>
		</div>

		<!-- Bottom Bar -->
		<div
			class="mt-12 flex flex-col items-center border-t border-main/10 pt-8 sm:flex-row sm:justify-between"
		>
			<p class="text-sm text-main/60">
				© {new Date().getFullYear()} {$page.data.settings?.siteName || 'Vision AI Tech'}. All
				Rights Reserved.
			</p>
			<a href="#hero" class="mt-4 text-sm font-bold text-main/60 transition hover:text-accent sm:mt-0">
				Back to Top ↑
			</a>
		</div>
	</div>
</footer>
