<script>
	import { page } from '$app/stores';
</script>

<footer class="relative z-10 border-t border-main/10 bg-light">
	<div class="mx-auto max-w-6xl px-8 py-12">
		<div class="grid grid-cols-1 gap-12 text-center sm:grid-cols-2 lg:grid-cols-4 sm:text-left">
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
							href="/resources"
							class="text-main/80 transition hover:text-accent hover:drop-shadow-accent-glow"
							>Resources</a
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

			<!-- Column 4: Social Links -->
			<div>
				<h3 class="font-bold uppercase tracking-wider text-main/60">Follow Us</h3>
				<div class="mt-4 flex justify-center gap-6 sm:justify-start">
					{#if $page.data.settings?.socialLinkedIn}
						<a
							href={$page.data.settings.socialLinkedIn}
							target="_blank"
							rel="noopener noreferrer"
							class="text-main/70 hover:text-accent"
							aria-label="LinkedIn"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path
									d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
								/><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg
							>
						</a>
					{/if}
					{#if $page.data.settings?.socialX}
						<a
							href={$page.data.settings.socialX}
							target="_blank"
							rel="noopener noreferrer"
							class="text-main/70 hover:text-accent"
							aria-label="X (formerly Twitter)"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="lucide lucide-x"
								><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
							>
						</a>
					{/if}
					{#if $page.data.settings?.socialFacebook}
						<a
							href={$page.data.settings.socialFacebook}
							target="_blank"
							rel="noopener noreferrer"
							class="text-main/70 hover:text-accent"
							aria-label="Facebook"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg
							>
						</a>
					{/if}
				</div>
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
