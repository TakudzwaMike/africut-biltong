<script>
	/** @type {import('./$types').PageData} */
	export let data;
	/** @type {import('./$types').ActionData} */
	export let form;

	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast-service';

	$: if (form?.status === 200) {
		toast.success('Solution deleted successfully!');
	}
</script>

<div class="p-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-main">Solutions</h1>
			<p class="mt-2 text-base text-main/70">Manage your solutions pages.</p>
		</div>
		<a
			href="/admin/solutions/new"
			class="rounded-md bg-accent px-4 py-2 font-bold text-main shadow-sm transition hover:-translate-y-0.5"
		>
			+ Create New
		</a>
	</div>

	<div class="mt-12 overflow-x-auto">
		<table class="w-full min-w-max text-left">
			<thead class="border-b border-main/10">
				<tr>
					<th class="p-4">Name</th>
					<th class="p-4">Description</th>
					<th class="p-4 text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.solutions as s (s.id)}
					<tr class="border-b border-main/10">
						<td class="p-4 font-medium">{s.solutionName}</td>
						<td class="p-4 text-main/80">{s.shortDescription}</td>
						<td class="p-4">
							<div class="flex items-center justify-end gap-4">
								<a
									href={`/admin/solutions/${s.id}/edit`}
									class="font-bold text-accent transition hover:drop-shadow-accent-glow"
								>
									Edit
								</a>
								<form method="POST" action="?/delete&id={s.id}" use:enhance>
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
		{#if data.solutions.length === 0}
			<div class="mt-8 rounded-xl border border-dashed border-main/20 p-12 text-center">
				<p class="text-main/70">No solutions found. Create your first one!</p>
			</div>
		{/if}
	</div>
</div>