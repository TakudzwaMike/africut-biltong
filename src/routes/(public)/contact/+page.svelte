<script>
	import { pow } from "$lib/actions/pow.js";
	import { enhance } from "$app/forms";
	import PageHeader from "$lib/components/PageHeader.svelte";
	import Seo from "$lib/components/Seo.svelte";
	import Icon from "@iconify/svelte";

	let { data, form } = $props();
	const { solution, product } = data;

	let message = $state(form?.data?.message ?? "");
	let submissionStatus = $state("idle");

	$effect(() => {
		if (form?.data?.message) {
			message = form.data.message;
		} else if (product) {
			message = `I'm interested in discussing your "${product.name}" product.`;
		} else if (solution) {
			message = `I'm interested in discussing your "${solution.solutionName}" solution.`;
		}
	});

	function handleEnhance() {
		submissionStatus = "sending";
		return async ({ result, update }) => {
			if (result.type === "success" && result.data?.success) {
				submissionStatus = "sent";
			} else {
				submissionStatus = "idle";
			}
			await update();
		};
	}

	// Dynamic Header Title based on context
	let headerTitle = $derived(
		solution
			? `Deploy ${solution.solutionName}`
			: product
				? `Inquire about ${product.name}`
				: "Start the Conversation",
	);

	let headerSubtitle = $derived(
		solution || product
			? "Our engineering team is ready to help you integrate this technology into your workflow."
			: "Ready to optimize your operations? Let’s discuss how Vision AI Tech can drive value for your business.",
	);
</script>

<Seo
	title="Contact Us | Vision AI Tech"
	description="Ready to optimize your operations? Let’s discuss how Vision AI Tech can drive value for your business."
/>

<PageHeader title={headerTitle} subtitle={headerSubtitle} />

<div class="relative z-10 bg-slate-50 py-24">
	<div class="mx-auto max-w-7xl px-8">
		<div class="grid grid-cols-1 gap-16 lg:grid-cols-3">
			<!-- Left Column: Contact Form -->
			<div class="lg:col-span-2">
				<div
					class="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5 sm:p-12"
				>
					<h3 class="text-2xl font-bold text-main mb-8">
						Send us a Message
					</h3>

					{#if form?.message}
						<div
							class="mb-8 rounded-md p-4 text-sm font-bold {form.success
								? 'bg-green-50 text-green-800 border border-green-200'
								: 'bg-red-50 text-red-800 border border-red-200'}"
						>
							{form.message}
						</div>
					{/if}

					{#if !form?.success}
						<form
							method="POST"
							class="space-y-6"
							use:enhance={handleEnhance}
							use:pow
							onpow-solving={() =>
								(submissionStatus = "verifying")}
							onpow-verified={() => {
								if (submissionStatus === "verifying")
									submissionStatus = "idle";
							}}
						>
							{#if solution}
								<input
									type="hidden"
									name="solutionId"
									value={solution.id}
								/>
							{/if}

							<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
								<div>
									<label
										for="firstName"
										class="block text-sm font-bold text-main/80 mb-2"
										>First Name</label
									>
									<input
										type="text"
										name="firstName"
										id="firstName"
										required
										value={form?.data?.firstName ?? ""}
										class="block w-full rounded-md border-0 bg-slate-50 px-4 py-3 text-main shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-accent"
									/>
								</div>
								<div>
									<label
										for="lastName"
										class="block text-sm font-bold text-main/80 mb-2"
										>Last Name</label
									>
									<input
										type="text"
										name="lastName"
										id="lastName"
										required
										value={form?.data?.lastName ?? ""}
										class="block w-full rounded-md border-0 bg-slate-50 px-4 py-3 text-main shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-accent"
									/>
								</div>
							</div>

							<div>
								<label
									for="email"
									class="block text-sm font-bold text-main/80 mb-2"
									>Email Address</label
								>
								<input
									type="email"
									name="email"
									id="email"
									required
									value={form?.data?.email ?? ""}
									class="block w-full rounded-md border-0 bg-slate-50 px-4 py-3 text-main shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-accent"
								/>
							</div>

							<div>
								<label
									for="message"
									class="block text-sm font-bold text-main/80 mb-2"
									>How can we help?</label
								>
								<textarea
									name="message"
									id="message"
									rows="5"
									required
									class="block w-full rounded-md border-0 bg-slate-50 px-4 py-3 text-main shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-accent"
									bind:value={message}
								></textarea>
							</div>

							<div class="pt-4">
								<button
									type="submit"
									disabled={submissionStatus !== "idle"}
									class="flex w-full items-center justify-center gap-2 rounded-md bg-main px-8 py-4 text-lg font-bold text-light shadow-lg transition-all hover:bg-accent hover:text-main disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
								>
									{#if submissionStatus === "verifying"}
										<Icon
											icon="mdi:shield-sync"
											class="animate-spin"
										/>
										Verifying Security...
									{:else if submissionStatus === "sending"}
										<Icon
											icon="mdi:loading"
											class="animate-spin"
										/>
										Sending Message...
									{:else}
										Send Message <Icon icon="mdi:send" />
									{/if}
								</button>
							</div>
						</form>
					{/if}
				</div>
			</div>

			<!-- Right Column: Contact Info & Offices -->
			<div class="space-y-8">
				<!-- Direct Contact Card -->
				<div class="rounded-xl bg-main p-8 text-light shadow-xl">
					<h3 class="text-xl font-bold text-accent mb-6">
						Quick Contact
					</h3>
					<div class="space-y-4">
						<div class="flex items-center gap-4">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
							>
								<Icon icon="mdi:email" class="text-accent" />
							</div>
							<div>
								<p
									class="text-xs text-light/60 uppercase font-bold"
								>
									Email Us
								</p>
								<a
									href="mailto:hello@vision-ai.tech"
									class="font-medium hover:text-accent"
									>hello@vision-ai.tech</a
								>
							</div>
						</div>
						<div class="flex items-center gap-4">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
							>
								<Icon icon="mdi:clock" class="text-accent" />
							</div>
							<div>
								<p
									class="text-xs text-light/60 uppercase font-bold"
								>
									Response Time
								</p>
								<p class="font-medium">Within 24 Hours</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Locations -->
				{#if data.locations.length > 0}
					<div>
						<h3
							class="text-lg font-bold text-main mb-4 flex items-center gap-2"
						>
							<Icon
								icon="mdi:map-marker-multiple"
								class="text-accent"
							/>
							Our Offices
						</h3>
						<div class="space-y-4">
							{#each data.locations as loc}
								<div
									class="rounded-xl border border-main/10 bg-white p-6 shadow-sm transition hover:border-accent hover:shadow-md"
								>
									<h4 class="font-bold text-main">
										{loc.countryName}
									</h4>
									<p class="mt-2 text-sm text-main/70">
										{loc.address}
									</p>
									{#if loc.phoneNumber}
										<a
											href="tel:{loc.phoneNumber.replace(
												/\s/g,
												'',
											)}"
											class="mt-4 inline-flex items-center gap-1 text-sm font-bold text-accent hover:underline"
										>
											<Icon icon="mdi:phone" />
											{loc.phoneNumber}
										</a>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
