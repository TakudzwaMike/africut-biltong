<script>
	import { slugify } from '$lib/utils.js';

	let { data, form } = $props();

	let title = $state('');
	let slug = $state('');
	let manualSlug = $state(false);

	$effect(() => {
		if (!manualSlug) {
			slug = slugify(title);
		}
	});

	let kpiResults = $state([{ id: 1, kpiName: '', kpiValue: '' }]);

	function addKpi() {
		kpiResults.push({ id: Math.random(), kpiName: '', kpiValue: '' });
	}

	function removeKpi(id) {
		kpiResults = kpiResults.filter((r) => r.id !== id);
	}
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-4xl px-8 py-20 sm:py-24">
		<div class="flex items-center justify-between">
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">New Case Study</h1>
			<a href="/admin/case-studies" class="font-bold text-accent transition hover:drop-shadow-accent-glow"
				>← Back to List</a
			>
		</div>

		<form method="POST" class="mt-12 space-y-8">
			<div class="space-y-4 rounded-xl border border-main/10 p-6">
				<h3 class="text-lg font-bold">Core Details</h3>
				<div>
					<label for="title" class="mb-1 block font-medium text-main/80">Title</label>
					<input
						type="text"
						id="title"
						name="title"
						required
						bind:value={title}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div>
						<div class="mb-1 flex items-center justify-between">
							<label for="slug" class="font-medium text-main/80">Slug</label>
							{#if !manualSlug}
								<button type="button" onclick={() => (manualSlug = true)} class="text-sm text-accent"
									>Edit</button
								>
							{/if}
						</div>
						<input
							type="text"
							id="slug"
							name="slug"
							required
							readonly={!manualSlug}
							bind:value={slug}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 read-only:bg-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						/>
					</div>
					<div>
						<label for="clientId" class="mb-1 block font-medium text-main/80">Client</label>
						<select
							id="clientId"
							name="clientId"
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						>
							<option value="">-- None --</option>
							{#each data.clients as client}
								<option value={client.id}>{client.name}</option>
							{/each}
						</select>
					</div>
				</div>
			</div>

			<div class="space-y-4 rounded-xl border border-main/10 p-6">
				<h3 class="text-lg font-bold">Content</h3>
				<div>
					<label for="challenge" class="mb-1 block font-medium text-main/80"
						>Challenge (Plain Text)</label
					>
					<textarea
						id="challenge"
						name="challenge"
						rows="5"
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					></textarea>
				</div>
				<div>
					<label for="solution" class="mb-1 block font-medium text-main/80"
						>Solution (Plain Text)</label
					>
					<textarea
						id="solution"
						name="solution"
						rows="5"
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					></textarea>
				</div>
			</div>

			<div class="space-y-4 rounded-xl border border-main/10 p-6">
				<h3 class="text-lg font-bold">Key Results (KPIs)</h3>
				{#each kpiResults as result (result.id)}
					<div class="grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr,1fr,auto]">
						<div>
							<label for="kpiValue-{result.id}" class="mb-1 block font-medium text-main/80"
								>KPI Value</label
							>
							<input
								id="kpiValue-{result.id}"
								type="text"
								name="kpiValue"
								placeholder="e.g., 15%"
								bind:value={result.kpiValue}
								class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
							/>
						</div>
						<div>
							<label for="kpiName-{result.id}" class="mb-1 block font-medium text-main/80"
								>KPI Name</label
							>
							<input
								id="kpiName-{result.id}"
								type="text"
								name="kpiName"
								placeholder="e.g., Reduction in Fuel"
								bind:value={result.kpiName}
								class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
							/>
						</div>
						<button
							type="button"
							onclick={() => removeKpi(result.id)}
							class="rounded-md bg-red-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-red-600"
						>
							Remove
						</button>
					</div>
				{/each}
				<button
					type="button"
					onclick={addKpi}
					class="rounded-md bg-main px-4 py-2 font-bold text-light transition hover:bg-main/90"
				>
					+ Add KPI
				</button>
			</div>

			{#if form?.message}
				<p class="text-center font-bold text-red-600">{form.message}</p>
			{/if}

			<div class="text-center">
				<button
					type="submit"
					class="rounded-md bg-accent px-8 py-3 font-bold text-main shadow-lg shadow-accent/30 transition hover:-translate-y-1"
				>
					Create Case Study
				</button>
			</div>
		</form>
	</div>
</div>