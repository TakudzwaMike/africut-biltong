<script>
	let { data, form } = $props();

	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';

	let clientData = $state(data.client);
	let generatedToken = $state(null);

	$effect(() => {
		if (form?.success) {
			if (form.form === 'updateClient') {
				toast.success('Client details saved successfully!');
			} else if (form.form === 'generateLink') {
				toast.success('New testimonial link generated!');
				const newTestimonial = form.newTestimonial;
				generatedToken = newTestimonial.submissionToken;
				data.client.testimonials.unshift(newTestimonial);
			} else if (form.form === 'deleteTestimonial') {
				toast.success('Testimonial deleted.');
			}
		}
	});

	function getStatusClass(status) {
		switch (status) {
			case 'published':
				return 'bg-green-100 text-green-800';
			case 'submitted':
				return 'bg-blue-100 text-blue-800';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'rejected':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-4xl px-8 py-20 sm:py-24">
		<div class="flex items-center justify-between">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Edit Client</h1>
			<a href="/admin/clients" class="font-bold text-accent transition hover:drop-shadow-accent-glow"
				>← Back to List</a
			>
		</div>

		<form
			method="POST"
			action="?/updateClient"
			enctype="multipart/form-data"
			class="mt-12 space-y-6"
		>
			<div class="rounded-xl border border-main/10 p-6">
				<h3 class="text-lg font-bold">Client Details</h3>
				<div class="mt-4 space-y-6">
					<div>
						<label for="name" class="mb-1 block font-medium text-main/80">Client Name</label>
						<input
							type="text"
							id="name"
							name="name"
							required
							bind:value={clientData.name}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						/>
					</div>

					<div>
						<label for="logo" class="mb-1 block font-medium text-main/80">Upload New Logo</label>
						{#if clientData.logoUrl}
							<div class="mb-2">
								<p class="text-sm text-main/80">Current Logo:</p>
								<img
									src={clientData.logoUrl}
									alt="Current logo"
									class="mt-1 h-12 w-24 rounded-md bg-main/5 object-contain p-1"
								/>
							</div>
						{/if}
						<input
							type="file"
							id="logo"
							name="logo"
							accept="image/png, image/jpeg, image/svg+xml, image/webp"
							class="w-full rounded-md border border-main/10 bg-main/5 text-sm text-main/80 file:mr-4 file:border-0 file:bg-main/10 file:px-4 file:py-2 file:font-bold"
						/>
						<p class="mt-1 text-xs text-main/60">
							Optional. Uploading a new file will replace the current logo.
						</p>
					</div>

					{#if form?.form === 'updateClient' && form?.message}
						<p class="text-center font-bold text-red-600">{form.message}</p>
					{/if}

					<div class="text-right">
						<button
							type="submit"
							class="rounded-md bg-accent px-6 py-2 font-bold text-main shadow-lg shadow-accent/30 transition hover:-translate-y-0.5"
						>
							Save Client Details
						</button>
					</div>
				</div>
			</div>
		</form>

		<div class="mt-12 rounded-xl border border-main/10 p-6">
			<h3 class="text-lg font-bold">Testimonials</h3>
			<div class="mt-4 space-y-4">
				{#each data.client.testimonials as testimonial (testimonial.id)}
					<div class="flex items-center justify-between rounded-md bg-main/5 p-3">
						<div class="flex items-center gap-3">
							<span
								class="rounded-full px-2 py-0.5 text-xs font-semibold uppercase {getStatusClass(
									testimonial.status
								)}"
							>
								{testimonial.status}
							</span>
							{#if testimonial.status === 'pending'}
								<code class="text-sm text-main/70">/testimonials/{testimonial.submissionToken}</code>
							{:else}
								<p class="italic text-main/80">"{testimonial.quote}"</p>
							{/if}
						</div>
						<form method="POST" action="?/deleteTestimonial" use:enhance>
							<input type="hidden" name="testimonialId" value={testimonial.id} />
							<button class="text-sm font-bold text-red-500 hover:text-red-400">Delete</button>
						</form>
					</div>
				{/each}

				{#if data.client.testimonials.length === 0}
					<p class="text-center text-sm text-main/60">No testimonial requests yet.</p>
				{/if}
			</div>

			<div class="mt-6 border-t border-main/10 pt-6">
				<form method="POST" action="?/generateLink" use:enhance>
					<button
						type="submit"
						class="w-full rounded-md bg-main px-6 py-2 font-bold text-light transition hover:bg-main/90"
					>
						+ Generate New Testimonial Link
					</button>
				</form>
				{#if generatedToken}
					{@const url = `/testimonials/${generatedToken}`}
					<div class="mt-4 rounded-md bg-accent/10 p-4 text-center">
						<p class="font-medium text-main">Share this one-time link with your client:</p>
						<a
							href={url}
							target="_blank"
							class="mt-2 block font-mono text-accent underline hover:text-accent/80"
						>
							{url}
						</a>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>