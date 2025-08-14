<script>
	let { data, form } = $props();
	const { solution } = data;
</script>

<section id="contact" class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<div class="rounded-xl bg-main p-8 sm:p-16">
			<h2 class="text-center text-3xl font-bold tracking-tight text-light sm:text-4xl">
				{#if solution}
					Discussing "{solution.solutionName}"
				{:else}
					Ready to Build the Future?
				{/if}
			</h2>
			<p class="mx-auto mt-4 max-w-2xl text-center text-lg text-light/70">
				{#if solution}
					Fill out the form below to get in touch with our team about this solution. We'll get back
					to you as soon as possible.
				{:else}
					Let's get in touch. Drop us a message below and we'll get back to you as soon as possible
					to discuss your next project.
				{/if}
			</p>

			{#if form?.message}
				<div
					class="mx-auto mt-8 max-w-xl rounded-md p-4 text-center {form.success
						? 'bg-accent text-main'
						: 'bg-red-500 text-white'}"
				>
					<p class="font-bold">{form.message}</p>
				</div>
			{/if}

			{#if !form?.success}
				<form method="POST" class="mx-auto mt-12 max-w-xl">
					{#if solution}
						<input type="hidden" name="solutionId" value={solution.id} />
					{/if}
					<div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
						<div>
							<label for="firstName" class="sr-only">First name</label>
							<input
								type="text"
								name="firstName"
								id="firstName"
								placeholder="First name"
								required
								value={form?.data?.firstName ?? ''}
								class="block w-full rounded-md border-0 bg-light/5 px-3.5 py-2 text-light shadow-sm ring-1 ring-inset ring-light/10 placeholder:text-light/50 focus:ring-2 focus:ring-inset focus:ring-accent"
							/>
						</div>
						<div>
							<label for="lastName" class="sr-only">Last name</label>
							<input
								type="text"
								name="lastName"
								id="lastName"
								placeholder="Last name"
								required
								value={form?.data?.lastName ?? ''}
								class="block w-full rounded-md border-0 bg-light/5 px-3.5 py-2 text-light shadow-sm ring-1 ring-inset ring-light/10 placeholder:text-light/50 focus:ring-2 focus:ring-inset focus:ring-accent"
							/>
						</div>
						<div class="sm:col-span-2">
							<label for="email" class="sr-only">Email</label>
							<input
								type="email"
								name="email"
								id="email"
								placeholder="Email"
								required
								value={form?.data?.email ?? ''}
								class="block w-full rounded-md border-0 bg-light/5 px-3.5 py-2 text-light shadow-sm ring-1 ring-inset ring-light/10 placeholder:text-light/50 focus:ring-2 focus:ring-inset focus:ring-accent"
							/>
						</div>
						<div class="sm:col-span-2">
							<label for="message" class="sr-only">Message</label>
							<textarea
								name="message"
								id="message"
								rows="4"
								placeholder="Message"
								required
								class="block w-full rounded-md border-0 bg-light/5 px-3.5 py-2 text-light shadow-sm ring-1 ring-inset ring-light/10 placeholder:text-light/50 focus:ring-2 focus:ring-inset focus:ring-accent"
							>{form?.data?.message ?? ''}</textarea>
						</div>
					</div>
					<div class="mt-10 text-center">
						<button
							type="submit"
							class="rounded-md bg-accent px-6 py-3 font-bold text-main shadow-lg shadow-accent/30 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/40"
						>
							Send Message
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
</section>