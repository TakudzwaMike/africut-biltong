<script>
	let { form } = $props();
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-4xl px-8 py-20 sm:py-24">
		<div class="flex items-center justify-between">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">New Client</h1>
			<a href="/admin/clients" class="font-bold text-accent transition hover:drop-shadow-accent-glow"
				>← Back to List</a
			>
		</div>

		<form method="POST" enctype="multipart/form-data" class="mt-12 space-y-6">
			<div>
				<label for="name" class="mb-1 block font-medium text-main/80">Client Name</label>
				<input
					type="text"
					id="name"
					name="name"
					required
					value={form?.name ?? ''}
					class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
				/>
			</div>

			<div>
				<label for="logo" class="mb-1 block font-medium text-main/80">Logo</label>
				<input
					type="file"
					id="logo"
					name="logo"
					accept="image/png, image/jpeg, image/svg+xml, image/webp"
					class="w-full rounded-md border border-main/10 bg-main/5 text-sm text-main/80 file:mr-4 file:border-0 file:bg-main/10 file:px-4 file:py-2 file:font-bold"
				/>
				<p class="mt-1 text-xs text-main/60">Optional. Max file size 2MB.</p>
			</div>

			{#if form?.message}
				<p class="text-center font-bold text-red-600">{form.message}</p>
			{/if}

			<div class="text-center">
				<button
					type="submit"
					class="rounded-md bg-accent px-8 py-3 font-bold text-main shadow-lg shadow-accent/30 transition hover:-translate-y-1"
				>
					Create Client
				</button>
			</div>
		</form>
	</div>
</div>