<script>
	let { data, form } = $props();
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-2xl px-8 py-20 sm:py-24">
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">
				Client Testimonial for {data.clientName}
			</h1>
			<p class="mt-4 text-lg leading-8 text-main/70">
				Thank you for taking a moment to share your feedback. Your insights are invaluable to us.
			</p>
		</div>

		<form method="POST" class="mt-12 space-y-6">
			<div>
				<label for="quote" class="mb-1 block font-medium text-main/80">Testimonial / Quote</label>
				<textarea
					id="quote"
					name="quote"
					rows="5"
					required
					value={form?.data?.quote ?? ''}
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				></textarea>
			</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div>
					<label for="authorName" class="mb-1 block font-medium text-main/80">Your Full Name</label>
					<input
						type="text"
						id="authorName"
						name="authorName"
						required
						value={form?.data?.authorName ?? ''}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
				<div>
					<label for="authorTitle" class="mb-1 block font-medium text-main/80"
						>Your Title / Role</label
					>
					<input
						type="text"
						id="authorTitle"
						name="authorTitle"
						required
						value={form?.data?.authorTitle ?? ''}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
			</div>

			{#if form?.message}
				<p class="text-center font-bold text-red-600">{form.message}</p>
			{/if}

			<div class="text-center">
				<button
					type="submit"
					class="rounded-md bg-accent px-8 py-3 font-bold text-main shadow-lg shadow-accent/30 transition hover:-translate-y-1"
				>
					Submit Testimonial
				</button>
			</div>
		</form>
	</div>
</div>