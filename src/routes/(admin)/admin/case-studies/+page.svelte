<script>
	/** @type {import('./$types').PageData} */
	export let data;
	/** @type {import('./$types').ActionData} */
	export let form;

	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';

	$: if (form?.status === 200) {
		toast.success('Case study deleted successfully!');
	}
</script>

<div class="relative z-10">
	<div class="mx-auto max-w-6xl px-8 py-20 sm:py-24">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-4xl font-bold tracking-tight text-main sm:text-5xl">Case Studies</h1>
				<p class="mt-4 text-lg leading-8 text-main/70">Manage your case studies.</p>
			</div>
			<a
				href="/admin/case-studies/new"
				class="rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
			>
				+ Create New
			</a>
		</div>

		<div class="mt-12 overflow-x-auto">
			<table class="w-full min-w-max text-left">
				<thead class="border-b border-main/10">
					<tr>
						<th class="p-4">Title</th>
						<th class="p-4">Client</th>
						<th class="p-4 text-right">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.caseStudies as cs (cs.id)}
						<tr class="border-b border-main/10">
							<td class="p-4 font-medium">{cs.title}</td>
							<td class="p-4 text-main/80">{cs.clientName}</td>
							<td class="p-4">
								<div class="flex items-center justify-end gap-4">
									<a
										href={`/admin/case-studies/${cs.id}/edit`}
										class="font-bold text-accent transition hover:drop-shadow-accent-glow"
									>
										Edit
									</a>
									<form method="POST" action="?/delete&id={cs.id}" use:enhance>
										<button
											type="submit"
											class="font-bold text-red-500 transition hover:text-red-400"
										>
											Delete
										</button>
									</form>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			{#if data.caseStudies.length === 0}
				<div class="mt-8 rounded-xl border border-dashed border-main/20 p-12 text-center">
					<p class="text-main/70">No case studies found. Create your first one!</p>
				</div>
			{/if}
		</div>
	</div>
</div>