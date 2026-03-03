<script>
	import { page } from "$app/state";
	import Icon from "@iconify/svelte";

	let settings = $derived(page.data.settings);
	let locations = $derived(page.data.locations);
	let userCountryCode = $derived(page.data.userCountryCode);
	let mediaItems = $derived(page.data.mediaItems);

	// Find the logo object from the media list using the ID stored in settings
	let logo = $derived(
		mediaItems?.find((m) => m.id == settings?.siteLogoMediaId),
	);
</script>

<footer class="bg-main text-light relative z-10 border-t-4 border-accent">
	<div class="mx-auto max-w-7xl px-8 py-16">
		<div class="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
			<!-- Brand Section -->
			<div class="space-y-6">
				<a href="/" class="block text-2xl font-bold tracking-tight">
					{#if logo}
						<img
							src={logo.displayUrl || logo.originalUrl}
							alt={logo.altText}
							class="h-10 object-contain brightness-0 invert"
						/>
					{:else}
						{settings?.siteName || "Vision AI Tech"}
					{/if}
				</a>
				<p class="text-sm leading-relaxed text-light/70">
					Transforming heavy industry through smart, simple AI
					solutions. We turn operational data into measurable
					profitability and safety.
				</p>
				<div class="flex gap-4">
					{#if settings?.socialLinkedIn}
						<a
							href={settings.socialLinkedIn}
							target="_blank"
							rel="noopener noreferrer"
							class="text-light/70 hover:text-accent transition-colors"
							aria-label="LinkedIn"
						>
							<Icon icon="mdi:linkedin" width="24" />
						</a>
					{/if}
					{#if settings?.socialInstagram}
						<a
							href={settings.socialInstagram}
							target="_blank"
							rel="noopener noreferrer"
							class="text-light/70 hover:text-accent transition-colors"
							aria-label="Instagram"
						>
							<Icon icon="mdi:instagram" width="24" />
						</a>
					{/if}
					{#if settings?.socialTikTok}
						<a
							href={settings.socialTikTok}
							target="_blank"
							rel="noopener noreferrer"
							class="text-light/70 hover:text-accent transition-colors"
							aria-label="TikTok"
						>
							<Icon icon="mdi:tiktok" width="24" />
						</a>
					{/if}
					{#if settings?.socialX}
						<a
							href={settings.socialX}
							target="_blank"
							rel="noopener noreferrer"
							class="text-light/70 hover:text-accent transition-colors"
							aria-label="X (Twitter)"
						>
							<Icon icon="mdi:twitter" width="24" />
						</a>
					{/if}
					{#if settings?.socialFacebook}
						<a
							href={settings.socialFacebook}
							target="_blank"
							rel="noopener noreferrer"
							class="text-light/70 hover:text-accent transition-colors"
							aria-label="Facebook"
						>
							<Icon icon="mdi:facebook" width="24" />
						</a>
					{/if}
					{#if settings?.socialInstagram}
						<a
							href={settings.socialInstagram}
							target="_blank"
							rel="noopener noreferrer"
							class="text-light/70 hover:text-accent transition-colors"
							aria-label="Instagram"
						>
							<Icon icon="mdi:instagram" width="24" />
						</a>
					{/if}
					{#if settings?.socialTikTok}
						<a
							href={settings.socialTikTok}
							target="_blank"
							rel="noopener noreferrer"
							class="text-light/70 hover:text-accent transition-colors"
							aria-label="TikTok"
						>
							<Icon icon="mdi:tiktok" width="24" />
						</a>
					{/if}
				</div>
			</div>

			<!-- Navigation -->
			<div>
				<h3
					class="text-sm font-bold uppercase tracking-widest text-accent"
				>
					Company
				</h3>
				<ul class="mt-6 space-y-4 text-sm">
					<li>
						<a
							href="/about"
							class="text-light/80 hover:text-white hover:underline"
							>About Us</a
						>
					</li>
					<li>
						<a
							href="/solutions"
							class="text-light/80 hover:text-white hover:underline"
							>Solutions</a
						>
					</li>
					<li>
						<a
							href="/case-studies"
							class="text-light/80 hover:text-white hover:underline"
							>Case Studies</a
						>
					</li>
					<li>
						<a
							href="/blog"
							class="text-light/80 hover:text-white hover:underline"
							>Latest Insights</a
						>
					</li>
					<li>
						<a
							href="/contact"
							class="text-light/80 hover:text-white hover:underline"
							>Contact</a
						>
					</li>
				</ul>
			</div>

			<!-- Contact Info -->
			<div class="lg:col-span-2">
				<h3
					class="text-sm font-bold uppercase tracking-widest text-accent"
				>
					Global Presence
				</h3>

				<div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
					<!-- Primary Email -->
					<div class="flex items-start gap-3">
						<Icon
							icon="mdi:email-outline"
							class="mt-1 text-accent"
							width="20"
						/>
						<div>
							<p
								class="text-xs font-bold uppercase text-light/50"
							>
								General Inquiries
							</p>
							<a
								href="mailto:hello@vision-ai.tech"
								class="hover:text-accent transition-colors"
								>hello@vision-ai.tech</a
							>
						</div>
					</div>

					<!-- Locations Loop -->
					{#if locations?.length > 0}
						{#each locations as loc}
							<div
								class="flex items-start gap-3 {userCountryCode ===
								loc.countryCode
									? 'rounded-md bg-light/10 p-2 -m-2'
									: ''}"
							>
								<Icon
									icon="mdi:map-marker-outline"
									class="mt-1 text-accent"
									width="20"
								/>
								<div>
									<p class="font-bold text-sm">
										{loc.countryName}
									</p>
									<p class="text-sm text-light/70">
										{loc.address}
									</p>
									{#if loc.phoneNumber}
										<a
											href="tel:{loc.phoneNumber.replace(
												/\s/g,
												'',
											)}"
											class="text-xs text-accent hover:underline mt-1 block"
										>
											{loc.phoneNumber}
										</a>
									{/if}
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>

		<!-- Bottom Bar -->
		<div
			class="mt-16 flex flex-col items-center justify-between border-t border-light/10 pt-8 sm:flex-row"
		>
			<p class="text-xs text-light/50">
				© {new Date().getFullYear()}
				{settings?.siteName || "Vision AI Tech"}. All Rights Reserved.
			</p>
			<div class="mt-4 flex gap-6 sm:mt-0">
				<a
					href="/privacy"
					class="text-xs text-light/50 hover:text-light"
					>Privacy Policy</a
				>
				<a href="/terms" class="text-xs text-light/50 hover:text-light"
					>Terms of Service</a
				>
				{#if page.data.user}
					<a href="/_/admin" class="text-xs font-bold text-accent"
						>Admin Panel</a
					>
				{/if}
			</div>
		</div>
	</div>
</footer>
