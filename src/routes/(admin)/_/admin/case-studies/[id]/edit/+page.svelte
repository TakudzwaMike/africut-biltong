<script>
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';

	let { data, form } = $props();

	let caseStudyData = $state(data.caseStudy);
	let kpiResults = $state(data.caseStudy.results.map((r) => ({ ...r, id: Math.random() })) || []);
	let challengeJson = $state(data.caseStudy.challenge);
	let solutionJson = $state(data.caseStudy.solution);

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
			<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Edit Case Study</h1>
			<a
				href="/_/admin/case-studies"
				class="font-bold text-accent transition hover:drop-shadow-accent-glow"
				>← Back to List</a
			>
		</div>

		<form method="POST" class="mt-12 space-y-8">
			<input type="hidden" name="challenge" value={JSON.stringify(challengeJson)} />
			<input type="hidden" name="solution" value={JSON.stringify(solutionJson)} />

			<div class="space-y-4 rounded-xl border border-main/10 p-6">
				<h3 class="text-lg font-bold">Core Details</h3>
				<div>
					<label for="title" class="mb-1 block font-medium text-main/80">Title</label>
					<input
						type="text"
						id="title"
						name="title"
						required
						bind:value={caseStudyData.title}
						class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
					/>
				</div>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div>
						<label for="slug" class="mb-1 block font-medium text-main/80">Slug</label>
						<input
							type="text"
							id="slug"
							name="slug"
							required
							bind:value={caseStudyData.slug}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						/>
					</div>
					<div>
						<label for="clientId" class="mb-1 block font-medium text-main/80">Client</label>
						<select
							id="clientId"
							name="clientId"
							bind:value={caseStudyData.clientId}
							class="w-full rounded-md border-0 bg-main/5 px-3.5 py-2 text-main shadow-sm ring-1 ring-inset ring-main/10 focus:ring-2 focus:ring-inset focus:ring-accent"
						>
							<option value={null}>-- None --</option>
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
					<label for="challenge" class="mb-1 block font-medium text-main/80">Challenge</label>
					<RichTextEditor bind:content={challengeJson} initialContent={caseStudyData.challenge} />
				</div>
				<div>
					<label for="solution" class="mb-1 block font-medium text-main/80">Solution</label>
					<RichTextEditor bind:content={solutionJson} initialContent={caseStudyData.solution} />
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
					Save Changes
				</button>
			</div>
		</form>
	</div>
</div>